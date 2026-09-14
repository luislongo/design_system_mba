# 3. Tailwind CSS como única camada de estilo

Data: 2026-07-07

## Status

Ativa

## Contexto

Um design system precisa de uma estratégia de estilo que atenda simultaneamente a três exigências que costumam competir entre si:

1. **Consistência** — os valores usados nos componentes devem vir dos tokens de design, não de decisões locais.
2. **Isolamento** — o CSS da biblioteca não pode colidir com o da aplicação consumidora.
3. **Sobrescrita controlada** — o consumidor precisa poder ajustar layout pontualmente sem forkar o componente.

Além disso, os tokens vêm do Figma como valores brutos ([ADR-0008](0008-transcricao-manual-dos-tokens-do-figma.md)) e precisam de um destino que os transforme em algo aplicável nos componentes.

## Decisão

Vamos usar **Tailwind CSS como única camada de estilo**. Não há CSS-in-JS, CSS Modules, arquivos `.css` por componente, `styled-components` ou estilo inline.

Os tokens em `src/tokens/` alimentam `tailwind.config.ts`, que os transforma em utilitários. Os componentes referenciam apenas classes utilitárias via `className`. O único arquivo CSS do projeto é [globals.css](../../src/styles/globals.css), com as três diretivas do Tailwind.

## Alternativas Consideradas

### Alternativa 1: CSS-in-JS (styled-components, Emotion)

**Descrição**: Estilos co-localizados com o componente, em template literals ou objetos.

**Prós**:
- Estilo escopado por construção — zero colisão
- Acesso direto aos tokens em JavaScript, com tipagem
- Estilo dinâmico baseado em props sem mapas de classe
- Theming em runtime (dark mode) via Context

**Contras**:
- Introduz dependência de runtime, contrariando [ADR-0004](0004-zero-dependencias-de-runtime.md)
- Custo de performance: geração de CSS durante o render
- Em React Server Components, exige configuração adicional ou não funciona
- Sobrescrita pelo consumidor exige API própria (`styled(Component)`, prop `css`)

**Razão para rejeição**: A dependência de runtime é incompatível com [ADR-0004](0004-zero-dependencias-de-runtime.md), que é uma restrição de nível mais alto. E o CSS gerado em runtime é justamente o custo que queríamos evitar num pacote consumido por várias aplicações.

### Alternativa 2: CSS Modules

**Descrição**: Um `.module.css` por componente, com nomes de classe hasheados.

**Prós**:
- Escopo garantido, sem runtime
- CSS padrão — nenhuma sintaxe nova
- Bom suporte no Vite

**Contras**:
- Os tokens precisariam ser duplicados como variáveis CSS, criando uma segunda fonte de verdade ao lado de `src/tokens/`
- Variação por variante volta a depender de composição de nomes de classe, sem ganho sobre a abordagem atual
- Sobrescrita pelo consumidor é frágil: nomes hasheados não são endereçáveis
- 16 arquivos CSS adicionais para manter em sincronia com os componentes

**Razão para rejeição**: A duplicação dos tokens como variáveis CSS e a impossibilidade de sobrescrita via `className` são custos maiores do que o ganho de escopo.

### Alternativa 3: Tailwind + `class-variance-authority` (cva)

**Descrição**: Tailwind com `cva` gerenciando as variantes, e `tailwind-merge` resolvendo conflitos de classe.

**Prós**:
- API declarativa de variantes, com `defaultVariants` e `compoundVariants`
- `tailwind-merge` resolve conflitos de utilitário corretamente, tornando a sobrescrita por `className` confiável
- Tipos derivados automaticamente das variantes

**Contras**:
- Duas dependências de runtime, contrariando [ADR-0004](0004-zero-dependencias-de-runtime.md)
- Para 16 componentes com dois eixos cada, `Record<Variant, string>` resolve com garantia de tipo equivalente
- `tailwind-merge` carrega uma tabela interna de grupos de utilitários que precisa acompanhar a versão do Tailwind

**Razão para rejeição**: Incompatível com [ADR-0004](0004-zero-dependencias-de-runtime.md). A perda concreta é a resolução de conflito de classe — documentada como consequência em [ADR-0012](0012-classname-como-unico-escape-hatch.md).

## Consequências

### Positivas

- Os tokens têm um destino único e natural: `theme.extend` em `tailwind.config.ts`
- CSS final é proporcional ao que os componentes usam — o `dist/index.css` fica em ~14 kB (3 kB gzip)
- Zero runtime de estilo
- Sobrescrita pelo consumidor via `className` funciona sem API adicional ([ADR-0012](0012-classname-como-unico-escape-hatch.md))
- A origem de cada regra é rastreável: não há CSS aninhado, `!important` ou seletor descendente. A variação é resolvida em JS, escolhendo qual string de classe entra no array
- `peer-*` viabiliza controles customizados sem JS de estado ([Checkbox](../../src/components/inputs/Checkbox/Checkbox.tsx), [Radio](../../src/components/inputs/Radio/Radio.tsx))

### Negativas

- **Strings de classe não são validadas.** `bg-primry-500` compila e produz um elemento sem fundo — a falha mais provável do sistema, e invisível ao `tsc` ([ADR-0002](0002-typescript-strict-como-gate-de-qualidade.md))
- **`@tailwind base` aplica reset global.** Importar `@ds/core/style.css` afeta estilos base de toda a página. Em aplicação que já usa Tailwind, o preflight é duplicado
- **`content` cobre apenas `./src/**/*.{ts,tsx}`.** Classes escritas na aplicação consumidora não são geradas pelo CSS da biblioteca — o consumidor precisa estender a própria config ([ADR-0006](0006-distribuicao-por-workspace-local.md))
- Classes montadas por concatenação dinâmica não são detectadas pelo scanner do Tailwind — todas as classes devem aparecer literais no código
- Sem `tailwind-merge`, um utilitário passado via `className` não sobrescreve o interno de forma garantida — a resolução é por ordem no stylesheet, não na string
- Sem theming em runtime: os valores de token são compilados no CSS, então dark mode exigiria outra estratégia (variáveis CSS)

### Neutras

- PostCSS + autoprefixer entram como ferramentas de build
- O Storybook precisa importar `globals.css` no [preview.ts](../../.storybook/preview.ts), senão nenhuma classe existe no iframe
- Componentes ficam verbosos: arrays de 6 a 8 strings de classe são a norma

## Trade-offs

Priorizamos **zero runtime de estilo, CSS enxuto e sobrescrita simples via `className`** sobre **validação das classes e escopo garantido**. Aceitamos que a categoria de erro mais provável do sistema — classe inexistente ou errada — só seja detectável visualmente.

## Notas de Implementação

```ts
// tailwind.config.ts
import { colors, fontFamily, fontSize, fontWeight, spacing, borderRadius } from "./src/tokens";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors, fontFamily, fontSize, fontWeight, spacing, borderRadius } },
  plugins: [],
} satisfies Config;
```

Ver [ADR-0009](0009-estender-o-tema-do-tailwind.md) para a decisão de usar `theme.extend` em vez de substituir o tema.

A ordem canônica do array de classes (estrutura → transição → foco → disabled → variante → tamanho → `className`) está em `docs/best-practices/component-api.md`, regra A7.

## Validação

A decisão é bem-sucedida se:

- Nenhum valor de cor ou espaçamento literal aparecer nos componentes (verificável com `grep -rn "\[#" src/components/`)
- O CSS distribuído permanecer abaixo de ~20 kB
- Consumidores conseguirem ajustar layout via `className` sem forkar componentes

## Revisão

**2026-07-07**: Decisão inicial. Se dark mode entrar em escopo, esta decisão precisa ser revisada — a estratégia atual compila os valores no CSS e não permite troca em runtime.
