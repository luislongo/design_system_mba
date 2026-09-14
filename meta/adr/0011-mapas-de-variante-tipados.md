# 11. Mapas de variante tipados como mecanismo de variação visual

Data: 2026-07-07

## Status

Ativa

## Contexto

Com Tailwind como única camada de estilo ([ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md)) e zero dependências de runtime ([ADR-0004](0004-zero-dependencias-de-runtime.md)), era preciso um mecanismo para traduzir props de variante em strings de classe.

As opções diferem em três dimensões: garantia de cobertura das variantes, custo por render, e legibilidade.

## Decisão

Vamos declarar a variação visual em **`Record<Union, string>` no escopo do módulo**, um mapa por eixo:

```tsx
type Variant = "primary" | "secondary" | "tertiary";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:   "bg-primary-500 text-light-full hover:bg-primary-400 border border-primary-500 …",
  secondary: "bg-transparent text-neutral-400 border border-neutral-200 hover:bg-neutral-50 …",
  tertiary:  "bg-transparent text-neutral-400 border border-transparent hover:bg-neutral-50 …",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-300 text-sm gap-100",
  md: "h-10 px-400 text-sm gap-200",
  lg: "h-12 px-600 text-base gap-200",
};
```

Três regras:

1. **Um eixo, um mapa.** Eixos independentes permanecem mapas independentes.
2. **Escopo do módulo**, fora do componente — não recriados a cada render.
3. **`Record<Union, string>`**, não `Record<string, string>` — é o que dá a garantia de cobertura.

Quando os eixos genuinamente se cruzam, o padrão muda para funções que retornam classe. O [IconToggle](../../src/components/actions/IconToggle/IconToggle.tsx) é o único caso, cruzando `disabled` × `active`.

## Alternativas Consideradas

### Alternativa 1: `class-variance-authority` (cva)

**Descrição**: API declarativa de variantes, com `defaultVariants` e `compoundVariants`.

**Prós**:
- `compoundVariants` resolve eixos cruzados de forma declarativa
- `defaultVariants` centraliza os defaults
- Tipos derivados automaticamente via `VariantProps`
- Combinado com `tailwind-merge`, resolve conflito de classe na sobrescrita

**Contras**:
- Dependência de runtime, contrariando [ADR-0004](0004-zero-dependencias-de-runtime.md)
- Para dois eixos independentes, `Record` entrega garantia de tipo equivalente
- `compoundVariants` só se paga com vários eixos cruzados; aqui há um caso

**Razão para rejeição**: Incompatível com [ADR-0004](0004-zero-dependencias-de-runtime.md). A perda concreta é `tailwind-merge`, documentada em [ADR-0012](0012-classname-como-unico-escape-hatch.md).

### Alternativa 2: Condicionais ou `switch` no corpo do componente

**Descrição**: Resolver a classe com `if`/`switch`/ternário durante o render.

**Prós**:
- Nenhuma estrutura extra
- Permite lógica arbitrária na decisão

**Contras**:
- **Nenhuma garantia de cobertura.** Adicionar valor à união sem tratá-lo compila e cai no caso default silenciosamente
- Espalha a decisão visual pelo corpo do componente
- Difícil ler todas as variantes de uma vez

**Razão para rejeição**: A perda da garantia de cobertura é decisiva. Com `Record<Variant, string>`, adicionar `"quaternary"` à união sem entrada no mapa é erro de compilação — a única garantia forte que o sistema tem sobre variantes.

### Alternativa 3: Mapa único com chave composta

**Descrição**: `Record<`${Variant}-${Size}`, string>` — todas as combinações explícitas.

**Prós**:
- Permite ajuste fino de qualquer combinação
- Cobertura garantida do produto cartesiano

**Contras**:
- Explosão combinatória: 3 variantes × 3 tamanhos = 9 entradas para o `Button`
- Duplicação massiva — variante e tamanho são ortogonais em quase todos os casos
- Adicionar um valor a um eixo multiplica as entradas necessárias

**Razão para rejeição**: Os eixos são de fato ortogonais na esmagadora maioria dos casos. O produto cartesiano só se justifica onde há cruzamento real — e nesse caso o padrão de função é mais legível.

## Consequências

### Positivas

- **Cobertura garantida pelo compilador**: `Record<Union, string>` exige que o mapa cubra toda a união
- Todas as variantes visíveis num bloco, lado a lado — fácil comparar e detectar inconsistência
- Zero custo por render: os mapas são constantes de módulo
- Zero dependências
- Legível sem conhecer nenhuma API além de TypeScript
- Combina naturalmente com a ordem canônica do array de classes

### Negativas

- **O conteúdo das strings não é validado.** `bg-primry-500` satisfaz o tipo `string` e produz um elemento sem fundo. É a categoria de erro mais provável do sistema
- Eixos cruzados exigem sair do padrão para funções, criando duas formas de fazer a mesma coisa
- Sem resolução de conflito de classe: o mapa e o `className` do consumidor podem declarar utilitários concorrentes
- Defaults ficam no destructuring do componente, separados dos mapas
- As uniões de variante não são exportadas ([ADR-0012](0012-classname-como-unico-escape-hatch.md)), então o consumidor precisa derivá-las de `NonNullable<Props["variant"]>`

### Neutras

- Uniões são nomeadas com prefixo do componente (`DangerVariant`, `IconSize`) para desambiguar na leitura isolada do arquivo
- Strings de classe ficam longas; a formatação em múltiplas linhas por entrada é a convenção

## Trade-offs

Priorizamos **garantia de cobertura das variantes e zero dependências** sobre **validação do conteúdo das classes e ergonomia para eixos cruzados**. A garantia que se obtém é estrutural (todo valor da união tem uma entrada), não semântica (a entrada contém classes válidas) — e essa fronteira precisa ser conhecida por quem revisa.

## Notas de Implementação

Regra A4 em `docs/best-practices/component-api.md`, com a anatomia completa de um componente novo.

Padrão de função para eixos cruzados, no `IconToggle`:

```tsx
const slotClass = (side: ActiveSide) => [
  slot,
  "flex items-center justify-center rounded-full transition-colors duration-150",
  disabled ? (isActive ? "bg-neutral-200" : "bg-transparent")
           : (isActive ? "bg-primary-500 hover:bg-primary-400 cursor-pointer"
                       : "bg-transparent hover:bg-light-800 cursor-pointer"),
].join(" ");
```

Mitigação da não-validação das classes: revisão visual no Storybook ([ADR-0015](0015-storybook-como-ambiente-de-verificacao.md)) e as buscas `grep` de `docs/best-practices/contributing.md`.

## Validação

A decisão é bem-sucedida se:

- Nenhum componente resolver variante com condicional no corpo do render
- Adicionar valor a uma união sempre resultar em erro de compilação até o mapa ser atualizado
- Os defeitos de estilo que ocorrerem forem de classe inexistente — categoria conhecida — e não de variante não tratada

## Revisão

**2026-07-07**: Decisão inicial. Se o número de eixos cruzados crescer (mais de dois ou três componentes precisando do padrão de função), reconsiderar `cva` — o que exigiria reabrir [ADR-0004](0004-zero-dependencias-de-runtime.md).
