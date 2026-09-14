# 15. Storybook como ambiente de desenvolvimento e verificação

Data: 2026-07-07

## Status

Ativa

## Contexto

Componentes de design system não podem ser desenvolvidos dentro de uma aplicação: isso acopla a biblioteca ao contexto de um consumidor e torna difícil exercitar variantes e estados isoladamente.

Além disso, com `tsc` como único gate automatizado ([ADR-0002](0002-typescript-strict-como-gate-de-qualidade.md)), a verificação de **aparência** e de **comportamento** precisava de algum lugar. O `tsc` não detecta classe Tailwind inexistente nem teclado incompleto — as duas categorias de defeito mais prováveis do sistema.

Era preciso um ambiente que servisse simultaneamente como bancada de desenvolvimento, catálogo para design e produto, e harness de verificação.

## Decisão

Vamos usar **Storybook 8 com `@storybook/react-vite`** como ambiente de desenvolvimento e principal mecanismo de verificação.

```ts
// .storybook/main.ts
stories: ["../src/**/*.stories.@(ts|tsx)"],
addons: ["@storybook/addon-essentials"],
framework: { name: "@storybook/react-vite", options: {} },
```

Todas as stories usam `tags: ["autodocs"]`, gerando uma página de documentação por componente a partir das interfaces de props via `react-docgen`.

O [preview.ts](../../.storybook/preview.ts) importa `globals.css` — sem isso nenhuma classe Tailwind existiria no iframe.

Convenção de story: `title: "Components/<Nome>"`, `argTypes` com `control: "select"` para eixos de variante e `control: "boolean"` para flags, uma story por variante e por estado, e stories comparativas (`Sizes`, `AllVariants`) usando `render`.

## Alternativas Consideradas

### Alternativa 1: Aplicação de exemplo (playground)

**Descrição**: Uma app Vite dentro do repositório, com uma página por componente.

**Prós**:
- Sem dependência adicional além do Vite, que já existe
- Controle total sobre a apresentação
- Mais leve para instalar e iniciar

**Contras**:
- Nenhuma documentação gerada automaticamente dos tipos
- Nenhum painel de controles para explorar props interativamente
- Nenhuma organização, navegação ou isolamento entre casos — tudo manual
- Não serve como catálogo para design e produto
- Recriaria mal o que o Storybook já faz

**Razão para rejeição**: Reconstruiria uma fração do Storybook com esforço contínuo, sem os autodocs e os controles interativos, que são o que faz o ambiente útil para além de quem escreve o código.

### Alternativa 2: Testes unitários com Vitest + Testing Library como verificação principal

**Descrição**: Verificar comportamento por asserção em testes.

**Prós**:
- Verificação automatizada e repetível
- Roda em CI
- Documenta comportamento esperado de forma executável
- Pegaria regressão de teclado e de ARIA

**Contras**:
- Não verifica aparência: um teste passa com a classe `bg-primry-500` errada
- Testar strings de classe é frágil e acopla o teste à implementação
- Exige configuração (jsdom, setup, matchers)
- Design e produto não conseguem consultar testes como catálogo

**Razão para rejeição**: Complementar, não alternativa. Testes verificariam comportamento mas não aparência, que é metade do que um design system precisa garantir. Está registrado como prioridade de infraestrutura em `docs/best-practices/contributing.md`.

### Alternativa 3: Storybook + teste de regressão visual (Chromatic)

**Descrição**: Snapshots visuais automáticos a cada mudança.

**Prós**:
- Detectaria automaticamente mudança visual não intencional
- Especialmente valioso para mudança de token, que atinge muitos componentes de uma vez
- Fecharia a lacuna de verificação de aparência

**Contras**:
- Serviço externo, com custo e conta a gerenciar
- Requer CI, que não existe
- Só se paga com cobertura de stories razoável — hoje 5 de 16 componentes

**Razão para rejeição**: Adiada por precondição, não por mérito. Sem CI e sem cobertura de stories, o valor não se realiza. Registrada como prioridade 7 em `docs/best-practices/contributing.md`.

## Consequências

### Positivas

- Desenvolvimento isolado, sem acoplamento a nenhum consumidor
- Documentação de props gerada automaticamente dos tipos TypeScript — nunca desatualiza em relação à assinatura
- Controles interativos permitem explorar props sem escrever código
- Serve simultaneamente três públicos: quem desenvolve, quem desenha e quem revisa
- Stories comparativas (`AllVariants`, `Sizes`) tornam inconsistência entre variantes visualmente óbvia
- Ambiente onde comportamento de teclado pode ser exercitado manualmente — foi o que permitiu verificar a implementação do combobox do `MegaSelect` ([ADR-0014](0014-elemento-nativo-primeiro.md))
- `build-storybook` gera um catálogo estático publicável

### Negativas

- **A verificação depende de existir story.** Componente sem story não tem verificação nenhuma além do `tsc`
- **Cobertura atual é parcial**: 5 de 16 componentes têm story — os quatro botões e o `MegaSelect`. `IconToggle` e os componentes de `navigation` e da maior parte de `inputs` não têm
- Verificação manual não é repetível nem detecta regressão automaticamente
- `argTypes` é `Record<string, unknown>` — os `options` declarados podem divergir da união real do componente sem erro de compilação
- Storybook é uma dependência de desenvolvimento pesada (instalação e tempo de inicialização)
- A fonte DM Sans não é carregada no preview, então o catálogo renderiza com a fonte de fallback ([ADR-0008](0008-transcricao-manual-dos-tokens-do-figma.md))
- Não há story de tokens: paleta, escala de tamanho e tipografia não estão visualizáveis

### Neutras

- Stories comparativas usam a escala padrão do Tailwind (`gap-3`) por serem código de documentação, não parte do bundle
- `tags: ["autodocs"]` como padrão significa que toda story nova ganha página de docs sem esforço
- Storybook 8 emite avisos de compatibilidade com algumas versões de pacote, sem impacto funcional

## Trade-offs

Priorizamos **verificação de aparência e valor como catálogo compartilhado** sobre **automação e repetibilidade**. A consequência é que a garantia de qualidade depende de duas coisas frágeis: a story existir, e alguém olhar. A primeira é endereçável por disciplina (story junto com o componente); a segunda só por automação futura.

## Notas de Implementação

Cobertura atual:

| Componente | Stories |
|---|---|
| `Button` | `Primary`, `Secondary`, `Ghost`, `Destructive`, `Loading`, `Disabled`, `Sizes`, `AllVariants` |
| `DangerButton` | `Primary`, `Secondary`, `Tertiary`, `Disabled`, `Sizes`, `AllVariants` |
| `HeroButton` | `Primary`, `Secondary`, `Disabled`, `AllVariants` |
| `IconButton` | `Primary`, `Secondary`, `Tertiary`, `Disabled`, `Sizes`, `AllVariants` |
| `MegaSelect` | `Default`, `WithValue`, `Disabled`, `Empty`, `Controlled` |

Sem story: `IconToggle`, `Textbox`, `FormGroup`, `Checkbox`, `Radio`, `Select`, `SelectOption`, `MegaSelectOption`, `SearchInput`, `Navbar`, `NavbarTab`, `TabList`, `Tab`.

A story `Controlled` do `MegaSelect` é o precedente para componentes com comportamento de teclado: usa `render` com estado real, exibe o valor selecionado e documenta os atalhos no próprio corpo da story, servindo de roteiro para a verificação manual.

Convenções de story e regra de que story faz parte do componente (não é opcional) em `docs/best-practices/component-api.md`.

Checklist de verificação manual em `docs/best-practices/accessibility.md`.

## Validação

A decisão é bem-sucedida se:

- Todo componente novo nascer com story cobrindo variantes, tamanhos e estados
- A cobertura de stories chegar a 100% dos componentes exportados
- Defeitos visuais forem detectados antes de chegar a consumidores

Métrica atual: **5 de 16 componentes com story (31%)**. É a prioridade 1 de infraestrutura em `docs/best-practices/contributing.md`.

## Revisão

**2026-07-07**: Decisão inicial. Adicionar `@storybook/addon-a11y` é a próxima melhoria de melhor relação custo-benefício. Teste de regressão visual depende de CI e de cobertura de stories.
