# @ds/core

Biblioteca de componentes React e tokens de design, construída sobre Tailwind CSS e documentada em Storybook.

Fornece a camada de UI das aplicações de produto: 16 componentes e uma escala de tokens derivada do Figma, distribuídos como um único pacote ESM com CSS separado.

```tsx
import "@ds/core/style.css";
import { Button, FormGroup, MegaSelect } from "@ds/core";

<FormGroup label="E-mail" placeholder="voce@exemplo.com" />
<Button loading={enviando}>Enviar</Button>
```

---

## Instalação

O pacote é `private` e não é publicado em registry — o consumo é por **workspace local ou link `file:`**.

```json
// package.json da aplicação
{ "dependencies": { "@ds/core": "file:../design_system" } }
```

Antes do primeiro uso, gere o `dist/`:

```bash
cd design_system
npm install
npm run build
```

Requisitos do consumidor: **React 18 ou 19** (`peerDependency`) e um bundler com suporte a **ESM** — não há build CommonJS.

### Três passos obrigatórios

```tsx
// 1. importar o CSS uma única vez, no entrypoint da aplicação
import "@ds/core/style.css";
```

```html
<!-- 2. carregar DM Sans (pesos 400 e 600) — o pacote nomeia a fonte, não a carrega -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
```

```ts
// 3. (opcional) estender o Tailwind da aplicação com os tokens,
//    para usar bg-primary-500, px-400 etc. no código da aplicação
import { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } from "@ds/core";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } },
};
```

O passo 3 é necessário porque o `content` desta biblioteca cobre apenas o próprio `src/` — classes escritas na aplicação não são geradas pelo CSS do pacote.

---

## Desenvolvimento

```bash
npm install
npm run storybook        # localhost:6006 — ambiente principal de trabalho
npm run build            # tsc && vite build → dist/
npm run dev              # Vite dev server
npm run build-storybook  # storybook-static/
```

`npm run build` roda `tsc` antes do bundle: erro de tipo impede a geração do `dist/`. É o único gate automatizado do repositório — não há ESLint, Prettier nem test runner configurados.

---

## Componentes

| Categoria | Componentes |
|---|---|
| **Ações** | [`Button`](docs/features.md#button) · [`DangerButton`](docs/features.md#dangerbutton) · [`HeroButton`](docs/features.md#herobutton) · [`IconButton`](docs/features.md#iconbutton) · [`IconToggle`](docs/features.md#icontoggle) |
| **Formulário** | [`Textbox`](docs/features.md#textbox) · [`FormGroup`](docs/features.md#formgroup) · [`Checkbox`](docs/features.md#checkbox) · [`Radio`](docs/features.md#radio) · [`Select`](docs/features.md#select) · [`SelectOption`](docs/features.md#selectoption) · [`MegaSelect`](docs/features.md#megaselect) · [`MegaSelectOption`](docs/features.md#megaselectoption) · [`SearchInput`](docs/features.md#searchinput) |
| **Navegação** | [`Navbar`](docs/features.md#navbar--navbartab) · [`NavbarTab`](docs/features.md#navbar--navbartab) · [`TabList`](docs/features.md#tablist--tab) · [`Tab`](docs/features.md#tablist--tab) |

O sistema especializa **por intenção, não por variante**: uma ação destrutiva é `<DangerButton>`, não `<Button variant="danger">`. Isso torna a intenção visível no ponto de uso e permite que cada componente tenha o eixo de variação que faz sentido para ele — `Button` tem `loading` e três tamanhos, `HeroButton` não tem tamanho, `IconButton` tem `icon` obrigatório.

### Qual componente de ação usar

| Situação | Componente |
|---|---|
| Ação comum de formulário ou toolbar | `Button` |
| Ação destrutiva (excluir, remover) | `DangerButton` |
| CTA principal de página de destaque | `HeroButton` |
| Ação compacta, só ícone | `IconButton` |
| Alternância entre dois modos | `IconToggle` |

### Qual componente de seleção usar

| Necessidade | Componente | Por quê |
|---|---|---|
| Seleção simples, mobile, formulário | `Select` | usa `<select>` nativo — teclado, busca por digitação e picker do SO de graça |
| Aparência customizada do painel | `MegaSelect` | controle total; teclado completo (padrão combobox), sem busca por digitação nem picker nativo |
| Lista montada pelo consumidor | `SelectOption` | primitiva de item, sem container |

---

## Tokens

Duas camadas: `colorPrimitives` (valores crus) e `semanticColors` (intenção, composta por referência aos primitivos). A export `colors` — só primitivos — é o que alimenta o Tailwind, então as classes disponíveis são `bg-primary-500`, `text-neutral-400`, `border-danger-500`.

**Cores** — quatro rampas: `primary` (roxo `#6739B1`), `neutral`, `danger` (`#DA3E1D`) em escalas 50–950, e `light` (`800`, `900`, `full`). `500` é a âncora; `400` é hover.

**Tamanhos** — escala única onde `px = chave / 25`, com lacunas deliberadas:

| Token | px | Token | px | Token | px |
|---|---|---|---|---|---|
| `0` | 0 | `300` | 12 | `1200` | 48 |
| `050` | 2 | `400` | 16 | `1600` | 64 |
| `100` | 4 | `600` | 24 | `2400` | 96 |
| `150` | 6 | `800` | 32 | `4000` | 160 |
| `200` | 8 | `1000` | 40 | | |

`borderRadius` usa um subconjunto: `100` (4px), `200` (8px), `400` (16px), `full`.

**Tipografia** — DM Sans; `xs` a `3xl` (12–30px) com line-height pareado; pesos 400 e 600.

Todos os tokens são exportados em runtime, para onde classes não alcançam:

```tsx
import { colors, spacing } from "@ds/core";
<LineChart stroke={colors.primary[500]} gridColor={colors.neutral[100]} />
```

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/stack.md](docs/stack.md) | Tecnologias, contrato do pacote, arquitetura em camadas, decisões e trade-offs |
| [docs/patterns.md](docs/patterns.md) | Padrões arquiteturais e de código, convenções de nomenclatura, organização |
| [docs/features.md](docs/features.md) | Referência completa de API dos 16 componentes, com exemplos e tabelas de dimensão |
| [docs/business-rules.md](docs/business-rules.md) | As invariantes de comportamento (R1–R17) e as 8 regras de domínio (D1–D8) |
| [docs/integrations.md](docs/integrations.md) | Pipeline Figma→código, contrato de consumo, convivência com o Tailwind da aplicação |

**Decisões arquiteturais** — por que o sistema é como é:

| Documento | Conteúdo |
|---|---|
| [meta/adr/](meta/adr/README.md) | 15 ADRs com contexto, alternativas rejeitadas e consequências; inclui o grafo de dependências entre as decisões |
| [meta/architecture/system-overview.md](meta/architecture/system-overview.md) | Camadas, fluxo de dados, princípios arquiteturais, gatilhos de revisão |
| [meta/architecture/communication-patterns.md](meta/architecture/communication-patterns.md) | Os três canais de comunicação, contratos e diagramas de sequência |

**Boas práticas** — como escrever código novo:

| Guia | Quando ler |
|---|---|
| [docs/best-practices/](docs/best-practices/) | Índice e os cinco princípios do sistema |
| [tokens.md](docs/best-practices/tokens.md) | Antes de adicionar ou alterar token, ou de escrever um valor de cor/tamanho |
| [component-api.md](docs/best-practices/component-api.md) | Antes de criar componente ou adicionar prop |
| [accessibility.md](docs/best-practices/accessibility.md) | Ao construir qualquer componente interativo |
| [contributing.md](docs/best-practices/contributing.md) | Antes de abrir PR; ao classificar a versão |

---

## Arquitetura

```
figmatokens.json      export de variáveis do Figma (W3C Design Tokens)
       │              transcrição manual — não há transformador no pipeline
       ▼
src/tokens/*.ts       tokens tipados: colors, spacing, typography
       │
       ├──────────►   tailwind.config.ts   tokens viram utilitários (theme.extend)
       │                      │
       ▼                      ▼
src/components/**     componentes consomem os utilitários por className
       │
       ▼
src/index.ts          barrel público: componentes + tokens + globals.css
       │
       ▼
dist/                 index.js (ESM) + index.d.ts + index.css
```

```
design_system/
├── .storybook/           configuração do Storybook
├── docs/                 documentação (core + best-practices)
├── meta/
│   ├── adr/              15 decisões arquiteturais
│   └── architecture/     visão geral e padrões de comunicação
├── figmatokens.json      fonte de design exportada
├── src/
│   ├── components/
│   │   ├── actions/      Button, DangerButton, HeroButton, IconButton, IconToggle
│   │   ├── inputs/       Textbox, FormGroup, Checkbox, Radio, Select, MegaSelect, SearchInput
│   │   └── navigation/   Navbar (+NavbarTab), TabList (+Tab)
│   ├── styles/globals.css
│   ├── tokens/           colors.ts, spacing.ts, typography.ts
│   └── index.ts
└── tailwind.config.ts  tsconfig.json  vite.config.ts  postcss.config.cjs
```

### Decisões que definem o sistema

**Zero dependências de runtime.** Nenhum `clsx`, `cva`, Radix ou Headless UI. Mantém o pacote pequeno e livre de conflito de versão; o custo é que comportamento acessível não trivial — teclado em listbox, focus trap, posicionamento com colisão — é responsabilidade deste repositório.

**Tailwind como única camada de estilo.** A variação visual vive em mapas `Record<Variant, string>`. O tipo garante que o mapa cubra a união; o conteúdo das strings não é validado.

**ESM-only, CSS em subpath separado.** Dois pontos de entrada, e apenas dois: `@ds/core` e `@ds/core/style.css`. Não há deep import por componente.

**Tokens transcritos manualmente do Figma.** Sem Style Dictionary no pipeline — a sincronização é uma etapa humana, e nada no build detecta divergência.

**Container e item são separados.** `TabList`/`Tab`, `Navbar`/`NavbarTab`. Nenhum container gerencia seleção; o estado de navegação fica na aplicação, normalmente no router.

---

## Estado atual

`0.0.1`. O que está em pé e o que não está:

| | |
|---|---|
| ✅ | 16 componentes com API tipada e `.d.ts` gerado |
| ✅ | Camada de tokens em duas camadas, alinhada ao export do Figma |
| ✅ | Semântica ARIA e foco visível na maior parte dos componentes |
| ✅ | `tsc` bloqueante no build |
| ✅ | Stories em todos os 16 componentes |
| ⚠️ | Sem ESLint, Prettier ou test runner |
| ✅ | `MegaSelect` com padrão combobox do WAI-ARIA completo, verificado em navegador |
| ⚠️ | `semanticColors` exportado mas sem utilitários Tailwind correspondentes |
| ⚠️ | Sincronização de token com o Figma é manual |
| ⚠️ | Modo de cor único — sem dark mode |

Prioridades de infraestrutura em [contributing.md](docs/best-practices/contributing.md#trabalho-de-infraestrutura-em-aberto).
