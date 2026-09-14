# Padrões de Design

Este documento descreve os padrões **efetivamente presentes no código**. Para o que deve ser feito ao adicionar código novo, ver [best-practices/](best-practices/).

## Padrões Arquiteturais

### Camadas de token: primitivo → semântico

[src/tokens/colors.ts](../src/tokens/colors.ts) define duas camadas explícitas:

- **`colorPrimitives`** — rampas cruas por matiz: `primary`, `neutral`, `danger` (escalas `50`…`950`) e `light` (`800`, `900`, `full`).
- **`semanticColors`** — intenção de uso, montada a partir dos primitivos: `border.brand.hover`, `background.danger.disabled`, `text.base.secondary`, etc.

A terceira export, **`colors`**, é o mapa achatado consumido pelo Tailwind e contém apenas os primitivos:

```ts
// src/tokens/colors.ts:115
export const colors = {
  primary: colorPrimitives.primary,
  neutral: colorPrimitives.neutral,
  light:   colorPrimitives.light,
  danger:  colorPrimitives.danger,
};
```

Consequência prática: como o Tailwind recebe `colors` (primitivos), as classes disponíveis nos componentes são primitivas — `bg-primary-500`, `text-neutral-400`, `border-danger-500`. `semanticColors` é exportado no bundle público ([src/index.ts](../src/index.ts)) e disponível para consumidores em runtime, mas não gera utilitários Tailwind e não é referenciado por nenhum componente. O mapeamento semântico existe no código-fonte dos componentes, na forma dos mapas de variante.

### Escala única de tamanho

[src/tokens/spacing.ts](../src/tokens/spacing.ts) usa uma única fonte, `sizePrimitives`, com nomenclatura numérica proporcional (`100` = 4px, `400` = 16px, `1600` = 64px), reaproveitada em dois lugares:

```ts
export const spacing = sizePrimitives;                    // padding, margin, gap, width…
export const borderRadius = { "100", "200", "400", full }; // subconjunto + "full"
```

Tabela completa: `0`=0, `050`=2px, `100`=4px, `150`=6px, `200`=8px, `300`=12px, `400`=16px, `600`=24px, `800`=32px, `1000`=40px, `1200`=48px, `1600`=64px, `2400`=96px, `4000`=160px.

### Barrel exports em três níveis

Cada componente, cada categoria e a raiz têm um `index.ts`:

```
src/components/actions/Button/index.ts   → export { Button }, export type { ButtonProps }
src/components/actions/index.ts          → export * from "./Button" | "./DangerButton" | …
src/components/index.ts                  → export * from "./actions" | "./inputs" | "./navigation"
src/index.ts                             → export * from "./components" | "./tokens"; import "./styles/globals.css"
```

O resultado é um namespace público plano: `import { Button, MegaSelect, colors } from "@ds/core"`.

Dois estilos de barrel de componente convivem. Os quatro botões com stories usam re-export nomeado explícito (`export { Button }; export type { ButtonProps }`), enquanto os demais usam `export *`. Componentes com subcomponente exportam ambos: [Select/index.ts](../src/components/inputs/Select/index.ts) exporta `Select` e `SelectOption`; [MegaSelect/index.ts](../src/components/inputs/MegaSelect/index.ts) exporta `MegaSelect` e `MegaSelectOption`; [Navbar/index.ts](../src/components/navigation/Navbar/index.ts) exporta `Navbar` e `NavbarTab`; [TabList/index.ts](../src/components/navigation/TabList/index.ts) exporta `TabList` e `Tab`.

### Efeito colateral de CSS no entrypoint

[src/index.ts:3](../src/index.ts#L3) faz `import "./styles/globals.css"`. No build de lib do Vite isso produz o `dist/index.css` publicado sob o subpath `./style.css`. `globals.css` contém apenas as três diretivas do Tailwind:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Não há `@font-face` nem `@import` de fonte. `DM Sans` é referenciada em [typography.ts:2](../src/tokens/typography.ts#L2) como primeira opção da stack `font-sans`, com fallback para `ui-sans-serif`/`system-ui`/`sans-serif`; carregar o arquivo da fonte é responsabilidade da aplicação consumidora.

## Padrões de Código

### Composição de classes

Todo componente monta `className` a partir de um array de strings e o serializa. Duas variantes desse padrão coexistem:

```tsx
// Sem filtro — usado quando todos os itens são strings não-vazias garantidas
[...].join(" ")                        // Button, DangerButton, HeroButton, IconButton, Navbar

// Com filtro — usado quando algum item pode ser "" (ex.: bloco condicional de disabled)
[...].filter(Boolean).join(" ")        // Textbox, Select, SearchInput, MegaSelect, IconToggle, Tab, NavbarTab
```

A ordem dentro do array é convencionada e consistente: **estrutura/layout → transição → foco → disabled → variante → tamanho → `className` do consumidor**. O `className` recebido vem sempre por último, então utilitários passados de fora aparecem depois na string — o que não garante precedência (o CSS resolve por especificidade e ordem no stylesheet, não na string de classes), mas mantém a origem legível.

### Mapa de variantes tipado

Variação visual é declarada em `Record<Variant, string>` no escopo do módulo, fora do componente:

```tsx
// src/components/actions/Button.tsx:3, 14
type Variant = "primary" | "secondary" | "tertiary";

const variantClasses: Record<Variant, string> = {
  primary:   "bg-primary-500 text-light-full hover:bg-primary-400 …",
  secondary: "bg-transparent text-neutral-400 border border-neutral-200 …",
  tertiary:  "bg-transparent text-neutral-400 border border-transparent …",
};
```

O `Record<Variant, string>` obriga o mapa a cobrir toda a união — adicionar um valor a `Variant` sem entrada no mapa é erro de compilação. O conteúdo das strings, porém, não é validado.

Mapas separados por eixo (`variantClasses`, `sizeClasses`) são a norma. [IconToggle](../src/components/actions/IconToggle/IconToggle.tsx) é o caso em que os estados se cruzam (`disabled` × `active`) e o padrão muda para funções que retornam classe:

```tsx
// src/components/actions/IconToggle/IconToggle.tsx:40
const slotClass = (side: ActiveSide) => { … }
const iconClass = (side: ActiveSide) => { … }
```

### Extensão de atributos HTML nativos

Cada componente estende a interface DOM correspondente e repassa o resto via spread:

| Componente | Interface base |
|---|---|
| `Button`, `DangerButton`, `HeroButton`, `IconButton` | `ButtonHTMLAttributes<HTMLButtonElement>` |
| `Textbox`, `Checkbox`, `Radio`, `SearchInput`, `FormGroup` | `InputHTMLAttributes<HTMLInputElement>` (com `Omit<…, "type">`) |
| `Select` | `SelectHTMLAttributes<HTMLSelectElement>` |
| `MegaSelect` | `HTMLAttributes<HTMLDivElement>` (com `Omit<…, "onChange">`) |

`Omit` é usado para fechar props que o componente controla: `type` nos inputs (fixado em `"text"`, `"checkbox"`, `"radio"`) e `onChange` no `MegaSelect`, que expõe a assinatura própria `(value: string) => void` em vez do evento DOM.

`IconToggle`, `Navbar`, `NavbarTab`, `TabList` e `Tab` não seguem esse padrão: definem interfaces fechadas, sem herança de atributos HTML. Nesses casos `className` é a única prop de escape declarada.

### Posição do spread

A posição de `{...props}` determina o que o consumidor pode sobrescrever, e ela varia por componente:

```tsx
// Button.tsx:44 — spread ANTES de disabled/className
<button {...props} disabled={isDisabled} className={[…]}>
// disabled e className computados vencem sempre

// Textbox.tsx:26 — spread DEPOIS de className
<input type="text" disabled={disabled} className={[…]} {...props} />
// className passado em props sobrescreveria o computado
```

Nos inputs, `className` e `disabled` são desestruturados fora de `...props`, então não chegam no spread e não há sobrescrita acidental na prática.

### `forwardRef` seletivo

Apenas [Checkbox](../src/components/inputs/Checkbox/Checkbox.tsx) e [Radio](../src/components/inputs/Radio/Radio.tsx) usam `forwardRef`, com `displayName` explícito:

```tsx
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ … }, ref) => …);
Checkbox.displayName = "Checkbox";
```

Esses dois são os componentes cujo elemento real está escondido atrás de um `<span>` de apresentação — o ref é o que dá acesso ao input para bibliotecas de formulário e para `indeterminate`. Os demais componentes são `function` declarations sem ref.

### Input visualmente oculto + `peer`

`Checkbox` e `Radio` usam a mesma técnica: o input nativo fica com `opacity-0` sobreposto ao controle visual, que reage via variantes `peer-*` do Tailwind.

```tsx
// Checkbox.tsx:8-24
<input type="checkbox" className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer …" />
<span aria-hidden className="absolute inset-0 … peer-checked:bg-primary-500 peer-hover:border-neutral-300
                             peer-disabled:bg-light-800 peer-focus-visible:ring-2 …" />
```

O input mantém semântica, teclado e foco nativos; o `<span>` é `aria-hidden` e `pointer-events-none`. Ambos ocupam `w-5 h-5` (20px). A diferença visual entre os dois: `rounded-100` + borda 1px + ícone de check SVG no `Checkbox`; `rounded-full` + `border-2` + ponto `w-2 h-2` no `Radio`.

### Padrão controlado/não-controlado

[SearchInput](../src/components/inputs/SearchInput/SearchInput.tsx) implementa o padrão híbrido completo para o estado `open`:

```tsx
// SearchInput.tsx:23-32
const [internalOpen, setInternalOpen] = useState(false);
const isControlled = controlledOpen !== undefined;
const open = isControlled ? controlledOpen : internalOpen;

const toggle = () => {
  if (disabled) return;
  const next = !open;
  if (!isControlled) setInternalOpen(next);
  onOpenChange?.(next);
};
```

`onOpenChange` é chamado nos dois modos; o estado interno só é escrito quando não há controle externo.

[MegaSelect](../src/components/inputs/MegaSelect/MegaSelect.tsx) usa a divisão inversa: `value`/`onChange` são controlados pelo consumidor, enquanto `open` é sempre estado interno, sem prop de controle.

### Renderização condicional de forma

`SearchInput` não é um input que muda de estilo — ele troca a árvore renderizada. Fechado, retorna um `<button>` 40×40 com ícone de lupa ([SearchInput.tsx:34-55](../src/components/inputs/SearchInput/SearchInput.tsx#L34-L55)). Aberto, retorna um container com botão + `<input autoFocus>` ([SearchInput.tsx:57-95](../src/components/inputs/SearchInput/SearchInput.tsx#L57-L95)). O `autoFocus` só existe no segundo ramo, então o foco vai para o campo no momento da abertura.

### API dupla: `options` ou `children`

[Select](../src/components/inputs/Select/Select.tsx) aceita as duas formas, com `options` tendo precedência:

```tsx
// Select.tsx:54-60
{options
  ? options.map((opt) => <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)
  : children}
```

### Ícones como SVG inline local

Ícones internos são componentes SVG declarados no topo do arquivo que os usa, sem export:

- `SearchIcon` em [SearchInput.tsx:3](../src/components/inputs/SearchInput/SearchInput.tsx#L3) (viewBox 16×16)
- `ChevronDownIcon` em [Select.tsx:3](../src/components/inputs/Select/Select.tsx#L3) e novamente em [MegaSelect.tsx:11](../src/components/inputs/MegaSelect/MegaSelect.tsx#L11) — duas definições independentes, `w-4 h-4`, a do MegaSelect com `shrink-0` adicional
- Spinner de loading inline em [Button.tsx:57-76](../src/components/actions/Button/Button.tsx#L57-L76), com `animate-spin`

Todos usam `stroke="currentColor"` ou `fill="currentColor"`, herdando a cor do texto do container, e recebem `aria-hidden`.

Ícones vindos do consumidor entram como `ReactNode` (`icon`, `startIcon`, `trailingIcon`, `leftIcon`, `rightIcon`) e são envolvidos em `<span className="shrink-0 flex items-center">`. `IconButton` marca esse wrapper com `aria-hidden` ([IconButton.tsx:49](../src/components/actions/IconButton/IconButton.tsx#L49)) — o rótulo acessível vem de `aria-label`.

### Composição por children em navegação

`Navbar` e `TabList` são containers puros que recebem `children`, sem gerenciar seleção:

```tsx
<Navbar>                          <TabList>
  <NavbarTab label="…" active />    <Tab label="…" active />
  <NavbarTab label="…" />           <Tab label="…" />
</Navbar>                         </TabList>
```

O estado de qual aba está ativa vive na aplicação, passado item a item via `active`. Não há contexto React nem registro de filhos.

### Prop `state` string em navegação

`NavbarTab` e `Tab` expõem `state?: "Default" | "Hover" | "Disabled"` — nomenclatura herdada dos nomes de estado das variantes do Figma. Apenas `"Disabled"` altera o render: deriva `const disabled = state === "Disabled"`. `"Hover"` não tem efeito no código; o hover real vem das classes `hover:*` do Tailwind.

`TabList` aceita `size?: "Default" | "Large"` mas o desestrutura como `_size` e não o usa ([TabList.tsx:9](../src/components/navigation/TabList/TabList.tsx#L9)) — o prefixo `_` é o que satisfaz `noUnusedParameters`. O `size` que produz efeito visual é o do `Tab` individual, que troca `text-sm`/`text-base` e a espessura do indicador entre 2px e 3px.

## Organização de Código

```
design_system/
├── .storybook/
│   ├── main.ts               # stories: ../src/**/*.stories.@(ts|tsx), addon-essentials, react-vite
│   └── preview.ts            # importa ../src/styles/globals.css + matchers de control
├── docs/                     # esta documentação
├── figmatokens.json          # export bruto do Figma (W3C Design Tokens)
├── src/
│   ├── components/
│   │   ├── actions/          # Button, DangerButton, HeroButton, IconButton, IconToggle
│   │   ├── inputs/           # Checkbox, FormGroup, MegaSelect, Radio, SearchInput, Select, Textbox
│   │   ├── navigation/       # Navbar (+NavbarTab), TabList (+Tab)
│   │   └── index.ts
│   ├── styles/globals.css
│   ├── tokens/               # colors.ts, spacing.ts, typography.ts, index.ts
│   └── index.ts
├── package.json  postcss.config.cjs  tailwind.config.ts  tsconfig.json  vite.config.ts
```

Regra de pasta por componente: `<Nome>/<Nome>.tsx` + `<Nome>/index.ts`, mais `<Nome>.stories.tsx` quando existe story, mais arquivos de subcomponente irmãos (`SelectOption.tsx`, `MegaSelectOption.tsx`, `NavbarTab.tsx`, `Tab.tsx`).

Categorização por função de UI (`actions` / `inputs` / `navigation`), não por complexidade atômica.

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Pasta e arquivo de componente | `PascalCase`, idênticos | `IconButton/IconButton.tsx` |
| Componente | `PascalCase` | `MegaSelectOption` |
| Interface de props | `<Componente>Props`, exportada | `export interface ButtonProps` |
| Tipo de item de dados | `<Componente>Item` | `SelectOptionItem`, `MegaSelectItem` |
| Union de variante | `PascalCase`, **local ao módulo, não exportada** | `type Variant`, `type DangerVariant`, `type IconSize` |
| Mapa de classes | `<eixo>Classes` | `variantClasses`, `sizeClasses` |
| Ícone SVG interno | `<Nome>Icon`, não exportado | `ChevronDownIcon`, `SearchIcon` |
| Token de tamanho | numérico proporcional (string) | `"400"` = 16px |
| Token de cor | matiz + escala 50–950 | `primary.500` |
| Prop booleana de estado | `has`/`is` ou adjetivo | `hasError`, `loading`, `active`, `disabled` |
| Story | `PascalCase` descritivo | `Primary`, `Sizes`, `AllVariants` |
| Título de story | `Components/<Nome>` | `"Components/IconButton"` |

Nomes de tipo de variante são deliberadamente prefixados por componente (`DangerVariant`, `HeroVariant`, `IconVariant`, `IconSize`, `DangerSize`) mesmo sendo locais ao módulo — o que evita ambiguidade ao ler o arquivo isolado.

Textos de interface embutidos estão em **português**: `"Buscar..."`, `"Selecionar..."`, `"Abrir busca"`, `"Fechar busca"`. Não há camada de i18n; esses valores são defaults de prop e podem ser sobrescritos por `placeholder`, exceto os `aria-label` do `SearchInput`, que são fixos.

## Padrões de Teste

Não há teste automatizado no repositório: nenhum test runner, nenhum arquivo `*.test.*` ou `*.spec.*`, nenhuma configuração de `@storybook/test` ou `play` function.

A verificação existente é composta de duas partes:

1. **`tsc` no build** ([package.json:18](../package.json#L18) — `"build": "tsc && vite build"`), com `strict`, `noUnusedLocals` e `noUnusedParameters`. Falha de tipo impede o bundle.
2. **Storybook como harness visual.** Quatro componentes têm stories, todos em `components/actions`:

| Story | Cobertura |
|---|---|
| [Button.stories.tsx](../src/components/actions/Button/Button.stories.tsx) | `Primary`, `Secondary`, `Ghost`, `Destructive`, `Loading`, `Disabled`, `Sizes`, `AllVariants` |
| [DangerButton.stories.tsx](../src/components/actions/DangerButton/DangerButton.stories.tsx) | `Primary`, `Secondary`, `Tertiary`, `Disabled`, `Sizes`, `AllVariants` |
| [HeroButton.stories.tsx](../src/components/actions/HeroButton/HeroButton.stories.tsx) | `Primary`, `Secondary`, `Disabled`, `AllVariants` |
| [IconButton.stories.tsx](../src/components/actions/IconButton/IconButton.stories.tsx) | `Primary`, `Secondary`, `Tertiary`, `Disabled`, `Sizes`, `AllVariants` |

`IconToggle` e todos os componentes de `inputs` e `navigation` não têm story.

A estrutura de story é uniforme: `meta` com `title: "Components/<Nome>"`, `component`, `tags: ["autodocs"]` e `argTypes` declarando `control: "select"` para os eixos de variante e `control: "boolean"` para flags. Stories simples usam `args`; stories comparativas (`Sizes`, `AllVariants`) usam `render` com um wrapper flex.

Note que as stories comparativas usam classes utilitárias de espaçamento default do Tailwind (`gap-3`), não a escala de tokens — elas são código de documentação, não parte do bundle da lib.

## Padrões de Tratamento de Erros

Não há `try/catch`, error boundary, logging ou validação em runtime em nenhum componente. As garantias são todas de tipo, em build time.

Erro é tratado como **estado visual de formulário**, não como exceção:

- `Textbox` e `Select` recebem `hasError?: boolean`, que troca a borda para `border-danger-500` e fixa `focus:border-danger-500`.
- `FormGroup` recebe `error?: string` e o converte para o booleano do filho, além de renderizar a mensagem:

```tsx
// FormGroup.tsx:32-35
<Textbox id={inputId} hasError={!!error} disabled={disabled} {...props} />
{error && <p className="text-xs font-sans text-danger-500 leading-none">{error}</p>}
```

`FormGroup` também é o único componente que coordena `label` + controle + mensagem, e o único que deriva um `id`:

```tsx
// FormGroup.tsx:17
const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
```

O `id` derivado do label liga `htmlFor` ao `<input>`. Passar `id` explicitamente sobrescreve a derivação.

Além disso, `FormGroup` aplica três cores distintas ao label conforme precedência `error > disabled > normal`:

```tsx
// FormGroup.tsx:26
error ? "text-danger-500" : disabled ? "text-neutral-300" : "text-neutral-600"
```

Guardas defensivas em interação seguem o mesmo estilo — retorno antecipado, sem exceção:

```tsx
// SearchInput.tsx:28
const toggle = () => { if (disabled) return; … };

// MegaSelect.tsx:62
onClick={() => !disabled && setOpen((o) => !o)}
```

## Boas Práticas Específicas

### Padrão de estado disabled

Todos os componentes tratam `disabled` explicitamente, com duas abordagens conforme o elemento:

**Elementos nativamente desabilitáveis** (`button`, `input`, `select`) usam a variante `disabled:` do Tailwind. Os quatro botões compartilham a linha exata:

```
disabled:pointer-events-none disabled:opacity-50
```

**Elementos não-nativos** (containers, o `<span>` de apresentação de Checkbox/Radio) recebem classes condicionais explícitas em JS. `Textbox` desabilitado, por exemplo, muda quatro propriedades de uma vez:

```tsx
// Textbox.tsx:20
"bg-light-800 border-neutral-50 text-neutral-300 placeholder:text-neutral-200 cursor-not-allowed pointer-events-none"
```

`Button` é o único que compõe `disabled` a partir de outra prop:

```tsx
// Button.tsx:40
const isDisabled = disabled || loading;
```

Ou seja, `loading` implica desabilitado — o clique não passa durante o carregamento.

### Foco visível consistente

Nos componentes de ação e nos controles de formulário, o anel de foco segue um padrão fixo:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-<cor>-500
```

A cor do anel acompanha o contexto: `ring-primary-500` nos botões neutros e de marca, `ring-danger-500` no `DangerButton`. `NavbarTab` usa a mesma receita com `ring-inset` em vez de `ring-offset-2`, porque o item vive encostado na borda inferior da barra ([NavbarTab.tsx:32](../src/components/navigation/Navbar/NavbarTab.tsx#L32)).

Em `Checkbox` e `Radio` o anel é aplicado no `<span>` visual via `peer-focus-visible:`, já que o input real é invisível.

Nos campos de texto o indicador é a **borda**, não o anel: `outline-none` + `focus:border-primary-500` (`Textbox`, `Select`) ou `focus-within:border-primary-500` no container (`SearchInput`). `MegaSelect` alterna a borda pelo estado `open`, não pelo foco.

### Transições uniformes

`transition-colors duration-150` em praticamente todo elemento interativo. As duas exceções usam `duration-100`, ambas em item de lista: [SelectOption.tsx:28](../src/components/inputs/Select/SelectOption.tsx#L28) e [MegaSelectOption.tsx:37](../src/components/inputs/MegaSelect/MegaSelectOption.tsx#L37). Só `colors` é animado — nunca layout, tamanho ou opacidade em transição.

### Semântica ARIA aplicada por componente

| Componente | Atributos |
|---|---|
| `IconButton` | `aria-label` repassado explicitamente; wrapper do ícone `aria-hidden` |
| `IconToggle` | `aria-pressed={active === "left"}` / `="right"` nos dois botões |
| `SelectOption`, `MegaSelectOption` | `role="option"` + `aria-selected`; `MegaSelectOption` também tem `aria-disabled` e `tabIndex={-1}` |
| `MegaSelect` | `role="combobox"` + `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant` no gatilho; `role="listbox"` no painel |
| `NavbarTab`, `Tab` | `role="tab"` + `aria-selected={active}` |
| `TabList` | `role="tablist"` |
| `Navbar` | elemento `<nav>` nativo |
| `SearchInput` | `aria-label="Abrir busca"` / `"Fechar busca"`; botão de fechar com `tabIndex={-1}` |
| `Checkbox`, `Radio`, spinner, SVGs decorativos | `aria-hidden` no elemento de apresentação |

`type="button"` é declarado em todo `<button>` que não é submit — em `IconToggle`, `SelectOption`, `MegaSelectOption`, `SearchInput`, `MegaSelect`, `NavbarTab` e `Tab` — evitando submit acidental dentro de formulário. Os componentes `Button`/`DangerButton`/`HeroButton`/`IconButton` não fixam `type`, deixando o default `"submit"` do HTML e permitindo sobrescrita via props.

### Cleanup de listener global

O único listener em `document` do sistema é registrado com cleanup no mesmo efeito:

```tsx
// MegaSelect.tsx:43-51
useEffect(() => {
  const onOutsideClick = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener("mousedown", onOutsideClick);
  return () => document.removeEventListener("mousedown", onOutsideClick);
}, []);
```

Array de dependências vazio: registra na montagem, remove na desmontagem. O handler lê `containerRef.current` no momento do evento, então não captura valor obsoleto.

### Valores arbitrários do Tailwind são exceção

A escala de tokens cobre quase tudo. Onde não cobre, valores arbitrários aparecem de forma pontual e sempre para detalhes sub-token:

- `w-[10px] h-[10px]` — ícone de check do `Checkbox`
- `h-[2px]` / `h-[3px]` — indicador de aba ativa em `Tab` e `NavbarTab`
- `max-h-[200px]` — altura máxima do painel do `MegaSelect`

### Layout e z-index

O dropdown do `MegaSelect` usa `absolute top-full z-10 w-full mt-050` com `overflow-auto` — `z-10` é o único z-index do sistema, e `w-full` amarra a largura do painel à do gatilho. Não há portal: o painel é filho do container relativo, então fica sujeito a `overflow` de ancestrais.

`shrink-0` é aplicado consistentemente a ícones e ao spinner para impedir que sejam comprimidos por um label longo em container flex.
