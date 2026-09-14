# Visão Geral da Arquitetura

> Última atualização: 2026-07-07
>
> Visão de alto nível de como as partes do **@ds/core** se organizam e interagem.
> Para as decisões que produziram esta arquitetura, ver [os ADRs](../adr/README.md).

## Natureza do sistema

Antes do diagrama, uma observação que condiciona todo o resto: **@ds/core não é um sistema em execução**. É uma biblioteca. Não há processos, serviços, rede, banco de dados ou estado compartilhado.

Isso significa que a arquitetura relevante não é de runtime, mas de **transformação e distribuição**: como valores de design viram utilitários CSS, como componentes viram um pacote, e como esse pacote chega às aplicações. Os "componentes" deste documento são camadas de código e artefatos de build, não serviços.

## Diagrama de Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FIGMA  (fonte de verdade do design)                                    │
│  variáveis: Color primitives · Color · Size primitives · Size ·         │
│             Typography primitives · Typography                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │  export de variáveis (manual)
                                 ▼
                       ┌──────────────────────┐
                       │  figmatokens.json    │  W3C Design Tokens
                       │  (versionado)        │  + extensões da Figma
                       └──────────┬───────────┘
                                  │  transcrição manual  ── ADR-0008
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAMADA 1 — TOKENS            src/tokens/                               │
│                                                                         │
│   colors.ts      colorPrimitives → semanticColors → colors  ── ADR-0007 │
│   spacing.ts     sizePrimitives → spacing, borderRadius                 │
│   typography.ts  fontFamily, fontSize, fontWeight                       │
└──────────────┬─────────────────────────────────┬────────────────────────┘
               │                                 │
               │ colors, spacing,                │ export público
               │ borderRadius, fontFamily,       │ (runtime)
               │ fontSize, fontWeight            │
               ▼                                 │
┌──────────────────────────────┐                 │
│  tailwind.config.ts          │                 │
│  theme.extend  ── ADR-0009   │                 │
│  content: ./src/**/*.{ts,tsx}│                 │
└──────────────┬───────────────┘                 │
               │ utilitários CSS                 │
               ▼                                 │
┌─────────────────────────────────────────────────────────────────────────┐
│  CAMADA 2 — COMPONENTES       src/components/          ── ADR-0003      │
│                                                                         │
│   actions/     Button · DangerButton · HeroButton · IconButton ·        │
│                IconToggle                              ── ADR-0010      │
│   inputs/      Textbox · FormGroup · Checkbox · Radio ·                 │
│                Select (+Option) · MegaSelect (+Option) ·                │
│                SearchInput                             ── ADR-0014      │
│   navigation/  Navbar (+NavbarTab) · TabList (+Tab)    ── ADR-0013      │
│                                                                         │
│   Consomem apenas classes utilitárias via className.                    │
│   Variação visual em Record<Variant, string>.          ── ADR-0011      │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CAMADA 3 — BARREL PÚBLICO    src/index.ts                              │
│                                                                         │
│   export * from "./components";                                         │
│   export * from "./tokens";                                             │
│   import "./styles/globals.css";   ← efeito colateral que gera o CSS    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │  tsc && vite build      ── ADR-0002, 0005
                               ▼
                  ┌────────────────────────────┐
                  │  dist/                     │
                  │   index.js    ESM, ~28 kB  │  @ds/core
                  │   index.d.ts  + .d.ts.map  │  @ds/core
                  │   index.css   ~14 kB       │  @ds/core/style.css
                  └─────────────┬──────────────┘
                                │  workspace / file: link  ── ADR-0006
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
        ┌─────────────────┐          ┌─────────────────┐
        │  aplicação A    │          │  aplicação B    │
        │  React 18/19    │          │  React 18/19    │
        │  fornece React  │          │  fornece React  │
        │  e a fonte      │          │  e a fonte      │
        └─────────────────┘          └─────────────────┘

     ┌──────────────────────────────────────────────────┐
     │  .storybook/  →  ambiente paralelo de            │
     │  desenvolvimento e verificação    ── ADR-0015    │
     │  lê src/ diretamente, não o dist/                │
     └──────────────────────────────────────────────────┘
```

## Componentes Principais

### Figma (externo)

**Responsabilidade**: Fonte de verdade dos valores de design — cor, tamanho, tipografia.

**Tecnologias**: Variáveis do Figma, exportadas em formato W3C Design Tokens.

**Decisões relacionadas**: [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md)

**Dependências**: Nenhuma.

**Consumidores**: `figmatokens.json`, por export manual.

**Observação**: Não participa de build nem de runtime. Sem ele, a biblioteca compila e funciona; o que se perde é a capacidade de saber se os tokens estão atualizados.

---

### `figmatokens.json`

**Responsabilidade**: Congelar o estado exportado do Figma, versionado, servindo de referência para diff.

**Tecnologias**: JSON no formato W3C Design Tokens, com `$extensions` da Figma (`variableId`, `scopes`, `modeName`).

**Decisões relacionadas**: [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md)

**Dependências**: Export do Figma.

**Consumidores**: Nenhum programático — é lido por humanos durante a transcrição. **Não é importado pelo build.**

---

### Camada de Tokens — `src/tokens/`

**Responsabilidade**: Definir os valores de design em TypeScript, em duas camadas (primitivo e semântico), no formato que o Tailwind consome.

**Tecnologias**: TypeScript, objetos literais com tipos inferidos.

**Decisões relacionadas**: [ADR-0007](../adr/0007-tokens-em-duas-camadas.md), [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md), [ADR-0009](../adr/0009-estender-o-tema-do-tailwind.md)

**Dependências**: Nenhuma em código. Depende conceitualmente do `figmatokens.json`.

**Consumidores**:
- `tailwind.config.ts`, que recebe `colors`, `spacing`, `borderRadius`, `fontFamily`, `fontSize`, `fontWeight`
- `src/index.ts`, que reexporta tudo no bundle público
- Aplicações consumidoras, em runtime

**Regra estrutural**: `semanticColors` nunca introduz valor novo — todos os seus valores são referências a `colorPrimitives`. `spacing` é `sizePrimitives` por referência, não uma cópia.

---

### `tailwind.config.ts`

**Responsabilidade**: Transformar os tokens em classes utilitárias CSS.

**Tecnologias**: Tailwind CSS 3, `theme.extend`.

**Decisões relacionadas**: [ADR-0003](../adr/0003-tailwind-como-unica-camada-de-estilo.md), [ADR-0009](../adr/0009-estender-o-tema-do-tailwind.md)

**Dependências**: `src/tokens`.

**Consumidores**: O processo de build do CSS (PostCSS), que escaneia `content` e emite os utilitários usados.

**Ponto crítico de integração**: `content` cobre **apenas** `./src/**/*.{ts,tsx}`. Classes escritas em aplicações consumidoras não são geradas por este CSS — o consumidor precisa estender a própria config com os tokens.

---

### Camada de Componentes — `src/components/`

**Responsabilidade**: Implementar os 16 componentes, organizados por função de UI.

**Tecnologias**: React 18/19, TypeScript, classes utilitárias Tailwind. Zero dependências de runtime.

**Decisões relacionadas**: [ADR-0004](../adr/0004-zero-dependencias-de-runtime.md), [ADR-0010](../adr/0010-especializacao-de-componentes-por-intencao.md), [ADR-0011](../adr/0011-mapas-de-variante-tipados.md), [ADR-0012](../adr/0012-classname-como-unico-escape-hatch.md), [ADR-0013](../adr/0013-container-e-item-separados.md), [ADR-0014](../adr/0014-elemento-nativo-primeiro.md)

**Dependências**: React (peer), utilitários gerados pelo Tailwind.

**Consumidores**: `src/components/index.ts` → `src/index.ts`; Storybook, diretamente.

**Subdivisão**:

| Categoria | Responsabilidade | Componentes |
|---|---|---|
| `actions/` | Acionamento | `Button`, `DangerButton`, `HeroButton`, `IconButton`, `IconToggle` |
| `inputs/` | Entrada de dados | `Textbox`, `FormGroup`, `Checkbox`, `Radio`, `Select` (+`SelectOption`), `MegaSelect` (+`MegaSelectOption`), `SearchInput` |
| `navigation/` | Navegação | `Navbar` (+`NavbarTab`), `TabList` (+`Tab`) |

---

### Barrel Público — `src/index.ts`

**Responsabilidade**: Definir a superfície pública do pacote e disparar a geração do CSS.

**Tecnologias**: Reexport ESM.

**Decisões relacionadas**: [ADR-0005](../adr/0005-build-esm-only-com-css-em-subpath.md)

**Dependências**: `./components`, `./tokens`, `./styles/globals.css`.

**Consumidores**: O build do Vite (é o `lib.entry`).

**Detalhe não óbvio**: o `import "./styles/globals.css"` é o que faz o Vite emitir `dist/index.css`. Sem esse efeito colateral no entrypoint, não haveria CSS a distribuir.

---

### Artefatos de Build — `dist/`

**Responsabilidade**: O que efetivamente chega às aplicações consumidoras.

**Tecnologias**: ESM + declarações TypeScript + CSS compilado.

**Decisões relacionadas**: [ADR-0005](../adr/0005-build-esm-only-com-css-em-subpath.md), [ADR-0006](../adr/0006-distribuicao-por-workspace-local.md)

**Dependências**: Todo o `src/`.

**Consumidores**: Aplicações, via dois subpaths — `@ds/core` e `@ds/core/style.css`.

**Observação**: Ignorado pelo git. Um clone novo não funciona até o primeiro `npm run build`.

---

### Storybook — `.storybook/`

**Responsabilidade**: Ambiente de desenvolvimento isolado, catálogo visual e principal mecanismo de verificação.

**Tecnologias**: Storybook 8, `@storybook/react-vite`, `addon-essentials`, `react-docgen` para autodocs.

**Decisões relacionadas**: [ADR-0015](../adr/0015-storybook-como-ambiente-de-verificacao.md)

**Dependências**: Lê `src/` **diretamente**, não o `dist/` — mudanças aparecem sem rebuild.

**Consumidores**: Quem desenvolve, desenha e revisa.

**Cobertura atual**: 5 de 16 componentes.

## Camadas Arquiteturais

Três camadas, com dependência **estritamente unidirecional**. Nenhuma camada importa de uma camada acima.

### Camada 1 — Tokens

**Responsabilidade**: Definir valores de design.

**Componentes**: `src/tokens/`

**Regras**:
- Nenhuma dependência de React ou de componentes
- `semanticColors` referencia apenas `colorPrimitives` — nunca um valor literal
- Todo valor tem origem no Figma ([ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md))
- Formato adequado ao consumo pelo Tailwind (strings com unidade, tuplas de `fontSize`)

### Camada 2 — Componentes

**Responsabilidade**: Implementar comportamento e aparência.

**Componentes**: `src/components/`

**Regras**:
- Consomem tokens **apenas** por classes utilitárias, nunca importando `src/tokens` diretamente
- Nenhum valor literal de cor, espaçamento ou raio
- Variação visual em `Record<Variant, string>` no escopo do módulo
- `className` aceito e concatenado por último
- Nenhuma margem emitida
- Nenhum componente importa outro de categoria diferente

**Exceção documentada à última regra**: `FormGroup` (em `inputs/`) importa `Textbox` (também em `inputs/`) — composição dentro da mesma categoria, permitida.

### Camada 3 — Superfície Pública

**Responsabilidade**: Definir o contrato com as aplicações.

**Componentes**: `src/index.ts`, `package.json` (`exports`)

**Regras**:
- Dois subpaths, e apenas dois
- Nenhum import profundo por componente
- Interfaces de props exportadas; uniões de variante **não** exportadas
- Estrutura interna de pastas não é contrato — permanece livre para refatoração

## Fluxo de Dados

### Em build time: do design ao artefato

```
1. Designer altera uma variável no Figma
2. Export das variáveis → substitui figmatokens.json
3. Diff do JSON identifica o que mudou
4. Transcrição manual para src/tokens/*.ts, com as adaptações de forma
5. tailwind.config.ts recebe os tokens via theme.extend
6. PostCSS escaneia src/**/*.{ts,tsx} e emite os utilitários efetivamente usados
7. tsc verifica tipos (bloqueante) e gera .d.ts
8. Vite empacota src/index.ts em ESM, com React external
9. dist/ contém index.js, index.d.ts, index.css
10. Aplicação consumidora resolve @ds/core pelo link de workspace
```

### Em runtime: dentro da aplicação consumidora

```
1. A aplicação importa "@ds/core/style.css" uma vez, no entrypoint
   → o preflight do Tailwind e os utilitários entram na página
2. A aplicação importa componentes de "@ds/core"
3. Renderiza passando props; o React resolvido é o da própria aplicação
4. O componente monta a string de className a partir do array de classes
5. O navegador aplica os utilitários já presentes no CSS
6. Interação do usuário dispara callbacks que devolvem dados à aplicação
   → nenhum estado de domínio permanece na biblioteca
```

O ponto essencial do fluxo de runtime: **os dados atravessam a biblioteca, não ficam nela**. O único estado que a biblioteca mantém é de interação — `open` e `activeIndex` no `MegaSelect`, `open` no `SearchInput` quando não controlado.

## Decisões Arquiteturais Chave

Esta arquitetura foi moldada por, em ordem de impacto:

- [ADR-0004: Zero dependências de runtime](../adr/0004-zero-dependencias-de-runtime.md) — a raiz do grafo. Determinou a rejeição de CSS-in-JS, `cva` e Radix, e concentrou o custo de acessibilidade neste repositório
- [ADR-0003: Tailwind como única camada de estilo](../adr/0003-tailwind-como-unica-camada-de-estilo.md) — deu aos tokens um destino e definiu a forma dos componentes
- [ADR-0007: Tokens em duas camadas](../adr/0007-tokens-em-duas-camadas.md) — estruturou a camada 1
- [ADR-0010: Especialização por intenção](../adr/0010-especializacao-de-componentes-por-intencao.md) — definiu a granularidade da camada 2
- [ADR-0005: Build ESM-only com CSS em subpath](../adr/0005-build-esm-only-com-css-em-subpath.md) — definiu a camada 3
- [ADR-0002: TypeScript strict como único gate](../adr/0002-typescript-strict-como-gate-de-qualidade.md) — definiu o que é garantido automaticamente e o que depende de revisão

## Princípios Arquiteturais

1. **O token é a única fonte de valor.** Nenhum valor de cor, espaçamento, raio ou tipografia é escrito diretamente em componente. Se o valor não existe como token, a ação é adicionar o token — no Figma primeiro.

2. **Dependência unidirecional entre camadas.** Tokens não sabem de componentes; componentes não sabem do barrel; nada sabe das aplicações consumidoras.

3. **O componente possui sua superfície, não seu contexto.** Dimensão interna, cor, raio, tipografia e estados pertencem ao componente. Margem, posição, largura de contexto e empilhamento pertencem ao layout.

4. **A intenção fica visível no ponto de uso.** `<DangerButton>` se lê sem consultar props.

5. **Acessibilidade é requisito, não melhoria.** Sem bibliotecas de terceiros, nada resolve teclado e ARIA por nós. Um componente sem nome acessível, sem foco visível ou sem suporte a teclado está incompleto.

6. **O tipo é o contrato; o resto é revisão.** `Record<Variant, string>` garante cobertura das variantes; nada garante que a string de classe esteja correta. Conhecer essa fronteira é obrigatório.

7. **Estilo é composto por concatenação, não por especificidade.** Não há CSS aninhado, `!important` ou seletor descendente. A variação é resolvida em JavaScript, escolhendo qual string entra no array — o que mantém a origem de cada regra rastreável.

8. **Vocabulário compartilhado com o Figma.** Escalas `50`–`950`, tokens de tamanho `050`–`4000`, tamanhos de fonte `xs`–`3xl`, e até os nomes de estado em PascalCase de `NavbarTab`/`Tab` atravessam a fronteira design↔código sem tradução.

## Estratégias Transversais

### Tratamento de Erros

Não há `try/catch`, error boundary ou logging em nenhum componente. Todas as garantias são de tipo, em build time.

Erro é tratado como **estado visual de formulário**, não como exceção: `hasError?: boolean` em `Textbox` e `Select`, `error?: string` em `FormGroup`. Guardas defensivas em interação usam retorno antecipado (`if (disabled) return`), nunca exceção.

Detalhe: `FormGroup` recebe `error` como string e deriva `hasError={!!error}` para o filho, garantindo que borda vermelha e mensagem apareçam sempre juntas.

### Estado

| Tipo de estado | Onde vive |
|---|---|
| Estado de domínio (valor de formulário, aba atual) | Na aplicação consumidora |
| Estado de interação (painel aberto, índice ativo no teclado) | Local ao componente |
| Estado global | **Não existe** — sem Context, store ou singleton |

Padrões de controle: totalmente controlado (`MegaSelect.value`, `Tab.active`), híbrido (`SearchInput.open`) ou interno (`MegaSelect.open`). O híbrido detecta o modo por `!== undefined` e notifica o callback nos dois modos.

### Observabilidade

Não aplicável. Nenhum log, métrica ou trace. A biblioteca não faz I/O.

### Acessibilidade

Alvo WCAG 2.1 AA. Estratégia em quatro níveis:

1. **Elemento nativo primeiro** — o máximo de comportamento vem do HTML ([ADR-0014](../adr/0014-elemento-nativo-primeiro.md))
2. **Input real por trás de controle customizado** — `Checkbox` e `Radio` usam `opacity-0` + `peer`, preservando semântica e foco
3. **Padrão ARIA completo quando o nativo é substituído** — o `MegaSelect` implementa o combobox do WAI-ARIA: `aria-activedescendant`, navegação por setas com clamp, `Home`/`End`, `Escape`, retorno de foco, scroll da opção ativa
4. **Receitas uniformes de foco e estado desabilitado**, copiadas entre componentes irmãos

Lacunas conhecidas e checklist em `docs/best-practices/accessibility.md`.

### Segurança

Sem superfície própria: a biblioteca não coleta dados pessoais, não faz requisições de rede, não usa `localStorage`/cookies/IndexedDB, não instala telemetria e não tem dependências de runtime (`npm audit`: 0 vulnerabilidades).

LGPD/GDPR não incidem sobre o pacote. Se um `Textbox` coletar dado pessoal, a obrigação é da aplicação consumidora.

## Evolução da Arquitetura

**2026-07-07 — estado inicial.** Todas as 15 decisões arquiteturais tomadas de forma consciente, no contexto de: um design system novo, dois consumidores próximos evoluindo em conjunto, equipe pequena, e um único modo de cor no Figma.

Direções registradas, em ordem de prioridade (`docs/best-practices/contributing.md`):

1. Stories para os 11 componentes sem cobertura — hoje a verificação cobre 31% da biblioteca
2. `@storybook/addon-a11y`
3. ESLint + Prettier
4. Teste de interação
5. Automação de tokens (revisaria [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md))
6. Regressão visual (depende de CI)
7. Utilitários Tailwind a partir de `semanticColors` (fecharia a camada 2 de [ADR-0007](../adr/0007-tokens-em-duas-camadas.md))

Gatilhos que obrigariam a reabrir decisões:

| Gatilho | Decisões afetadas |
|---|---|
| Componentes de overlay (modal, popover, tooltip, menu) | [ADR-0004](../adr/0004-zero-dependencias-de-runtime.md), [ADR-0014](../adr/0014-elemento-nativo-primeiro.md) |
| Dark mode | [ADR-0003](../adr/0003-tailwind-como-unica-camada-de-estilo.md), [ADR-0007](../adr/0007-tokens-em-duas-camadas.md), [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md) |
| Consumidor mantido por outra equipe | [ADR-0006](../adr/0006-distribuicao-por-workspace-local.md) |
| Segunda plataforma de saída (iOS/Android) | [ADR-0008](../adr/0008-transcricao-manual-dos-tokens-do-figma.md) |
| Navegação por setas entre abas | [ADR-0013](../adr/0013-container-e-item-separados.md) |
| Consumidor CommonJS | [ADR-0005](../adr/0005-build-esm-only-com-css-em-subpath.md) |

## Referências

- [ADRs completos](../adr/README.md)
- [Padrões de Comunicação](communication-patterns.md)
- [docs/stack.md](../../docs/stack.md) — tecnologias e contrato do pacote
- [docs/patterns.md](../../docs/patterns.md) — padrões de código
- [docs/integrations.md](../../docs/integrations.md) — pipeline Figma e contrato de consumo
