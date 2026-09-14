# 10. Especialização de componentes por intenção, não por variante

Data: 2026-07-07

## Status

Ativa

## Contexto

O caminho convencional para um botão em design system é um componente único com um eixo de variante amplo:

```tsx
<Button variant="primary" | "secondary" | "ghost" | "danger" | "link" />
```

Esse modelo tem um problema que aparece com o crescimento: os eixos de variação deixam de fazer sentido uniformemente. Um botão destrutivo raramente precisa do tamanho `lg`. Um CTA de landing page não precisa de `sm`. Um botão só-ícone precisa da prop `icon` obrigatória, que não faz sentido para os outros. O resultado são props que só se aplicam a algumas variantes, combinações inválidas que o tipo permite, e um componente cuja API é a união de necessidades incompatíveis.

Havia também uma consideração de legibilidade: `<Button variant="danger">` exige ler a prop para saber que a ação é destrutiva.

## Decisão

Vamos **especializar componentes por intenção**, criando componentes distintos quando a intenção difere e os eixos de variação também diferem:

| Componente | Intenção | Eixos próprios |
|---|---|---|
| `Button` | ação comum | `variant` (3), `size` (3), `loading` |
| `DangerButton` | ação destrutiva | `variant` (3), `size` (2) — sem `loading` |
| `HeroButton` | CTA de destaque | `variant` (2) — sem `size` |
| `IconButton` | ação compacta só-ícone | `variant` (3), `size` (2), `icon` **obrigatório** |
| `IconToggle` | alternância entre dois modos | `size` (2), `active`, handlers por lado |

Dentro de cada componente, `variant` continua expressando **peso visual** (`primary`/`secondary`/`tertiary`), não intenção.

A regra de decisão documentada: se a intenção difere **e** os eixos de variação diferem, é componente novo. Se apenas o peso visual muda, é variante.

## Alternativas Consideradas

### Alternativa 1: `Button` único com variante ampla

**Descrição**: Um componente, `variant` cobrindo todas as intenções.

**Prós**:
- Uma API para aprender
- Zero duplicação de classes base
- Trocar a intenção de um botão é mudar uma string
- Modelo familiar — é o que a maioria dos design systems faz

**Contras**:
- Props que só se aplicam a algumas variantes (`loading` faz sentido em `primary`, não em `link`)
- Combinações inválidas permitidas pelo tipo (`variant="link" size="lg" loading`)
- A intenção exige ler a prop
- O componente cresce como união de necessidades incompatíveis
- Difícil restringir tamanhos por intenção

**Razão para rejeição**: A incapacidade de dar a cada intenção o seu próprio conjunto de eixos foi decisiva. Com componentes separados, `HeroButton` simplesmente não tem `size` — não há combinação inválida a documentar ou validar.

### Alternativa 2: Componente base compartilhado + wrappers finos

**Descrição**: Um `ButtonBase` interno não exportado, com `Button`/`DangerButton`/`HeroButton` como wrappers que fixam props.

**Prós**:
- Elimina a duplicação das classes base
- Mantém APIs especializadas na superfície pública
- Correção em um lugar propaga para todos

**Contras**:
- `ButtonBase` teria que aceitar a união de todos os eixos, reintroduzindo internamente o problema da Alternativa 1
- Uma camada de indireção a atravessar ao ler ou depurar qualquer botão
- Acopla os quatro componentes: mudar a base afeta todos, inclusive de formas não intencionadas
- Para ~10 linhas de classes compartilhadas, a abstração custa mais do que economiza

**Razão para rejeição**: Trocaria duplicação visível e inofensiva por acoplamento invisível. Com quatro componentes e uma linha base de classes, a duplicação é o custo menor — e é explicitamente aceita.

### Alternativa 3: Composição por slots (`<Button.Danger>`)

**Descrição**: Namespace com subcomponentes.

**Prós**:
- Agrupa visualmente a família
- Autocomplete guiado (`Button.` lista as opções)

**Contras**:
- Prejudica tree-shaking em alguns bundlers
- Torna o export mais complexo do que `export { Button }`
- Ganho puramente estético sobre nomes distintos

**Razão para rejeição**: Custo de bundling e complexidade de export sem benefício funcional.

## Consequências

### Positivas

- **A intenção fica visível no ponto de uso.** `<DangerButton>` se lê sem consultar props
- **Auditável**: `grep DangerButton src/` encontra toda ação destrutiva do código
- Cada componente tem exatamente os eixos que fazem sentido para ele — nenhuma combinação inválida a documentar
- `icon` pode ser obrigatório no `IconButton` sem afetar os outros
- APIs menores e mais fáceis de aprender individualmente
- Variantes com o mesmo nome podem ter aparências diferentes por intenção: `Button.secondary` é neutro (texto `neutral-400`, borda `neutral-200`), `DangerButton.secondary` é vermelho (texto e borda `danger-500`)

### Negativas

- **Duplicação deliberada**: os quatro botões repetem a mesma linha base de classes (`inline-flex items-center justify-center rounded-200 font-semibold`, transição, foco, disabled) e a mesma estrutura de render
- Uma correção na linha base precisa ser aplicada em quatro arquivos
- Mais componentes para descobrir e documentar
- Trocar a intenção de um botão exige mudar o import e o JSX, não uma string
- Nada impede a divergência acidental entre irmãos — que se materializou nas dimensões: `Button` com `size="md"` tem 40px de altura, `DangerButton` com `size="md"` tem 48px
- O limite entre "intenção nova" e "variante nova" é de julgamento, não mecânico

### Neutras

- A regra de decisão precisa estar documentada, já que não é mecânica
- Componentes irmãos devem copiar as receitas de estado uns dos outros para manter consistência
- A mesma lógica se aplica a `Select` vs. `MegaSelect`, que são intenções distintas de seleção ([ADR-0014](0014-elemento-nativo-primeiro.md))

## Trade-offs

Priorizamos **clareza da intenção no ponto de uso e APIs precisas por componente** sobre **DRY e uma superfície de API menor**. Aceitamos duplicação de classes base como custo consciente — e aceitamos, com ela, o risco de divergência entre irmãos, que só é contido por disciplina de revisão.

## Notas de Implementação

Árvore de decisão "componente ou variante?" em `docs/best-practices/component-api.md`, seção "A decisão anterior a todas".

Regra T5 em `docs/best-practices/tokens.md` é a mitigação do risco de divergência: antes de escolher a classe de um estado, abrir um componente irmão e copiar a receita.

Tabela de qual componente de ação usar em cada situação em `docs/business-rules.md`, seção "Política de escolha entre os componentes de ação", e no [README](../../README.md).

## Validação

A decisão é bem-sucedida se:

- Novos desenvolvedores escolherem o componente correto sem consultar documentação
- Nenhum componente acumular props que só se aplicam a parte das variantes
- Componentes irmãos mantiverem as mesmas receitas de estado (foco, disabled, transição)

O sinal de que a decisão está falhando: divergência acumulada entre irmãos — dimensões, cores de estado ou comportamento diferentes sem razão de intenção.

## Revisão

**2026-07-07**: Decisão inicial. Reavaliar se o número de componentes de ação passar de ~8, ponto em que a duplicação da linha base e o risco de divergência podem superar o ganho de clareza.
