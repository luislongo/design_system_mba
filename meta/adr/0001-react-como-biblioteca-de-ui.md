# 1. React como biblioteca de UI, com peerDependency ampla

Data: 2026-07-07

## Status

Ativa

## Contexto

O design system precisa entregar componentes de interface consumíveis por múltiplas aplicações de produto. A escolha da biblioteca de UI é a decisão mais irreversível do projeto: ela define o modelo de composição, o formato dos componentes, o ecossistema de ferramentas disponível e, na prática, quais aplicações podem consumir o pacote.

Forças em jogo:

- As aplicações consumidoras já são React — um design system em outra tecnologia seria inutilizável sem uma camada de interoperabilidade.
- O pacote precisa funcionar em aplicações que possam estar em versões diferentes do React, sem forçar todas a migrarem em sincronia.
- Duas instâncias de React no mesmo bundle causam o erro `Invalid hook call`, que é uma das falhas mais confusas de diagnosticar em bibliotecas de componentes.

## Decisão

Vamos usar **React como biblioteca de UI**, declarado como `peerDependency` com faixa ampla (`^18.0.0 || ^19.0.0`), e marcar `react`, `react-dom` e `react/jsx-runtime` como `external` no build.

O React usado em desenvolvimento (`devDependencies`) é fixado em `^18.3.1`, mas o pacote publicado não carrega React algum — a instância vem sempre da aplicação consumidora.

## Alternativas Consideradas

### Alternativa 1: Web Components (Lit, Stencil)

**Descrição**: Componentes em standard de plataforma, consumíveis por qualquer framework.

**Prós**:
- Agnóstico de framework — serviria React, Vue, Angular e HTML puro
- Encapsulamento real via Shadow DOM
- Não amarra o design system ao ciclo de vida de um framework

**Contras**:
- Interoperabilidade com React é atritada: eventos customizados, passagem de objetos por propriedade, `ref` forwarding
- Shadow DOM isola o CSS, o que inviabiliza a abordagem de utilitários Tailwind globais ([ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md))
- Tipagem em TSX exige declaração manual de `IntrinsicElements`
- Nenhuma aplicação consumidora precisa da portabilidade hoje

**Razão para rejeição**: Pagaríamos o custo de interoperabilidade e o conflito com a estratégia de estilo para obter uma portabilidade que nenhum consumidor atual demanda.

### Alternativa 2: React como `dependency` (não peer)

**Descrição**: Declarar React como dependência direta do pacote.

**Prós**:
- Instalação mais simples: o consumidor não precisa garantir a presença do React
- Versão do React controlada pelo design system

**Contras**:
- Risco alto de duas instâncias de React no bundle final → `Invalid hook call`
- Força a aplicação a usar a versão que o design system escolheu
- Aumenta o tamanho do pacote

**Razão para rejeição**: É o antipadrão conhecido de bibliotecas de componentes React. O ganho de conveniência não compensa a classe de bug que introduz.

### Alternativa 3: `peerDependency` estreita (só React 18)

**Descrição**: `"react": "^18.0.0"`.

**Prós**:
- Superfície de compatibilidade menor para testar
- Permite usar APIs específicas do React 18 sem hesitação

**Contras**:
- Aplicação que migrar para React 19 recebe aviso de peer incompatível
- Acopla o cronograma de migração das aplicações ao do design system

**Razão para rejeição**: A faixa ampla custa apenas a disciplina de evitar APIs exclusivas de uma major, e desacopla os cronogramas.

## Consequências

### Positivas

- Consumo direto pelas aplicações, sem camada de adaptação
- Uma única instância de React no bundle final, garantida pelo `external`
- Aplicações podem migrar entre React 18 e 19 no próprio ritmo
- Acesso ao ecossistema React: Storybook, `react-docgen` para autodocs, tipos de `@types/react`
- Modelo de composição por props e `children` é familiar a quem consome

### Negativas

- O design system fica amarrado ao React; suportar outro framework exigiria reescrita
- Aplicações não-React não podem consumir o pacote
- A faixa ampla proíbe APIs exclusivas de uma major (ex.: recursos só do React 19)
- O consumidor precisa garantir que React esteja instalado — não é automático

### Neutras

- `react` e `react-dom` ficam em `devDependencies` apenas para desenvolvimento e Storybook
- O contrato de tipos depende de `@types/react` compatível no lado do consumidor

## Trade-offs

Priorizamos **integração direta e sem atrito com as aplicações existentes** sobre **portabilidade entre frameworks**. E priorizamos **desacoplamento do cronograma de migração dos consumidores** sobre **liberdade de usar APIs de uma major específica**.

## Notas de Implementação

```json
// package.json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

```ts
// vite.config.ts
rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] }
```

`jsx: "react-jsx"` no [tsconfig.json](../../tsconfig.json) habilita o runtime automático — nenhum componente importa `React` explicitamente.

APIs em uso hoje, todas disponíveis em 18 e 19: `useState`, `useRef`, `useEffect`, `useId`, `forwardRef`, e os tipos `ReactNode`, `HTMLAttributes`, `KeyboardEvent`.

## Validação

A decisão é bem-sucedida se:

- Nenhuma aplicação consumidora reportar `Invalid hook call` por React duplicado
- O pacote funcionar sem alteração em aplicações React 18 e React 19
- Nenhuma API exclusiva de uma major entrar no código sem decisão explícita

## Revisão

**2026-07-07**: Decisão inicial. Todas as APIs em uso são compatíveis com ambas as majors.
