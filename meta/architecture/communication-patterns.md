# Padrões de Comunicação

> Última atualização: 2026-07-07
>
> Como as partes do **@ds/core** se comunicam entre si e com as aplicações consumidoras.

## Visão Geral

**Não há comunicação de rede neste sistema.** Nenhum protocolo REST, gRPC, GraphQL, WebSocket ou mensageria. Nenhuma requisição HTTP parte da biblioteca; nenhum endpoint é exposto.

O que existe são três canais de comunicação de natureza completamente diferente:

| Canal | Momento | Mecanismo | Direção |
|---|---|---|---|
| **Design → código** | Design time | Arquivo exportado, transcrito à mão | Unidirecional |
| **Biblioteca → aplicação** | Build time | Resolução de módulo ESM + CSS | Unidirecional |
| **Aplicação ↔ componente** | Runtime | Props e callbacks React | Bidirecional |

Este documento descreve os três. Os padrões de resiliência distribuída — circuit breaker, retry, timeout, fallback de serviço — **não se aplicam**, e a seção de resiliência explica o que existe em seu lugar.

---

## Canal 1 — Design → Código (design time)

### Protocolo: arquivo exportado, transcrição manual

**Uso**: Levar valores de design do Figma para a camada de tokens.

**Padrão**: Export manual das variáveis do Figma → substituição de [figmatokens.json](../../figmatokens.json) → diff → transcrição para `src/tokens/*.ts`.

**Formato**: W3C Design Tokens com extensões da Figma.

**Autenticação**: Nenhuma. Não há chamada de API; é um arquivo versionado.

**Decisões relacionadas**: [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md), [ADR-0007](../adr/0007-tokens-em-duas-camadas.md)

**Exemplo de mensagem** (token primitivo):

```json
"Primary": {
  "50": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [0.9529411792755127, 0.9372549057006836, 0.9764705896377563],
      "alpha": 1,
      "hex": "#F3EFF9"
    },
    "$extensions": {
      "com.figma.variableId": "VariableID:2:581",
      "com.figma.scopes": ["ALL_SCOPES"]
    }
  }
}
```

**Exemplo de mensagem** (token semântico, com alias):

```json
"Size medium": {
  "$type": "number",
  "$value": "{Typography primitives.Font size.base}"
}
```

**Tradução aplicada na transcrição**: o campo `hex` é usado; `components` e `variableId` são descartados; alias textuais viram referências reais de objeto TypeScript. Números viram strings com unidade. Tabela completa em `docs/best-practices/tokens.md`, regra T8.

**Garantias**: Nenhuma automatizada. O `tsc` verifica tipo, não valor — uma divergência entre Figma e código não é detectada por nada. É o risco central desta decisão, aceito e gerenciado por procedimento.

---

## Canal 2 — Biblioteca → Aplicação (build time)

### Protocolo: resolução de módulo ESM + folha de estilo separada

**Uso**: Entregar componentes, tipos e CSS às aplicações consumidoras.

**Padrão**: Dois subpaths declarados em `exports`, resolvidos por workspace npm ou dependência `file:`.

**Autenticação**: Nenhuma. Não há registry — o pacote é `private` e resolvido pelo sistema de arquivos.

**Versionamento**: Não há versionamento efetivo; todos os consumidores usam o estado do disco. A disciplina de `major`/`minor`/`patch` permanece como **comunicação**, documentada em `docs/best-practices/contributing.md`.

**Decisões relacionadas**: [ADR-0005](../adr/0005-build-esm-only-com-css-em-subpath.md), [ADR-0006](../adr/0006-distribuicao-por-workspace-local.md), [ADR-0001](../adr/0001-react-como-biblioteca-de-ui.md)

### Contrato

```json
"exports": {
  ".":           { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
  "./style.css": "./dist/index.css"
}
```

| Subpath | Artefato | Conteúdo |
|---|---|---|
| `@ds/core` | `dist/index.js` + `dist/index.d.ts` | 16 componentes + 9 objetos de token (ESM) |
| `@ds/core/style.css` | `dist/index.css` | Preflight do Tailwind + utilitários usados |

Dois subpaths, e **apenas** dois — `@ds/core/Button` não resolve.

### Exemplo de integração

```tsx
// 1. CSS, uma única vez, no entrypoint da aplicação
import "@ds/core/style.css";

// 2. componentes e tokens
import { Button, FormGroup, MegaSelect, colors } from "@ds/core";
```

```ts
// 3. opcional — estender o Tailwind da aplicação com os tokens
import { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } from "@ds/core";
export default { theme: { extend: { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } } };
```

### Pré-condições do consumidor

| Requisito | Origem |
|---|---|
| React 18 ou 19 instalado | `peerDependencies` |
| Bundler com suporte a ESM | `formats: ["es"]` — não há build CJS |
| Import explícito do CSS | O JS não injeta estilo |
| Fonte DM Sans carregada (pesos 400 e 600) | `globals.css` não tem `@font-face` |
| `dist/` gerado (`npm run build`) | `dist/` é ignorado pelo git |

### Tratamento de falhas

Todas as falhas deste canal se manifestam em **build time** ou como ausência visível de estilo — nunca como erro silencioso em produção.

| Sintoma | Causa |
|---|---|
| `Failed to resolve import "@ds/core"` | `dist/` não existe — falta `npm run build` |
| Componentes sem estilo algum | `@ds/core/style.css` não importado |
| Fonte de sistema em vez de DM Sans | Aplicação não carregou a fonte (degrada pela stack de fallback) |
| `Invalid hook call` | React duplicado — verificar resolução para uma única instância |
| `require() of ES Module` | Consumidor em CommonJS |
| Classes da aplicação não aplicadas | Aplicação não estendeu a própria config do Tailwind |
| "A mudança não aparece" | `dist/` não reconstruído — não há watch cruzado |

### Ordem de importação do CSS

Como toda a variação de estilo é resolvida por utilitário e não por especificidade ([princípio 7](system-overview.md#princípios-arquiteturais)), a ordem no stylesheet determina qual utilitário vence entre os de mesma especificidade.

**Importar o CSS da biblioteca antes do CSS da aplicação** é o que permite que a aplicação sobrescreva via `className`. Foi por isso que a injeção de CSS pelo JavaScript foi rejeitada ([ADR-0005](../adr/0005-build-esm-only-com-css-em-subpath.md)): ela tiraria esse controle do consumidor.

---

## Canal 3 — Aplicação ↔ Componente (runtime)

### Protocolo: props e callbacks React

**Uso**: Único canal de comunicação em runtime. Não há event bus, Context ou store.

**Padrão**: Dados descem por props; eventos sobem por callbacks. Todo callback é invocado com optional chaining (`onChange?.(v)`).

**Decisões relacionadas**: [ADR-0013](../adr/0013-container-e-item-separados.md), [ADR-0012](../adr/0012-classname-como-unico-escape-hatch.md)

### Contrato de entrada (props)

A maioria dos componentes **estende os atributos HTML** do elemento raiz, o que os torna transparentes a qualquer prop nativa:

| Componente | Interface base |
|---|---|
| `Button`, `DangerButton`, `HeroButton`, `IconButton` | `ButtonHTMLAttributes<HTMLButtonElement>` |
| `Textbox`, `Checkbox`, `Radio`, `SearchInput`, `FormGroup` | `Omit<InputHTMLAttributes<HTMLInputElement>, "type">` |
| `Select` | `SelectHTMLAttributes<HTMLSelectElement>` |
| `MegaSelect` | `Omit<HTMLAttributes<HTMLDivElement>, "onChange">` |
| `SelectOption` | `ButtonHTMLAttributes<HTMLButtonElement>` |

`Omit` é o mecanismo que fecha o que o componente controla: `type` nos inputs, `onChange` no `MegaSelect`.

API fechada (sem herança de atributos HTML), onde o elemento raiz não é o alvo natural das props: `IconToggle`, `Navbar`, `NavbarTab`, `TabList`, `Tab`, `MegaSelectOption`. Nesses casos `className` é a única prop de escape.

### Contrato de saída (callbacks)

| Componente | Callback | Assinatura | Natureza |
|---|---|---|---|
| Botões | `onClick` e demais | herdados de `ButtonHTMLAttributes` | evento DOM nativo |
| `Textbox`, `Checkbox`, `Radio`, `FormGroup` | `onChange` e demais | herdados de `InputHTMLAttributes` | evento DOM nativo |
| `Select` | `onChange` e demais | herdados de `SelectHTMLAttributes` | evento DOM nativo |
| `SelectOption` | `onClick` | `MouseEventHandler` | evento DOM nativo |
| `IconToggle` | `onLeftClick`, `onRightClick` | `() => void` | simplificado, um por lado |
| `MegaSelect` | `onChange` | `(value: string) => void` | simplificado — **substitui** o do DOM via `Omit` |
| `MegaSelectOption` | `onClick` | `(value: string) => void` | simplificado |
| `SearchInput` | `onOpenChange` | `(open: boolean) => void` | simplificado |
| `NavbarTab`, `Tab` | `onClick` | `() => void` | simplificado |

A divisão é deliberada: componentes que **estendem** atributos HTML repassam o evento DOM completo, porque bibliotecas de formulário esperam essa assinatura. Componentes de **API fechada** expõem callbacks simplificados sem o objeto de evento.

### Padrões de controle de estado

```
TOTALMENTE CONTROLADO          O estado vive na aplicação.
MegaSelect.value               Default para estado que a aplicação já possui
IconToggle.active              (rota atual, valor de formulário).
Tab.active / NavbarTab.active

HÍBRIDO                        Funciona sem props; aceita controle quando oferecido.
SearchInput.open               Detecção por `!== undefined`.
                               O callback dispara nos DOIS modos.

INTERNO                        Estado puramente visual que o consumidor não precisa conhecer.
MegaSelect.open                Não exposto como prop.
MegaSelect.activeIndex
```

Regra inviolável do padrão híbrido: **nunca alternar entre modos**. A detecção é reavaliada a cada render; se `open` passar de valor para `undefined`, o componente troca de modo no meio do ciclo de vida e o estado interno estará obsoleto.

### Matriz de comunicação interna

Quais partes do sistema se comunicam com quais, e como:

| De ↓ / Para → | `src/tokens` | `tailwind.config` | Componentes | `src/index` | Aplicação |
|---|---|---|---|---|---|
| **Figma** | — | — | — | — | — |
| **`figmatokens.json`** | transcrição manual | — | — | — | — |
| **`src/tokens`** | — | import (build) | via classes CSS | reexport | valores em runtime |
| **`tailwind.config`** | — | — | utilitários CSS | — | — |
| **Componentes** | — | — | composição¹ | reexport | props ↓ / callbacks ↑ |
| **`src/index`** | — | — | — | — | ESM + CSS |

¹ Composição entre componentes ocorre apenas **dentro da mesma categoria**: `FormGroup` → `Textbox`, `MegaSelect` → `MegaSelectOption`. Nenhum componente importa de outra categoria.

Observação: a coluna do Figma está vazia porque a comunicação é estritamente unidirecional — nada no repositório escreve de volta no Figma.

### Diagrama de sequência: seleção no `MegaSelect` por teclado

O fluxo mais complexo do sistema, e o único com coordenação de estado interno.

```
 Usuário          MegaSelect (gatilho)        MegaSelectOption        Aplicação
    │                     │                          │                    │
    │  Tab (foco)         │                          │                    │
    ├────────────────────►│ role=combobox                                 │
    │                     │ aria-expanded=false                           │
    │                     │                          │                    │
    │  Enter              │                          │                    │
    ├────────────────────►│ openPanel("start")                            │
    │                     │  setOpen(true)                                │
    │                     │  setActiveIndex(selecionado ?? primeiro)      │
    │                     ├─────────────────────────►│ renderiza opções   │
    │                     │ aria-expanded=true       │ role=option        │
    │                     │ aria-controls=<listboxId>│ tabIndex=-1        │
    │                     │ aria-activedescendant ───┤ id=<listboxId>-opt-N
    │                     │                          │                    │
    │  ↓ ↓                │                          │                    │
    ├────────────────────►│ moveActive(1)                                 │
    │                     │  pula opções disabled                         │
    │                     │  clamp nos extremos (sem wrap)                │
    │                     │  scrollIntoView({block:"nearest"})            │
    │                     │  ativa recebe ring-1 ring-primary-500         │
    │                     │                          │                    │
    │  Enter              │                          │                    │
    ├────────────────────►│ commit(activeIndex)                           │
    │                     │  if (opt.disabled) return                     │
    │                     │  onChange?.(opt.value) ───────────────────────►│
    │                     │  closePanel(true)                             │  atualiza
    │                     │   setOpen(false)                              │  o estado
    │                     │   setActiveIndex(-1)                          │  e re-renderiza
    │                     │   triggerRef.focus()  ◄── foco devolvido      │  com value novo
    │                     │                          │                    │
    │                     │◄──────────────────────────────────────────────┤ value
    │                     │ exibe o label da opção selecionada            │
```

Caminhos alternativos:

| Ação | Efeito |
|---|---|
| `Escape` | `closePanel(true)` — fecha sem selecionar, **devolve o foco** ao gatilho |
| `Tab` | fecha e deixa o foco seguir (sem `preventDefault`) |
| `↑` com painel fechado | `openPanel("end")` — abre posicionando no fim |
| `Home` / `End` | primeira / última opção habilitada |
| `mousedown` fora | fecha **sem** roubar o foco (o listener usa `setOpen(false)`, não `closePanel`) |
| Clique em opção | `commit(i)` — mesmo caminho do `Enter` |
| Clique em opção desabilitada | bloqueado por `disabled` no `<button>` e por guarda no handler |
| `disabled` passa a `true` com painel aberto | painel deixa de renderizar (condição `open && !disabled`) |

O detalhe de design que merece atenção: **clique fora não devolve o foco, `Escape` e `Enter` devolvem.** Roubar o foco após um clique em outro lugar da página seria hostil — o usuário já indicou onde quer estar.

### Diagrama de sequência: `SearchInput` (padrão híbrido)

```
 Usuário         SearchInput            Aplicação (modo controlado)
    │                 │                          │
    │  clique         │                          │
    ├────────────────►│ toggle()                 │
    │                 │  if (disabled) return    │
    │                 │  next = !open            │
    │                 │  if (!isControlled)      │
    │                 │    setInternalOpen(next) │
    │                 │  onOpenChange?.(next) ──►│  reage (analytics, layout)
    │                 │                          │  e, se controlado, devolve `open`
    │                 │◄─────────────────────────┤
    │                 │ troca a árvore renderizada:
    │                 │ botão 40×40  →  container + <input autoFocus>
    │◄────────────────┤ foco vai para o campo
```

`onOpenChange` dispara nos dois modos — é o que permite ao consumidor observar sem assumir o controle.

---

## Contratos e Schemas

### Contrato de tipos

`declaration: true` + `declarationMap: true` geram `.d.ts` com source map, dando ao consumidor tipagem completa e navegação até o fonte.

**Exportado**: 16 componentes + 2 subcomponentes de opção, 18 interfaces `*Props`, 2 tipos de item de dados (`SelectOptionItem`, `MegaSelectItem`), 9 objetos de token.

**Não exportado** (deliberadamente): as uniões de variante — `Variant`, `Size`, `DangerVariant`, `HeroVariant`, `IconVariant`, `IconSize`, `DangerSize`, `ActiveSide`, `ToggleSize`. São locais ao módulo para poderem ser renomeadas sem quebrar consumidor.

Derivação no lado do consumidor:

```ts
import type { ButtonProps } from "@ds/core";
type ButtonVariant = NonNullable<ButtonProps["variant"]>;  // "primary" | "secondary" | "tertiary"
```

### Contrato de tokens

O **formato** de cada token é parte do contrato, porque o consumidor pode alimentar a própria config do Tailwind com eles:

| Token | Tipo | Exemplo |
|---|---|---|
| `colors` | `Record<string, Record<string, string>>` | `colors.primary[500]` → `"#6739B1"` |
| `spacing`, `sizePrimitives` | `Record<string, string>` | `spacing["400"]` → `"16px"` |
| `borderRadius` | `Record<string, string>` | `borderRadius.full` → `"9999px"` |
| `fontFamily` | `Record<string, string[]>` | `fontFamily.sans` → `["DM Sans", …]` |
| `fontSize` | `Record<string, [string, { lineHeight: string }]>` | `fontSize.sm` → `["14px", { lineHeight: "20px" }]` |
| `fontWeight` | `Record<string, string>` | `fontWeight.semibold` → `"600"` |
| `colorPrimitives`, `semanticColors` | objeto literal, tipo inferido | `semanticColors.text.base.default` |

### Contrato ARIA

Para consumidores que escrevem testes ou auditam acessibilidade, os papéis e atributos emitidos são parte observável do contrato:

| Componente | Papel | Atributos de estado |
|---|---|---|
| `MegaSelect` (gatilho) | `combobox` | `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant` |
| `MegaSelect` (painel) | `listbox` | `id` |
| `MegaSelectOption` | `option` | `aria-selected`, `aria-disabled`, `tabIndex=-1` |
| `SelectOption` | `option` | `aria-selected`, `data-value` |
| `Tab`, `NavbarTab` | `tab` | `aria-selected` |
| `TabList` | `tablist` | — |
| `Navbar` | `<nav>` nativo | — |
| `IconToggle` | dois `<button>` | `aria-pressed` |
| `IconButton` | `<button>` | `aria-label` (responsabilidade do consumidor) |
| Ícones, camadas de apresentação | — | `aria-hidden` |

---

## Resiliência

Os padrões de resiliência distribuída não se aplicam: não há I/O, rede ou processo externo. O que existe é de outra ordem.

### Degradação de fonte

A stack `["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]` degrada em três níveis. A ausência da fonte não gera erro — a tipografia fica diferente do design, e as métricas de line-height pensadas para DM Sans passam a se aplicar a outra fonte.

### Defaults em toda prop opcional

Nenhum componente depende de o consumidor passar props de aparência. `<Button />` renderiza um botão primário médio válido. Isso elimina a classe de bug em que uma prop faltante gera `className="undefined"`.

### Optional chaining em todo callback

`onChange?.(v)`, `onOpenChange?.(next)`, `onClick?.(value)`. Nenhum componente assume que o handler foi fornecido.

### Guardas de interação redundantes

Estado desabilitado é aplicado em duas camadas: o atributo `disabled` do elemento nativo (que o navegador respeita) **e** uma guarda no handler JS. No `MegaSelect` há uma terceira camada — a condição de render `open && !disabled`.

### Cleanup de efeito

Os dois `useEffect` do sistema estão no `MegaSelect`: o listener de `mousedown` remove-se na desmontagem; o de scroll da opção ativa não registra nada global.

### `tsc` bloqueante

`"build": "tsc && vite build"`. O `&&` impede que um bundle com erro de tipo chegue ao `dist/` — é o mecanismo que protege o contrato do Canal 2.

### Sem estado global

Nenhum Context, store, singleton ou variável de módulo mutável. Cada instância é independente; montar duas cópias da biblioteca na mesma página não gera conflito de estado (embora gere CSS duplicado).

### Limites conhecidos

| Limite | Consequência |
|---|---|
| Painel do `MegaSelect` sem portal nem detecção de colisão | abre sempre para baixo; pode ser cortado por `overflow` de ancestral ou pela borda da viewport |
| `z-10` fixo — único z-index do sistema | overlay da aplicação com z-index maior cobre o dropdown |
| Sem busca por digitação no `MegaSelect` | o `<select>` nativo tem; o customizado não |
| Sem navegação por setas entre abas | consequência de [ADR-0013](../adr/0013-container-e-item-separados.md) |
| `id` derivado do label no `FormGroup` pode colidir | dois campos com o mesmo label geram o mesmo `id` |
| Sem tema alternativo | valores de token compilados no CSS; dark mode exigiria variáveis CSS |

---

## Evolução

**2026-07-07 — estado inicial.** Os três canais estabelecidos conforme os ADRs.

Mudanças que afetariam cada canal:

| Canal | Mudança possível | Decisão a reabrir |
|---|---|---|
| Design → código | Automação de tokens (Style Dictionary) | [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md) |
| Design → código | Múltiplos modos (dark mode) | [ADR-0007](../adr/0007-tokens-em-duas-camadas.md), [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md) |
| Biblioteca → aplicação | Publicação em registry, versionamento real | [ADR-0006](../adr/0006-distribuicao-por-workspace-local.md) |
| Biblioteca → aplicação | Build CJS adicional | [ADR-0005](../adr/0005-build-esm-only-com-css-em-subpath.md) |
| Aplicação ↔ componente | Context para coordenar teclado entre abas | [ADR-0013](../adr/0013-container-e-item-separados.md) |
| Aplicação ↔ componente | Portal e posicionamento no `MegaSelect` | [ADR-0004](../adr/0004-zero-dependencias-de-runtime.md) |

## Referências

- [Visão Geral da Arquitetura](system-overview.md)
- [ADRs](../adr/README.md)
- [docs/integrations.md](../../docs/integrations.md) — pipeline Figma e contrato de consumo, em detalhe
- [docs/features.md](../../docs/features.md) — referência completa de API dos componentes
- [docs/business-rules.md](../../docs/business-rules.md) — invariantes de comportamento
