# 4. Zero dependências de runtime

Data: 2026-07-07

## Status

Ativa

## Contexto

Uma biblioteca de componentes é instalada dentro de outras aplicações. Cada dependência de runtime que ela carrega passa a existir no bundle final do consumidor, com três consequências:

- **Conflito de versão**: se a aplicação já usa a mesma biblioteca em outra major, o gerenciador de pacotes resolve com duplicação ou com um conflito que o consumidor precisa mediar.
- **Peso**: soma ao bundle de todas as aplicações consumidoras.
- **Superfície de manutenção**: cada dependência traz seu próprio ciclo de breaking changes e vulnerabilidades.

Por outro lado, existem bibliotecas maduras que resolvem exatamente os problemas de um design system: `clsx` para composição de classes, `class-variance-authority` para variantes, `tailwind-merge` para conflito de utilitários, e Radix UI / Headless UI / React Aria para comportamento acessível de componentes complexos.

A questão era se o benefício dessas bibliotecas justificava o custo de carregá-las para dentro de cada aplicação consumidora.

## Decisão

Vamos manter **zero dependências de runtime**. O campo `dependencies` do [package.json](../../package.json) permanece vazio; React entra como `peerDependency` ([ADR-0001](0001-react-como-biblioteca-de-ui.md)) e todo o resto é `devDependency`.

Consequências diretas assumidas:

| Necessidade | Solução adotada |
|---|---|
| Composição de classes | `[...].filter(Boolean).join(" ")` manual |
| Variantes | `Record<Variant, string>` ([ADR-0011](0011-mapas-de-variante-tipados.md)) |
| Ícones | SVG inline, definido no arquivo do componente |
| Comportamento acessível (dropdown, teclado, foco) | Implementado à mão, componente por componente |

## Alternativas Consideradas

### Alternativa 1: Radix UI (ou Headless UI / React Aria) como base de comportamento

**Descrição**: Usar primitivas headless para os componentes que exigem comportamento complexo — dropdown, tabs, checkbox.

**Prós**:
- Acessibilidade de nível profissional pronta: teclado completo, `aria-*` correto, focus trap, `aria-activedescendant`
- Posicionamento com detecção de colisão e portal (resolve o painel cortado por `overflow`)
- Testado por uma comunidade grande, em cenários que não anteciparíamos
- Elimina a classe de bug de a11y sutil

**Contras**:
- Radix adiciona ~30–50 kB e um conjunto de subpacotes ao bundle do consumidor
- Impõe seu modelo de composição (`Root`/`Trigger`/`Content`/`Item`), que conflita com a API plana escolhida em [ADR-0013](0013-container-e-item-separados.md)
- Estilizar exige trabalhar em torno dos data-attributes da biblioteca
- Cria acoplamento a um ciclo de releases externo

**Razão para rejeição**: Rejeitada com reserva explícita. É a alternativa mais forte deste ADR, e a única cujo argumento a favor é de qualidade, não de conveniência. Para o escopo atual — 16 componentes, dos quais apenas o `MegaSelect` tem comportamento não trivial — o custo de implementar à mão foi considerado pagável, e foi pago (ver Notas de Implementação). Se o sistema crescer para incluir modal, popover, tooltip, menu aninhado ou date picker, esta decisão deve ser reaberta: esses componentes têm comportamento de acessibilidade que não é razoável reimplementar.

### Alternativa 2: `clsx` + `class-variance-authority` + `tailwind-merge`

**Descrição**: As três bibliotecas utilitárias padrão do ecossistema Tailwind + React.

**Prós**:
- `cva` dá API declarativa de variantes, com `compoundVariants` para eixos cruzados
- `tailwind-merge` resolve conflito de utilitários, tornando a sobrescrita por `className` confiável
- Tipos derivados automaticamente das variantes
- Peso combinado modesto (~10 kB)

**Contras**:
- Três dependências para resolver o que `Record<Variant, string>` e `.filter(Boolean).join(" ")` já resolvem com garantia de tipo equivalente
- `tailwind-merge` mantém uma tabela interna de grupos de utilitários que precisa acompanhar a versão do Tailwind
- `compoundVariants` só se paga quando há muitos eixos cruzados; aqui só o `IconToggle` cruza dois

**Razão para rejeição**: O ganho real é a resolução de conflito do `tailwind-merge`. Esse ganho foi trocado pela regra de disciplina em [ADR-0012](0012-classname-como-unico-escape-hatch.md) (`className` sempre por último) e pela consequência documentada de que a sobrescrita não é garantida.

### Alternativa 3: Pacote de ícones (lucide-react, react-icons)

**Descrição**: Consumir ícones de uma biblioteca.

**Prós**:
- Centenas de ícones consistentes, prontos
- Não é preciso desenhar nem manter SVG

**Contras**:
- Dependência de runtime, mesmo com tree-shaking
- O design system só precisa de 4 ícones internos (chevron, lupa, check, spinner)
- Ícones do consumidor já entram como `ReactNode`, sem acoplamento — quem consome escolhe sua própria biblioteca

**Razão para rejeição**: Quatro SVGs inline de ~6 linhas cada não justificam uma dependência. E a API de `ReactNode` já deixa a escolha de biblioteca de ícones para o consumidor.

## Consequências

### Positivas

- Nenhum conflito de versão possível na aplicação consumidora
- Bundle mínimo: `dist/index.js` em ~28 kB (5.9 kB gzip) para 16 componentes
- Nenhuma vulnerabilidade transitiva a monitorar (`npm audit`: 0)
- Nenhum ciclo de breaking change externo a acompanhar
- Controle total sobre o DOM gerado, o que mantém a estratégia de estilo de [ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md) sem workaround
- Instalação e build rápidos

### Negativas

- **A acessibilidade de componentes complexos é responsabilidade integral deste repositório.** Nada resolve teclado, ARIA ou gestão de foco por nós. Isso já se materializou: o `MegaSelect` exigiu a implementação manual do padrão combobox do WAI-ARIA — índice ativo, `aria-activedescendant`, navegação por setas, `Home`/`End`, `Escape`, retorno de foco e scroll da opção ativa
- Sem `tailwind-merge`, sobrescrita por `className` não tem resolução de conflito garantida
- Duplicação: `ChevronDownIcon` está definido duas vezes ([Select](../../src/components/inputs/Select/Select.tsx), [MegaSelect](../../src/components/inputs/MegaSelect/MegaSelect.tsx))
- Sem portal nem posicionamento inteligente: o painel do `MegaSelect` abre sempre para baixo e é filho do container `relative`, sujeito a `overflow` de ancestrais e a um `z-10` fixo
- Componentes ficam mais verbosos do que com `cva`
- Cada componente novo com comportamento complexo carrega o custo integral de a11y

### Neutras

- `devDependencies` continua rica (React, Tailwind, Vite, Storybook, TypeScript) — a restrição é só sobre runtime
- Adicionar dependência de runtime passa a ser decisão arquitetural, sujeita a alinhamento, não escolha de implementação

## Trade-offs

Priorizamos **bundle mínimo, zero conflito de versão e controle total do DOM** sobre **comportamento acessível pronto e ferramental de conveniência**. O preço é pago em esforço de implementação e em risco de acessibilidade concentrado neste repositório — risco que precisa ser gerenciado por checklist e verificação manual, já que nenhuma biblioteca o absorve.

## Notas de Implementação

Composição de classes, o padrão em todo componente:

```tsx
className={[
  "inline-flex items-center justify-center rounded-200 font-semibold",
  "transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  variantClasses[variant],
  sizeClasses[size],
  className,
].filter(Boolean).join(" ")}
```

O custo de acessibilidade desta decisão foi pago no `MegaSelect`, que implementa o padrão combobox do WAI-ARIA sem biblioteca — ver [MegaSelect.tsx](../../src/components/inputs/MegaSelect/MegaSelect.tsx) e [ADR-0014](0014-elemento-nativo-primeiro.md).

## Validação

A decisão é bem-sucedida se:

- `dependencies` permanecer vazio
- Nenhum consumidor reportar conflito de versão
- Componentes com comportamento customizado passarem no checklist de teclado de `docs/best-practices/accessibility.md`

O sinal de que a decisão deixou de valer: um componente novo cujo padrão de acessibilidade seja complexo o bastante para que reimplementá-lo seja irresponsável — modal com focus trap, popover com posicionamento, menu aninhado, date picker.

## Revisão

**2026-07-07**: Decisão inicial, com reserva registrada. Reabrir se entrarem em escopo componentes de overlay (modal, popover, tooltip, menu) ou se aparecer o primeiro defeito de acessibilidade em produção.
