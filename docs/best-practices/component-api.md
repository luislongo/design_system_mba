# Boas Práticas — API de Componentes

Como desenhar a interface de um componente para que ele seja previsível, composável e difícil de usar errado.

---

## A decisão anterior a todas: componente novo ou variante nova?

Este sistema especializa **por intenção** ([D3](../business-rules.md#d3--especialização-por-intenção-não-por-variante)). Antes de escrever código, resolva esta pergunta.

```
A mudança é de INTENÇÃO ou de APARÊNCIA?

  Intenção diferente
  (destrutivo vs. comum, CTA vs. ação de toolbar)
        │
        ├── os eixos de variação também diferem?
        │   (DangerButton não tem loading; HeroButton não tem size)
        │         │
        │         ├── sim  ──►  COMPONENTE NOVO
        │         └── não  ──►  variante, se o mapa não passar de ~4 entradas
        │
  Mesma intenção, peso visual diferente
  (primária vs. secundária na mesma tela)
        │
        └──►  VARIANTE
```

Sinais de que é componente novo:

- O conjunto de props úteis é diferente (`icon` obrigatório → `IconButton`; sem `size` → `HeroButton`).
- A intenção precisa ser óbvia na chamada, para revisão e para busca no código (`grep DangerButton` encontra toda ação destrutiva).
- A união de variante passaria de quatro valores.

Sinais de que é variante:

- Só a paleta ou o peso visual muda.
- Todas as props existentes continuam fazendo sentido.

O custo aceito de componente novo é duplicação: os quatro botões repetem a mesma linha base de classes. Isso é deliberado — desduplicar exigiria uma abstração compartilhada que reintroduz o acoplamento que a especialização eliminou.

---

## Estrutura de arquivo

```
src/components/<categoria>/<Nome>/
├── <Nome>.tsx            # implementação
├── <Nome>.stories.tsx    # variantes, tamanhos, estados
├── <Sub>.tsx             # subcomponente, se houver
└── index.ts              # barrel
```

Categorias: `actions` (acionamento), `inputs` (entrada de dados), `navigation` (navegação). Uma categoria nova se justifica quando três ou mais componentes compartilham a função — não antes.

Barrel do componente, com export nomeado explícito:

```ts
export { Nome } from "./Nome";
export type { NomeProps } from "./Nome";
```

Depois, registrar na categoria:

```ts
// src/components/<categoria>/index.ts
export * from "./Nome";
```

Não há passo na raiz: `src/components/index.ts` já reexporta as três categorias.

---

## Regras de API

### A1 — Estenda os atributos HTML do elemento raiz

```tsx
// ✓ o consumidor tem onClick, type, form, name, data-*, aria-*, tudo de graça
export interface MeuBotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// ✗ o consumidor descobre que falta uma prop e precisa de PR na biblioteca
export interface MeuBotaoProps {
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
}
```

Interfaces base por elemento:

| Elemento raiz | Interface |
|---|---|
| `<button>` | `ButtonHTMLAttributes<HTMLButtonElement>` |
| `<input>` | `InputHTMLAttributes<HTMLInputElement>` |
| `<select>` | `SelectHTMLAttributes<HTMLSelectElement>` |
| `<textarea>` | `TextareaHTMLAttributes<HTMLTextAreaElement>` |
| `<div>`, `<nav>`, `<span>` | `HTMLAttributes<HTMLDivElement>` (etc.) |

API fechada — sem herança — se justifica só quando o componente é uma composição cujo elemento raiz não é o alvo natural das props: `IconToggle` (dois botões dentro de um container), `Navbar`, `TabList`, `Tab`, `NavbarTab`. Nesses casos, `className` é a única prop de escape.

### A2 — Use `Omit` para fechar o que você controla

```tsx
// type é fixado pelo componente
extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">

// onChange tem assinatura própria, não o evento DOM
extends Omit<HTMLAttributes<HTMLDivElement>, "onChange">
```

`Omit` documenta a decisão no tipo. Sem ele, o consumidor passa `type="password"` num `Textbox`, o componente sobrescreve com `"text"`, e o bug é silencioso.

### A3 — Toda prop de aparência é opcional e tem default

```tsx
export function Componente({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}: ComponenteProps) {
```

`<Componente />` deve renderizar algo válido e sensato. Isso elimina a classe de bug em que uma prop faltante produz `className="undefined"`.

Props **sem** default são as que não têm valor razoável: `icon` no `IconButton`, `leftIcon`/`rightIcon` no `IconToggle`, `label` em `Tab`, `options` no `MegaSelect`. Essas são obrigatórias no tipo, sem `?`.

### A4 — Um eixo, um mapa

```tsx
type Variant = "primary" | "secondary" | "tertiary";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = { … };
const sizeClasses: Record<Size, string> = { … };
```

Os mapas ficam **no escopo do módulo**, fora do componente — não são recriados a cada render. O `Record<Union, string>` é o que garante cobertura completa: adicionar valor à união sem entrada no mapa é erro de compilação.

Quando os eixos se cruzam (`disabled` × `active` no `IconToggle`), o padrão muda para funções que retornam classe:

```tsx
const slotClass = (side: ActiveSide) => [ … ].join(" ");
```

Use a matriz cruzada só quando o produto cartesiano é real. Dois eixos independentes devem permanecer dois mapas.

### A5 — Nomeie a união com prefixo do componente

```tsx
// dentro de DangerButton.tsx
type DangerVariant = "primary" | "secondary" | "tertiary";
type DangerSize = "sm" | "md";
```

Mesmo sendo locais ao módulo (não exportadas), o prefixo remove ambiguidade ao ler o arquivo isolado e evita confusão quando dois componentes têm variantes de mesmo nome com aparências diferentes — que é exatamente o caso de `Button.secondary` (neutro) e `DangerButton.secondary` (vermelho).

### A6 — Exporte a interface de props; não exporte a união

```tsx
export interface ButtonProps extends … { variant?: Variant }   // exportada
type Variant = "primary" | "secondary" | "tertiary";           // não exportada
```

O consumidor que precisa tipar uma variável de variante deriva da interface:

```ts
import type { ButtonProps } from "@ds/core";
type ButtonVariant = NonNullable<ButtonProps["variant"]>;
```

Isso mantém a interface como o único ponto de contrato: a união pode ser renomeada internamente sem quebrar consumidor.

### A7 — Ordem canônica do array de classes

```tsx
className={[
  "inline-flex items-center justify-center rounded-200 font-semibold",   // 1. estrutura
  "transition-colors duration-150",                                      // 2. transição
  "focus-visible:outline-none focus-visible:ring-2 …",                   // 3. foco
  "disabled:pointer-events-none disabled:opacity-50",                    // 4. disabled
  variantClasses[variant],                                               // 5. variante
  sizeClasses[size],                                                     // 6. tamanho
  className,                                                             // 7. consumidor
].filter(Boolean).join(" ")}
```

`className` sempre por último. `filter(Boolean)` sempre que algum item puder ser string vazia (ternário sem alternativa) — sem ele a string final ganha espaços duplos.

### A8 — Cuidado com a posição do spread

```tsx
// spread ANTES — props computadas vencem
<button {...props} disabled={isDisabled} className={computado}>

// spread DEPOIS — props do consumidor vencem
<input className={computado} {...props} />
```

A regra: **desestruture toda prop que você computa**. Se `className` e `disabled` saem de `props` no destructuring, eles não chegam no spread, e a posição deixa de importar. É o que os componentes existentes fazem.

Sempre desestruture: `className`, `disabled`, e qualquer prop cujo valor final você calcula.

### A9 — `forwardRef` em componente cujo elemento real está escondido

Obrigatório quando o consumidor precisa de acesso imperativo ao elemento nativo:

```tsx
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ disabled, className = "", ...props }, ref) => ( … )
);
Checkbox.displayName = "Checkbox";
```

`Checkbox` e `Radio` precisam porque o `<input>` real está sob um `<span>` de apresentação — sem ref não há como uma biblioteca de formulário focar o campo, nem como definir `indeterminate` (que não existe como atributo, só como propriedade do DOM).

`displayName` é obrigatório junto: sem ele o componente aparece como `ForwardRef` no DevTools e no Storybook.

Componentes cujo elemento raiz já recebe as props diretamente (`Button`, `Textbox`) podem ser `function` declarations. Ao adicionar controle customizado com input oculto, `forwardRef` é requisito.

### A10 — Dados por array, com `children` como alternativa

`Select` aceita as duas formas, com precedência explícita:

```tsx
{options
  ? options.map((opt) => <option key={opt.value} … >{opt.label}</option>)
  : children}
```

Exporte o tipo do item (`SelectOptionItem`, `MegaSelectItem`) para que a aplicação possa tipar seus dados. Documente a precedência — e note o comportamento de borda: `options={[]}` é truthy, então renderiza lista vazia, não `children`.

### A11 — Callback próprio recebe o valor, não o evento

Quando o componente abstrai o elemento nativo, a assinatura simplifica:

```tsx
// MegaSelect — Omit remove o onChange do DOM, a assinatura própria entra
extends Omit<HTMLAttributes<HTMLDivElement>, "onChange">
onChange?: (value: string) => void;
```

O consumidor escreve `onChange={setUf}` em vez de `onChange={e => setUf(e.target.value)}`.

Componentes que **não** abstraem o elemento (`Textbox`, `Select`, `Checkbox`) mantêm o `onChange` do DOM herdado — não o substitua sem razão, porque bibliotecas de formulário esperam a assinatura nativa.

Todo callback é invocado com optional chaining: `onChange?.(v)`.

### A12 — Controlado, não-controlado, ou os dois — decida e documente

Três padrões válidos:

**Totalmente controlado** (`MegaSelect.value`, `IconToggle.active`, `Tab.active`) — o estado vive no consumidor. Default para estado que a aplicação já possui (rota atual, valor de formulário).

**Híbrido** (`SearchInput.open`) — funciona sem props, aceita controle quando oferecido:

```tsx
const [internalOpen, setInternalOpen] = useState(false);
const isControlled = controlledOpen !== undefined;
const open = isControlled ? controlledOpen : internalOpen;

const toggle = () => {
  if (disabled) return;
  const next = !open;
  if (!isControlled) setInternalOpen(next);
  onOpenChange?.(next);      // notifica nos dois modos
};
```

**Interno** (`MegaSelect.open`) — estado puramente visual que o consumidor não precisa conhecer.

Duas regras invioláveis:

1. **Nunca alterne entre modos.** A detecção é `!== undefined`, avaliada a cada render. Se `open` passa de valor para `undefined`, o componente troca de modo no meio do ciclo de vida e o estado interno estará obsoleto.
2. **O callback dispara nos dois modos.** Um consumidor deve poder observar a mudança sem assumir o controle.

### A13 — Container e item são componentes separados

```tsx
<TabList>
  <Tab label="Dados" active={aba === "dados"} onClick={() => setAba("dados")} />
</TabList>
```

O container aplica layout e `role`; o item recebe `active` diretamente. Sem Context, sem `React.Children.map`, sem clonagem de elemento.

Por quê: a fonte da verdade do estado de navegação é a aplicação — normalmente o router. Duplicá-la dentro da biblioteca cria dois estados para sincronizar. E `cloneElement` sobre children quebra assim que alguém envolve um item num wrapper ou num `.map()`.

Exporte os dois no barrel, para permitir composição fora do container padrão.

### A14 — `className` é o único escape hatch

Todos os 16 componentes aceitam `className`, concatenado por último. Não exponha `style`, `containerClassName`, `labelClassName`, `sx` ou objeto de override.

Por quê: cada prop de estilo adicional é uma parte do interior do componente que se torna contrato público, e que não pode mais ser refatorada. Se `className` não resolve o caso, o sinal é que falta uma variante ou um componente — não outra prop de estilo.

`FormGroup` é o precedente: recebe um `className` (aplicado ao container) e repassa o resto ao `Textbox` interno via spread. Não expõe controle separado do label ou da mensagem.

### A15 — Não emita margem

```tsx
// ✗ o consumidor vai lutar contra isso
"mb-400 mt-200"

// ✓ dimensão e padding internos, sim; margem externa, não
"h-10 px-400"
```

Espaçamento entre elementos pertence ao layout que os contém. Campos são `w-full`; botões, `inline-flex` com largura de conteúdo.

Exceção legítima: espaçamento **entre filhos próprios**, como o `gap-600` do `TabList` e o `gap-100` do `FormGroup`. É composição interna, não margem externa.

### A16 — `type="button"` em botão que não é submit

```tsx
<button type="button" onClick={…}>
```

O default do HTML é `"submit"`. Um `<button>` sem `type` dentro de um `<form>` submete o formulário ao ser clicado — bug que só aparece quando alguém usa o componente dentro de form.

Aplicado em `IconToggle`, `SelectOption`, `MegaSelectOption`, `SearchInput`, `MegaSelect`, `NavbarTab` e `Tab` — todos botões de controle.

`Button`, `DangerButton`, `HeroButton` e `IconButton` deliberadamente **não** fixam `type`: são de propósito geral, e submit é um uso legítimo deles. O consumidor decide via prop.

### A17 — Ícone do consumidor é `ReactNode`, envolvido em wrapper

```tsx
startIcon?: ReactNode;

{startIcon && <span className="shrink-0 flex items-center">{startIcon}</span>}
```

`ReactNode` em vez de `ComponentType` ou `string`: aceita qualquer biblioteca de ícones, SVG inline ou elemento composto, sem acoplamento.

O `shrink-0` impede que um label longo comprima o ícone em container flex. O `flex items-center` centraliza verticalmente sem depender de o ícone ter altura de linha.

Ícones internos (chevron, lupa, spinner) são componentes SVG locais e não exportados, com `stroke="currentColor"`/`fill="currentColor"` para herdar a cor do texto, e `aria-hidden`.

---

## Anatomia de um componente novo

```tsx
import { type ButtonHTMLAttributes, type ReactNode } from "react";

// 1. unions locais, prefixadas, não exportadas
type BadgeVariant = "neutral" | "brand" | "danger";
type BadgeSize = "sm" | "md";

// 2. interface exportada, estendendo os atributos HTML do elemento raiz
export interface BadgeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  startIcon?: ReactNode;
}

// 3. mapas no escopo do módulo, tipados por Record
const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-50 text-neutral-800 border border-neutral-200",
  brand:   "bg-primary-50 text-primary-500 border border-primary-500",
  danger:  "bg-danger-50 text-danger-500 border border-danger-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-6 px-200 text-xs gap-100",
  md: "h-8 px-300 text-sm gap-100",
};

// 4. defaults no destructuring; className e disabled fora do spread
export function Badge({
  variant = "neutral",
  size = "md",
  disabled,
  startIcon,
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <button
      {...props}
      type="button"                                    // A16
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-full font-semibold",  // estrutura
        "transition-colors duration-150",                                      // transição
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
        "disabled:pointer-events-none disabled:opacity-50",                    // disabled
        variantClasses[variant],
        sizeClasses[size],
        className,                                                             // A7
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {startIcon && <span className="shrink-0 flex items-center">{startIcon}</span>}
      {children}
    </button>
  );
}
```

```ts
// index.ts
export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";
```

```tsx
// Badge.stories.tsx — a story faz parte do componente, não é opcional
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["neutral", "brand", "danger"] },
    size: { control: "select", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { variant: "neutral", children: "Rascunho" } };
export const Brand: Story   = { args: { variant: "brand",   children: "Ativo" } };
export const Danger: Story  = { args: { variant: "danger",  children: "Expirado" } };
export const Disabled: Story = { args: { disabled: true, children: "Rascunho" } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="brand">Brand</Badge>
      <Badge variant="danger">Danger</Badge>
    </div>
  ),
};
```

Convenções de story:

- `title: "Components/<Nome>"`, `tags: ["autodocs"]` — a página de docs é gerada dos tipos.
- `argTypes` com `control: "select"` para cada eixo de variação e `control: "boolean"` para flags.
- Uma story por variante e por estado (`Disabled`, `Loading`, `Error`).
- `Sizes` e `AllVariants` com `render`, para comparação lado a lado.
- **Os `options` do `argTypes` devem casar com a união do componente.** É a única parte da story que o `tsc` não valida.

---

## Antipadrões

| Antipadrão | Por que dói | Faça |
|---|---|---|
| Interface fechada sem razão | consumidor descobre prop faltante e precisa de PR | estender `*HTMLAttributes` (A1) |
| `variant?: string` | qualquer string compila, o mapa retorna `undefined` | união literal + `Record` (A4) |
| Mapa de classes dentro do componente | recriado a cada render | escopo do módulo |
| `if (variant === "primary") return "…"` | não há garantia de cobertura da união | `Record<Variant, string>` |
| `styleOverrides`, `sx`, `labelClassName` | o interior do componente vira contrato público | `className` (A14) |
| `style={{ … }}` como prop | escapa da cascata, não é sobrescrevível | `className` |
| Margem no componente | consumidor luta contra ela | layout decide (A15) |
| `<button>` sem `type` em controle | submete formulário ao clicar | `type="button"` (A16) |
| Controle customizado sem `forwardRef` | biblioteca de formulário não alcança o input | `forwardRef` + `displayName` (A9) |
| `forwardRef` sem `displayName` | aparece como `ForwardRef` no DevTools | definir `displayName` |
| Container gerenciando filhos por `cloneElement` | quebra com wrapper ou `.map()` | container + item separados (A13) |
| Alternar entre controlado e não-controlado | estado interno fica obsoleto | decidir no design da API (A12) |
| Callback que só dispara em um modo | consumidor não pode observar sem controlar | disparar nos dois (A12) |
| `onChange` customizado em componente que não abstrai o input | quebra bibliotecas de formulário | manter a assinatura do DOM (A11) |
| Exportar a união de variante | impede renomear internamente | exportar só a interface (A6) |
| Componente novo sem story | não há como verificar comportamento | story junto com o componente |
| `argTypes.options` divergindo da união | a story documenta uma API que não existe | conferir na revisão |
