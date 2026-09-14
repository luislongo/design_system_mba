# Integrações

Este repositório é uma **folha** na árvore de dependências: não consome nenhum serviço, API ou repositório em runtime. Suas integrações são de duas naturezas — uma **entrada de design** (Figma) e uma **saída de código** (as aplicações que instalam o pacote).

```
      Figma  ──── export de variáveis ────►  figmatokens.json
                                                   │
                                          transcrição manual
                                                   ▼
                                            src/tokens/*.ts
                                                   │
                                            npm run build
                                                   ▼
                                        dist/index.js + index.css
                                                   │
                                        workspace / file: link
                                        ┌──────────┴──────────┐
                                        ▼                     ▼
                                  aplicação A           aplicação B
```

---

## Repositórios e Serviços Relacionados

### Aplicações consumidoras (workspace local)

**Tipo**: Biblioteca de componentes React (dependência de build)

**Propósito**: Fornecer a camada de UI — componentes e tokens — para as aplicações de produto, garantindo consistência visual e comportamental entre elas.

**Protocolo**: Resolução de módulo ESM via **npm workspace ou dependência `file:`**. O pacote é `"private": true` ([package.json:4](../package.json#L4)) e não é publicado em registry — a aplicação referencia a pasta no sistema de arquivos e consome o `dist/` gerado localmente.

Configuração no lado do consumidor:

```json
// package.json da aplicação
{
  "dependencies": {
    "@ds/core": "file:../design_system"
  }
}
```

ou, com workspaces:

```json
// package.json na raiz do monorepo
{ "workspaces": ["design_system", "app"] }
```

**Dados trocados**: Nenhum em runtime. A troca é de **artefatos de build**:

| Artefato | Subpath | Conteúdo |
|---|---|---|
| `dist/index.js` | `@ds/core` | Componentes React + objetos de token (ESM) |
| `dist/index.d.ts` | `@ds/core` | Declarações de tipo (`declaration: true`) |
| `dist/index.css` | `@ds/core/style.css` | CSS compilado pelo Tailwind |

**Dependência**: **Crítica.** A aplicação não renderiza sua UI sem o pacote. E a dependência é de build, não de rede — uma falha aqui é erro de compilação, não erro em produção.

**Tratamento de falhas**: Não há fallback possível nem desejável. As falhas se manifestam em build time:

| Sintoma | Causa provável |
|---|---|
| `Failed to resolve import "@ds/core"` | `dist/` não existe — falta rodar `npm run build` no design system |
| Componentes renderizam sem estilo | `@ds/core/style.css` não foi importado na aplicação |
| Texto com fonte de sistema em vez de DM Sans | a aplicação não carregou o arquivo da fonte (ver [Fonte DM Sans](#fonte-dm-sans)) |
| `Invalid hook call` / dois Reacts | React duplicado — verificar que a resolução do consumidor aponta para uma única instância |
| `require() of ES Module` | consumidor em CommonJS; o pacote é ESM-only |

#### Contrato de consumo

Passos obrigatórios do lado da aplicação:

```bash
# 1. no design system — gerar dist/
cd design_system && npm install && npm run build
```

```tsx
// 2. na aplicação — importar o CSS uma única vez, no entrypoint
import "@ds/core/style.css";
```

```tsx
// 3. usar componentes e tokens
import { Button, FormGroup, MegaSelect, colors } from "@ds/core";

export function Formulario() {
  return (
    <form>
      <FormGroup label="E-mail" placeholder="voce@exemplo.com" />
      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

Três pontos que decorrem do contrato:

1. **O CSS não vem junto com o JS.** O `import` de componente não injeta estilo. Sem o `import "@ds/core/style.css"` os componentes renderizam sem nenhuma classe aplicada.
2. **O `dist/` precisa ser reconstruído a cada mudança na biblioteca.** Não há watch cruzado configurado; durante desenvolvimento simultâneo, `npm run build` no design system é a etapa de sincronização.
3. **A aplicação precisa do próprio React.** `react`, `react-dom` e `react/jsx-runtime` são `external` no bundle ([vite.config.ts:13](../vite.config.ts#L13)) e `peerDependencies` na faixa `^18.0.0 || ^19.0.0`.

#### Interação com o Tailwind da aplicação

Ponto que costuma surpreender: o `content` da config deste repositório cobre apenas `./src/**/*.{ts,tsx}` ([tailwind.config.ts:5](../tailwind.config.ts#L5)). O `dist/index.css` contém **somente** as classes usadas pelos componentes da biblioteca.

Se a aplicação também usa Tailwind, ela tem sua própria config e seu próprio CSS, e há duas formas de conviver:

**Opção A — dois CSS independentes.** A aplicação importa `@ds/core/style.css` e gera o seu separadamente. Simples, mas há duplicação de `@tailwind base` (preflight) e a aplicação não tem acesso aos tokens como classes.

**Opção B — a aplicação estende os tokens.** A aplicação importa os tokens na própria config e passa a poder usar `bg-primary-500`, `px-400` etc. no código dela:

```ts
// tailwind.config.ts da aplicação
import { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } from "@ds/core";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } },
};
```

Como os tokens são exportados no bundle público ([src/index.ts](../src/index.ts) faz `export * from "./tokens"`), essa importação funciona sem acesso ao código-fonte da biblioteca.

---

## Dependências Externas

### Figma

**Tipo**: Ferramenta de design — integração por **arquivo exportado**, sem API

**Propósito**: O Figma é a fonte de verdade do design. As variáveis definidas lá (cor, tamanho, tipografia) são exportadas e transcritas para a camada de tokens em TypeScript.

**Protocolo**: Export manual das variáveis do Figma para [figmatokens.json](../figmatokens.json), no formato **W3C Design Tokens** com extensões da Figma. Não há chamada de API, plugin instalado no build ou automação. Uma etapa de transcrição humana converte esse JSON em [src/tokens/*.ts](../src/tokens/).

**Dados trocados** — estrutura do arquivo exportado:

| Grupo no `figmatokens.json` | Destino em `src/tokens/` |
|---|---|
| `Color primitives.{Primary, Neutral, Light, Danger}` | `colorPrimitives` em [colors.ts](../src/tokens/colors.ts) |
| `Color.{Border, Background, Text}` | `semanticColors` em [colors.ts](../src/tokens/colors.ts) |
| `Size primitives` | `sizePrimitives` em [spacing.ts](../src/tokens/spacing.ts) |
| `Size.{Radius, Gap, Padding}` | `borderRadius` (parcial) em [spacing.ts](../src/tokens/spacing.ts) |
| `Typography primitives.{Font Family, Weight, Font size}` | `fontFamily`, `fontWeight`, `fontSize` em [typography.ts](../src/tokens/typography.ts) |
| `Typography.Body` | (sem destino direto — ver abaixo) |
| `Color primitives.Utilities`, `Tertiary` (raiz) | `"transparent"` nos tokens semânticos |

Formato de um token primitivo no arquivo:

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

A transcrição usa o campo `hex`; `components` (sRGB normalizado) e `com.figma.variableId` não são levados para o TypeScript.

Tokens semânticos aparecem como **alias**, com sintaxe de referência entre chaves:

```json
"Size medium": {
  "$type": "number",
  "$value": "{Typography primitives.Font size.base}"
}
```

No TypeScript, esses alias viram referências reais de objeto — o que preserva a intenção do Figma na estrutura do código:

```ts
// colors.ts:51
default: colorPrimitives.primary[500],
```

**Dependência**: **Crítica em design time, inexistente em runtime.** O Figma não participa de build nem de execução; sem ele, a biblioteca compila e funciona. O que se perde é a capacidade de saber se os tokens estão atualizados.

**Tratamento de falhas**: Não aplicável — é um arquivo versionado, não uma chamada. O risco real é **divergência silenciosa**: uma variável alterada no Figma sem novo export, ou um export sem a transcrição correspondente em `src/tokens/`. Nada no build detecta isso.

#### Diferenças de forma entre o export e os tokens em TS

A transcrição não é uma cópia — ela adapta o formato do Figma ao que o Tailwind consome:

- **Números viram strings com unidade.** `"$value": 16` no Figma torna-se `"16px"` em `sizePrimitives`, porque o Tailwind espera valores CSS.
- **`fontSize` ganha `lineHeight`.** O Figma exporta apenas o tamanho (`Font size.sm` = 14). Em [typography.ts:5-13](../src/tokens/typography.ts#L5-L13) cada tamanho é uma tupla `[size, { lineHeight }]` — os line-heights (16, 20, 24, 28, 28, 32, 36) são definidos no código, no formato de tupla que o Tailwind aceita.
- **`fontFamily` ganha a stack de fallback.** O Figma exporta `"DM Sans"`; o TS declara `["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]`.
- **`fontWeight` vira string.** `600` → `"600"`.
- **Nomes são normalizados.** `Color primitives.Primary` → `colorPrimitives.primary`; `Size.Radius.Full` → `borderRadius.full`; `Color.Text.Base.Default` → `semanticColors.text.base.default`.
- **`Size.Gap` e `Size.Padding` não têm export próprio.** Esses grupos existem no Figma como subconjuntos semânticos da escala, mas em código são cobertos pelo `spacing` único (que é `sizePrimitives` por referência).
- **`Typography.Body` não tem export próprio.** O grupo semântico de tipografia do Figma (`Font family`, `Size small/medium/large`, `Font weight`) não foi materializado como objeto em TS; os componentes usam diretamente as classes de escala (`text-sm`, `text-base`, `font-semibold`).
- **Modo único.** O arquivo declara `"$extensions": { "com.figma.modeName": "Mode 3" }` na raiz. Só esse modo foi exportado; não há tema alternativo (dark mode) no arquivo nem no código.

#### Procedimento de sincronização

Como não há automação, a sincronização é um procedimento manual documentado:

1. No Figma, exportar as variáveis e substituir [figmatokens.json](../figmatokens.json).
2. Diff do JSON para identificar o que mudou.
3. Aplicar as mudanças correspondentes em [src/tokens/](../src/tokens/), respeitando as adaptações de forma listadas acima.
4. `npm run build` — o `tsc` detecta quebra de tipo, mas **não** detecta valor divergente.
5. `npm run storybook` e revisar visualmente os componentes afetados.
6. Reconstruir o `dist/` consumido pelas aplicações.

Ver [best-practices/tokens.md](best-practices/tokens.md) para as regras que governam adição e alteração de token.

### Fonte DM Sans

**Tipo**: Recurso de fonte web (Google Fonts)

**Propósito**: É a família tipográfica do sistema, primeira opção da stack `font-sans`.

**Protocolo**: Nenhum implementado neste repositório. [globals.css](../src/styles/globals.css) contém apenas as três diretivas do Tailwind — não há `@font-face`, `@import url(…)` ou `<link>`. [typography.ts:2](../src/tokens/typography.ts#L2) apenas **nomeia** a família:

```ts
export const fontFamily = { sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"] };
```

**Dependência**: **Opcional com degradação silenciosa.** Sem a fonte carregada, o navegador cai no próximo item da stack (`ui-sans-serif` → `system-ui` → `sans-serif`). Nada quebra; a tipografia fica diferente do design, e as métricas de altura de linha — pensadas para DM Sans — passam a se aplicar a outra fonte.

**Tratamento de falhas**: A stack de fallback **é** o tratamento. Carregar a fonte é responsabilidade da aplicação consumidora:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
```

Os pesos necessários são exatamente **400** e **600**, os dois valores definidos em `fontWeight` ([typography.ts:15-18](../src/tokens/typography.ts#L15-L18)).

O mesmo vale para o Storybook: [.storybook/preview.ts](../.storybook/preview.ts) importa `globals.css` mas não carrega a fonte, então o catálogo visual também renderiza com a fonte de fallback.

### Registry npm

**Tipo**: Registry de pacotes

**Propósito**: Origem das dependências de desenvolvimento (React, Tailwind, Vite, Storybook, TypeScript).

**Protocolo**: `npm install`, com versões travadas por [package-lock.json](../package-lock.json).

**Dependência**: Crítica apenas para instalação e build. Não há dependência de runtime — a lista de `dependencies` do pacote é vazia.

**Tratamento de falhas**: `package-lock.json` versionado garante instalação reproduzível. O pacote **não é publicado** neste registry (`"private": true`).

---

## Eventos

Não aplicável. Não há mensageria, event bus, WebSocket ou pub/sub. A comunicação entre componentes e aplicação é feita exclusivamente por **props e callbacks React**.

O único listener de evento global do sistema é um `mousedown` em `document`, local ao `MegaSelect` e removido na desmontagem ([MegaSelect.tsx:57-66](../src/components/inputs/MegaSelect/MegaSelect.tsx#L57-L66)).

### Callbacks expostos aos consumidores

Estes são o "contrato de eventos" da biblioteca:

| Componente | Callback | Assinatura | Observação |
|---|---|---|---|
| `Button`, `DangerButton`, `HeroButton`, `IconButton` | `onClick` e demais | herdados de `ButtonHTMLAttributes` | eventos DOM nativos |
| `Textbox`, `Checkbox`, `Radio`, `FormGroup` | `onChange` e demais | herdados de `InputHTMLAttributes` | evento DOM nativo |
| `Select` | `onChange` e demais | herdados de `SelectHTMLAttributes` | evento DOM nativo |
| `IconToggle` | `onLeftClick`, `onRightClick` | `() => void` | um por lado, não um `onChange` unificado |
| `MegaSelect` | `onChange` | `(value: string) => void` | **substitui** o `onChange` do DOM via `Omit` |
| `MegaSelectOption` | `onClick` | `(value: string) => void` | recebe o value, não o evento |
| `SearchInput` | `onOpenChange` | `(open: boolean) => void` | disparado nos dois modos de controle |
| `NavbarTab`, `Tab` | `onClick` | `() => void` | sem parâmetro de evento |
| `SelectOption` | `onClick` | `MouseEventHandler` | herdado de `ButtonHTMLAttributes` |

Note a inconsistência deliberada: componentes que estendem atributos HTML repassam o evento DOM completo; componentes de API fechada (`IconToggle`, `MegaSelect`, `Tab`, `NavbarTab`) expõem callbacks simplificados sem o objeto de evento.

---

## Contratos de Integração

### Contrato de pacote

Declarado em [package.json](../package.json):

```json
{
  "name": "@ds/core",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".":           { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./style.css": "./dist/index.css"
  },
  "peerDependencies": {
    "react":     "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

Dois subpaths, e **apenas** dois: `@ds/core` e `@ds/core/style.css`. Não há deep import por componente (`@ds/core/Button` não resolve) — o campo `exports` fecha o pacote nesses dois pontos de entrada.

### Contrato de tipos

`declaration: true` e `declarationMap: true` ([tsconfig.json:12-13](../tsconfig.json#L12-L13)) geram `.d.ts` com source map, então o consumidor tem tipagem completa e navegação até o código-fonte no editor.

Superfície tipada exportada:

```ts
// Componentes (16)
Button, DangerButton, HeroButton, IconButton, IconToggle,
Textbox, FormGroup, Checkbox, Radio, Select, SelectOption,
MegaSelect, MegaSelectOption, SearchInput,
Navbar, NavbarTab, TabList, Tab

// Interfaces de props
ButtonProps, DangerButtonProps, HeroButtonProps, IconButtonProps, IconToggleProps,
TextboxProps, FormGroupProps, CheckboxProps, RadioProps,
SelectProps, SelectOptionProps, MegaSelectProps, MegaSelectOptionProps,
SearchInputProps, NavbarProps, NavbarTabProps, TabListProps, TabProps

// Tipos de dado
SelectOptionItem, MegaSelectItem

// Tokens
colorPrimitives, semanticColors, colors,
sizePrimitives, spacing, borderRadius,
fontFamily, fontSize, fontWeight
```

As unions de variante (`Variant`, `Size`, `DangerVariant`, `HeroVariant`, `IconVariant`, `IconSize`, `DangerSize`, `ActiveSide`, `ToggleSize`) são **locais ao módulo e não exportadas**. Para tipar uma variável de variante na aplicação, o caminho é derivar da interface de props:

```ts
import type { ButtonProps } from "@ds/core";
type ButtonVariant = NonNullable<ButtonProps["variant"]>;  // "primary" | "secondary" | "tertiary"
```

### Contrato de tokens

O formato de cada token é parte do contrato, porque quem consome pode alimentar a própria config do Tailwind com eles:

| Token | Tipo | Exemplo |
|---|---|---|
| `colors` | `Record<string, Record<string, string>>` | `colors.primary[500]` → `"#6739B1"` |
| `spacing`, `sizePrimitives` | `Record<string, string>` | `spacing["400"]` → `"16px"` |
| `borderRadius` | `Record<string, string>` | `borderRadius.full` → `"9999px"` |
| `fontFamily` | `Record<string, string[]>` | `fontFamily.sans` → `["DM Sans", …]` |
| `fontSize` | `Record<string, [string, { lineHeight: string }]>` | `fontSize.sm` → `["14px", { lineHeight: "20px" }]` |
| `fontWeight` | `Record<string, string>` | `fontWeight.semibold` → `"600"` |
| `colorPrimitives` | objeto literal (tipo inferido) | `colorPrimitives.danger[500]` |
| `semanticColors` | objeto literal (tipo inferido) | `semanticColors.text.base.default` |

`colorPrimitives` e `semanticColors` não têm anotação de tipo explícita — o TypeScript infere a estrutura literal, o que dá autocomplete preciso das chaves aninhadas.

### Contrato de CSS

O `dist/index.css` contém o preflight do Tailwind (`@tailwind base`) mais as classes utilizadas pelos componentes. Duas implicações:

1. **O preflight aplica reset global.** Importar `@ds/core/style.css` afeta estilos base de toda a página (`margin: 0`, `box-sizing: border-box`, remoção de estilo de heading e lista). Em aplicação que já usa Tailwind, isso duplica o reset.
2. **A ordem de importação importa.** Como toda a variação de estilo é resolvida por utilitário e não por especificidade (ver [D7 em business-rules.md](business-rules.md#d7--estilo-é-composto-por-concatenação-não-por-especificidade)), o CSS importado depois vence entre utilitários de mesma especificidade. Importar o CSS da biblioteca **antes** do CSS da aplicação é o que permite que a aplicação sobrescreva via `className`.

---

## Resiliência

Os padrões clássicos de resiliência distribuída — circuit breaker, retry, timeout, fallback de serviço, bulkhead — **não se aplicam**: não há I/O, rede ou processo externo.

O que existe de resiliência é de outra ordem:

### Degradação de fonte

A stack `["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]` degrada em três níveis. A ausência da fonte não gera erro nem tela vazia.

### Valores default em toda prop opcional

Nenhum componente depende de o consumidor passar props de aparência. Todos os eixos têm default no destructuring:

```tsx
variant = "primary"       // Button, DangerButton, HeroButton, IconButton
size = "md"               // Button, DangerButton, IconButton
size = "default"          // IconToggle
active = "left"           // IconToggle
active = false            // NavbarTab, Tab
state = "Default"         // NavbarTab, Tab
loading = false           // Button
hasError = false          // Textbox, Select
disabled = false          // IconToggle
className = ""            // todos
placeholder = "Buscar..."      // SearchInput
placeholder = "Selecionar..."  // MegaSelect
```

`<Button />` renderiza um botão primário médio válido. Isso remove a classe de bug em que uma prop faltante gera `className="undefined"`.

### Optional chaining em todo callback

Callbacks são invocados com `?.` — `onChange?.(v)`, `onOpenChange?.(next)`, `onClick?.(value)`. Nenhum componente assume que o consumidor forneceu o handler.

### Cleanup de efeito

Os dois `useEffect` do sistema estão no `MegaSelect`. O que registra o listener de `mousedown` remove-o no retorno, com dependências vazias — registro na montagem, remoção na desmontagem, sem re-registro por render. O segundo apenas traz a opção ativa à área visível e não registra nada global.

### Guardas de interação redundantes

Estado desabilitado é aplicado em duas camadas: o atributo `disabled` do elemento nativo (que o navegador respeita) **e** uma guarda no handler JS. Ver R8 em [business-rules.md](business-rules.md#r8--desabilitado-impede-abertura-de-dropdown).

### `tsc` bloqueante no build

`"build": "tsc && vite build"` ([package.json:18](../package.json#L18)). O operador `&&` impede que um bundle com erro de tipo chegue ao `dist/` — e, portanto, às aplicações consumidoras. É o mecanismo que protege o contrato de integração.

### Sem estado global

Não há Context, store, singleton ou variável de módulo mutável. Cada instância de componente é independente; montar duas cópias da biblioteca na mesma página não gera conflito de estado (embora gere CSS duplicado).

### Limites conhecidos

Aspectos em que a biblioteca não é resiliente hoje, relevantes para quem integra:

- **Painel do `MegaSelect` sem detecção de colisão.** Abre sempre para baixo (`top-full`), sem portal e sem flip. Próximo à borda inferior da viewport, ou dentro de container com `overflow: hidden`, o painel pode ser cortado.
- **`z-10` fixo.** O único z-index do sistema. Um overlay da aplicação com z-index maior cobre o dropdown; um com valor menor fica atrás dele.
- **Sem busca por digitação no `MegaSelect`.** O `<select>` nativo pula para a opção que começa com a letra digitada; o customizado não. É opcional pela WAI-ARIA APG.
- **Sem tratamento de `id` duplicado no `FormGroup`.** Dois campos com o mesmo label produzem o mesmo `id` (R7).
- **Sem tema alternativo.** Um único modo de cor; não há dark mode nem variável CSS que permita troca em runtime — os valores de token são compilados no CSS.
