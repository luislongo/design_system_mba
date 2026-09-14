# 12. `className` como único escape hatch de estilo

Data: 2026-07-07

## Status

Ativa

## Contexto

Consumidores de um design system inevitavelmente precisam de ajustes que a API do componente não prevê: uma largura específica num contexto, um alinhamento, uma margem imposta pelo layout ao redor.

As bibliotecas resolvem isso de formas variadas: prop `style`, objeto `sx` (MUI), props de classe por região interna (`labelClassName`, `containerClassName`), ou objeto de override de tema. Cada mecanismo expõe uma parte diferente do interior do componente como contrato público.

Havia também uma questão simétrica: qual parte da aparência **não** deve ser negociável. Se o consumidor pode sobrescrever qualquer coisa, o design system deixa de garantir consistência.

## Decisão

Vamos expor **`className` como único escape hatch**, aceito por todos os 16 componentes e sempre concatenado ao final do array de classes.

Não expomos `style`, `sx`, `css`, `labelClassName`, `containerClassName`, `slotProps` ou objeto de override.

A divisão de responsabilidade que isso estabelece:

| Pertence ao componente | Pertence ao layout que o contém |
|---|---|
| dimensão interna, padding | margem, posição |
| cor, raio, tipografia | largura de contexto |
| estados (hover, foco, disabled, erro) | empilhamento (z-index) |

Corolário: **componentes não emitem margem**. Campos são `w-full`; botões são `inline-flex` com largura de conteúdo.

## Alternativas Consideradas

### Alternativa 1: Prop `style` além de `className`

**Descrição**: Aceitar `React.CSSProperties`.

**Prós**:
- Resolve casos que classes não cobrem (valor calculado em runtime)
- Familiar

**Contras**:
- Estilo inline não participa da cascata: não pode ser sobrescrito por utilitário, e vence tudo
- Incentiva valores literais, contrariando a regra de token ([ADR-0007](0007-tokens-em-duas-camadas.md))
- Cria dois caminhos para o mesmo objetivo, com precedências diferentes

**Razão para rejeição**: A precedência absoluta do estilo inline é o problema — torna o resultado imprevisível e permite escapar dos tokens silenciosamente. Componentes que estendem atributos HTML tecnicamente recebem `style` via spread, mas ele não é parte da API documentada.

### Alternativa 2: Props de classe por região interna

**Descrição**: `labelClassName`, `inputClassName`, `errorClassName` no `FormGroup`; `panelClassName` no `MegaSelect`.

**Prós**:
- Permite ajuste preciso de partes internas
- Sem sair do modelo de classes

**Contras**:
- **Cada prop dessas transforma uma parte do interior do componente em contrato público.** Renomear ou reestruturar o interno passa a ser breaking change
- A superfície cresce multiplicativamente: 16 componentes × regiões internas
- Sinaliza o problema errado: se o consumidor precisa estilizar o label internamente, provavelmente falta uma variante

**Razão para rejeição**: Congelaria a estrutura interna dos componentes. O `FormGroup` é o precedente adotado: recebe um `className` aplicado ao container e repassa o resto ao `Textbox` interno via spread, sem expor controle separado do label ou da mensagem.

### Alternativa 3: Sistema de tema com overrides (modelo MUI)

**Descrição**: `ThemeProvider` com overrides por componente e variante.

**Prós**:
- Customização centralizada, sem tocar em cada uso
- Permite temas por aplicação

**Contras**:
- Exige Context e runtime de estilo, contrariando [ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md) e [ADR-0004](0004-zero-dependencias-de-runtime.md)
- Complexidade grande para um sistema com um único tema
- Torna a aparência final difícil de prever a partir do código do componente

**Razão para rejeição**: Incompatível com as decisões de estilo e de dependências, e desproporcional a um sistema de tema único.

## Consequências

### Positivas

- Superfície de API mínima e uniforme: um mecanismo, aceito por todos os componentes
- O interior dos componentes permanece livre para refatoração — não é contrato
- Ajustes de layout (largura, alinhamento, posicionamento no grid) são triviais
- Consistente com [ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md): tudo é classe utilitária, inclusive a customização
- A ausência de margem própria evita a categoria de conflito em que o consumidor "luta contra" o componente
- Quando `className` não resolve, o sinal é claro: falta uma variante ou um componente — não outra prop de estilo

### Negativas

- **A sobrescrita não é garantida.** Sem `tailwind-merge` ([ADR-0004](0004-zero-dependencias-de-runtime.md)), passar `px-600` para um componente que já aplica `px-400` produz as duas classes na string. O vencedor é decidido pela ordem no stylesheet, não na string de classes — a posição final de `className` mantém a origem legível, mas não confere precedência
- Ajuste de parte interna é impossível sem forkar o componente
- Nenhum controle sobre o que o consumidor sobrescreve: `className="bg-red-500"` num `Button` primário funciona (ou não, dependendo da ordem) e ninguém avisa
- Valor calculado em runtime não tem caminho oficial

### Neutras

- Componentes que estendem atributos HTML herdam `style` via spread, mesmo não sendo API documentada
- `className` é desestruturado fora de `...props` em todos os componentes, evitando sobrescrita acidental do valor computado
- As uniões de variante não são exportadas, para que possam ser renomeadas internamente; o consumidor deriva de `NonNullable<Props["variant"]>`

## Trade-offs

Priorizamos **superfície de API mínima e liberdade de refatoração interna** sobre **poder de customização e garantia de sobrescrita**. O consumidor tem um mecanismo simples que resolve a maioria dos casos, sem garantia de precedência — e nós mantemos o direito de mudar o interior dos componentes sem quebrar ninguém.

## Notas de Implementação

Ordem canônica do array de classes, com `className` sempre por último:

```tsx
className={[
  "…estrutura…",
  "transition-colors duration-150",
  "focus-visible:…",
  "disabled:…",
  variantClasses[variant],
  sizeClasses[size],
  className,
].filter(Boolean).join(" ")}
```

Regras A7 (ordem), A14 (`className` como único escape hatch) e A15 (não emitir margem) em `docs/best-practices/component-api.md`.

Exceção legítima à regra de margem: espaçamento **entre filhos próprios** — `gap-600` no `TabList`, `gap-100` no `FormGroup`. É composição interna, não margem externa.

## Validação

A decisão é bem-sucedida se:

- Nenhum componente expor prop de estilo além de `className`
- Nenhum componente emitir margem (verificável por inspeção das classes)
- Consumidores conseguirem resolver ajustes de layout sem pedir novas props

O sinal de que a decisão precisa revisão: pedidos recorrentes de `*ClassName` para a mesma região interna — indicaria que falta uma variante naquele componente.

## Revisão

**2026-07-07**: Decisão inicial. Se a ausência de resolução de conflito de classe causar problemas reais de sobrescrita, avaliar `tailwind-merge` — o que exige reabrir [ADR-0004](0004-zero-dependencias-de-runtime.md).
