# @ds/core — Design System

Biblioteca de componentes React + tokens de design sobre Tailwind CSS, documentada em Storybook. Fornece a camada de UI das aplicações de produto: 16 componentes e uma escala de tokens derivada do Figma, distribuídos como pacote ESM (`private`, consumido por workspace/`file:` link) com CSS em subpath separado.

## Documentação do Projeto

Consulte os arquivos abaixo antes de implementar componentes, alterar tokens ou mexer no contrato de integração:

| Arquivo | Conteúdo |
|---------|----------|
| `docs/stack.md` | Tecnologias, contrato do pacote, arquitetura em camadas, decisões e trade-offs |
| `docs/patterns.md` | Padrões arquiteturais e de código, convenções de nomenclatura, organização |
| `docs/features.md` | Referência completa de API dos 16 componentes |
| `docs/business-rules.md` | Invariantes de comportamento (R1–R17, incluindo R10a–c) e regras de domínio (D1–D8) |
| `docs/integrations.md` | Pipeline Figma→código, contrato de consumo, convivência com o Tailwind da aplicação |

Boas práticas — **leia antes de escrever código novo**:

| Arquivo | Conteúdo |
|---------|----------|
| `docs/best-practices/` | Índice e os cinco princípios do sistema |
| `docs/best-practices/tokens.md` | Hierarquia primitivo→semântico, regras de consumo e adição de token (T1–T12) |
| `docs/best-practices/component-api.md` | Design de API de componente (A1–A17), anatomia completa, antipadrões |
| `docs/best-practices/accessibility.md` | WCAG AA, contrastes calculados da paleta, lacunas conhecidas (AC1–AC13) |
| `docs/best-practices/contributing.md` | Fluxos de trabalho, versionamento, checklist de PR, governança |

## Restrições e Decisões Arquiteturais

Leia os ADRs em `meta/adr/` **antes de propor mudanças de stack, arquitetura ou padrões**. Comece por [meta/adr/README.md](meta/adr/README.md), que traz o índice e o grafo de dependências entre as decisões.

| ADR | Título | Status | Categoria |
|-----|--------|--------|-----------|
| [ADR-0001](meta/adr/0001-react-como-biblioteca-de-ui.md) | React como biblioteca de UI, com peerDependency ampla | Ativa | Stack |
| [ADR-0002](meta/adr/0002-typescript-strict-como-gate-de-qualidade.md) | TypeScript strict como único gate automatizado de qualidade | Ativa | Qualidade |
| [ADR-0003](meta/adr/0003-tailwind-como-unica-camada-de-estilo.md) | Tailwind CSS como única camada de estilo | Ativa | Stack |
| [ADR-0004](meta/adr/0004-zero-dependencias-de-runtime.md) | Zero dependências de runtime | Ativa | Arquitetura |
| [ADR-0005](meta/adr/0005-build-esm-only-com-css-em-subpath.md) | Build ESM-only em modo lib, com CSS em subpath separado | Ativa | Distribuição |
| [ADR-0006](meta/adr/0006-distribuicao-por-workspace-local.md) | Distribuição por workspace local, com pacote privado | Ativa | Distribuição |
| [ADR-0007](meta/adr/0007-tokens-em-duas-camadas.md) | Tokens de design em duas camadas: primitivo e semântico | Ativa | Tokens |
| [ADR-0008](meta/adr/0008-transcricao-manual-dos-tokens-do-figma.md) | Transcrição manual dos tokens do Figma | Ativa | Tokens |
| [ADR-0009](meta/adr/0009-estender-o-tema-do-tailwind.md) | Estender o tema do Tailwind em vez de substituí-lo | Ativa | Tokens |
| [ADR-0010](meta/adr/0010-especializacao-de-componentes-por-intencao.md) | Especialização de componentes por intenção, não por variante | Ativa | API de Componentes |
| [ADR-0011](meta/adr/0011-mapas-de-variante-tipados.md) | Mapas de variante tipados como mecanismo de variação visual | Ativa | API de Componentes |
| [ADR-0012](meta/adr/0012-classname-como-unico-escape-hatch.md) | `className` como único escape hatch de estilo | Ativa | API de Componentes |
| [ADR-0013](meta/adr/0013-container-e-item-separados.md) | Container e item como componentes separados, com estado na aplicação | Ativa | API de Componentes |
| [ADR-0014](meta/adr/0014-elemento-nativo-primeiro.md) | Elemento nativo primeiro, customizado por exceção | Ativa | Acessibilidade |
| [ADR-0015](meta/adr/0015-storybook-como-ambiente-de-verificacao.md) | Storybook como ambiente de desenvolvimento e verificação | Ativa | Qualidade |

**[ADR-0004](meta/adr/0004-zero-dependencias-de-runtime.md) é a raiz do grafo.** Se a restrição de zero dependências for revista, os ADRs 0003, 0011, 0012, 0013 e 0014 mudam de contexto — várias das suas alternativas rejeitadas passam a estar disponíveis.

Documentação de arquitetura complementar: [meta/architecture/system-overview.md](meta/architecture/system-overview.md) (camadas, fluxo de dados, princípios) e [meta/architecture/communication-patterns.md](meta/architecture/communication-patterns.md) (os três canais de comunicação, contratos, diagramas de sequência).

Restrições que valem como regra até que sejam explicitamente revistas:

- **Zero dependências de runtime.** Não adicione `clsx`, `cva`, `tailwind-merge`, Radix, Headless UI ou pacote de ícones sem alinhamento. A composição de classes é `[...].filter(Boolean).join(" ")`; ícones são SVG inline local.
- **Token é a única fonte de valor.** Nenhum hex ou px literal em componente. Valor arbitrário do Tailwind só para detalhe sub-token (há três casos legítimos no código).
- **Todo token nasce no Figma.** Fluxo unidirecional `figmatokens.json` → `src/tokens/*.ts`. Nunca adicione valor direto no TypeScript.
- **Especialização por intenção, não por variante.** `DangerButton`, não `<Button variant="danger">`.
- **O componente não emite margem.** Dimensão e padding internos, sim; margem, posição e z-index pertencem ao layout.
- **`className` é o único escape hatch.** Não exponha `style`, `sx`, `labelClassName` ou objeto de override.
- **Acessibilidade é requisito.** Sem bibliotecas de terceiros, nada resolve teclado e ARIA por nós. Não replique as lacunas listadas em `docs/best-practices/accessibility.md`.
- **ESM-only, dois subpaths.** `@ds/core` e `@ds/core/style.css`. Não há CJS nem deep import por componente.

## Comandos

```bash
npm run storybook   # localhost:6006 — ambiente principal de trabalho
npm run build       # tsc && vite build → dist/  (único gate automatizado)
```

Não há ESLint, Prettier nem test runner configurados. `tsc` com `strict`, `noUnusedLocals` e `noUnusedParameters` é a única verificação automática — ele **não** pega classe Tailwind inexistente, valor de token divergente, `aria-label` faltante, contraste insuficiente ou `argTypes` de story divergindo da união do componente. Ver `docs/best-practices/contributing.md#o-que-o-tsc-não-pega`.

## Convenções rápidas

**Estrutura de componente**

```
src/components/<actions|inputs|navigation>/<Nome>/
├── <Nome>.tsx
├── <Nome>.stories.tsx
└── index.ts          → export { Nome }; export type { NomeProps };
```

Registrar em `src/components/<categoria>/index.ts`.

**Ordem do array de classes**

```
estrutura → transição → foco → disabled → variante → tamanho → className
```

**Receitas de estado** (copie do componente irmão, não invente)

```
foco (botão):   focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-offset-2 focus-visible:ring-<contexto>-500
foco (campo):   outline-none + focus:border-primary-500
disabled:       disabled:pointer-events-none disabled:opacity-50
transição:      transition-colors duration-150   (duration-100 em item de lista)
raio:           rounded-200 (8px) | rounded-full (pílula)
```

**Tokens** — cores primitivas (`bg-primary-500`, `text-neutral-600`, `border-danger-500`); tamanhos onde `px = chave / 25` (`p-400` = 16px), com lacunas deliberadas na escala.

## Sessão Ativa

Verifique `.claude/sessions/` para features em andamento. Para retomar: `/work <slug>`.
