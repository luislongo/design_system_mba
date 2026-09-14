# 9. Estender o tema do Tailwind em vez de substituí-lo

Data: 2026-07-07

## Status

Ativa

## Contexto

O Tailwind oferece duas formas de instalar tokens na configuração:

- **`theme`** — substitui a escala padrão. Só os valores declarados existem.
- **`theme.extend`** — soma à escala padrão. Coexistem os valores do Tailwind e os do projeto.

Para um design system, a escolha define se a escala de tokens é a **única** disponível ou apenas a **preferencial**. Substituir é o que garante consistência mecânica; estender é o que dá flexibilidade e evita quebrar utilitários que não têm equivalente em token.

Complicação relevante: a escala de tamanho do projeto usa nomenclatura numérica proporcional (`100` = 4px, `400` = 16px), enquanto a escala padrão do Tailwind usa outra convenção (`1` = 0.25rem, `4` = 1rem). As chaves não colidem — o Tailwind não tem chave `100` em `spacing`, e o projeto não tem `4`. A única sobreposição é `0`, com o mesmo valor em ambos.

## Decisão

Vamos usar **`theme.extend`**, preservando a escala padrão do Tailwind ao lado da escala de tokens.

```ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors, fontFamily, fontSize, fontWeight, spacing, borderRadius } },
  plugins: [],
} satisfies Config;
```

A consequência assumida é que os componentes usam as duas escalas, com uma divisão de papéis que se estabeleceu na prática:

- **Escala de tokens** para padding, gap, margin e raio: `px-400`, `gap-200`, `rounded-200`
- **Escala padrão do Tailwind** para altura e largura de controle: `h-8`, `h-10`, `h-12`, `w-5`

Os valores coincidem — `h-8` é 2rem (32px), igual ao token `800`; `h-10` é 40px, igual ao token `1000`; `h-12` é 48px, igual ao token `1200`. Não há divergência de ritmo, apenas duas notações para os mesmos valores.

Para código novo, a regra documentada é **preferir a escala de tokens em espaçamento**, mantendo consistência com os componentes irmãos nas dimensões de controle.

## Alternativas Consideradas

### Alternativa 1: Substituir o tema (`theme` sem `extend`)

**Descrição**: Só os tokens existem; a escala padrão do Tailwind desaparece.

**Prós**:
- **Consistência mecânica**: `p-4` deixaria de compilar, tornando impossível sair da escala
- Uma única notação, sem ambiguidade sobre qual usar
- CSS potencialmente menor (menos utilitários gerados)

**Contras**:
- Quebraria utilitários sem equivalente em token. `w-5` (20px, usado em `Checkbox` e `Radio`) não tem chave na escala — 20px seria `500`, que é uma das lacunas deliberadas da escala
- `fontSize` e `fontWeight` substituídos removeriam variações que o Tailwind oferece e que podem ser necessárias
- Substituir `colors` removeria `transparent`, `current` e `inherit`, que são usados (`bg-transparent`, `border-transparent`, `currentColor` nos SVGs)
- Cada lacuna da escala passaria a exigir valor arbitrário (`w-[20px]`), que é justamente o que se quer evitar

**Razão para rejeição**: As lacunas deliberadas da escala de tamanho ([ADR-0007](0007-tokens-em-duas-camadas.md), regra T10) tornam a substituição impraticável: não existem `500` (20px) nem `700`, e vários controles precisam desses valores. Substituir forçaria valores arbitrários — resultado pior que a coexistência das duas escalas.

### Alternativa 2: Substituir apenas `colors`, estender o resto

**Descrição**: Híbrido — cores restritas aos tokens, dimensões flexíveis.

**Prós**:
- Cor é onde a divergência é mais visível e mais custosa
- Preservaria a flexibilidade de dimensão

**Contras**:
- Removeria `transparent`, `current` e `inherit`, que estão em uso
- Seria preciso redeclarar essas três chaves manualmente
- Inconsistência conceitual: por que cor é restrita e espaçamento não?

**Razão para rejeição**: O ganho é pequeno — a paleta de tokens já cobre todas as cores usadas — e exigiria redeclarar as palavras-chave do CSS. A restrição real de cor é obtida por convenção e revisão (regra T1), não pela config.

## Consequências

### Positivas

- Nenhum utilitário do Tailwind é perdido: `transparent`, `currentColor`, `w-5`, `inset-0`, `shrink-0`, `z-10` continuam disponíveis
- As lacunas deliberadas da escala não forçam valores arbitrários
- Alturas de controle usam a notação curta e familiar (`h-10`), coincidindo com os valores de token
- Migração e experimentação são mais fáceis — nada quebra por falta de chave

### Negativas

- **Duas escalas coexistem, e nada impede o uso da errada.** `p-4` e `p-400` produzem o mesmo resultado visual (16px) por caminhos diferentes, e o `tsc` não distingue
- Um componente pode misturar as duas notações no mesmo elemento — como acontece em `Textbox`, com `h-10 px-400`
- Alguém pode usar `p-5` (20px), que está fora da escala de tokens, sem que nada avise
- CSS ligeiramente maior, por gerar utilitários das duas escalas
- Exige uma regra de convenção documentada para desambiguar, em vez de a config resolver

### Neutras

- A chave `0` existe nas duas escalas com o mesmo valor — sobreposição inócua
- `fontSize` usa o formato de tupla `[size, { lineHeight }]` do Tailwind, o que embute o line-height no utilitário: `text-sm` já aplica `line-height: 20px`
- Os tokens ficam também disponíveis à aplicação consumidora, que pode estender a própria config com eles ([ADR-0006](0006-distribuicao-por-workspace-local.md))

## Trade-offs

Priorizamos **flexibilidade e ausência de utilitários quebrados** sobre **consistência garantida pela configuração**. A restrição à escala de tokens passa a ser convenção documentada e verificada em revisão, não uma garantia do compilador — coerente com [ADR-0002](0002-typescript-strict-como-gate-de-qualidade.md), onde a mesma divisão entre garantia automática e disciplina humana aparece.

## Notas de Implementação

Regra T3 em `docs/best-practices/tokens.md` define a convenção: preferir a escala de tokens em padding, margin, gap e raio; a escala padrão em altura e largura de controle, mantendo consistência com os componentes irmãos.

Busca que localiza uso da escala padrão onde deveria haver token:

```bash
grep -rnE "\b(p|px|py|m|mx|my|gap)-[0-9]{1,2}\b" src/components/
```

Os matches em `h-`/`w-` são esperados e legítimos.

Escala de tamanho e suas lacunas em `docs/features.md`. A relação é `px = chave / 25`; não existem `500`, `700`, `900`, `1400`.

## Validação

A decisão é bem-sucedida se:

- Nenhum valor de espaçamento fora da escala de tokens aparecer nos componentes
- Componentes irmãos usarem a mesma notação para o mesmo tipo de propriedade
- O `grep` acima não retornar matches em padding/margin/gap

## Revisão

**2026-07-07**: Decisão inicial. Se a mistura de escalas gerar divergência real de ritmo visual, reconsiderar a substituição de `spacing` apenas — redeclarando as chaves faltantes (`500` = 20px) como tokens no Figma primeiro.
