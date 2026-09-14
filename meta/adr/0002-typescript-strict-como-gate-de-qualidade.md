# 2. TypeScript strict como único gate automatizado de qualidade

Data: 2026-07-07

## Status

Ativa

## Contexto

O design system é consumido por múltiplas aplicações via build local. Um erro que chega ao `dist/` se propaga para todos os consumidores como erro de compilação — ou, pior, como defeito silencioso em produção.

Ao mesmo tempo, o projeto é novo e pequeno (16 componentes, ~1500 linhas). Montar a pilha completa de qualidade — ESLint com plugins de React e a11y, Prettier, Vitest, Testing Library, testes de regressão visual — custa tempo de configuração e manutenção que competia diretamente com a construção dos componentes.

Era preciso escolher o mínimo de verificação automatizada que impedisse as falhas mais custosas.

## Decisão

Vamos usar **TypeScript em modo `strict` como único gate automatizado**, com o comando de build encadeando a checagem de tipos antes do bundle:

```json
"build": "tsc && vite build"
```

Flags adicionais além de `strict`: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. O `&&` é deliberado — erro de tipo aborta antes de gerar `dist/`.

A verificação de comportamento fica com o Storybook ([ADR-0015](0015-storybook-como-ambiente-de-verificacao.md)) e com a revisão humana, guiada por checklists em `docs/best-practices/`.

## Alternativas Consideradas

### Alternativa 1: Pilha completa de qualidade desde o início

**Descrição**: ESLint (com `eslint-plugin-react-hooks`, `jsx-a11y`), Prettier, Vitest + Testing Library, Chromatic.

**Prós**:
- Pega classes de erro que o `tsc` não alcança: hooks condicionais, ARIA inválido, regressão visual
- Formatação consistente sem esforço
- Rede de segurança para refatoração

**Contras**:
- Configuração e manutenção significativas para um projeto de 16 componentes
- Sem CI configurado, as ferramentas dependem de disciplina local para rodar
- `jsx-a11y` pega pouco do que importa aqui: não detecta teclado incompleto nem ordem de foco

**Razão para rejeição**: Adiada, não rejeitada. O custo de configuração competia com a construção da biblioteca, e as verificações de maior valor para um design system (comportamento de teclado, aparência) não são cobertas por linters. Está registrada como prioridade de infraestrutura em `docs/best-practices/contributing.md`.

### Alternativa 2: TypeScript sem `strict`

**Descrição**: `strict: false`, tipagem gradual.

**Prós**:
- Menos atrito ao escrever código
- Migração incremental possível

**Contras**:
- `strictNullChecks` desligado é justamente o que deixa passar os bugs mais comuns
- Design system é código de biblioteca: os tipos são o contrato público com os consumidores
- Tipagem frouxa gera `.d.ts` frouxo, e o consumidor perde a garantia

**Razão para rejeição**: Em código de biblioteca, o tipo é o contrato. Enfraquecê-lo transfere o custo para todos os consumidores.

### Alternativa 3: Build sem checagem de tipos (`vite build` apenas)

**Descrição**: Vite transpila TS sem verificar tipos (via esbuild); checagem só no editor.

**Prós**:
- Build muito mais rápido
- `tsc` no editor já dá o feedback durante o desenvolvimento

**Contras**:
- Erro de tipo pode chegar ao `dist/` e ao consumidor
- Geração de `.d.ts` exige `tsc` de qualquer forma (`declaration: true`)

**Razão para rejeição**: O `.d.ts` já exige `tsc`, então o custo marginal de fazê-lo bloquear é próximo de zero — e o benefício é impedir que erro de tipo seja publicado.

## Consequências

### Positivas

- Contrato público tipado e confiável, com `.d.ts` + `declarationMap` para navegação no editor do consumidor
- `Record<Variant, string>` passa a garantir cobertura completa das uniões de variante ([ADR-0011](0011-mapas-de-variante-tipados.md))
- `noUnusedLocals`/`noUnusedParameters` impedem código morto
- Um único comando (`npm run build`) é o gate — simples de lembrar e de rodar
- Nenhum tempo gasto configurando e mantendo ferramentas antes de haver componentes

### Negativas

- **A fronteira do `tsc` é estreita, e conhecê-la é obrigatório.** Ele não detecta:
  - classe Tailwind inexistente (`bg-primry-500` compila e não pinta nada)
  - valor de token divergente do Figma
  - `aria-label` ausente em componente só-ícone
  - contraste insuficiente
  - comportamento de teclado incompleto
  - `argTypes` de story divergindo da união real do componente
  - regressão visual
- Sem ESLint, não há detecção automática de hooks condicionais ou dependências de efeito incorretas
- Sem formatador, a consistência de estilo depende de disciplina
- `noUnusedParameters` obriga o prefixo `_` em parâmetro intencionalmente não usado

### Neutras

- A revisão humana carrega o peso do que o `tsc` não pega — daí a existência dos checklists em `docs/best-practices/contributing.md`
- `skipLibCheck: true` evita que tipos de terceiros quebrem o build

## Trade-offs

Priorizamos **velocidade inicial de construção e um gate simples e confiável** sobre **cobertura ampla de verificação automatizada**. Aceitamos que a garantia de comportamento e de aparência seja manual, e compensamos documentando explicitamente o que o `tsc` não pega.

## Notas de Implementação

```json
// tsconfig.json
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true,
"declaration": true,
"declarationMap": true,
"skipLibCheck": true
```

A fronteira do `tsc` está documentada em `docs/best-practices/contributing.md`, seção "O que o `tsc` não pega", junto com buscas `grep` que localizam o que merece leitura na revisão.

## Validação

A decisão é bem-sucedida se:

- Nenhum erro de tipo chegar a `dist/`
- Consumidores tiverem autocomplete e checagem corretos ao usar o pacote
- Os defeitos que escaparem forem das categorias conhecidamente fora do alcance do `tsc` — não de categorias que ele deveria pegar

## Revisão

**2026-07-07**: Decisão inicial. Reavaliar quando (a) houver mais de um contribuidor regular, ou (b) surgir o primeiro defeito de comportamento em consumidor — o que indicaria que a verificação manual não está segurando.
