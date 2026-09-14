# 13. Container e item como componentes separados, com estado na aplicação

Data: 2026-07-07

## Status

Ativa

## Contexto

Componentes compostos — abas, listas de seleção, barras de navegação — precisam decidir onde vive o estado de "qual item está ativo" e como o container coordena seus filhos.

Os modelos habituais:

- **Container inteligente**: o container mantém o estado e distribui via Context ou `cloneElement`. Uso fica `<Tabs value={x} onChange={f}><Tab value="a" /></Tabs>`.
- **Container burro**: o container só aplica layout; cada item recebe `active` diretamente.

A consideração decisiva para este sistema: em quase todos os casos reais de navegação, **o estado já existe na aplicação** — normalmente no router. Uma barra de navegação reflete a rota atual; uma lista de abas de seção reflete um parâmetro de URL ou um `useState` da página.

## Decisão

Vamos manter **container e item como componentes separados e independentes**, sem estado compartilhado:

```tsx
<TabList>
  <Tab label="Dados"     active={aba === "dados"} onClick={() => setAba("dados")} />
  <Tab label="Histórico" active={aba === "hist"}  onClick={() => setAba("hist")} />
</TabList>
```

O container aplica layout e o `role` de agrupamento. O item recebe `active` diretamente do consumidor. Não há Context, `React.Children.map` nem `cloneElement`.

Pares que seguem o padrão: `Navbar`/`NavbarTab`, `TabList`/`Tab`, `Select`/`SelectOption`. Todos os itens são exportados individualmente, permitindo composição fora do container padrão.

**Exceção deliberada**: o `MegaSelect` gerencia o próprio estado de painel aberto e o índice ativo do teclado, e renderiza os `MegaSelectOption` internamente. Ali o estado é puramente de interação — não duplica nada que a aplicação possua — e a coordenação é necessária para o padrão combobox do WAI-ARIA ([ADR-0014](0014-elemento-nativo-primeiro.md)).

## Alternativas Consideradas

### Alternativa 1: Container inteligente com Context

**Descrição**: O container mantém o estado e provê via Context; itens consomem.

**Prós**:
- API mais enxuta no ponto de uso: `value` num lugar, não `active` em cada item
- O container pode coordenar navegação por setas entre abas (parte do padrão ARIA de tablist)
- Impede estados inconsistentes, como duas abas ativas
- Pode gerenciar `tabIndex` automaticamente

**Contras**:
- **Duplica um estado que a aplicação já tem.** Com o router como fonte da verdade, o container criaria uma segunda fonte a sincronizar
- Modo controlado + não-controlado dobra a complexidade do container
- Exige que os itens sejam descendentes do Provider, restringindo composição
- Context re-renderiza todos os consumidores a cada mudança

**Razão para rejeição**: A duplicação de estado é o problema central. Para navegação, a fonte da verdade é o router — e um container que mantenha sua própria cópia introduz sincronização onde não havia. O custo assumido é que a navegação por setas entre abas fica por implementar.

### Alternativa 2: `cloneElement` sobre children

**Descrição**: O container clona os filhos injetando `active` e handlers.

**Prós**:
- API enxuta sem Context
- Sem re-render em cascata

**Contras**:
- **Quebra assim que alguém envolve um item.** Um `<Tooltip><Tab /></Tooltip>` ou um `.map()` que retorne fragmento deixa de receber as props injetadas
- Torna o tipo dos children opaco
- Comportamento "mágico" e difícil de depurar
- Impede que o consumidor passe `active` explicitamente

**Razão para rejeição**: A fragilidade diante de qualquer wrapper é inaceitável — é uma restrição invisível que o consumidor descobre quebrando.

### Alternativa 3: API baseada em dados (`items` array)

**Descrição**: `<TabList items={[{label, value}]} value={x} onChange={f} />`.

**Prós**:
- Muito enxuto para casos simples
- Estado num lugar
- Fácil renderizar de dados remotos

**Contras**:
- Perde flexibilidade de composição: ícone customizado, badge, item com layout próprio
- Cada necessidade nova vira prop no objeto do item
- Mistura os dois modelos se `children` também for aceito

**Razão para rejeição**: A composição por `children` é mais flexível para navegação, onde itens frequentemente precisam de conteúdo customizado. O `Select` adota o modelo de dados justamente porque `<option>` nativo não aceita composição rica — e ainda assim aceita `children` como alternativa.

## Consequências

### Positivas

- **Uma única fonte de verdade**: o estado de navegação fica onde já estava, na aplicação
- Composição livre: itens podem ser envolvidos, mapeados, condicionados sem quebrar
- Componentes triviais de entender — `TabList` são 12 linhas, `Navbar` são 10
- Nenhum re-render em cascata
- Itens exportados individualmente permitem montar composições fora do container
- Sem modo controlado/não-controlado a documentar nos containers

### Negativas

- **Verboso no ponto de uso**: `active={aba === "x"}` repetido em cada item
- **Nada impede estado inconsistente**: duas abas com `active` simultâneo renderizam dois indicadores
- **A navegação por setas entre abas não está implementada.** O padrão ARIA de tablist pede `←`/`→` e `tabIndex` gerenciado; sem um coordenador, cada `Tab` é independente e não sabe dos irmãos. Hoje as abas são navegáveis por `Tab`/`Enter`, mas não por setas
- Não há `aria-controls` ligando `Tab` ao painel correspondente — o container não conhece os painéis
- Adicionar uma aba exige atualizar a lógica de estado na aplicação

### Neutras

- `TabList` aceita `size` mas não o usa (`_size`), porque o dimensionamento efetivo é feito por `Tab` individualmente
- `NavbarTab` e `Tab` expõem `state?: "Default" | "Hover" | "Disabled"`, herdado dos nomes de variante do Figma; só `"Disabled"` altera o render
- O `MegaSelect` como exceção mostra que a regra é sobre **estado de domínio**, não sobre estado de interação

## Trade-offs

Priorizamos **fonte única de verdade e liberdade de composição** sobre **API enxuta e coordenação automática entre itens**. O custo mais concreto é a navegação por setas nas abas, que fica por implementar — e que exigiria algum mecanismo de coordenação, provavelmente Context, revisitando esta decisão.

## Notas de Implementação

Regra A13 em `docs/best-practices/component-api.md`.

Regra de domínio D5 em `docs/business-rules.md`.

Se a navegação por setas entre abas entrar em escopo, as opções são: (a) um Context restrito à coordenação de teclado, sem carregar o estado de seleção; ou (b) um componente `TabList` alternativo com API de dados. A opção (a) preserva a fonte única de verdade e é a preferível.

## Validação

A decisão é bem-sucedida se:

- Nenhum container mantiver estado que a aplicação já possua
- Composições customizadas (item envolvido, item condicional) funcionarem sem workaround
- Consumidores não reportarem necessidade de sincronizar dois estados

## Revisão

**2026-07-07**: Decisão inicial. A navegação por setas nas abas está registrada como lacuna de acessibilidade em `docs/best-practices/accessibility.md`; endereçá-la exige revisitar este ADR.
