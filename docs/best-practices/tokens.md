# Boas Práticas — Tokens

Como decidir, nomear, adicionar e consumir tokens neste repositório.

---

## A hierarquia de três camadas

Um sistema de tokens maduro tem três camadas. As duas primeiras existem aqui; a terceira é implícita.

```
┌─ Camada 1 — PRIMITIVO ────────────────────────────────────────┐
│  O valor cru. Nomeado pelo que É.                             │
│  colorPrimitives.primary[500] = "#6739B1"                     │
│  sizePrimitives["400"] = "16px"                               │
│                                                               │
│  Regra: nunca comunica intenção. "primary.500" não diz onde   │
│  usar — diz apenas qual é a cor.                              │
└───────────────────────────────────────────────────────────────┘
                            │  referência
                            ▼
┌─ Camada 2 — SEMÂNTICO ────────────────────────────────────────┐
│  A intenção. Nomeado pelo que FAZ.                            │
│  semanticColors.background.brand.hover  → primary[400]        │
│  semanticColors.text.base.secondary     → neutral[600]        │
│                                                               │
│  Regra: nunca introduz um valor novo. Todo valor aqui é       │
│  uma referência a um primitivo.                               │
└───────────────────────────────────────────────────────────────┘
                            │  aplicação
                            ▼
┌─ Camada 3 — COMPONENTE ───────────────────────────────────────┐
│  A decisão local. Vive nos mapas de variante.                 │
│  variantClasses.primary = "bg-primary-500 text-light-full …"  │
└───────────────────────────────────────────────────────────────┘
```

### O estado atual e o que ele implica

O Tailwind recebe a export `colors`, que contém **apenas primitivos** ([colors.ts:115](../../src/tokens/colors.ts#L115)). Por isso as classes disponíveis são `bg-primary-500`, `text-neutral-400` — primitivas. `semanticColors` existe como dado exportado, mas não gera utilitários.

Consequência prática: **a camada 2 e a camada 3 estão fundidas nos mapas de variante**. Quando `Button` escreve `hover:bg-primary-400`, ele está exercendo a intenção `background.brand.hover` sem nomeá-la.

Isso funciona, mas concentra decisão semântica em cada componente. As regras abaixo minimizam o custo disso.

---

## Regras de consumo

### T1 — Nunca escreva um valor literal onde existe token

```tsx
// ✗ errado
<div className="bg-[#6739B1] p-[16px] rounded-[8px]" />
<div style={{ color: "#64656A" }} />

// ✓ correto
<div className="bg-primary-500 p-400 rounded-200" />
```

Um hex literal em componente é invisível para o design: não aparece no Figma, não é auditável e não muda quando a paleta muda.

### T2 — Valor arbitrário só para detalhe sub-token, e com justificativa

A escala de tamanho começa em 2px e salta para 4px. Detalhes visuais menores que isso não têm token — e não devem ganhar um. Os três casos legítimos no código:

```tsx
w-[10px] h-[10px]   // ícone de check do Checkbox — proporção interna do controle
h-[2px] / h-[3px]   // indicador de aba — espessura de linha, não espaçamento
max-h-[200px]       // altura máxima do painel do MegaSelect — limite de scroll
```

O teste: **se o valor voltasse a aparecer num terceiro componente, ele deveria ser token.** Se é único e sub-token, arbitrário é aceitável — com comentário quando a razão não for óbvia.

### T3 — Prefira a escala de tokens à escala default do Tailwind

A config usa `theme.extend` ([tailwind.config.ts:7](../../tailwind.config.ts#L7)), então a escala default do Tailwind continua disponível. Os componentes hoje misturam as duas: `h-10` (default, 2.5rem) ao lado de `px-400` (token, 16px) no mesmo elemento.

Para código novo, **use a escala de tokens** em padding, margin, gap e raio:

```tsx
// preferir
px-400 py-200 gap-200 rounded-200

// evitar em código novo
px-4 py-2 gap-2 rounded-lg
```

Altura e largura de controle são a exceção pragmática — `h-8`/`h-10`/`h-12` (32/40/48px) coincidem com os tokens `800`/`1000`/`1200` e são a forma que os componentes existentes já usam. Mantenha a consistência com os irmãos ao adicionar um componente à mesma família.

### T4 — Cores por papel, não por aparência

Consulte `semanticColors` ([colors.ts:48](../../src/tokens/colors.ts#L48)) para decidir **qual** primitivo usar, mesmo escrevendo a classe primitiva. O mapa semântico é a documentação da intenção:

| Papel | Token semântico | Classe a escrever |
|---|---|---|
| Texto principal | `text.base.default` → `neutral[800]` | `text-neutral-800` |
| Texto secundário | `text.base.secondary` → `neutral[600]` | `text-neutral-600` |
| Texto de apoio | `text.base.tertiary` → `neutral[400]` | `text-neutral-400` |
| Texto sobre marca | `text.brand.onBrand` → `light.full` | `text-light-full` |
| Superfície de marca | `background.brand.default` → `primary[500]` | `bg-primary-500` |
| Superfície de marca, hover | `background.brand.hover` → `primary[400]` | `bg-primary-400` |
| Borda de campo | `border.brand.secondary` → `neutral[200]` | `border-neutral-200` |
| Borda de campo, hover | — (convenção dos componentes) | `border-neutral-300` |
| Borda de campo, foco | `border.brand.default` → `primary[500]` | `border-primary-500` |
| Borda desabilitada | `border.brand.disabled` → `neutral[50]` | `border-neutral-50` |
| Superfície desabilitada | — (convenção dos componentes) | `bg-light-800` |
| Texto desabilitado | — (convenção dos componentes) | `text-neutral-300` |
| Erro (borda, texto) | `border.danger.default` / `text.danger.default` | `border-danger-500` / `text-danger-500` |
| Erro, fundo sutil | `background.danger.disabled` → `danger[50]` | `bg-danger-50` |

Escrever `bg-primary-400` quando o papel é hover está correto. Escrever `bg-primary-400` como cor de superfície estática, não — mesmo que o resultado visual agrade.

### T5 — Consistência de estado entre componentes irmãos

Estados idênticos usam os mesmos tokens em todos os componentes. As convenções vigentes:

```
foco (botões):        focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-offset-2 focus-visible:ring-<contexto>-500
foco (campos):        outline-none + focus:border-primary-500
desabilitado (nativo): disabled:pointer-events-none disabled:opacity-50
desabilitado (campo):  bg-light-800 border-neutral-50 text-neutral-300 cursor-not-allowed
transição:            transition-colors duration-150   (duration-100 em item de lista)
raio de controle:     rounded-200 (8px)
raio de pílula:       rounded-full
```

Antes de escolher a classe de um estado, abra um componente irmão da mesma categoria e copie a receita.

### T6 — Anime apenas cor

`transition-colors`, nunca `transition-all`. Layout, tamanho e posição não são animados em nenhum componente. Isso mantém a performance previsível e evita reflow durante interação.

---

## Regras de adição e alteração

### T7 — Todo token novo nasce no Figma

O fluxo é unidirecional: **Figma → `figmatokens.json` → `src/tokens/*.ts`**. Nunca o inverso.

Adicionar um valor direto em `src/tokens/` cria divergência silenciosa: o código passa a ter um token que o design não conhece, e o próximo export do Figma não vai contê-lo.

Procedimento completo em [../integrations.md](../integrations.md#procedimento-de-sincronização).

### T8 — Ao transcrever, respeite as adaptações de forma

O TypeScript não é cópia literal do JSON. As conversões estabelecidas:

| No Figma | Em `src/tokens/` | Razão |
|---|---|---|
| `"$value": 16` (número) | `"16px"` (string) | Tailwind espera valor CSS |
| `hex: "#F3EFF9"` | `"#F3EFF9"` | usa-se `hex`; `components` sRGB é descartado |
| `Font size.sm` = 14 | `["14px", { lineHeight: "20px" }]` | o line-height é decidido no código |
| `"DM Sans"` | `["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]` | a stack de fallback é decidida no código |
| `Weight.Semibold` = 600 | `"600"` | string |
| `"{Typography primitives.Font size.base}"` (alias) | referência real de objeto | preserva a intenção na estrutura |
| `Color primitives.Primary` | `colorPrimitives.primary` | camelCase / lowercase |
| `Size.Radius.Full` | `borderRadius.full` | idem |

### T9 — Um token semântico nunca introduz valor novo

```ts
// ✗ errado — hex literal na camada semântica
semanticColors.background.brand.pressed = "#5A2F9E";

// ✓ correto — referência a primitivo
semanticColors.background.brand.pressed = colorPrimitives.primary[600];
```

Se a camada semântica precisa de um valor que não existe como primitivo, o primitivo é que está faltando. Adicione-o na camada 1 primeiro (via T7).

### T10 — Respeite as lacunas da escala

A escala de tamanho é `0, 050, 100, 150, 200, 300, 400, 600, 800, 1000, 1200, 1600, 2400, 4000`. Não existem `500`, `700`, `900`, `1400`.

As lacunas são deliberadas: elas impedem escolhas intermediárias arbitrárias. A relação `px = chave / 25` significa que uma chave `500` valeria 20px — um valor plausível, e é exatamente por isso que sua ausência é uma decisão, não um esquecimento.

Adicionar chave à escala é mudança de sistema de design, não ajuste de implementação. Requer decisão no Figma.

### T11 — Escala de cor completa, sempre

Toda rampa de matiz vai de `50` a `950` em onze passos (`50, 100, 200, 300, …, 900, 950`). `primary`, `neutral` e `danger` seguem isso. `light` é a exceção intencional — três valores (`800`, `900`, `full`) porque não é uma rampa de matiz, é um conjunto de superfícies claras.

Uma rampa nova (`success`, `warning`, `info`) deve nascer completa, mesmo que só dois passos sejam usados de imediato. Rampa parcial gera o problema de descobrir, meses depois, que o passo necessário não existe.

### T12 — `500` é a âncora

Em todas as rampas, `500` é o valor base — aquele referenciado por `*.default` na camada semântica. `400` é o hover (mais claro), `600` o estado pressionado. `50` e `100` são superfícies sutis; `800`–`950`, texto e alto contraste.

Ao adicionar rampa, mantenha essa convenção de posição.

---

## Uso pela aplicação consumidora

Os tokens são exportados no bundle público ([src/index.ts](../../src/index.ts)), então a aplicação pode consumi-los de duas formas.

### Como classes Tailwind — estenda a config da aplicação

```ts
// tailwind.config.ts da aplicação
import { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } from "@ds/core";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors, spacing, borderRadius, fontFamily, fontSize, fontWeight } },
};
```

Necessário porque o `content` deste repositório cobre apenas `./src/**/*.{ts,tsx}` — classes escritas na aplicação não são geradas pelo CSS da biblioteca.

### Como valores em JS — onde classes não alcançam

```tsx
import { colors, spacing, fontSize, semanticColors } from "@ds/core";

// biblioteca de gráficos
<LineChart stroke={colors.primary[500]} gridColor={colors.neutral[100]} />

// canvas / SVG calculado
ctx.fillStyle = colors.danger[500];

// tema de componente de terceiro
const tema = { primaryColor: colors.primary[500], borderRadius: 8 };
```

Regra: use valor em JS **apenas** quando a classe não é possível. Estilo inline não participa da cascata e não pode ser sobrescrito por utilitário.

---

## Antipadrões

| Antipadrão | Por que dói | Faça |
|---|---|---|
| `bg-[#6739B1]` | valor invisível ao design (T1) | `bg-primary-500` |
| `p-[18px]` | fora da escala, quebra o ritmo vertical | token mais próximo, `p-400` ou `p-600` |
| Token novo direto em `src/tokens/` | divergência silenciosa com o Figma (T7) | Figma → export → transcrição |
| Hex literal em `semanticColors` | rompe a camada de referência (T9) | referenciar primitivo |
| `transition-all duration-300` | anima layout, causa reflow (T6) | `transition-colors duration-150` |
| Misturar `p-4` e `p-400` no mesmo componente | duas escalas conviventes, ritmo imprevisível | uma escala por componente (T3) |
| `style={{ padding: spacing["400"] }}` para o que é classe | escapa da cascata, não é sobrescrevível | `className="p-400"` |
| Rampa nova com dois passos | o passo faltante aparece depois (T11) | rampa completa 50–950 |
| Inventar receita de estado nova | inconsistência entre irmãos (T5) | copiar do componente irmão |
| Usar `primary-400` como cor estática | `400` é o token de hover (T4/T12) | `primary-500` |

---

## Verificação

Sem lint de token configurado, a verificação é manual. Comandos úteis:

```bash
# valores arbitrários de cor em componentes
grep -rn "\[#" src/components/

# estilo inline
grep -rn "style={{" src/components/

# escala default do Tailwind onde deveria haver token
grep -rnE "\b(p|px|py|m|mx|my|gap)-[0-9]{1,2}\b" src/components/

# transições fora do padrão
grep -rn "transition-" src/components/ | grep -v "transition-colors"
```

Os matches não são necessariamente erro — `h-10`, `w-5` e os três arbitrários de T2 são legítimos. O grep localiza o que merece leitura, não o que está errado.
