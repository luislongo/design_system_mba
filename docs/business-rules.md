# Regras de Negócio

Uma biblioteca de UI não carrega regras de domínio de produto. As regras aqui são de **outra natureza**: são as invariantes de design e as decisões de comportamento que o código impõe às aplicações consumidoras. Quebrar uma delas não gera exceção — gera inconsistência visual ou perda de acessibilidade no produto final.

Todas as regras abaixo estão efetivamente implementadas no código, com a localização indicada.

---

## Regras Críticas

### R1 — Loading implica desabilitado

**Descrição**: Quando `Button` recebe `loading`, o botão fica desabilitado independentemente da prop `disabled`.

**Justificativa**: Impede clique duplo em operação assíncrona em andamento — o caso clássico de submit duplicado que gera registro ou cobrança duplicada na aplicação consumidora.

**Implementação**: [Button.tsx:40](../src/components/actions/Button/Button.tsx#L40)

```tsx
const isDisabled = disabled || loading;
```

**Validações**: `isDisabled` é passado ao atributo `disabled` do `<button>`, o que soma o `disabled:pointer-events-none` das classes base.

**Exceções**: `DangerButton`, `HeroButton` e `IconButton` não têm `loading`. Em ação destrutiva assíncrona, a proteção contra duplo clique é responsabilidade da aplicação.

---

### R2 — O texto permanece visível durante o carregamento

**Descrição**: O spinner é **adicionado** ao conteúdo do botão, não o substitui.

**Justificativa**: Trocar o label por um spinner faz o botão mudar de largura, deslocando o layout ao redor. Mantendo o texto, apenas o spinner de 16px + gap é somado.

**Implementação**: [Button.tsx:56-79](../src/components/actions/Button/Button.tsx#L56-L79) — o bloco `{loading && <svg …>}` precede `{startIcon}` e `{children}`, todos irmãos.

**Consequência para o consumidor**: o label deve descrever a operação em curso (`"Salvando…"`), não a ação (`"Salvar"`), já que ele continua na tela. É o que as stories demonstram ([Button.stories.tsx:42](../src/components/actions/Button/Button.stories.tsx#L42)).

---

### R3 — Ordem fixa de elementos no botão

**Descrição**: A ordem de renderização é sempre `spinner → startIcon → children → trailingIcon`.

**Justificativa**: Ordem previsível independentemente da combinação de props, o que mantém alinhamento consistente entre botões diferentes na mesma tela.

**Implementação**: [Button.tsx:56-80](../src/components/actions/Button/Button.tsx#L56-L80); `DangerButton` e `HeroButton` seguem a mesma ordem sem o spinner.

**Validações**: `startIcon` e `trailingIcon` recebem wrapper `<span className="shrink-0 flex items-center">` — o `shrink-0` impede que um label longo comprima o ícone.

---

### R4 — `IconButton` exige `aria-label`

**Descrição**: `icon` é prop obrigatória e é renderizado dentro de `<span aria-hidden>`. Sem `aria-label`, o botão fica sem nome acessível.

**Justificativa**: O ícone é a única informação visual; sem rótulo textual, leitores de tela anunciam apenas "botão". Marcar o ícone como `aria-hidden` é correto (SVG decorativo), o que torna o `aria-label` a única fonte de nome.

**Implementação**: [IconButton.tsx:38](../src/components/actions/IconButton/IconButton.tsx#L38) repassa `aria-label={props["aria-label"]}` explicitamente; [IconButton.tsx:49](../src/components/actions/IconButton/IconButton.tsx#L49) marca o wrapper como `aria-hidden`.

**Validações**: Nenhuma em build time — `aria-label` é opcional no tipo `ButtonHTMLAttributes`. É convenção verificada em revisão. Todas as stories do componente passam `aria-label` ([IconButton.stories.tsx:37-67](../src/components/actions/IconButton/IconButton.stories.tsx#L37-L67)).

---

### R5 — Erro tem precedência sobre desabilitado na cor do label

**Descrição**: Em `FormGroup`, a cor do label segue a precedência `error` > `disabled` > normal.

**Justificativa**: Um campo desabilitado que carrega mensagem de erro precisa comunicar o erro; o cinza de desabilitado esconderia a informação mais importante.

**Implementação**: [FormGroup.tsx:26](../src/components/inputs/FormGroup/FormGroup.tsx#L26)

```tsx
error ? "text-danger-500" : disabled ? "text-neutral-300" : "text-neutral-600"
```

**Exceções**: A precedência vale apenas para o label. O `Textbox` interno recebe `hasError` e `disabled` de forma independente, e as classes de `disabled` sobrescrevem as de erro na borda ([Textbox.tsx:16-21](../src/components/inputs/Textbox/Textbox.tsx#L16-L21)) — um campo desabilitado com erro exibe label e mensagem em vermelho, mas borda de desabilitado.

---

### R6 — `error` string é a fonte da verdade em `FormGroup`

**Descrição**: `FormGroup` não expõe `hasError`. Recebe `error?: string` e o converte para o booleano do filho.

**Justificativa**: Evita o estado inconsistente de `hasError={true}` sem mensagem (borda vermelha sem explicação) ou mensagem sem borda vermelha. Um único dado governa os dois efeitos.

**Implementação**: [FormGroup.tsx:32-35](../src/components/inputs/FormGroup/FormGroup.tsx#L32-L35)

```tsx
<Textbox id={inputId} hasError={!!error} disabled={disabled} {...props} />
{error && <p className="text-xs font-sans text-danger-500 leading-none">{error}</p>}
```

**Consequência**: `error=""` (string vazia) é falsy — não marca erro e não renderiza mensagem. Para sinalizar erro sem texto, é preciso usar o `Textbox` diretamente com `hasError`.

---

### R7 — `id` derivado do label

**Descrição**: Sem `id` explícito, `FormGroup` gera um a partir do label: minúsculas e espaços trocados por hífen.

**Justificativa**: Garante a associação `label`↔`input` (`htmlFor`/`id`) por padrão, sem exigir que quem usa se lembre de fornecer um id. Essa associação é o que permite clicar no label para focar o campo e o que leitores de tela usam para anunciar o campo.

**Implementação**: [FormGroup.tsx:17](../src/components/inputs/FormGroup/FormGroup.tsx#L17)

```tsx
const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
```

**Regras derivadas**:
- Sem `label` e sem `id`, `inputId` é `undefined` — nenhum dos dois atributos é emitido.
- Dois `FormGroup` com o mesmo label na mesma página produzem o mesmo `id`. `id` explícito é o mecanismo para desambiguar.
- A transformação trata apenas espaços; acentos e caracteres especiais são preservados no id (`"Endereço"` → `id="endereço"`).

---

### R8 — Desabilitado impede abertura de dropdown

**Descrição**: `MegaSelect` e `SearchInput` desabilitados não alternam estado.

**Justificativa**: A guarda no handler protege contra acionamento programático ou por caminho que não passe pelo atributo `disabled` do DOM.

**Implementação**: dupla guarda em cada componente.

```tsx
// MegaSelect.tsx:62 — no handler
onClick={() => !disabled && setOpen((o) => !o)}

// MegaSelect.tsx:83 — na renderização do painel
{open && !disabled && ( … )}

// SearchInput.tsx:28 — retorno antecipado
const toggle = () => { if (disabled) return; … };
```

**Validações**: No `MegaSelect`, a condição de render `open && !disabled` significa que desabilitar o componente enquanto o painel está aberto o fecha visualmente, mesmo que o estado `open` interno continue `true`.

---

### R9 — Clique fora fecha o `MegaSelect`

**Descrição**: Um listener de `mousedown` em `document` fecha o painel quando o clique ocorre fora do container.

**Justificativa**: Comportamento esperado de dropdown. Sem isso, o painel só fecharia ao selecionar uma opção, ficando preso sobre o conteúdo.

**Implementação**: [MegaSelect.tsx:57-66](../src/components/inputs/MegaSelect/MegaSelect.tsx#L57-L66)

```tsx
useEffect(() => {
  const onOutsideClick = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener("mousedown", onOutsideClick);
  return () => document.removeEventListener("mousedown", onOutsideClick);
}, []);
```

**Regras derivadas**:
- O listener é registrado uma vez na montagem e removido na desmontagem — não há vazamento e não há re-registro por render.
- Usa `mousedown`, não `click`: o painel fecha antes de o `click` completar.
- A detecção é por `contains` no container, então cliques no painel (que é filho do container) não fecham.
- **Clique fora não devolve o foco ao gatilho**, ao contrário de `Escape` e da seleção (R10a). O listener chama `setOpen(false)` diretamente, não `closePanel(true)` — roubar o foco depois de o usuário ter clicado em outro lugar da página seria hostil.

---

### R10 — Seleção fecha o painel

**Descrição**: Escolher uma opção no `MegaSelect` dispara `onChange(value)` e fecha o painel na mesma ação.

**Justificativa**: É um seletor de valor único; manter aberto após a escolha não tem função.

**Implementação**: `commit(index)` em [MegaSelect.tsx](../src/components/inputs/MegaSelect/MegaSelect.tsx) — o mesmo caminho serve para clique de mouse e para `Enter`/`Espaço`:

```tsx
const commit = (index: number) => {
  const opt = options[index];
  if (!opt || opt.disabled) return;
  onChange?.(opt.value);
  closePanel(true);
};
```

**Validações**: Três camadas impedem selecionar uma opção desabilitada — a guarda `opt.disabled` no `commit`, a guarda `if (!disabled)` no handler do `MegaSelectOption`, e o atributo `disabled` no `<button>`. A navegação por teclado também pula opções desabilitadas (R10b).

---

### R10a — Fechar por teclado devolve o foco; fechar por clique fora, não

**Descrição**: `Escape` e a seleção devolvem o foco ao gatilho. Clique fora fecha o painel sem mover o foco.

**Justificativa**: Quem navega por teclado precisa do foco de volta num ponto conhecido, ou fica perdido na página (WCAG 2.4.3). Quem clicou em outro lugar já indicou onde quer estar — mover o foco de volta seria hostil e roubaria o clique seguinte.

**Implementação**: o parâmetro booleano de `closePanel` é o que expressa essa distinção:

```tsx
const closePanel = (returnFocus: boolean) => {
  setOpen(false);
  setActiveIndex(-1);
  if (returnFocus) triggerRef.current?.focus();
};
```

`closePanel(true)` em `Escape` e em `commit`. `closePanel(false)` no clique no gatilho com painel aberto. O listener de clique fora não usa `closePanel` — chama `setOpen(false)` e `setActiveIndex(-1)` diretamente.

---

### R10b — A navegação por teclado pula opções desabilitadas e trava nos extremos

**Descrição**: `↑`/`↓` movem entre as opções **habilitadas**, ignorando as desabilitadas. Nos extremos, a navegação para — não há wrap-around.

**Justificativa**: Mover o cursor para uma opção que não pode ser selecionada é um estado sem saída. E o clamp nos extremos é o comportamento padrão de listbox na WAI-ARIA APG — o wrap-around desorienta, porque o usuário perde a noção de onde está na lista.

**Implementação**: os índices habilitados são computados a cada render e a navegação opera sobre essa lista, não sobre `options`:

```tsx
const enabledIndexes = options.flatMap((o, i) => (o.disabled ? [] : [i]));

const moveActive = (dir: 1 | -1) => {
  if (enabledIndexes.length === 0) return;
  const pos = enabledIndexes.indexOf(activeIndex);
  if (pos === -1) { setActiveIndex(dir === 1 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1]); return; }
  const next = Math.min(Math.max(pos + dir, 0), enabledIndexes.length - 1);
  setActiveIndex(enabledIndexes[next]);
};
```

**Regras derivadas**:
- `Home`/`End` também operam sobre `enabledIndexes` — vão para a primeira e a última **habilitada**.
- Abrir posiciona o cursor na opção selecionada, se houver e estiver habilitada; senão, no primeiro item (`Enter`/`Espaço`/`↓`) ou no último (`↑`).
- Lista sem nenhuma opção habilitada: o painel abre, `activeIndex` permanece `-1`, `aria-activedescendant` não é emitido e `Enter` não faz nada.

---

### R10c — O cursor de teclado é visualmente distinto da opção selecionada

**Descrição**: A opção ativa (cursor de teclado) recebe `ring-1 ring-inset ring-primary-500`. A opção selecionada (valor atual) recebe `bg-primary-50`. São indicadores independentes e podem coincidir.

**Justificativa**: São dois conceitos diferentes — "onde estou navegando" e "qual é o valor" — e precisam ser distinguíveis. Um fundo cinza sutil (`bg-light-800`, `#F2F2F2`) não funciona como indicador de posição: contra branco é quase invisível, o que torna a navegação por teclado inútil na prática mesmo estando implementada.

**Implementação**: [MegaSelectOption.tsx](../src/components/inputs/MegaSelect/MegaSelectOption.tsx)

```tsx
selected ? "bg-primary-50" : "bg-light-full hover:bg-light-800",
active ? "ring-1 ring-inset ring-primary-500" : "",
```

`primary-500` tem 7.51:1 de contraste contra branco, bem acima dos 3:1 que a WCAG 1.4.11 exige de um indicador.

---

### R11 — `onOpenChange` é notificado nos dois modos de controle

**Descrição**: Em `SearchInput`, o callback é chamado tanto quando o componente controla o próprio `open` quanto quando o consumidor controla; o estado interno só é escrito no primeiro caso.

**Justificativa**: Permite que o consumidor reaja à abertura (analytics, layout adjacente) sem ter de assumir o controle do estado.

**Implementação**: [SearchInput.tsx:24-32](../src/components/inputs/SearchInput/SearchInput.tsx#L24-L32)

```tsx
const isControlled = controlledOpen !== undefined;
const open = isControlled ? controlledOpen : internalOpen;

const toggle = () => {
  if (disabled) return;
  const next = !open;
  if (!isControlled) setInternalOpen(next);
  onOpenChange?.(next);
};
```

**Regras derivadas**: A detecção de controle é por `!== undefined`. Passar `open={undefined}` explicitamente coloca o componente em modo não-controlado.

---

### R12 — Abrir a busca move o foco para o campo

**Descrição**: O `<input>` do `SearchInput` expandido tem `autoFocus`.

**Justificativa**: O usuário clicou na lupa para digitar; exigir um segundo clique no campo é atrito. Como o input só existe no ramo expandido da renderização, o `autoFocus` dispara exatamente no momento da transição.

**Implementação**: [SearchInput.tsx:84](../src/components/inputs/SearchInput/SearchInput.tsx#L84)

**Regras derivadas**: O botão de fechar recebe `tabIndex={-1}` ([SearchInput.tsx:76](../src/components/inputs/SearchInput/SearchInput.tsx#L76)) — fica fora da ordem de tabulação para que `Tab` a partir do campo siga para o próximo elemento da página, não retorne à lupa.

---

### R13 — `options` tem precedência sobre `children` no `Select`

**Descrição**: Se o array `options` for fornecido, `children` é ignorado por completo.

**Justificativa**: Duas fontes de conteúdo simultâneas produziriam lista duplicada ou ordem indefinida. A precedência é explícita e determinística.

**Implementação**: [Select.tsx:54-60](../src/components/inputs/Select/Select.tsx#L54-L60)

```tsx
{options
  ? options.map((opt) => <option key={opt.value} … >{opt.label}</option>)
  : children}
```

**Regras derivadas**: `options={[]}` (array vazio) é truthy — renderiza um `<select>` sem opções, não o `children`. Para usar `children`, `options` deve ser `undefined`.

---

### R14 — Superfície do controle é fornecida pela biblioteca; posicionamento, pela aplicação

**Descrição**: Os componentes não emitem `margin`, `position` ou largura de contexto. Campos de formulário são `w-full`; botões são `inline-flex` com largura de conteúdo. O único vetor de ajuste externo é `className`.

**Justificativa**: Um componente que carrega margem própria força a aplicação a lutar contra ela. Espaçamento entre elementos é decisão do layout que os contém, não de cada elemento.

**Implementação**: `w-full` em [Textbox.tsx:13](../src/components/inputs/Textbox/Textbox.tsx#L13), [Select.tsx:36](../src/components/inputs/Select/Select.tsx#L36), [MegaSelect.tsx:165](../src/components/inputs/MegaSelect/MegaSelect.tsx#L165). `className` concatenado por último em todos os 16 componentes.

**Exceções**: Os dois containers de navegação definem espaçamento **interno entre seus filhos** — `TabList` usa `gap-600` (24px) e `FormGroup` usa `gap-100` (4px) na coluna label/campo/erro. É espaçamento de composição interna, não margem externa.

---

### R15 — `state="Hover"` não altera a renderização

**Descrição**: `NavbarTab` e `Tab` aceitam `state?: "Default" | "Hover" | "Disabled"`, mas apenas `"Disabled"` produz efeito. O valor é usado exclusivamente para derivar `disabled`.

**Justificativa**: A união de estados espelha os nomes das variantes no Figma, mantendo o vocabulário alinhado entre design e código. O hover real é responsabilidade do CSS (`hover:*`), que reflete o ponteiro do usuário — não um estado passado por prop.

**Implementação**: [NavbarTab.tsx:20](../src/components/navigation/Navbar/NavbarTab.tsx#L20) e [Tab.tsx:18](../src/components/navigation/TabList/Tab.tsx#L18)

```tsx
const disabled = state === "Disabled";
```

---

### R16 — Indicador de aba sempre presente no DOM

**Descrição**: O sublinhado do `Tab` é sempre renderizado; a diferença entre ativo e inativo é a cor (`bg-primary-500` vs `bg-transparent`).

**Justificativa**: Adicionar e remover o elemento mudaria a altura da aba, deslocando o conteúdo abaixo a cada troca. Mantê-lo no DOM com cor transparente estabiliza o layout.

**Implementação**: [Tab.tsx:44-55](../src/components/navigation/TabList/Tab.tsx#L44-L55)

**Exceções**: `NavbarTab` usa a abordagem oposta — o indicador é `absolute bottom-0` e só é renderizado quando `active` ([NavbarTab.tsx:49-57](../src/components/navigation/Navbar/NavbarTab.tsx#L49-L57)). Por ser posicionado absolutamente, não ocupa espaço no fluxo, então não há deslocamento a evitar.

---

### R17 — Aba ativa desabilitada usa indicador neutro

**Descrição**: Uma aba `active` com `state="Disabled"` mostra o indicador em `neutral-200` em vez de `primary-500`.

**Justificativa**: A aba precisa continuar identificável como a seção corrente, mas sem a saliência da cor de marca, que sugeriria interatividade.

**Implementação**: [Tab.tsx:49-53](../src/components/navigation/TabList/Tab.tsx#L49-L53) e [NavbarTab.tsx:52-55](../src/components/navigation/Navbar/NavbarTab.tsx#L52-L55)

```tsx
active ? (disabled ? "bg-neutral-200" : "bg-primary-500") : "bg-transparent"
```

---

## Validações e Restrições

Não há validação em runtime em nenhum componente. Todas as garantias são de tipo, verificadas por `tsc` no build ([package.json:18](../package.json#L18) — `"build": "tsc && vite build"`).

### Restrições impostas pelo tipo

| Restrição | Mecanismo | Local |
|---|---|---|
| Variante e tamanho só aceitam valores da união | `type Variant = "primary" \| …` | cada componente |
| Mapa de classes cobre toda a união | `Record<Variant, string>` — falta de chave é erro de compilação | `variantClasses`, `sizeClasses` |
| `type` não pode ser sobrescrito nos inputs | `Omit<InputHTMLAttributes<…>, "type">` | `Textbox`, `Checkbox`, `Radio`, `SearchInput`, `FormGroup` |
| `onChange` do `MegaSelect` recebe `string`, não evento | `Omit<HTMLAttributes<…>, "onChange">` + assinatura própria | [MegaSelect.tsx:29-32](../src/components/inputs/MegaSelect/MegaSelect.tsx#L29-L32) |
| `icon` é obrigatório no `IconButton` | `icon: ReactNode` sem `?` | [IconButton.tsx:9](../src/components/actions/IconButton/IconButton.tsx#L9) |
| `leftIcon`/`rightIcon` obrigatórios no `IconToggle` | sem `?` | [IconToggle.tsx:7-8](../src/components/actions/IconToggle/IconToggle.tsx#L7-L8) |
| `label` obrigatório em `Tab`/`NavbarTab`/`SelectOption`/`MegaSelectOption` | sem `?` | respectivos arquivos |
| `options` obrigatório no `MegaSelect` | sem `?` (diferente do `Select`, onde é opcional) | [MegaSelect.tsx:30](../src/components/inputs/MegaSelect/MegaSelect.tsx#L30) |
| Variáveis e parâmetros não usados | `noUnusedLocals`, `noUnusedParameters` | [tsconfig.json:9-10](../tsconfig.json#L9-L10) |

### O que os tipos não garantem

- **Conteúdo das strings de classe.** `variantClasses.primary = "bg-primry-500"` compila e produz um elemento sem fundo.
- **Presença de `aria-label`** em `IconButton` (R4).
- **Unicidade de `id`** em `FormGroup` (R7).
- **Coerência de `value`** no `MegaSelect`: um `value` sem opção correspondente faz o gatilho exibir o placeholder, sem aviso.
- **Combinações válidas de props.** `<Button loading disabled={false}>` é aceito e o botão fica desabilitado por R1.

### Restrições de ambiente

| Restrição | Origem |
|---|---|
| Consumidor deve usar bundler com suporte a ESM | `formats: ["es"]` em [vite.config.ts:9](../vite.config.ts#L9) |
| React 18 ou 19 deve estar instalado no consumidor | `peerDependencies` em [package.json:22-25](../package.json#L22-L25) |
| CSS deve ser importado separadamente | subpath `./style.css` em [package.json:14](../package.json#L14) |
| Fonte DM Sans deve ser carregada pela aplicação | [globals.css](../src/styles/globals.css) não tem `@font-face` nem `@import` |
| Classes escritas fora de `src/` não são geradas | `content: ["./src/**/*.{ts,tsx}"]` em [tailwind.config.ts:5](../tailwind.config.ts#L5) |

---

## Políticas e Workflows

### Fluxo de estado de um campo de formulário

```
        ┌──────────┐  hover   ┌──────────────┐  focus   ┌───────────────┐
        │ default  │ ───────► │    hover     │ ───────► │    focused    │
        │ neutral- │          │ neutral-300  │          │ primary-500   │
        │   200    │ ◄─────── │              │ ◄─────── │               │
        └──────────┘          └──────────────┘          └───────────────┘
              │
              │ hasError / error
              ▼
        ┌──────────────────────────────┐
        │           error              │  ← foco não muda a cor da borda
        │ danger-500 (borda + foco)    │
        └──────────────────────────────┘
              │
              │ disabled
              ▼
        ┌──────────────────────────────────────────────┐
        │                  disabled                    │
        │ bg-light-800, border-neutral-50,             │
        │ text-neutral-300, pointer-events-none        │
        └──────────────────────────────────────────────┘
```

`disabled` é terminal: `pointer-events-none` impede hover e foco.

### Fluxo de abertura do `MegaSelect`

```
fechado ──[clique no gatilho, se !disabled]──► aberto (borda primary-500, painel visível)
                                                 │
   ┌─────────────────────────────────────────────┼──────────────────────┐
   │                                             │                      │
   ▼ seleção de opção                            ▼ mousedown fora       ▼ disabled passa a true
onChange(value) + fecha                       fecha                  painel deixa de renderizar
```

### Fluxo do `SearchInput`

```
      colapsado                                    expandido
  ┌──────────────────┐   clique / open=true   ┌────────────────────────────┐
  │ botão 40×40      │ ─────────────────────► │ container + input autoFocus │
  │ lupa neutral-400 │                        │ foco vai para o campo       │
  │ aria: Abrir busca│ ◄───────────────────── │ aria: Fechar busca          │
  └──────────────────┘   clique / open=false  └────────────────────────────┘

  onOpenChange(next) é chamado nas duas direções, nos dois modos de controle
```

### Política de escolha entre os componentes de ação

O sistema resolve intenção por **componente**, não por variante de um componente único. A decisão é:

| Situação | Componente |
|---|---|
| Ação comum de formulário ou toolbar | `Button` |
| Ação destrutiva (excluir, remover, cancelar assinatura) | `DangerButton` |
| CTA principal de página de destaque | `HeroButton` |
| Ação compacta representada só por ícone | `IconButton` |
| Alternância entre dois modos mutuamente exclusivos | `IconToggle` |

E hierarquia visual **dentro** do componente escolhido:

| Peso | Variante | Quando |
|---|---|---|
| Alto | `primary` | uma por região de tela |
| Médio | `secondary` | ações de apoio; admite várias |
| Baixo | `tertiary` | ação terciária, densa ou repetida em lista |

### Política de seleção única: qual componente usar

| Necessidade | Componente | Razão |
|---|---|---|
| Seleção simples, mobile, formulário nativo | `Select` | usa `<select>` nativo — teclado, busca por digitação e picker do SO de graça |
| Aparência customizada, opções ricas | `MegaSelect` | controle total do painel; teclado completo (padrão combobox), mas sem busca por digitação e sem picker nativo em mobile |
| Lista de seleção montada pelo consumidor | `SelectOption` | primitiva de item, sem container |

---

## Cálculos e Algoritmos

O sistema tem pouca lógica computacional. O que existe:

### Escala de tamanho proporcional

Os nomes dos tokens de tamanho seguem a relação `valor_px = chave / 25`:

| Chave | Cálculo | px |
|---|---|---|
| `100` | 100 / 25 | 4 |
| `400` | 400 / 25 | 16 |
| `1600` | 1600 / 25 | 64 |
| `4000` | 4000 / 25 | 160 |

A relação vale para todas as chaves, inclusive `050` (50 / 25 = 2px — a chave é grafada com zero à esquerda para ordenar antes de `100`). A escala não é contínua: há lacunas deliberadas (não existem `500`, `700`, `900`, `1400`), o que impede escolhas intermediárias arbitrárias.

Definida em [spacing.ts:2-17](../src/tokens/spacing.ts#L2-L17), com os mesmos valores presentes em `Size primitives` do [figmatokens.json](../figmatokens.json).

### Derivação de `id` a partir do label

```tsx
label?.toLowerCase().replace(/\s+/g, "-")
```

`\s+` colapsa sequências de espaço em um único hífen: `"Nome   completo"` → `"nome-completo"`. Não remove acentos nem caracteres especiais. Ver R7.

### Resolução do label exibido no `MegaSelect`

```tsx
// MegaSelect.tsx:41, 76
const selected = options.find((o) => o.value === value);
selected?.label ?? placeholder
```

Busca linear por igualdade estrita de `value`. Sem correspondência, cai no placeholder — e a cor do texto também muda (`text-neutral-400` em vez de `text-neutral-800`), de modo que placeholder e valor real são visualmente distinguíveis.

### Composição de classes

```tsx
[base, transição, foco, disabled, variante, tamanho, className].filter(Boolean).join(" ")
```

`filter(Boolean)` descarta strings vazias produzidas por ternários sem alternativa (`disabled ? "…" : ""`), evitando espaços duplos na string final. Ver [patterns.md](patterns.md#composição-de-classes).

---

## Compliance e Regulamentações

Não há requisito regulatório aplicável a este repositório. A biblioteca:

- não coleta, armazena ou transmite dados pessoais;
- não faz requisições de rede;
- não usa `localStorage`, `sessionStorage`, cookies ou IndexedDB;
- não instala telemetria ou analytics.

LGPD/GDPR não incidem sobre o pacote. Se um `Textbox` for usado para coletar dado pessoal, a obrigação é da aplicação consumidora.

**Acessibilidade** é a dimensão de conformidade relevante. O código aplica boa parte das práticas de WCAG 2.1 nível AA — semântica nativa, `role` e `aria-*` apropriados, foco visível, input real por trás de controles customizados (ver a tabela em [patterns.md](patterns.md#semântica-aria-aplicada-por-componente)).

Pontos de conformidade que o código **não** cobre hoje:

- **`Tab` sem indicador de foco**: [Tab.tsx:37](../src/components/navigation/TabList/Tab.tsx#L37) declara `focus-visible:outline-none` sem anel substituto. WCAG 2.4.7 (Focus Visible).
- **Erro de formulário não é ligado ao campo**: `FormGroup` renderiza a mensagem sem `aria-describedby`, e `Textbox`/`Select` com `hasError` não emitem `aria-invalid`. Visualmente o erro existe; para um leitor de tela, não há vínculo. WCAG 3.3.1 (Error Identification).
- **Padrão de tablist incompleto**: `role="tab"` e `role="tablist"` estão presentes, mas não há `aria-controls` apontando para o painel, `tabIndex` gerenciado nem navegação por setas entre abas.
- **Contraste em estados de baixa saturação**: combinações como `text-neutral-200` sobre `light-full` (item desabilitado do `NavbarTab`) ficam abaixo de 4.5:1. Texto desabilitado é isento pela WCAG 1.4.3, mas o limite merece atenção em texto ativo.
- **Não há verificação automatizada** — nenhum `axe`, `jest-axe` ou `@storybook/addon-a11y` configurado.

Ver [best-practices/accessibility.md](best-practices/accessibility.md) para o padrão esperado ao adicionar componentes.

---

## Regras de Domínio

O domínio deste repositório é o **sistema de design**. Suas invariantes:

### D1 — Tokens têm duas camadas, e a fronteira é intencional

`colorPrimitives` são valores brutos (rampas de matiz). `semanticColors` são intenções compostas a partir deles (`border.brand.hover`, `text.base.secondary`). A camada semântica nunca introduz um hex novo — todos os seus valores são referências a primitivos.

O que o Tailwind recebe é a export `colors`, que contém apenas primitivos ([colors.ts:115-120](../src/tokens/colors.ts#L115-L120)). Consequentemente as classes usadas nos componentes são primitivas (`bg-primary-500`), e o mapeamento semântico vive nos mapas de variante de cada componente. `semanticColors` é exportado no bundle e disponível em runtime, mas não gera utilitários.

### D2 — Uma escala de tamanho, três usos

`sizePrimitives` é a fonte única. `spacing` é o mesmo objeto por referência (`export const spacing = sizePrimitives`), e `borderRadius` é um subconjunto de três chaves mais `full`. Não existe escala paralela para padding, gap ou dimensão.

### D3 — Especialização por intenção, não por variante

Ação destrutiva é um componente (`DangerButton`), não `<Button variant="danger">`. CTA de destaque é `HeroButton`, não `<Button size="hero">`. Isso torna a intenção visível no ponto de uso e permite que cada componente tenha o eixo de variação que faz sentido para ele — `Button` tem `loading` e três tamanhos; `HeroButton` não tem tamanho; `IconButton` tem `icon` obrigatório.

O custo é duplicação: os quatro botões repetem a mesma linha base de classes e a mesma estrutura de render.

### D4 — Três eixos de estado, com precedência definida

Todo componente interativo é descrito por `variant` (aparência), `size` (dimensão) e estado (`disabled`, `hasError`, `active`, `loading`). Estados sobrescrevem variante: as classes de `disabled` e `hasError` vêm depois no array de classes e ganham por ordem de cascata.

### D5 — Container e item são componentes separados

`Navbar`/`NavbarTab`, `TabList`/`Tab`, `MegaSelect`/`MegaSelectOption`, `Select`/`SelectOption`. Nenhum container gerencia o estado de seleção dos filhos, nem por contexto React, nem por clonagem de elementos. O container aplica layout e `role`; o item recebe `active`/`selected` diretamente do consumidor.

Isso mantém a fonte da verdade do estado de navegação na aplicação — normalmente o router — em vez de duplicá-la dentro da biblioteca.

### D6 — O componente possui sua superfície, não seu contexto

Ver R14. Dimensão interna, cor, raio, tipografia e estados pertencem ao componente. Margem, posição, largura de contexto e empilhamento pertencem ao layout que o contém.

### D7 — Estilo é composto por concatenação, não por especificidade

Não há CSS aninhado, `!important`, seletor descendente ou `:where()`. A variação é resolvida em JavaScript, escolhendo qual string de classe entra no array. O CSS final é uma lista plana de utilitários. Isso mantém a origem de cada regra rastreável ao ponto do código que a escolheu.

### D8 — Vocabulário compartilhado com o Figma

Os nomes atravessam a fronteira design↔código sem tradução: escalas `50`–`950`, tokens de tamanho `050`–`4000`, tamanhos de fonte `xs`–`3xl`, e até os nomes de estado em PascalCase de `NavbarTab`/`Tab` (`"Default"`, `"Hover"`, `"Disabled"`), herdados dos nomes de variante do Figma. Ver [integrations.md](integrations.md#figma).
