# Boas Práticas — Contribuição, Versionamento e Governança

Como levar uma mudança do Figma até as aplicações consumidoras sem quebrá-las.

---

## Ambiente

```bash
npm install
npm run storybook      # localhost:6006 — ambiente principal de desenvolvimento
```

Outros comandos:

```bash
npm run build            # tsc && vite build → dist/
npm run dev              # Vite dev server
npm run build-storybook  # storybook-static/
```

O Storybook é onde o trabalho acontece. `npm run build` é o gate antes do PR.

---

## Os quatro fluxos

### Fluxo 1 — Componente novo

```
1. Confirmar que é componente, não variante   → component-api.md, "a decisão anterior a todas"
2. Escolher categoria                         → actions | inputs | navigation
3. Criar a pasta                              → <Nome>.tsx + <Nome>.stories.tsx + index.ts
4. Implementar                                → seguir a anatomia de component-api.md
5. Registrar                                  → src/components/<categoria>/index.ts
6. Story cobrindo variantes, tamanhos, estados
7. npm run build                              → tsc precisa passar
8. Checklist de a11y                          → accessibility.md
9. PR
```

### Fluxo 2 — Alteração de token

```
1. Alterar a variável no Figma
2. Exportar variáveis → substituir figmatokens.json
3. Diff do JSON para identificar o que mudou
4. Aplicar em src/tokens/*.ts respeitando as adaptações de forma → tokens.md T8
5. npm run build
6. npm run storybook → revisar TODO componente que usa o token
7. PR sinalizando o impacto visual
```

Uma mudança de token atinge todo componente que usa a classe correspondente. Um ajuste em `primary-500` muda `Button`, `HeroButton`, `IconButton`, `IconToggle`, `Checkbox`, `Radio`, `Tab`, `NavbarTab`, `Textbox` (foco), `Select` (foco) e `MegaSelect` (aberto). Não existe mudança de token "local".

### Fluxo 3 — Alteração de componente existente

```
1. Localizar todo uso interno       → grep -rn "<Nome>" src/
2. Alterar
3. Avaliar se é breaking            → tabela abaixo
4. Atualizar a story                → se a API mudou, argTypes precisa acompanhar
5. npm run build
6. npm run storybook → revisar visualmente
7. PR indicando explicitamente se é breaking
```

### Fluxo 4 — Sincronização com as aplicações consumidoras

Como a distribuição é por workspace/`file:` link e não por registry, publicar é reconstruir:

```
1. npm run build no design system           → regenera dist/
2. Na aplicação: reinstalar ou reiniciar o dev server
3. Verificar o comportamento na aplicação real, não só no Storybook
```

Não há watch cruzado. Durante desenvolvimento simultâneo, `npm run build` é a etapa de sincronização — e ela é fácil de esquecer, produzindo o sintoma de "a mudança não aparece".

---

## Versionamento

O pacote está em `0.0.1` e é `"private": true` — não há publicação em registry. Isso **não** dispensa disciplina de versão: as aplicações consumidoras dependem do contrato, e a versão é como se comunica mudança.

### Semântica

| Incremento | Quando | Exemplos |
|---|---|---|
| **major** (`1.0.0`) | quebra o contrato — consumidor precisa mudar código | remover componente ou prop; remover valor de união; renomear export; mudar assinatura de callback; mudar default que altera aparência |
| **minor** (`0.1.0`) | adiciona superfície de forma compatível | componente novo; prop opcional nova; valor novo na união de variante; token novo |
| **patch** (`0.0.2`) | corrige sem mudar contrato | correção de classe errada; ajuste de a11y sem mudar API; correção de valor de token divergente do Figma |

### O que é breaking mesmo sem mudar tipo

Estas mudanças compilam no consumidor e ainda assim quebram a aplicação dele — o que as torna as mais perigosas:

| Mudança | Por que quebra |
|---|---|
| Alterar dimensão de um `size` | quebra o layout que dependia da altura anterior |
| Alterar o default de `variant` ou `size` | muda a aparência de todo uso que não passa a prop |
| Alterar valor de token | muda a aparência de todo componente que usa a classe |
| Trocar o elemento raiz (`<div>` → `<span>`) | quebra CSS e seletor de teste do consumidor |
| Remover uma classe de layout (`w-full`) | muda o comportamento dentro do container do consumidor |
| Mudar a posição do spread `{...props}` | muda o que o consumidor pode sobrescrever |
| Adicionar `margin` a um componente | quebra o espaçamento do layout ([A15](component-api.md#a15--não-emita-margem)) |
| Passar a exigir prop antes opcional | erro de tipo no consumidor |
| Mudar `role` ou remover atributo ARIA | quebra teste de acessibilidade e leitor de tela |

**Regra**: mudança visual perceptível em componente existente é, no mínimo, minor com nota no PR — mesmo que nenhum tipo tenha mudado.

### Deprecação

Antes de remover superfície pública:

```tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** @deprecated Use `startIcon`. Será removido na 2.0. */
  leadingIcon?: ReactNode;
  startIcon?: ReactNode;
}
```

`@deprecated` no JSDoc aparece riscado no editor do consumidor e na página de autodocs do Storybook — é o aviso de menor atrito disponível. Mantenha a prop funcionando por pelo menos um ciclo de release antes de remover.

---

## Checklist de PR

### Sempre

- [ ] `npm run build` passa (`tsc` + bundle)
- [ ] `npm run storybook` sobe e a story do componente afetado renderiza corretamente
- [ ] Nenhum valor literal onde existe token ([T1](tokens.md#t1--nunca-escreva-um-valor-literal-onde-existe-token))
- [ ] `className` aceito e concatenado por último ([A7](component-api.md#a7--ordem-canônica-do-array-de-classes))
- [ ] Nenhuma margem emitida pelo componente ([A15](component-api.md#a15--não-emita-margem))
- [ ] Nenhum `console.log` ou código comentado

### Componente novo ou alterado

- [ ] Estende os atributos HTML do elemento raiz, ou há razão documentada para API fechada ([A1](component-api.md#a1--estenda-os-atributos-html-do-elemento-raiz))
- [ ] Toda prop de aparência é opcional e tem default ([A3](component-api.md#a3--toda-prop-de-aparência-é-opcional-e-tem-default))
- [ ] Mapa de variante tipado por `Record<Union, string>`, no escopo do módulo ([A4](component-api.md#a4--um-eixo-um-mapa))
- [ ] Interface de props exportada; união de variante não exportada ([A6](component-api.md#a6--exporte-a-interface-de-props-não-exporte-a-união))
- [ ] `className` e `disabled` desestruturados fora do spread ([A8](component-api.md#a8--cuidado-com-a-posição-do-spread))
- [ ] `type="button"` em botão que não é submit ([A16](component-api.md#a16--typebutton-em-botão-que-não-é-submit))
- [ ] `forwardRef` + `displayName` se o elemento nativo está escondido ([A9](component-api.md#a9--forwardref-em-componente-cujo-elemento-real-está-escondido))
- [ ] `disabled` tratado em visual **e** interação ([R8](../business-rules.md#r8--desabilitado-impede-abertura-de-dropdown))
- [ ] Estados seguem a receita dos componentes irmãos ([T5](tokens.md#t5--consistência-de-estado-entre-componentes-irmãos))
- [ ] Registrado no `index.ts` da categoria
- [ ] Story com variantes, tamanhos e estados; `argTypes.options` casando com a união
- [ ] Callback invocado com `?.`
- [ ] `useEffect` com cleanup, se houver listener

### Acessibilidade

- [ ] Elemento nativo considerado antes de `role` customizado
- [ ] Nome acessível garantido (texto, `aria-label` ou `<label htmlFor>`)
- [ ] Foco visível ([AC2](accessibility.md#ac2--foco-sempre-visível))
- [ ] Estado exposto por ARIA além da cor ([AC4](accessibility.md#ac4--estado-é-comunicado-por-aria-não-só-por-cor))
- [ ] Percorrido só com teclado: `Tab`, `Shift+Tab`, setas, `Enter`, `Espaço`, `Escape`
- [ ] Contraste ≥ 4.5:1 em texto, ≥ 3:1 em borda e ícone informativo
- [ ] Alvo de toque ≥ 24×24px
- [ ] Nenhuma das [lacunas conhecidas](accessibility.md#lacunas-conhecidas) replicada

### Token

- [ ] Origem no Figma, com `figmatokens.json` atualizado ([T7](tokens.md#t7--todo-token-novo-nasce-no-figma))
- [ ] Adaptações de forma respeitadas ([T8](tokens.md#t8--ao-transcrever-respeite-as-adaptações-de-forma))
- [ ] Token semântico referencia primitivo, sem valor novo ([T9](tokens.md#t9--um-token-semântico-nunca-introduz-valor-novo))
- [ ] Rampa de cor completa, 50–950 ([T11](tokens.md#t11--escala-de-cor-completa-sempre))
- [ ] Todo componente afetado revisado visualmente
- [ ] Impacto visual descrito no PR

### Versão

- [ ] Classificada como major / minor / patch
- [ ] Mudança breaking sinalizada explicitamente, com o que o consumidor precisa fazer
- [ ] Mudança visual em componente existente sinalizada, mesmo sem mudança de tipo

---

## O que o `tsc` não pega

`"build": "tsc && vite build"` é o único gate automatizado. Conhecer sua fronteira evita falsa confiança.

**Pega:**

- prop obrigatória faltante, tipo errado, valor fora da união
- mapa `Record<Union, string>` incompleto
- variável ou parâmetro não usado (`noUnusedLocals`, `noUnusedParameters`)
- import inexistente, export ausente no barrel
- `switch` sem `break` (`noFallthroughCasesInSwitch`)

**Não pega:**

| Categoria | Exemplo |
|---|---|
| Classe Tailwind inexistente | `bg-primry-500` compila e não renderiza fundo |
| Classe fora do `content` | classe montada por concatenação dinâmica não é gerada pelo Tailwind |
| Valor de token divergente do Figma | `primary-500` com o hex errado compila |
| `aria-label` faltante | é prop opcional no tipo |
| `id` duplicado em `FormGroup` | derivação de label sem verificação |
| Contraste insuficiente | nenhuma verificação de cor |
| Teclado incompleto | nenhum teste de interação |
| `argTypes.options` divergindo da união | `argTypes` é `Record<string, unknown>` |
| Regressão visual | não há snapshot |
| Ordem de foco ilógica | não há teste de a11y |
| Margem emitida pelo componente | é só uma classe |

Tudo na coluna direita é responsabilidade da revisão manual.

### Buscas úteis na revisão

```bash
# valores arbitrários de cor
grep -rn "\[#" src/components/

# estilo inline
grep -rn "style={{" src/components/

# botão sem type explícito
grep -rn "<button" src/components/ | grep -v 'type='

# outline removido sem anel substituto
grep -rn "outline-none" src/components/ | grep -v "ring-"

# useEffect sem cleanup aparente
grep -rn -A6 "useEffect" src/components/ | grep -B6 -L "return"

# aria-label em componentes só-ícone
grep -rn "aria-label" src/components/
```

Match não é erro — o grep localiza o que merece leitura.

---

## Governança

### Propriedade das decisões

| Decisão | Onde é tomada | Quem decide |
|---|---|---|
| Valor de token (cor, tamanho, tipografia) | Figma | design |
| Adicionar chave à escala de tamanho | Figma | design |
| Rampa de cor nova | Figma | design |
| Componente novo é componente ou variante | código | design + engenharia |
| Forma da API (props, nomes, defaults) | código | engenharia |
| Estratégia de acessibilidade | código | engenharia |
| Nativo vs. customizado em controle | código | engenharia, com o custo de a11y à vista |
| Classificação de versão | código | engenharia |

A fronteira: **design decide os valores; engenharia decide a forma.** Um valor de cor não se decide em PR de código; uma assinatura de callback não se decide no Figma.

### O que exige alinhamento antes do código

- Componente novo (é a família certa? a categoria certa?)
- Mudança breaking (quais aplicações consumidoras são afetadas?)
- Token novo ou alterado (o impacto é sistêmico)
- Adicionar dependência de runtime — hoje são zero, e essa é uma decisão arquitetural ([stack.md](../stack.md#decisões-arquiteturais-importantes))
- Trocar controle nativo por customizado (transfere o custo de acessibilidade para este repositório)

### Divergência entre Figma e código

Nada no build detecta que um token no código diverge do Figma. Quando a divergência aparece:

1. **Determine qual é a fonte de verdade.** Por padrão, é o Figma ([T7](tokens.md#t7--todo-token-novo-nasce-no-figma)).
2. **Se o Figma está certo**, corrija `src/tokens/` — é patch.
3. **Se o código está certo** (o Figma ficou para trás), corrija o Figma primeiro, exporte, e só então confirme o código. Não deixe o código "correto e divergente".
4. **Registre a decisão no PR.** É a única memória disponível — não há changelog nem ADR no repositório.

### Trabalho de infraestrutura em aberto

Nenhum destes existe hoje. Em ordem de retorno sobre esforço:

| Prioridade | Item | Ganho |
|---|---|---|
| 1 | ~~Stories para os 11 componentes sem cobertura~~ **Concluído** — todos os 16 componentes têm stories | — |
| 2 | `@storybook/addon-a11y` | feedback de acessibilidade durante o desenvolvimento, custo de instalação |
| 3 | ESLint + Prettier | consistência automática; nenhum linter configurado |
| 4 | Foco visível no `Tab` + `aria-describedby`/`aria-invalid` no formulário | as lacunas de a11y restantes de maior impacto, todas de poucas linhas |
| 5 | Teste de interação (`@storybook/test` ou Vitest) | cobre o que `tsc` não pega |
| 6 | Automação de token (Style Dictionary / `@tokens-studio`) | elimina a transcrição manual e a classe de divergência silenciosa |
| 7 | Teste de regressão visual (Chromatic ou Playwright) | detecta mudança não intencional em mudança de token |
| 8 | CHANGELOG | não há registro histórico de mudança |
| 9 | Carregamento de DM Sans no Storybook | o catálogo visual hoje renderiza com fonte de fallback |
| 10 | Utilitários Tailwind a partir de `semanticColors` | fecharia a camada 2 da hierarquia de tokens |
