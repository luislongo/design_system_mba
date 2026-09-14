# 14. Elemento nativo primeiro, customizado por exceção

Data: 2026-07-07

## Status

Ativa

## Contexto

Com zero dependências de runtime ([ADR-0004](0004-zero-dependencias-de-runtime.md)), nenhuma biblioteca resolve acessibilidade por nós. Isso transforma a escolha entre elemento nativo e controle customizado numa **escolha de escopo de acessibilidade**: cada componente customizado assume integralmente o custo de teclado, ARIA e gestão de foco.

Elementos nativos do HTML entregam de graça: papel semântico, navegação por teclado, foco, estado desabilitado, integração com formulários, e — em `<select>` — busca por digitação e o picker do sistema operacional, que em mobile é a diferença entre uma experiência boa e uma ruim.

O custo do nativo é limitação de aparência. `<select>` não permite estilizar as opções; `<input type="checkbox">` não permite desenhar a caixa.

## Decisão

Vamos adotar a regra **elemento nativo primeiro**: antes de escrever `role`, verificar se um elemento HTML já faz o trabalho.

Quando a aparência exigir customização, a técnica preferida é **manter o elemento nativo e esconder apenas sua pintura**:

```tsx
// Checkbox e Radio: input real com opacity-0 sobreposto ao controle visual
<input type="checkbox" className="peer absolute inset-0 w-full h-full opacity-0 …" />
<span aria-hidden className="… peer-checked:bg-primary-500 peer-focus-visible:ring-2 …" />
```

`opacity-0` (não `display:none` nem `visibility:hidden`) preserva foco e ordem de tabulação. Semântica, teclado e integração com formulário permanecem nativos; só a pintura é customizada.

**Substituição completa do elemento nativo é exceção**, e quem a escolhe assume o custo integral do padrão ARIA correspondente. Há uma exceção no sistema — o `MegaSelect` — e o custo foi pago: ele implementa o padrão combobox do WAI-ARIA por completo.

Consequência de política: `Select` (nativo) e `MegaSelect` (customizado) coexistem como intenções distintas ([ADR-0010](0010-especializacao-de-componentes-por-intencao.md)), e a documentação orienta a escolha explicitamente.

## Alternativas Consideradas

### Alternativa 1: Tudo customizado, para consistência visual total

**Descrição**: Substituir `<select>`, `<input type=checkbox>` e `<input type=radio>` por implementações próprias.

**Prós**:
- Aparência idêntica em todos os navegadores e sistemas operacionais
- Controle total sobre animação, ícones e conteúdo das opções
- Nenhuma limitação de estilo

**Contras**:
- Cada componente assumiria o custo integral de teclado, ARIA e foco
- Perderia-se o picker nativo em mobile, que é significativamente melhor que qualquer dropdown customizado em tela pequena
- Perderia-se busca por digitação, autofill do navegador e integração automática com `<form>`
- Multiplicaria a superfície de risco de acessibilidade por 3 ou 4

**Razão para rejeição**: O custo de acessibilidade seria multiplicado sem ganho proporcional. A técnica de input oculto entrega quase toda a liberdade visual mantendo o comportamento nativo — é o melhor dos dois lados para `Checkbox` e `Radio`.

### Alternativa 2: Tudo nativo, sem exceção

**Descrição**: Proibir substituição de elemento nativo; aceitar as limitações de aparência.

**Prós**:
- Acessibilidade garantida por construção
- Código mínimo
- Zero risco de padrão ARIA incompleto

**Contras**:
- `<select>` não permite estilizar opções, agrupar com layout rico ou mostrar conteúdo customizado
- Alguns designs não são realizáveis
- Retiraria uma capacidade legítima do design system

**Razão para rejeição**: Excessivamente restritivo. A demanda por um seletor com painel estilizado é real; a resposta correta é permitir a exceção **e cobrar o custo dela**, não proibi-la.

### Alternativa 3: Radix UI para os componentes que exigem customização

**Descrição**: Usar primitivas headless onde o nativo não serve.

**Prós**:
- Resolveria o custo de acessibilidade com qualidade profissional
- Portal e posicionamento com detecção de colisão — resolveria as limitações restantes do `MegaSelect`

**Contras**:
- Dependência de runtime, contrariando [ADR-0004](0004-zero-dependencias-de-runtime.md)

**Razão para rejeição**: Ver [ADR-0004](0004-zero-dependencias-de-runtime.md), onde esta alternativa é analisada e rejeitada com reserva. Para um único componente complexo, o custo manual foi considerado pagável — e foi pago.

## Consequências

### Positivas

- `Select` herda teclado completo, busca por digitação e picker do SO sem uma linha de JS
- `Checkbox` e `Radio` têm aparência customizada com semântica, foco e integração com formulário nativos
- `forwardRef` nesses dois dá acesso ao input real, viabilizando bibliotecas de formulário e `indeterminate`
- A regra torna explícito o custo de cada customização, em vez de deixá-lo implícito
- Consumidores têm a escolha documentada entre `Select` e `MegaSelect`, com o trade-off à vista

### Negativas

- **Dois componentes de seleção para manter**, com aparências e capacidades diferentes
- O consumidor precisa decidir qual usar — decisão que a documentação orienta mas não elimina
- `Select` continua limitado: não é possível estilizar `<option>`
- O `MegaSelect`, mesmo com o padrão de teclado implementado, mantém limitações estruturais que uma biblioteca resolveria: abre sempre para baixo (`top-full`), sem portal, sujeito a `overflow` de ancestrais e a um `z-10` fixo
- Não há busca por digitação no `MegaSelect` — o `<select>` nativo tem, o customizado não

### Neutras

- A técnica de `peer` + input oculto exige três detalhes corretos (`opacity-0`, input cobrindo a área, camada visual `aria-hidden` + `pointer-events-none`), documentados como receita
- A escolha entre nativo e customizado passa a exigir alinhamento, não é decisão de implementação

## Trade-offs

Priorizamos **acessibilidade e comportamento nativo** sobre **uniformidade visual absoluta**, permitindo exceções desde que o custo integral do padrão ARIA seja pago. O que se sacrifica é a aparência consistente do `<select>` entre plataformas — e se ganha o picker nativo em mobile, que é o cenário onde o nativo mais importa.

## Notas de Implementação

### O custo pago no `MegaSelect`

Implementação completa do padrão combobox do WAI-ARIA, sem biblioteca ([MegaSelect.tsx](../../src/components/inputs/MegaSelect/MegaSelect.tsx)):

| Aspecto | Implementação |
|---|---|
| Papel e estado | `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` |
| Opção ativa | `aria-activedescendant` apontando o `id` da opção; `id` gerado com `useId()` |
| Abrir | `Enter`, `Espaço`, `↓` (abre no início ou no selecionado), `↑` (abre no fim) |
| Navegar | `↑`/`↓` com clamp nos extremos, pulando opções desabilitadas |
| Extremos | `Home` / `End` |
| Selecionar | `Enter` / `Espaço` → `onChange` + fecha + devolve foco ao gatilho |
| Cancelar | `Escape` → fecha sem selecionar + devolve foco ao gatilho |
| Sair | `Tab` → fecha e segue o fluxo natural de foco (sem `preventDefault`) |
| Foco | Permanece no gatilho; opções recebem `tabIndex={-1}` e não entram na ordem de tabulação |
| Scroll | Opção ativa trazida à área visível via `scrollIntoView({ block: "nearest" })` |
| Opções | `role="option"`, `aria-selected`, `aria-disabled` |
| Cursor visual | Anel `ring-1 ring-inset ring-primary-500` na opção ativa — discernível, distinto do fundo `bg-primary-50` da selecionada |

Comportamento verificado em navegador, incluindo: salto de opção desabilitada, clamp nos extremos, retorno de foco após `Escape` e `Enter`, reabertura posicionando o cursor na opção selecionada, fechamento por clique fora sem roubar o foco, e lista vazia sem erro.

### Técnica de input oculto

Regra AC3 em `docs/best-practices/accessibility.md`, com os três detalhes que fazem a técnica funcionar.

### Tabela de decisão

"Regra zero: elemento nativo primeiro" em `docs/best-practices/accessibility.md` lista, para cada necessidade, o elemento nativo correspondente e o que ele entrega de graça.

## Validação

A decisão é bem-sucedida se:

- Todo componente novo passar pela pergunta "existe elemento nativo para isso?" antes de receber `role`
- Todo controle customizado tiver o padrão ARIA correspondente completo, verificado com teclado
- Nenhum `role` for declarado sem que suas obrigações sejam cumpridas

## Revisão

**2026-07-07**: Decisão inicial. O `MegaSelect` cumpre o padrão de teclado e ARIA. Limitações estruturais restantes (portal, detecção de colisão, busca por digitação) permanecem registradas em `docs/integrations.md`. Se entrarem em escopo componentes de overlay com padrões mais complexos, reabrir [ADR-0004](0004-zero-dependencias-de-runtime.md) junto com este.
