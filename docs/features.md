# Funcionalidades

O repositório entrega três coisas: uma **camada de tokens de design**, uma **biblioteca de 16 componentes React** e um **ambiente de documentação visual (Storybook)**. Tudo é exportado por um único entrypoint, `@ds/core`.

## Inventário

| Categoria | Componentes exportados |
|---|---|
| `actions` | `Button`, `DangerButton`, `HeroButton`, `IconButton`, `IconToggle` |
| `inputs` | `Textbox`, `FormGroup`, `Checkbox`, `Radio`, `Select`, `SelectOption`, `MegaSelect`, `MegaSelectOption`, `SearchInput` |
| `navigation` | `Navbar`, `NavbarTab`, `TabList`, `Tab` |
| tokens | `colorPrimitives`, `semanticColors`, `colors`, `sizePrimitives`, `spacing`, `borderRadius`, `fontFamily`, `fontSize`, `fontWeight` |

---

## Funcionalidades Principais

### 1. Camada de tokens de design

**Descrição**: Escalas de cor, tamanho e tipografia tipadas em TypeScript, que alimentam a configuração do Tailwind e são também exportadas em runtime.

**Casos de uso**: gerar os utilitários Tailwind da biblioteca; permitir que a aplicação consumidora leia valores de token em JS (gráficos, canvas, estilos inline, temas de terceiros).

**Componentes envolvidos**: [src/tokens/colors.ts](../src/tokens/colors.ts), [spacing.ts](../src/tokens/spacing.ts), [typography.ts](../src/tokens/typography.ts), consumidos por [tailwind.config.ts](../tailwind.config.ts).

**Dependências**: [figmatokens.json](../figmatokens.json) como fonte de design (transcrição manual — ver [integrations.md](integrations.md#figma)).

#### Cores

Quatro rampas primitivas:

| Rampa | Escala | `500` | Uso |
|---|---|---|---|
| `primary` | 50–950 | `#6739B1` | Cor de marca (roxo) |
| `neutral` | 50–950 | `#64656A` | Texto, bordas, superfícies |
| `danger` | 50–950 | `#DA3E1D` | Ações destrutivas, erro |
| `light` | `800`, `900`, `full` | — | `#F2F2F2`, `#FAFAFA`, `#FFFFFF` |

`semanticColors` mapeia intenção sobre esses primitivos, em três grupos × contextos:

```
border.brand     { default, hover, disabled, secondary, secondaryHover, secondaryDisabled, tertiary }
border.danger    { … mesmas chaves … }
background.brand { … }
background.danger{ … }
text.brand       { default, secondary, tertiary, onBrand, onBrandSecondary, onBrandTertiary }
text.danger      { default, secondary, tertiary, onDanger, onDangerSecondary, onDangerTertiary }
text.base        { default, secondary, tertiary }
```

`tertiary` é `"transparent"` em todos os grupos de `border` e `background` — é o token que expressa "sem superfície".

#### Tamanhos

Escala numérica proporcional única, usada para espaçamento, dimensões e raio:

| Token | px | Token | px |
|---|---|---|---|
| `0` | 0 | `600` | 24 |
| `050` | 2 | `800` | 32 |
| `100` | 4 | `1000` | 40 |
| `150` | 6 | `1200` | 48 |
| `200` | 8 | `1600` | 64 |
| `300` | 12 | `2400` | 96 |
| `400` | 16 | `4000` | 160 |

`borderRadius` expõe um subconjunto: `100` (4px), `200` (8px), `400` (16px), `full` (9999px).

#### Tipografia

`fontFamily.sans` = `["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]`.

| Token | Tamanho | Line-height |
|---|---|---|
| `xs` | 12px | 16px |
| `sm` | 14px | 20px |
| `base` | 16px | 24px |
| `lg` | 18px | 28px |
| `xl` | 20px | 28px |
| `2xl` | 24px | 32px |
| `3xl` | 30px | 36px |

`fontWeight`: `base` = 400, `semibold` = 600.

---

### 2. Componentes de ação

**Descrição**: Cinco componentes de acionamento, especializados por intenção em vez de reunidos numa única API com muitas variantes.

**Casos de uso**: ação primária de formulário, ação destrutiva confirmada, CTA de landing, ação compacta em toolbar, alternância binária entre dois modos.

**Componentes envolvidos**: [src/components/actions/](../src/components/actions/)

#### `Button`

Botão de propósito geral. É o único com estado de carregamento.

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";  // default: "primary"
  size?: "sm" | "md" | "lg";                       // default: "md"
  loading?: boolean;                               // default: false
  startIcon?: ReactNode;
  trailingIcon?: ReactNode;
}
```

| Tamanho | Altura | Padding-x | Texto | Gap |
|---|---|---|---|---|
| `sm` | 32px (`h-8`) | 12px (`px-300`) | `text-sm` | 4px |
| `md` | 40px (`h-10`) | 16px (`px-400`) | `text-sm` | 8px |
| `lg` | 48px (`h-12`) | 24px (`px-600`) | `text-base` | 8px |

Aparência por variante:

- `primary` — fundo `primary-500`, texto branco, hover `primary-400`
- `secondary` — fundo transparente, texto `neutral-400`, borda `neutral-200`, hover fundo `neutral-50`
- `tertiary` — igual a `secondary` sem borda visível (`border-transparent`)

Comum a todas: `rounded-200` (8px), `font-semibold`, anel de foco `ring-primary-500`.

`loading` renderiza um spinner SVG `animate-spin` de 16px **antes** de `startIcon` e do conteúdo, e desabilita o botão (`isDisabled = disabled || loading`). O texto continua visível durante o carregamento — o spinner é adicionado, não substitui.

```tsx
<Button>Salvar</Button>
<Button variant="secondary" size="sm">Cancelar</Button>
<Button loading>Salvando…</Button>
<Button startIcon={<PlusIcon />} trailingIcon={<ChevronIcon />}>Adicionar</Button>
```

#### `DangerButton`

Mesma anatomia do `Button`, paleta `danger` e sem `loading`.

```tsx
interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";  // default: "primary"
  size?: "sm" | "md";                              // default: "md"
  startIcon?: ReactNode;
  trailingIcon?: ReactNode;
}
```

| Tamanho | Altura | Padding-x | Texto |
|---|---|---|---|
| `sm` | 32px (`h-8`) | 12px (`px-300`) | `text-sm` |
| `md` | 48px (`h-12`) | 16px (`px-400`) | `text-sm` |

A variante `secondary` aqui difere do `Button`: mantém texto e borda em `danger-500` (em vez de neutro), com hover em fundo `danger-50`. Anel de foco `ring-danger-500`.

```tsx
<DangerButton>Excluir</DangerButton>
<DangerButton variant="secondary" size="sm">Remover</DangerButton>
```

#### `HeroButton`

Botão de tamanho fixo grande, para CTA de destaque. Sem prop `size` — as dimensões são fixas em `h-12 px-600 text-base gap-200` (48px de altura, 24px de padding).

```tsx
interface HeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";  // default: "primary"
  startIcon?: ReactNode;
  trailingIcon?: ReactNode;
}
```

```tsx
<HeroButton>Começar agora</HeroButton>
<HeroButton variant="secondary">Saiba mais</HeroButton>
```

#### `IconButton`

Botão circular somente-ícone. `icon` é **obrigatório**.

```tsx
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";  // default: "primary"
  size?: "sm" | "md";                              // default: "md"
  icon: ReactNode;                                 // obrigatório
}
```

`sm` = 32×32 (`h-8 w-8`), `md` = 40×40 (`h-10 w-10`). Sempre `rounded-full` e `shrink-0`.

Variantes: `primary` fundo `primary-500` / branco; `secondary` fundo `neutral-50` / texto `neutral-400`, hover `light-800`; `tertiary` transparente, hover `neutral-50`.

O ícone é envolvido em `<span aria-hidden>`, então **`aria-label` é necessário** para o botão ter nome acessível:

```tsx
<IconButton icon={<TrashIcon />} aria-label="Excluir item" />
<IconButton variant="tertiary" size="sm" icon={<MoreIcon />} aria-label="Mais opções" />
```

#### `IconToggle`

Alternância entre dois ícones dentro de uma pílula. Não estende atributos HTML — API fechada, totalmente controlada.

```tsx
interface IconToggleProps {
  leftIcon: ReactNode;                 // obrigatório
  rightIcon: ReactNode;                // obrigatório
  active?: "left" | "right";           // default: "left"
  size?: "default" | "large";          // default: "default"
  disabled?: boolean;                  // default: false
  onLeftClick?: () => void;
  onRightClick?: () => void;
  className?: string;
}
```

| `size` | Slot | Ícone |
|---|---|---|
| `default` | 32×32 | 16×16 |
| `large` | 40×40 | 20×20 |

O container é `rounded-full` com `p-050` (2px) e fundo `neutral-50`; o slot ativo recebe fundo `primary-500` e ícone branco, o inativo fica transparente com ícone `neutral-400`. Desabilitado, o container ganha `bg-light-800 opacity-60` e o slot ativo cai para `neutral-200`.

Os dois lados são `<button type="button">` com `aria-pressed` refletindo qual está ativo. O estado é do consumidor: os handlers são separados por lado, não um `onChange` único.

```tsx
const [view, setView] = useState<"left" | "right">("left");

<IconToggle
  leftIcon={<ListIcon />}
  rightIcon={<GridIcon />}
  active={view}
  onLeftClick={() => setView("left")}
  onRightClick={() => setView("right")}
/>
```

---

### 3. Componentes de formulário

**Descrição**: Sete componentes de entrada de dados, cobrindo texto, seleção binária, seleção única (nativa e customizada) e busca.

**Casos de uso**: formulários de cadastro e edição, filtros, busca em barra de navegação.

**Componentes envolvidos**: [src/components/inputs/](../src/components/inputs/)

#### `Textbox`

Campo de texto base. `type` é fixado em `"text"` e removido da API via `Omit`.

```tsx
interface TextboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean;  // default: false
}
```

Dimensões fixas: `w-full h-10 px-400 rounded-200`, `text-sm`, texto `neutral-800`, placeholder `neutral-400`.

Estados de borda: normal `neutral-200` → hover `neutral-300` → foco `primary-500`. Com `hasError`, borda `danger-500` inclusive no foco. Desabilitado: fundo `light-800`, borda `neutral-50`, texto `neutral-300`, `cursor-not-allowed pointer-events-none`.

O indicador de foco é a borda (`outline-none`), não um anel.

```tsx
<Textbox placeholder="Nome completo" />
<Textbox hasError value={email} onChange={e => setEmail(e.target.value)} />
```

#### `FormGroup`

Compõe label + `Textbox` + mensagem de erro numa coluna com `gap-100` (4px). É o componente de formulário de mais alto nível.

```tsx
interface FormGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}
```

Comportamentos próprios:

- **Vinculação de id**: `id ?? label?.toLowerCase().replace(/\s+/g, "-")`. Sem `id` explícito, o label `"Nome completo"` produz `id="nome-completo"` e o `htmlFor` correspondente.
- **`error` string → `hasError` booleano**: passa `hasError={!!error}` ao `Textbox` e renderiza `<p>` com a mensagem em `text-xs text-danger-500`.
- **Cor do label por precedência**: `error` → `danger-500`; senão `disabled` → `neutral-300`; senão `neutral-600`.

Todas as demais props seguem para o `Textbox` interno via spread.

```tsx
<FormGroup label="E-mail" placeholder="voce@exemplo.com" />
<FormGroup label="Senha" error="Mínimo de 8 caracteres" />
<FormGroup label="CPF" id="cpf-field" disabled />
```

#### `Checkbox`

Caixa de seleção 20×20 com input nativo oculto e controle visual desenhado.

```tsx
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}
```

Encaminha ref para o `<input>` (`forwardRef<HTMLInputElement>`), o que permite integração com bibliotecas de formulário e acesso a `indeterminate`.

Visual: `rounded-100`, borda 1px `neutral-200`, fundo `light-full`. Marcado (`peer-checked`), fundo e borda viram `primary-500` e o check SVG de 10px em branco aparece. Hover: borda `neutral-300`. Desabilitado: borda `neutral-50`, fundo `light-800`. Foco: anel `primary-500` de 2px com offset.

O ícone de check está sempre no DOM; a cor branca sobre fundo branco é o que o esconde quando desmarcado.

```tsx
<Checkbox checked={aceito} onChange={e => setAceito(e.target.checked)} />
<Checkbox defaultChecked disabled />
```

#### `Radio`

Mesma técnica do `Checkbox`, forma circular.

```tsx
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}
```

Visual: `rounded-full`, `border-2` `neutral-200`. Marcado: borda e fundo `primary-500` com ponto interno branco de 8px. Também com `forwardRef`.

Agrupamento é responsabilidade do consumidor, via `name` compartilhado:

```tsx
<Radio name="plano" value="mensal" checked={p === "mensal"} onChange={…} />
<Radio name="plano" value="anual"  checked={p === "anual"}  onChange={…} />
```

#### `Select`

Wrapper sobre o `<select>` nativo com chevron customizado.

```tsx
interface SelectOptionItem { value: string; label: string; disabled?: boolean }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;              // default: false
  options?: SelectOptionItem[];
  children?: ReactNode;
}
```

Aceita duas formas de conteúdo — `options` (array de dados) tem precedência sobre `children`. Se `options` estiver presente, `children` é ignorado.

O `<select>` recebe `appearance-none` e `pr-1000` (40px de padding à direita) para abrir espaço ao chevron, posicionado em `absolute right-400 top-1/2 -translate-y-1/2` com `pointer-events-none`. Estados de borda idênticos ao `Textbox`.

Por usar o elemento nativo, herda gratuitamente teclado, busca por digitação e o picker do sistema operacional (importante em mobile).

```tsx
<Select options={[
  { value: "br", label: "Brasil" },
  { value: "pt", label: "Portugal" },
  { value: "ao", label: "Angola", disabled: true },
]} />

<Select hasError>
  <option value="">Selecione…</option>
  <option value="1">Opção 1</option>
</Select>
```

#### `SelectOption`

Item de lista renderizado como `<button role="option">`, exportado à parte para construir listas de seleção customizadas.

```tsx
interface SelectOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  label: string;
  selected?: boolean;
}
```

`w-full h-10 px-400`, texto à esquerda, `text-sm`. Selecionado: fundo `primary-50`. Não selecionado: fundo `light-full`, hover `light-800`. Desabilitado: texto `neutral-300`, fundo `light-800`, `cursor-not-allowed`. Expõe `aria-selected` e `data-value`.

Não é usado internamente pelo `Select` (que renderiza `<option>` nativo) nem pelo `MegaSelect` (que usa `MegaSelectOption`) — é uma primitiva de composição para o consumidor.

#### `MegaSelect`

Dropdown de seleção única totalmente customizado, sem `<select>` nativo.

```tsx
interface MegaSelectItem { value: string; label: string; disabled?: boolean }

interface MegaSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: MegaSelectItem[];            // obrigatório
  value?: string;
  onChange?: (value: string) => void;   // recebe o value, não o evento
  placeholder?: string;                 // default: "Selecionar..."
  disabled?: boolean;
}
```

Divisão de estado: `value` é controlado pelo consumidor; `open` e o índice ativo do teclado são internos e não expostos.

Comportamento:

- O gatilho é um `<button role="combobox">` de 40px que mostra o label da opção correspondente a `value`, ou o `placeholder` em `neutral-400` quando não há correspondência.
- Aberto, a borda do gatilho vira `primary-500` e o painel `role="listbox"` aparece em `absolute top-full z-10 w-full mt-050`, com `max-h-[200px] overflow-auto`.
- Selecionar uma opção chama `onChange(value)`, fecha o painel e devolve o foco ao gatilho.
- Clique fora fecha o painel — listener `mousedown` em `document`, com cleanup na desmontagem ([MegaSelect.tsx:57-66](../src/components/inputs/MegaSelect/MegaSelect.tsx#L57-L66)). Diferente de `Escape`, **não** devolve o foco.
- Desabilitado, o gatilho não abre e o painel não é renderizado nem quando `open` é `true` (a condição de render é `open && !disabled`).

**Teclado** — implementa o padrão combobox do WAI-ARIA por completo:

| Tecla | Efeito |
|---|---|
| `Enter`, `Espaço`, `↓` | abre, posicionando no selecionado ou na primeira opção habilitada |
| `↑` (fechado) | abre, posicionando na última habilitada |
| `↑` / `↓` | move o cursor, pulando desabilitadas, travando nos extremos (sem wrap) |
| `Home` / `End` | primeira / última habilitada |
| `Enter` / `Espaço` | seleciona, fecha e devolve o foco |
| `Escape` | fecha sem selecionar e devolve o foco |
| `Tab` | fecha e segue para o próximo elemento da página |

Atributos emitidos: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` e `aria-activedescendant` no gatilho; `role="listbox"` no painel. Os `id` das opções são gerados com `useId()`.

O foco permanece no gatilho durante a navegação — as opções recebem `tabIndex={-1}` e não entram na ordem de tabulação, como o padrão `aria-activedescendant` exige. A opção ativa é trazida à área visível com `scrollIntoView({ block: "nearest" })`.

Não há busca por digitação (o `<select>` nativo tem). O painel é filho do container `relative`, sem portal — abre sempre para baixo e está sujeito a `overflow` de ancestrais.

```tsx
const [uf, setUf] = useState<string>();

<MegaSelect
  options={[{ value: "SP", label: "São Paulo" }, { value: "RJ", label: "Rio de Janeiro" }]}
  value={uf}
  onChange={setUf}
  placeholder="Escolha o estado"
/>
```

#### `MegaSelectOption`

Item do painel do `MegaSelect`. API fechada, com `onClick` que recebe o `value`.

```tsx
interface MegaSelectOptionProps {
  value: string;
  label: string;
  id?: string;        // referenciado por aria-activedescendant do gatilho
  index?: number;     // emitido como data-index, usado para o scroll da opção ativa
  active?: boolean;   // cursor de teclado
  selected?: boolean; // valor atual
  disabled?: boolean;
  onClick?: (value: string) => void;
}
```

`w-full h-8 px-400` (32px de altura, 16px de padding), `role="option"`, `text-sm`, `whitespace-nowrap`, `tabIndex={-1}`.

Dois indicadores visuais **independentes**, que podem coincidir:

| Estado | Aparência | Significado |
|---|---|---|
| `selected` | `bg-primary-50` | é o valor atual |
| `active` | `ring-1 ring-inset ring-primary-500` | é onde o cursor de teclado está |

Hover (mouse) usa `bg-light-800`. Desabilitado: texto `neutral-300`, `aria-disabled`, e o `onClick` não é disparado (guarda `if (!disabled)` no handler, além do atributo `disabled` no `<button>`).

#### `SearchInput`

Busca expansível: colapsado é um botão de lupa, expandido é um campo de texto.

```tsx
interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
```

Suporta os dois modos de controle para `open`: sem a prop, usa estado interno; com a prop, o consumidor controla. `onOpenChange` é notificado nos dois casos ([SearchInput.tsx:23-32](../src/components/inputs/SearchInput/SearchInput.tsx#L23-L32)).

Colapsado: `<button>` 40×40 `rounded-200`, ícone `neutral-400`, hover `neutral-600`, `aria-label="Abrir busca"`.

Expandido: container flex `h-10 px-300 gap-200` com borda que reage a `focus-within:border-primary-500`, contendo o botão de fechar (`aria-label="Fechar busca"`, `tabIndex={-1}` para sair da ordem de tabulação) e o `<input autoFocus>` — o foco vai para o campo assim que ele aparece. O input é `bg-transparent outline-none flex-1 min-w-0`.

Placeholder default: `"Buscar..."`.

```tsx
<SearchInput onChange={e => setTermo(e.target.value)} />

// controlado
<SearchInput open={buscaAberta} onOpenChange={setBuscaAberta} value={termo} onChange={…} />
```

---

### 4. Componentes de navegação

**Descrição**: Dois pares container/item para navegação por abas. Ambos são "burros": não gerenciam seleção, apenas renderizam.

**Casos de uso**: barra de navegação principal da aplicação (`Navbar`), abas de seção dentro de uma página (`TabList`).

**Componentes envolvidos**: [src/components/navigation/](../src/components/navigation/)

#### `Navbar` + `NavbarTab`

```tsx
interface NavbarProps { children: ReactNode; className?: string }

interface NavbarTabProps {
  label: string;                                    // obrigatório
  icon?: ReactNode;
  active?: boolean;                                 // default: false
  state?: "Default" | "Hover" | "Disabled";         // default: "Default"
  onClick?: () => void;
  className?: string;
}
```

`Navbar` é um `<nav>` com `flex items-end`, borda inferior `neutral-200` e fundo `light-full`.

`NavbarTab` é um `<button role="tab">` com layout **vertical** (ícone 16×16 acima, label abaixo), `text-xs`, `px-400 pt-200 pb-300`, `rounded-t-200`. Quando `active`, renderiza um indicador `absolute bottom-0` de 2px em `primary-500`.

`state` só produz efeito no valor `"Disabled"`, que deriva `disabled` e aplica texto `neutral-200` + `cursor-not-allowed`. `"Hover"` não altera o render — o hover real vem das classes `hover:*`.

Aparência do estado ativo: texto `neutral-800`, hover fundo `light-800`. Inativo: texto `neutral-400`, hover fundo `neutral-800` com texto branco (inversão de contraste no hover).

Foco: `focus-visible:ring-2 ring-inset ring-primary-500`.

```tsx
<Navbar>
  <NavbarTab label="Início"    icon={<HomeIcon />}  active onClick={() => go("/")} />
  <NavbarTab label="Projetos"  icon={<FolderIcon />} onClick={() => go("/projetos")} />
  <NavbarTab label="Relatórios" state="Disabled" />
</Navbar>
```

#### `TabList` + `Tab`

```tsx
interface TabListProps {
  children: ReactNode;
  size?: "Default" | "Large";   // aceito, sem efeito no render do container
  className?: string;
}

interface TabProps {
  label: string;                              // obrigatório
  active?: boolean;                           // default: false
  size?: "Default" | "Large";                 // default: "Default"
  state?: "Default" | "Hover" | "Disabled";   // default: "Default"
  onClick?: () => void;
  className?: string;
}
```

`TabList` é um `<div role="tablist">` com `flex items-end gap-600` (24px) e borda inferior `neutral-200`. A prop `size` é desestruturada como `_size` e não afeta o layout ([TabList.tsx:9](../src/components/navigation/TabList/TabList.tsx#L9)) — o dimensionamento efetivo é feito por `Tab`.

`Tab` é um `<button role="tab">` com layout vertical, `pb-200`, alinhado à esquerda. `size="Large"` troca `text-sm` → `text-base` e a espessura do indicador de 2px → 3px.

O indicador de sublinhado está **sempre no DOM** (`block w-full`), com cor `bg-transparent` quando inativo — isso mantém a altura da aba constante entre estados. Ativo: `primary-500`; ativo e desabilitado: `neutral-200`.

Cores de texto: ativo `neutral-800`; inativo `neutral-400` com hover `neutral-600`; desabilitado `neutral-400` + `cursor-not-allowed`.

`Tab` declara `focus-visible:outline-none` sem anel de substituição.

```tsx
const [aba, setAba] = useState("dados");

<TabList>
  <Tab label="Dados"      active={aba === "dados"}  onClick={() => setAba("dados")} />
  <Tab label="Histórico"  active={aba === "hist"}   onClick={() => setAba("hist")} />
  <Tab label="Permissões" state="Disabled" />
</TabList>
```

---

### 5. Storybook como documentação visual

**Descrição**: Ambiente de desenvolvimento e catálogo visual dos componentes, com docs geradas automaticamente a partir dos tipos TypeScript.

**Casos de uso**: desenvolver componente isoladamente; revisar visualmente variantes e estados; servir de referência para design e produto.

**Componentes envolvidos**: [.storybook/main.ts](../.storybook/main.ts), [.storybook/preview.ts](../.storybook/preview.ts), arquivos `*.stories.tsx`.

Configuração: framework `@storybook/react-vite`, `addon-essentials`, stories em `../src/**/*.stories.@(ts|tsx)`. O `preview.ts` importa `globals.css` (sem isso as classes Tailwind não existiriam no iframe) e configura matchers de control para props de cor e data.

Todas as stories usam `tags: ["autodocs"]`, o que gera uma página de documentação por componente a partir das interfaces de props.

**Cobertura atual**: `Button`, `DangerButton`, `HeroButton` e `IconButton` — quatro dos dezesseis componentes, todos em `actions`. Ver a tabela em [patterns.md](patterns.md#padrões-de-teste).

```bash
npm run storybook          # dev, porta 6006
npm run build-storybook    # estático em storybook-static/
```

---

## Funcionalidades Secundárias

### Exportação de tokens em runtime

[src/index.ts](../src/index.ts) reexporta toda a camada de tokens, então a aplicação consumidora pode importar valores diretamente:

```tsx
import { colors, spacing, fontSize, semanticColors } from "@ds/core";

colors.primary[500]                    // "#6739B1"
spacing["400"]                         // "16px"
fontSize.sm                            // ["14px", { lineHeight: "20px" }]
semanticColors.text.base.secondary     // "#545559"
```

Útil onde classes Tailwind não alcançam: bibliotecas de gráfico, `<canvas>`, temas de componentes de terceiros, estilos inline calculados.

### Escape hatch via `className`

Todos os 16 componentes aceitam `className`, sempre concatenado ao final do array de classes. É o mecanismo previsto para ajuste pontual de layout (margem, largura, posicionamento) sem fork do componente.

### Tipos de item de dados exportados

`SelectOptionItem` e `MegaSelectItem` são exportados, permitindo tipar os arrays de opção na aplicação:

```tsx
import type { MegaSelectItem } from "@ds/core";
const estados: MegaSelectItem[] = await carregarEstados();
```

### Subcomponentes exportados individualmente

`SelectOption`, `MegaSelectOption`, `NavbarTab` e `Tab` estão no namespace público, o que permite montar composições fora dos containers padrão.

---

## Funcionalidades em Desenvolvimento

Não há roadmap, issues ou TODOs registrados no repositório. O que se observa como incompleto em relação à superfície existente:

- **Stories** para os 11 componentes sem cobertura em `inputs`, `navigation` e `IconToggle`.
- **Camada de teste automatizado** — não há runner configurado.
- **Documentação dos tokens no Storybook** — não há story de paleta, escala ou tipografia.
- **Pipeline de transformação de tokens** — a ponte entre [figmatokens.json](../figmatokens.json) e [src/tokens/](../src/tokens/) é manual.
- **Carregamento da fonte DM Sans** — referenciada nos tokens, não carregada pelo pacote.
- **Utilitários Tailwind semânticos** — `semanticColors` existe como dado, mas não gera classes (`bg-background-brand-default` e afins não existem).

## Funcionalidades Deprecated

Nenhuma. O pacote está em `0.0.1` e não houve remoção ou substituição de API.
