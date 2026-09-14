# 5. Build ESM-only em modo lib, com CSS em subpath separado

Data: 2026-07-07

## Status

Ativa

## Contexto

O pacote precisa de um formato de distribuição. As escolhas envolvem três questões independentes:

1. **Formato de módulo** — ESM, CommonJS, ou os dois?
2. **Entrega do CSS** — injetado pelo JS, ou arquivo separado?
3. **Granularidade dos pontos de entrada** — um barrel único, ou import profundo por componente?

Contexto relevante: as aplicações consumidoras usam bundlers modernos (Vite), e o CSS é gerado pelo Tailwind a partir das classes usadas nos componentes ([ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md)).

## Decisão

Vamos usar **Vite em modo `lib`, gerando apenas ESM**, com o CSS exposto num subpath separado e um único barrel de entrada para o JS.

```json
"type": "module",
"exports": {
  ".":           { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
  "./style.css": "./dist/index.css"
}
```

`react`, `react-dom` e `react/jsx-runtime` são `external` ([ADR-0001](0001-react-como-biblioteca-de-ui.md)). Dois subpaths, e apenas dois — o campo `exports` fecha o pacote.

## Alternativas Consideradas

### Alternativa 1: Dual build (ESM + CJS)

**Descrição**: Gerar `index.js` (ESM) e `index.cjs`, com `exports` condicional.

**Prós**:
- Suporta consumidores CommonJS: Jest sem transform, scripts Node, bundlers antigos
- Compatibilidade máxima

**Contras**:
- Dobra a configuração de build e o tamanho do `dist/`
- Risco do problema de "dual package hazard": duas cópias do módulo em grafos mistos
- Nenhum consumidor atual precisa de CJS

**Razão para rejeição**: Complexidade sem demanda. Se um consumidor precisar de CJS, adicionar o formato é uma mudança localizada no build — não uma reescrita.

### Alternativa 2: CSS injetado pelo JavaScript

**Descrição**: O bundle injeta um `<style>` no `<head>` ao ser importado (via `vite-plugin-css-injected-by-js` ou similar).

**Prós**:
- Um único import para o consumidor — impossível esquecer o CSS
- Sem etapa manual de setup

**Contras**:
- Impede o consumidor de controlar a ordem de importação do CSS, que é o que determina qual utilitário vence entre os de mesma especificidade
- Injeção em runtime causa FOUC e não funciona em SSR
- O CSS não pode ser cacheado separadamente pelo navegador
- Torna impossível não carregar o CSS (ex.: consumidor que só quer os tokens em JS)

**Razão para rejeição**: A perda de controle sobre a ordem do CSS é decisiva. Com estilo baseado em utilitários, a ordem no stylesheet é o mecanismo de precedência — entregá-la ao bundle removeria a capacidade do consumidor de sobrescrever via `className`.

### Alternativa 3: Import profundo por componente

**Descrição**: `exports` com `"./": "./dist/*"`, permitindo `@ds/core/Button`.

**Prós**:
- Consumidor importa só o que usa, sem depender de tree-shaking
- Alguns bundlers lidam melhor com isso

**Contras**:
- Cada caminho de componente vira contrato público — mover um arquivo passa a ser breaking change
- O bundle é pequeno (~28 kB) e ESM já permite tree-shaking pelo barrel
- Multiplica a superfície de API a manter

**Razão para rejeição**: Congelaria a estrutura interna de pastas como contrato, em troca de um ganho que o tree-shaking de ESM já entrega para um bundle deste tamanho.

## Consequências

### Positivas

- Configuração de build mínima: um formato, um entrypoint
- Tree-shaking funciona naturalmente pelo barrel ESM
- O CSS é um arquivo estático cacheável, e o consumidor controla sua posição na cascata
- `.d.ts` + `declarationMap` dão navegação até o fonte no editor do consumidor
- A estrutura interna de pastas permanece livre para refatoração — não é contrato público
- Consumidor que só quer tokens pode importar sem carregar CSS

### Negativas

- **Consumidor CommonJS não funciona**: `require()` de um ESM falha
- **O CSS precisa ser importado manualmente.** É o erro de integração mais provável, e o sintoma — componentes sem estilo algum — não aponta para a causa
- `@tailwind base` no CSS aplica reset global à página do consumidor
- Import profundo não existe: `@ds/core/Button` não resolve
- Um erro em qualquer componente pode abortar o build inteiro do pacote

### Neutras

- `"type": "module"` obriga `postcss.config.cjs` a usar a extensão `.cjs`
- `main` e `module` apontam para o mesmo arquivo, para compatibilidade com ferramentas que ignoram `exports`
- O `dist/` é ignorado pelo git e precisa ser gerado localmente ([ADR-0006](0006-distribuicao-por-workspace-local.md))

## Trade-offs

Priorizamos **simplicidade de build e controle do consumidor sobre a cascata de CSS** sobre **compatibilidade máxima e conveniência de setup**. Aceitamos que o consumidor precise de duas linhas de configuração (import do CSS e, opcionalmente, extensão da config do Tailwind) em troca de poder controlar a precedência do estilo.

## Notas de Implementação

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "index" },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
  },
});
```

O CSS é produzido porque [src/index.ts](../../src/index.ts) faz `import "./styles/globals.css"` — o efeito colateral no entrypoint é o que gera `dist/index.css`.

Saída atual: `index.js` 28.7 kB (5.9 kB gzip), `index.css` 14.5 kB (3.2 kB gzip).

Contrato de consumo e sintomas de falha documentados em `docs/integrations.md`.

## Validação

A decisão é bem-sucedida se:

- Consumidores integrarem o pacote sem alterações no build deles além do import do CSS
- O `dist/` permanecer com dois artefatos e tamanho estável
- Nenhuma demanda por CJS ou import profundo aparecer

## Revisão

**2026-07-07**: Decisão inicial. Adicionar build CJS se surgir consumidor que precise; é mudança aditiva e não breaking.
