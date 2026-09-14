# 7. Tokens de design em duas camadas: primitivo e semântico

Data: 2026-07-07

## Status

Ativa

## Contexto

Os tokens vindos do Figma chegam como valores nomeados pelo que **são** — `Primary/500` é um roxo específico, `Size primitives/400` são 16 pixels. Esses nomes não dizem nada sobre onde usar cada valor.

Um design system que expõe apenas essa camada tem um problema previsível: cada componente decide sozinho qual passo da rampa usar em cada situação. Dois componentes acabam usando cinzas diferentes para a mesma finalidade, e a intenção de design fica implícita e não auditável.

A prática estabelecida para resolver isso é uma camada semântica — tokens nomeados pelo que **fazem** (`background.brand.hover`, `text.base.secondary`) — que referencia a camada primitiva. O arquivo exportado do Figma já traz essa estrutura: o grupo `Color primitives` e o grupo `Color` com `Border`, `Background` e `Text`, cujos valores são alias no formato `{Color primitives.Primary.500}`.

## Decisão

Vamos manter **as duas camadas em `src/tokens/colors.ts`**, com a regra de que a camada semântica nunca introduz um valor novo — todo valor dela é uma referência a um primitivo:

```ts
export const colorPrimitives = { primary: { 50: "#F3EFF9", …, 950: "#08050E" }, neutral: {…}, light: {…}, danger: {…} };

export const semanticColors = {
  border:     { brand: { default: colorPrimitives.primary[500], hover: colorPrimitives.primary[400], … }, danger: {…} },
  background: { brand: {…}, danger: {…} },
  text:       { brand: {…}, danger: {…}, base: { default: colorPrimitives.neutral[800], … } },
};

/** Mapa achatado consumido por tailwind.config.ts — apenas primitivos */
export const colors = { primary: …, neutral: …, light: …, danger: … };
```

O Tailwind recebe **`colors`**, que contém apenas primitivos. As duas camadas são exportadas no bundle público e ficam disponíveis em runtime.

Uma consequência importante e assumida: como o Tailwind recebe primitivos, **as classes usadas nos componentes são primitivas** (`bg-primary-500`, `text-neutral-400`). `semanticColors` funciona como documentação da intenção e como dado consumível pela aplicação, mas não gera utilitários — a aplicação da semântica vive nos mapas de variante de cada componente ([ADR-0011](0011-mapas-de-variante-tipados.md)).

## Alternativas Consideradas

### Alternativa 1: Só a camada primitiva

**Descrição**: Expor apenas `colors` e deixar cada componente escolher o passo da rampa.

**Prós**:
- Mais simples — um único objeto a manter
- Nenhuma camada intermediária a sincronizar
- Menos código

**Contras**:
- A intenção de design fica implícita: nada registra que `primary-400` é a cor de hover, não uma cor de superfície
- Divergência entre componentes é fácil e invisível
- Perde a estrutura que o Figma já exporta
- Mudar "a cor de hover da marca" exigiria caçar `primary-400` em todos os componentes

**Razão para rejeição**: Perde a informação mais valiosa que o Figma fornece — o mapeamento de intenção — que é exatamente o que evita divergência entre componentes.

### Alternativa 2: Camada semântica gerando os utilitários do Tailwind

**Descrição**: Passar `semanticColors` para `theme.extend.colors`, produzindo classes como `bg-background-brand-hover` e `text-text-base-secondary`.

**Prós**:
- Fecha o ciclo: o componente expressaria intenção, não valor
- Trocar o primitivo por trás de uma intenção mudaria todos os usos de uma vez
- Auditável: `grep bg-background-brand-hover` acharia todos os usos daquela intenção
- Impediria o uso de um primitivo em papel errado

**Contras**:
- Nomes de classe longos e repetitivos (`text-text-base-default`)
- A estrutura aninhada de três níveis gera nomes pouco ergonômicos no Tailwind
- Os primitivos deixariam de estar disponíveis, ou coexistiriam e dobrariam o CSS
- A camada semântica atual não cobre todos os papéis usados nos componentes: `border-neutral-300` (hover de campo), `bg-light-800` (superfície desabilitada) e `text-neutral-300` (texto desabilitado) não têm token semântico correspondente

**Razão para rejeição**: É a alternativa tecnicamente superior e está registrada como direção futura. Foi adiada por duas razões: os nomes gerados são desconfortáveis, e a camada semântica exportada do Figma está incompleta em relação aos papéis realmente usados — adotá-la como única fonte exigiria completá-la primeiro, no Figma. A consequência aceita é que a semântica vive nos mapas de variante.

### Alternativa 3: Três camadas (primitivo → semântico → componente)

**Descrição**: Adicionar tokens por componente (`button.primary.background`).

**Prós**:
- Máxima granularidade de controle
- Permite ajustar um componente sem afetar outros

**Contras**:
- Explosão de tokens: 16 componentes × variantes × estados
- Camada extra a sincronizar com o Figma
- Para um sistema deste tamanho, a indireção supera o benefício

**Razão para rejeição**: Complexidade desproporcional ao tamanho do sistema.

## Consequências

### Positivas

- A intenção de design fica registrada e legível em `semanticColors`, servindo de referência para decidir qual primitivo usar em cada papel
- A estrutura espelha o Figma, o que mantém o vocabulário compartilhado entre design e código ([ADR-0008](0008-transcricao-manual-dos-tokens-do-figma.md))
- `semanticColors` referencia primitivos por objeto, então mudar um primitivo propaga automaticamente pela camada semântica
- Classes primitivas são curtas e ergonômicas nos componentes
- Ambas as camadas ficam disponíveis em runtime para a aplicação consumidora
- Tipos inferidos dão autocomplete preciso das chaves aninhadas

### Negativas

- **A camada semântica não é aplicada mecanicamente.** Nada impede um componente de usar `bg-primary-400` como superfície estática, em papel errado. A regra é convenção, verificada em revisão
- **Existe uma terceira camada implícita** — os mapas de variante — que exerce a semântica sem nomeá-la. Quando `Button` escreve `hover:bg-primary-400`, ele está aplicando `background.brand.hover` sem referenciá-lo
- `semanticColors` pode divergir do que os componentes realmente fazem, sem que nada detecte
- Papéis usados nos componentes não têm token semântico: hover de borda de campo, superfície desabilitada, texto desabilitado
- Três exports de cor (`colorPrimitives`, `semanticColors`, `colors`) exigem explicação sobre qual usar quando

### Neutras

- `colors` é derivado de `colorPrimitives`, não uma terceira definição — não há duplicação de valor
- `light` é intencionalmente uma exceção à rampa 50–950: são três superfícies claras (`800`, `900`, `full`), não um matiz
- `spacing` segue um modelo mais simples: `sizePrimitives` é a fonte única, `spacing` é o mesmo objeto por referência e `borderRadius` um subconjunto ([ADR-0009](0009-estender-o-tema-do-tailwind.md))

## Trade-offs

Priorizamos **ergonomia das classes e alinhamento com o vocabulário do Figma** sobre **aplicação mecânica da semântica**. A camada semântica funciona como documentação e como dado, não como restrição — o que significa que sua observância depende de disciplina e revisão, não do compilador.

## Notas de Implementação

Tabela de papel → token semântico → classe a escrever em `docs/best-practices/tokens.md`, regra T4. É a ponte prática entre as duas camadas: consulte a semântica para decidir, escreva a classe primitiva.

Regra T9 do mesmo documento: um token semântico nunca introduz valor novo.

Convenção de posição na rampa (regra T12): `500` é a âncora, referenciada por `*.default`; `400` é hover; `600` é pressionado; `50`/`100` são superfícies sutis; `800`–`950` são texto e alto contraste.

## Validação

A decisão é bem-sucedida se:

- `semanticColors` permanecer sem nenhum valor literal (só referências a `colorPrimitives`)
- Componentes irmãos usarem os mesmos tokens para os mesmos estados
- Nenhum primitivo aparecer em papel divergente da tabela T4

## Revisão

**2026-07-07**: Decisão inicial. A adoção da camada semântica como fonte dos utilitários Tailwind está registrada como direção futura em `docs/best-practices/contributing.md`; exige antes completar os papéis faltantes no Figma.
