# Stack Tecnológica

## Linguagens e Runtime

| Item | Versão | Observação |
|------|--------|------------|
| TypeScript | `^5.7.2` | `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` |
| Target de compilação | `ES2020` | `lib: ["ES2020", "DOM", "DOM.Iterable"]` |
| Módulos | `ESNext` + `moduleResolution: "bundler"` | O pacote é ESM-only (`"type": "module"`) |
| JSX | `react-jsx` | Runtime automático — não há `import React` nos componentes |

Não há runtime Node próprio: a biblioteca roda no browser, dentro da aplicação que a consome.

## Frameworks Principais

| Framework | Versão | Papel |
|-----------|--------|-------|
| React | `^18.3.1` (dev) / `^18.0.0 \|\| ^19.0.0` (peer) | Biblioteca de componentes. React é **peerDependency** — quem consome fornece a instância |
| Tailwind CSS | `^3.4.16` | Única camada de estilo. Não há CSS-in-JS, CSS Modules ou arquivos `.css` por componente |
| Vite | `^6.0.3` | Build em modo `lib` e dev server |
| Storybook | `^8.4.7` (`@storybook/react-vite`) | Documentação visual e ambiente de desenvolvimento dos componentes |

## Bibliotecas Chave

A lista de dependências de runtime é intencionalmente **vazia**. Não há `clsx`, `class-variance-authority`, `tailwind-merge`, Radix UI, Headless UI ou qualquer primitiva de terceiros.

Consequências diretas dessa escolha, visíveis no código:

- A composição de classes é feita manualmente com `[...].filter(Boolean).join(" ")` (ver [patterns.md](patterns.md#composição-de-classes)).
- Comportamentos como dropdown, foco e click-outside são implementados à mão (ex.: [MegaSelect.tsx:43-51](../src/components/inputs/MegaSelect/MegaSelect.tsx#L43-L51)).
- Ícones são SVGs inline definidos no próprio arquivo do componente, não vindos de um pacote de ícones.

`devDependencies` relevantes: `autoprefixer ^10.4.20`, `postcss ^8.4.49`, `@vitejs/plugin-react ^4.3.4`, `@types/react ^18.3.12`, `@types/react-dom ^18.3.1`.

## Banco de Dados

Não aplicável. É uma biblioteca de UI sem persistência, sem chamadas de rede e sem estado global. O único estado existente é local a componentes (`useState` em [MegaSelect](../src/components/inputs/MegaSelect/MegaSelect.tsx) e [SearchInput](../src/components/inputs/SearchInput/SearchInput.tsx)).

## Infraestrutura

Não há Docker, CI/CD, cloud provider ou pipeline de deploy neste repositório.

A distribuição é feita por **build local + link de workspace**: o pacote é `"private": true` e não é publicado em registry. Quem consome referencia a pasta (npm workspace ou `file:../design_system`) e depende do artefato em `dist/`.

Artefatos gerados (todos ignorados pelo git — ver [.gitignore](../.gitignore)):

```
dist/                 # saída do `npm run build`
storybook-static/     # saída do `npm run build-storybook`
node_modules/
```

Contrato de saída declarado em [package.json:6-15](../package.json#L6-L15):

```json
"main":    "./dist/index.js",
"module":  "./dist/index.js",
"types":   "./dist/index.d.ts",
"exports": {
  ".":            { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
  "./style.css":  "./dist/index.css"
}
```

Dois pontos importantes desse contrato:

1. **Somente ESM.** [vite.config.ts:9](../vite.config.ts#L9) declara `formats: ["es"]`. Não existe build CJS — um consumidor `require()` não funciona.
2. **O CSS é um subpath separado.** O JS não injeta estilo por si; a aplicação precisa importar `@ds/core/style.css` explicitamente.

`react`, `react-dom` e `react/jsx-runtime` são marcados como `external` em [vite.config.ts:13](../vite.config.ts#L13), evitando duplicação de React no bundle final.

## Ferramentas de Desenvolvimento

| Comando | Efeito |
|---------|--------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc && vite build` — a checagem de tipos é bloqueante e roda antes do bundle |
| `npm run storybook` | Storybook em `localhost:6006` |
| `npm run build-storybook` | Storybook estático em `storybook-static/` |

O `tsc` no `build` é, hoje, o **único gate automatizado de qualidade** do repositório: não há ESLint, Prettier, Jest/Vitest, Playwright, testes de acessibilidade automatizados ou hooks de git configurados. A verificação de comportamento é visual, via Storybook.

## Arquitetura Geral

Três camadas, com dependência estritamente unidirecional:

```
figmatokens.json          (fonte de design, exportada do Figma — W3C Design Tokens)
        │  transcrição manual
        ▼
src/tokens/*.ts           (tokens tipados em TS)
        │
        ├──────────────► tailwind.config.ts   (tokens viram utilitários Tailwind)
        │                        │
        ▼                        ▼
src/components/**         (componentes consomem os utilitários por className)
        │
        ▼
src/index.ts              (barrel público: componentes + tokens + globals.css)
```

Detalhes que definem o comportamento do sistema:

- **`theme.extend`, não `theme`.** [tailwind.config.ts:7](../tailwind.config.ts#L7) estende o tema padrão do Tailwind. A escala default continua disponível, e os componentes de fato misturam as duas: `h-10` (2.5rem, escala default) convive com `px-400` (16px, escala de tokens) no mesmo elemento — ver [Textbox.tsx:13](../src/components/inputs/Textbox/Textbox.tsx#L13).
- **`content` cobre apenas `./src/**/*.{ts,tsx}`.** Classes escritas fora de `src/` — inclusive em aplicações consumidoras — não são geradas por este build de CSS.
- **Os tokens são exportados no bundle.** [src/index.ts](../src/index.ts) faz `export * from "./tokens"`, então `colors`, `spacing`, `fontSize` etc. estão disponíveis em runtime para quem consome, não só em build time.
- **Organização por função de UI, não por átomo/molécula.** `components/actions`, `components/inputs`, `components/navigation`.

## Decisões Arquiteturais Importantes

**Tailwind como única camada de estilo.** Os tokens alimentam a config do Tailwind e os componentes referenciam apenas classes utilitárias. Isso mantém o CSS do pacote proporcional ao que é usado e elimina a necessidade de runtime de estilo. O trade-off é que a variação visual vive em mapas `Record<Variant, string>` de strings de classe, sem validação além do tipo da chave — uma classe escrita errado é um erro silencioso, não um erro de compilação.

**Zero dependências de runtime.** Evita conflitos de versão na aplicação consumidora e mantém o pacote pequeno. O custo é que padrões de acessibilidade não triviais (navegação por teclado em listbox, focus trap, posicionamento com detecção de colisão) ficam por conta deste repositório. Ver [best-practices/accessibility.md](best-practices/accessibility.md) para o que isso implica ao adicionar componentes.

**React como peerDependency com faixa ampla (18 ou 19).** Permite que a biblioteca acompanhe aplicações em qualquer das duas majors. Exige que o código evite APIs exclusivas de uma delas.

**ESM-only.** Simplifica o build (um único formato) e alinha com Vite/bundlers modernos. Exclui consumidores CommonJS.

**Tokens transcritos manualmente do Figma.** [figmatokens.json](../figmatokens.json) é o export bruto do Figma; [src/tokens/](../src/tokens/) é a versão TypeScript escrita à mão. Não há transformador (Style Dictionary, `@tokens-studio`) no pipeline — a sincronização é uma etapa humana. Ver [integrations.md](integrations.md#figma) para o formato e o mapeamento.

**Sem camada de teste automatizado.** A verificação é visual via Storybook e estrutural via `tsc`. Ver [best-practices/contributing.md](best-practices/contributing.md#checklist-de-pr) para o checklist manual que substitui isso hoje.
