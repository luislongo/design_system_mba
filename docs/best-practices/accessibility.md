# Boas Práticas — Acessibilidade

Este repositório tem **zero dependências de runtime** ([stack.md](../stack.md#bibliotecas-chave)). Não há Radix, Headless UI ou React Aria resolvendo comportamento acessível por baixo. Cada componente implementa o seu — e o que não estiver implementado aqui não existe no produto final.

Alvo: **WCAG 2.1 nível AA**.

---

## Regra zero: elemento nativo primeiro

Antes de escrever `role`, pergunte se um elemento HTML já faz o trabalho.

| Precisa de | Use | Ganha de graça |
|---|---|---|
| Ação | `<button>` | foco, `Enter`/`Espaço`, papel, estado desabilitado |
| Navegação para URL | `<a href>` | foco, `Enter`, menu de contexto, abrir em nova aba |
| Seleção única | `<select>` | teclado completo, busca por digitação, picker do SO |
| Seleção binária | `<input type="checkbox">` | `Espaço`, estado, `indeterminate` |
| Escolha exclusiva | `<input type="radio">` + `name` | navegação por setas dentro do grupo |
| Texto | `<input>` / `<textarea>` | teclado do SO, autocomplete, correção |
| Região de navegação | `<nav>` | landmark para leitor de tela |

`Select` usa `<select>` nativo, e é por isso que ele tem teclado completo sem uma linha de JS. `MegaSelect` optou pelo painel customizado — e por isso teve de implementar o padrão combobox do WAI-ARIA à mão, inteiro: índice ativo, `aria-activedescendant`, setas, `Home`/`End`, `Escape`, retorno de foco e scroll da opção ativa. São ~80 linhas de comportamento que o `<select>` entrega de graça.

**A escolha entre nativo e customizado é uma escolha de escopo de acessibilidade.** Decida com isso à vista.

---

## Regras

### AC1 — Todo controle tem nome acessível

Um controle sem nome é anunciado como "botão" ou "caixa de edição", sem mais nada.

```tsx
// texto visível já é o nome
<Button>Salvar</Button>

// só ícone → aria-label obrigatório
<IconButton icon={<TrashIcon />} aria-label="Excluir item" />

// campo → label associado por id
<FormGroup label="E-mail" />                          // htmlFor/id automático
<Textbox id="cep" /> + <label htmlFor="cep">CEP</label>
```

Ao construir componente só-ícone, marque o ícone como `aria-hidden` e trate `aria-label` como requisito:

```tsx
// IconButton.tsx:38, 49
aria-label={props["aria-label"]}
<span className="flex items-center justify-center" aria-hidden>{icon}</span>
```

O tipo não obriga `aria-label` — é convenção verificada em revisão. Todas as stories do `IconButton` o passam.

### AC2 — Foco sempre visível

Nunca remova o indicador de foco sem substituí-lo.

```tsx
// ✗ usuário de teclado se perde
"outline-none"

// ✓ anel (botões, controles)
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"

// ✓ borda (campos de texto)
"outline-none focus:border-primary-500"

// ✓ anel interno, quando o elemento encosta em outra borda
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
```

`focus-visible` em vez de `focus`: o anel aparece na navegação por teclado e não no clique de mouse — o comportamento que os navegadores modernos já adotam nativamente.

A cor do anel acompanha o contexto: `ring-primary-500` em geral, `ring-danger-500` no `DangerButton`.

Em controle com input oculto, o anel vai no `<span>` visual, via `peer-focus-visible:`.

### AC3 — Input real por trás de controle customizado

Nunca desenhe um checkbox com `<div onClick>`. A técnica correta — usada por `Checkbox` e `Radio` — mantém o input nativo, invisível, sobreposto ao controle visual:

```tsx
<span className="relative inline-flex w-5 h-5 shrink-0">
  <input
    ref={ref}
    type="checkbox"
    className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
    {...props}
  />
  <span
    aria-hidden
    className={[
      "absolute inset-0 rounded-100 border border-neutral-200 bg-light-full",
      "flex items-center justify-center pointer-events-none transition-colors duration-150",
      "peer-checked:bg-primary-500 peer-checked:border-primary-500",
      "peer-hover:border-neutral-300",
      "peer-disabled:border-neutral-50 peer-disabled:bg-light-800",
      "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500",
    ].join(" ")}
  >
    {/* ícone de check */}
  </span>
</span>
```

Os três detalhes que fazem isso funcionar:

1. **`opacity-0`, não `display: none` nem `visibility: hidden`.** Elemento oculto por essas duas propriedades sai da ordem de tabulação e não recebe foco.
2. **O input cobre a área toda** (`absolute inset-0 w-full h-full`) — o clique em qualquer ponto do controle atinge o input.
3. **A camada visual é `aria-hidden` e `pointer-events-none`** — leitores de tela a ignoram e ela não intercepta cliques.

Resultado: semântica, teclado, foco, estado e integração com formulário são os nativos. Só a pintura é customizada.

### AC4 — Estado é comunicado por ARIA, não só por cor

Cor sozinha não é percebida por leitor de tela nem por usuário com deficiência de visão de cores.

| Estado | Atributo | Onde |
|---|---|---|
| Aba/opção selecionada | `aria-selected` | `Tab`, `NavbarTab`, `SelectOption` |
| Alternância pressionada | `aria-pressed` | `IconToggle` (nos dois lados) |
| Desabilitado | `disabled` nativo (não `aria-disabled`) | todos |
| Expandido | `aria-expanded` | `MegaSelect` |
| Opção ativa por teclado | `aria-activedescendant` | `MegaSelect` |
| Campo inválido | `aria-invalid` | **falta** em `Textbox`/`Select` |
| Mensagem de erro | `aria-describedby` | **falta** no `FormGroup` |
| Carregando | `aria-busy` ou `role="status"` | **falta** no `Button` |

Ao adicionar componente, cubra os atributos da coluna do meio. Os marcados como faltantes são as lacunas atuais — não os replique.

### AC5 — Papel correto, e completo

Um `role` traz obrigações. Declarar `role="listbox"` sem implementar navegação por setas produz uma promessa quebrada — o leitor de tela anuncia uma listbox que não se comporta como tal.

Papéis já em uso:

| Papel | Componente | Obrigações do padrão | Situação |
|---|---|---|---|
| `combobox` / `listbox` / `option` | `MegaSelect` / `MegaSelectOption` | `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`, setas ↑↓, `Home`/`End`, `Enter`, `Escape`, retorno de foco | ✓ completo |
| `option` | `SelectOption` | `aria-selected` — é primitiva de composição, sem container próprio; o teclado é responsabilidade de quem monta a lista | ✓ no escopo dele |
| `tablist` / `tab` | `TabList`/`Tab`, `Navbar`/`NavbarTab` | `aria-selected`, `aria-controls`, setas ←→, tabIndex gerenciado | ⚠ parcial — ver [lacunas](#lacunas-conhecidas) |

Se as obrigações não serão cumpridas, é preferível **não declarar o papel** do que declará-lo pela metade — um `<button>` sem `role` é anunciado corretamente como botão.

### AC6 — Ícone decorativo é `aria-hidden`

```tsx
<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
```

Todo SVG interno do sistema tem `aria-hidden`: chevron, lupa, check, spinner, indicador de aba. Ícone que carrega informação não coberta por texto próximo é a exceção — nesse caso ele precisa de nome acessível, e é sinal de que provavelmente falta texto na interface.

O wrapper de ícone do consumidor no `IconButton` também é `aria-hidden` (AC1).

### AC7 — Ordem de tabulação segue a ordem visual

Não use `tabIndex` positivo. Nunca. Ele reordena a tabulação de toda a página de forma imprevisível.

`tabIndex={-1}` é legítimo para remover de tabulação um elemento redundante:

```tsx
// SearchInput.tsx:76 — o botão de fechar duplica uma ação já alcançável;
// mantê-lo na tabulação faria Tab voltar para trás em vez de seguir na página
<button type="button" onClick={toggle} aria-label="Fechar busca" tabIndex={-1}>
```

Em padrão de tablist com tabIndex gerenciado, `-1` nas abas inativas é parte do padrão — mas só quando as setas estiverem implementadas.

### AC8 — Foco vai para onde o conteúdo aparece

Quando a interação revela um campo, o foco vai para ele:

```tsx
// SearchInput.tsx:84 — o input só existe no ramo expandido,
// então autoFocus dispara exatamente na transição
<input type="text" autoFocus … />
```

`autoFocus` é aceitável aqui porque é **resposta a uma ação do usuário**, não foco automático no carregamento da página (que é desorientador e viola boa prática).

Corolário: quando o conteúdo desaparece, o foco volta ao elemento que o abriu. O `MegaSelect` devolve o foco ao gatilho ao fechar por `Escape` ou por seleção — mas **não** ao fechar por clique fora, porque roubar o foco depois de o usuário clicar em outro lugar da página seria hostil. Essa distinção é deliberada:

```tsx
// MegaSelect.tsx — Escape e seleção devolvem o foco
const closePanel = (returnFocus: boolean) => {
  setOpen(false);
  setActiveIndex(-1);
  if (returnFocus) triggerRef.current?.focus();
};

// o listener de clique fora fecha sem devolver
document.addEventListener("mousedown", () => { setOpen(false); setActiveIndex(-1); });
```

### AC9 — Teclado completo em controle customizado

Todo comportamento que o mouse alcança, o teclado precisa alcançar. Referência para os padrões que este sistema toca (WAI-ARIA Authoring Practices):

**Combobox / listbox** — implementado no [MegaSelect](../../src/components/inputs/MegaSelect/MegaSelect.tsx), e a referência a copiar para qualquer painel customizado novo:

| Tecla | Efeito | Situação |
|---|---|---|
| `Enter`, `Espaço`, `↓` | abre o painel, posicionando no selecionado ou no primeiro | ✓ |
| `↑` (fechado) | abre posicionando no último | ✓ |
| `↑` / `↓` | move a opção ativa, pulando desabilitadas, com clamp nos extremos | ✓ |
| `Home` / `End` | primeira / última opção habilitada | ✓ |
| `Enter` / `Espaço` | seleciona a ativa, fecha e devolve o foco | ✓ |
| `Escape` | fecha sem selecionar e devolve o foco | ✓ |
| `Tab` | fecha e segue o fluxo natural de foco (sem `preventDefault`) | ✓ |
| digitação | pula para a opção que começa com a letra | ✗ opcional pela APG; não implementado |

Atributos: `role="combobox"` no gatilho, com `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` e `aria-activedescendant` apontando o `id` da opção ativa (gerado com `useId()`). O painel é `role="listbox"`; as opções são `role="option"` com `aria-selected`, `aria-disabled` e `tabIndex={-1}` — o foco permanece no gatilho, que é o que o padrão `aria-activedescendant` exige.

Dois detalhes fáceis de esquecer, ambos resolvidos ali:

- **Opções não entram na ordem de tabulação** (`tabIndex={-1}`). Sem isso, `Tab` navegaria para dentro do painel e romperia o padrão.
- **A opção ativa precisa ser trazida à área visível.** O painel tem `max-h-[200px] overflow-auto`, então navegar com setas além do visível exige `scrollIntoView({ block: "nearest" })`.

E um requisito visual que costuma ser tratado como estético, mas é de acessibilidade: **o cursor de teclado precisa ser discernível.** Um cinza sutil (`bg-light-800`, `#F2F2F2`) não serve como indicador de posição. A opção ativa usa `ring-1 ring-inset ring-primary-500`, distinto do `bg-primary-50` que marca a opção selecionada.

**Tabs** (`TabList`, `Navbar`) — **não implementado**:

| Tecla | Efeito esperado |
|---|---|
| `←` / `→` | move entre abas |
| `Home` / `End` | primeira / última |
| `Tab` | sai do tablist para o painel |

Atributos: `aria-controls` no tab apontando o painel, `aria-labelledby` no painel apontando o tab, `tabIndex={0}` na ativa e `-1` nas demais.

Hoje as abas são alcançáveis por `Tab`/`Enter`, mas não por setas. Implementar exige um coordenador que conheça os irmãos, o que revisita [ADR-0013](../../meta/adr/0013-container-e-item-separados.md). Ver [Lacunas conhecidas](#lacunas-conhecidas).

### AC10 — Contraste mínimo

| Conteúdo | Mínimo AA |
|---|---|
| Texto normal (< 18.66px, ou < 24px se bold) | 4.5:1 |
| Texto grande | 3:1 |
| Borda de controle, ícone informativo, indicador de foco | 3:1 |

Contrastes calculados da paleta, sobre `light.full` (`#FFFFFF`) salvo indicação:

| Cor | Uso no sistema | Contraste | Texto normal (4.5:1) | Borda/ícone (3:1) |
|---|---|---|---|---|
| `neutral-800` `#343537` | texto principal | **12.28:1** | ✓ | ✓ |
| `primary-500` `#6739B1` | texto e superfície de marca | **7.51:1** | ✓ | ✓ |
| `neutral-600` `#545559` | texto secundário, label | **7.45:1** | ✓ | ✓ |
| `danger-600` `#AF3015` | — (não usado) | **6.45:1** | ✓ | ✓ |
| `danger-500` `#DA3E1D` | texto de erro, superfície | **4.48:1** | ✗ por 0.02 | ✓ |
| `neutral-400` `#7D7E82` | texto de apoio, placeholder, aba inativa | **4.06:1** | ✗ | ✓ |
| `neutral-300` `#96969A` | texto desabilitado | **2.95:1** | isento | isento |
| `neutral-200` `#AEAFB2` | borda de campo, aba desabilitada | **2.19:1** | isento | ✗ |
| `light.full` sobre `primary-500` | texto em botão primário | **7.51:1** | ✓ | — |
| `light.full` sobre `danger-500` | texto em botão destrutivo | **4.48:1** | ✗ por 0.02 | — |
| `neutral-400` sobre `light-800` | texto de apoio em superfície cinza | **3.62:1** | ✗ | ✓ |

Três consequências práticas:

- **`neutral-400` não atinge AA para texto normal (4.06:1).** É a cor de placeholder, texto de apoio e aba inativa. Placeholder e decoração são usos defensáveis; **informação essencial em `neutral-400` não é**. Para texto que precisa ser lido, use `neutral-600` (7.45:1).
- **`danger-500` fica a 0.02 de AA (4.48:1)**, tanto como texto sobre branco quanto como fundo de botão primário destrutivo. Para mensagem de erro em `text-xs`, `danger-600` (6.45:1) é a escolha correta.
- **`neutral-200` (2.19:1) está abaixo de 3:1 como borda de campo.** WCAG 1.4.11 exige 3:1 para o limite visual de um controle. `neutral-300` (2.95:1) ainda ficaria no limite; `neutral-400` (4.06:1) resolve.

Texto desabilitado é isento pela WCAG 1.4.3 — mas se a informação ainda precisa ser lida, ela não deveria estar em estado desabilitado.

Os valores acima foram calculados pela fórmula de luminância relativa da WCAG 2.1. Para verificar um par novo antes de adotá-lo, use o [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) ou o painel de acessibilidade do DevTools.

### AC11 — Não comunique só por cor

Erro é sinalizado por borda vermelha **e** mensagem de texto ([FormGroup](../../src/components/inputs/FormGroup/FormGroup.tsx)). Aba ativa, por cor de texto **e** indicador de sublinhado. Alternância, por fundo **e** `aria-pressed`.

Ao adicionar estado visual, garanta um segundo canal: texto, ícone, forma, posição ou atributo ARIA.

### AC12 — Alvo de toque de 24px, preferindo 44px

WCAG 2.1 AA (2.5.8) pede 24×24 CSS px mínimos. As diretrizes de plataforma móvel pedem 44×44.

| Componente | Alvo | Situação |
|---|---|---|
| `Button` sm / md / lg | 32 / 40 / 48px de altura | ✓ AA |
| `IconButton` sm / md | 32×32 / 40×40 | ✓ AA (abaixo de 44 no `sm`) |
| `Checkbox`, `Radio` | 20×20 | ⚠ abaixo de 24 |
| `MegaSelectOption` | 24px de altura | ✓ no limite exato |
| `IconToggle` slot | 32 / 40px | ✓ AA |

Para `Checkbox` e `Radio`, o padrão de uso deve compensar: envolva-os num `<label>` clicável, o que amplia a área efetiva:

```tsx
<label className="flex items-center gap-200 py-200 cursor-pointer">
  <Checkbox checked={aceito} onChange={…} />
  <span className="text-sm text-neutral-800">Aceito os termos</span>
</label>
```

### AC13 — Respeite `prefers-reduced-motion`

O sistema anima apenas cor por 150ms — o que já é conservador e não dispara problema vestibular. A exceção é o spinner de `loading`, que gira indefinidamente.

Ao adicionar animação de movimento, transform ou escala:

```tsx
"motion-safe:transition-transform motion-reduce:transition-none"
```

---

## Lacunas conhecidas

Estas são as lacunas de acessibilidade do código atual. Estão aqui para **não serem replicadas** em componentes novos.

| # | Lacuna | Local | WCAG |
|---|---|---|---|
| 1 | `Tab` declara `focus-visible:outline-none` sem anel substituto | [Tab.tsx:37](../../src/components/navigation/TabList/Tab.tsx#L37) | 2.4.7 |
| 2 | `FormGroup` não liga a mensagem de erro ao campo (`aria-describedby`) | [FormGroup.tsx](../../src/components/inputs/FormGroup/FormGroup.tsx) | 3.3.1 |
| 3 | `Textbox`/`Select` com `hasError` não emitem `aria-invalid` | [Textbox.tsx](../../src/components/inputs/Textbox/Textbox.tsx), [Select.tsx](../../src/components/inputs/Select/Select.tsx) | 3.3.1 |
| 4 | Tablist sem setas ←→ nem tabIndex gerenciado | `TabList`, `Navbar` | 2.1.1 |
| 5 | `role="tab"` sem `aria-controls`; painel sem `aria-labelledby` | idem | 1.3.1 |
| 6 | `Button` com `loading` não anuncia mudança de estado (`aria-busy` / `role="status"`) | [Button.tsx](../../src/components/actions/Button/Button.tsx) | 4.1.3 |
| 7 | `id` de `FormGroup` derivado do label pode colidir | [FormGroup.tsx:17](../../src/components/inputs/FormGroup/FormGroup.tsx#L17) | 4.1.1 |
| 8 | `aria-label` do `SearchInput` fixo em português, sem prop de override | [SearchInput.tsx:40](../../src/components/inputs/SearchInput/SearchInput.tsx#L40) | 3.1.2 |
| 9 | `MegaSelect` sem `aria-label` próprio — `...props` vai para o container `<div>`, não para o `combobox` | [MegaSelect.tsx](../../src/components/inputs/MegaSelect/MegaSelect.tsx) | 4.1.2 |
| 10 | `MegaSelect` sem portal nem detecção de colisão; `z-10` fixo | idem | — (usabilidade) |
| 11 | `MegaSelect` sem busca por digitação — o `<select>` nativo tem | idem | — (opcional pela APG) |
| 12 | `neutral-400` (4.06:1) usado como texto de apoio e placeholder — abaixo de 4.5:1 | `Textbox`, `Select`, `Tab`, `NavbarTab`, `Button` secondary/tertiary | 1.4.3 |
| 13 | `neutral-200` (2.19:1) como borda de campo — abaixo de 3:1 para limite de controle | `Textbox`, `Select`, `MegaSelect`, `Checkbox`, `Radio` | 1.4.11 |
| 14 | Nenhuma verificação automatizada (`axe`, `jest-axe`, `addon-a11y`) | repositório | — |

### Resolvidas

| Lacuna | Como foi fechada |
|---|---|
| `MegaSelect` sem navegação por teclado (2.1.1) | Padrão combobox do WAI-ARIA implementado: índice ativo, setas com clamp pulando desabilitadas, `Home`/`End`, `Enter`/`Espaço`, `Escape`, `Tab` |
| `MegaSelect` sem atributos de combobox (4.1.2) | `role="combobox"`, `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant` com `id` por opção via `useId()` |
| Fechar o `MegaSelect` não devolvia o foco (2.4.3) | `closePanel(returnFocus)` devolve o foco em `Escape` e na seleção; clique fora fecha sem roubar o foco |
| Cursor de teclado indiscernível | Opção ativa com `ring-1 ring-inset ring-primary-500`, distinta do `bg-primary-50` da selecionada |

Comportamento verificado em navegador. Ver [ADR-0014](../../meta/adr/0014-elemento-nativo-primeiro.md) para a decisão que tornou esse custo responsabilidade deste repositório.

### Como fechar as três primeiras

**Foco visível no `Tab`** — trocar `focus-visible:outline-none` isolado pela receita de AC2. Mudança de uma linha, e a de melhor relação custo-benefício da lista.

**`aria-describedby` no `FormGroup`** — gerar o id da mensagem a partir do `inputId`, aplicá-lo ao `<p>` e apontar `aria-describedby` no `Textbox`.

**`aria-invalid`** — `Textbox` e `Select` passarem `aria-invalid={hasError || undefined}`. Junto com a anterior, fecha o par de lacunas de formulário: hoje a borda vermelha e a mensagem existem visualmente, mas nada liga uma à outra para um leitor de tela.

---

## Checklist

Ao adicionar ou alterar um componente interativo:

**Semântica**
- [ ] Elemento nativo foi considerado antes de `role` customizado
- [ ] `<button type="button">` em controle que não é submit
- [ ] `role` declarado só se as obrigações do padrão serão cumpridas
- [ ] SVG decorativo com `aria-hidden`

**Nome e estado**
- [ ] Nome acessível: texto visível, `aria-label` ou `<label htmlFor>`
- [ ] Estado exposto por ARIA além da cor (`aria-selected`, `aria-pressed`, `aria-expanded`, `aria-invalid`)
- [ ] `disabled` nativo, não `aria-disabled`
- [ ] Erro com mensagem de texto, não só borda vermelha

**Teclado**
- [ ] Todo comportamento do mouse alcançável por teclado
- [ ] Foco visível em todo elemento focável
- [ ] Sem `tabIndex` positivo
- [ ] Foco move para conteúdo revelado e retorna ao fechar
- [ ] `Escape` fecha overlay/painel

**Visual**
- [ ] Contraste ≥ 4.5:1 em texto, ≥ 3:1 em borda e ícone informativo
- [ ] Alvo de toque ≥ 24×24px
- [ ] Informação não depende só de cor
- [ ] Animação de movimento respeita `prefers-reduced-motion`

**Verificação manual** (não há automação)
- [ ] Percorrer a story só com `Tab`, `Shift+Tab`, setas, `Enter`, `Espaço`, `Escape`
- [ ] Verificar que o foco é sempre visível e nunca fica preso
- [ ] Zoom de 200% sem perda de conteúdo
- [ ] Leitor de tela anuncia papel, nome e estado (NVDA no Windows, VoiceOver no macOS)

---

## Ferramentas sugeridas

Nada disso está instalado. Ordem de prioridade caso se decida instrumentar:

```bash
# 1. painel de a11y no Storybook — feedback durante o desenvolvimento
npm i -D @storybook/addon-a11y
# .storybook/main.ts → addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"]

# 2. verificação automatizada em teste
npm i -D vitest jest-axe @testing-library/react

# 3. auditoria de página inteira na aplicação consumidora
npm i -D @axe-core/react
```

Ferramentas automatizadas pegam contraste, atributo ARIA inválido e falta de nome acessível. **Não** pegam ordem de foco ilógica, teclado incompleto ou rótulo que não descreve a ação — esses exigem o teste manual do checklist.
