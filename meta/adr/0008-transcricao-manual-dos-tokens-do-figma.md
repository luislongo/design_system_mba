# 8. Transcrição manual dos tokens do Figma

Data: 2026-07-07

## Status

Ativa

## Contexto

O Figma é a fonte de verdade do design. Suas variáveis de cor, tamanho e tipografia são exportadas para [figmatokens.json](../../figmatokens.json), no formato W3C Design Tokens com extensões da Figma.

Esse arquivo não é diretamente consumível pelo Tailwind. As diferenças de forma são substantivas:

| No Figma | Necessário no código |
|---|---|
| `"$value": 16` (número) | `"16px"` (string com unidade CSS) |
| `$value: { colorSpace, components, alpha, hex }` | `"#F3EFF9"` |
| `Font size.sm` = 14 | `["14px", { lineHeight: "20px" }]` — o line-height não existe no Figma |
| `"DM Sans"` | `["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]` — a stack de fallback não existe no Figma |
| `"{Typography primitives.Font size.base}"` (alias textual) | referência real de objeto TypeScript |
| `Color primitives.Primary` | `colorPrimitives.primary` |

Ou seja: a conversão não é uma transformação mecânica de formato. Ela envolve decisões que só existem no lado do código — quais line-heights pareiam com cada tamanho de fonte, qual a stack de fallback tipográfica, quais grupos do Figma têm ou não destino em TypeScript.

## Decisão

Vamos fazer a **transcrição manual** do `figmatokens.json` para `src/tokens/*.ts`, sem transformador no pipeline (Style Dictionary, `@tokens-studio/sd-transforms` ou script próprio).

O fluxo é unidirecional e documentado como procedimento:

```
Figma → exportar variáveis → substituir figmatokens.json → diff → aplicar em src/tokens/*.ts
      → npm run build → npm run storybook (revisão visual) → reconstruir dist/
```

Esta decisão é considerada **definitiva para o escopo atual**, não uma etapa provisória.

## Alternativas Consideradas

### Alternativa 1: Style Dictionary

**Descrição**: Pipeline de build que lê tokens em formato padrão e gera saídas para múltiplas plataformas.

**Prós**:
- Elimina a transcrição manual e, com ela, a classe de erro de digitação
- Resolve alias automaticamente
- Geraria também variáveis CSS, se dark mode entrar em escopo
- Padrão da indústria para pipelines de token

**Contras**:
- Adiciona uma etapa de build e um conjunto de arquivos de configuração
- As adaptações de forma necessárias (line-height pareado, stack de fallback, tupla do Tailwind) exigiriam transforms customizados — que é código a escrever e manter
- O volume atual é pequeno: 4 rampas de cor, 14 tokens de tamanho, 7 de fonte
- O `figmatokens.json` da Figma usa `$extensions` e uma estrutura de `$value` de cor que exigiria parser próprio

**Razão para rejeição**: Os transforms customizados necessários representariam um esforço comparável ao da transcrição manual, mas com uma camada de ferramenta a manter. Para o volume atual, a automação não se paga. Registrada como direção futura se o número de tokens ou de plataformas de saída crescer.

### Alternativa 2: Script próprio de conversão

**Descrição**: Um script Node que lê o JSON e emite os arquivos TypeScript.

**Prós**:
- Sem dependência externa
- Ajustável às adaptações específicas deste projeto
- Detectaria divergência automaticamente

**Contras**:
- Código a escrever, testar e manter
- As decisões que vivem só no código (line-height, fallback) precisariam ficar numa tabela de configuração do script — deslocando o problema, não eliminando-o
- Arquivos gerados são menos legíveis e menos anotáveis do que escritos à mão

**Razão para rejeição**: Deslocaria as decisões de código para uma configuração de script, sem eliminar a necessidade de tomá-las. O ganho seria detectar divergência — que é o risco real desta decisão, mas que se aceita gerenciar por procedimento.

### Alternativa 3: Plugin de Figma que escreve direto no repositório

**Descrição**: Tokens Studio ou similar sincronizando via API.

**Prós**:
- Sincronização contínua, sem etapa manual
- Design altera e o código acompanha

**Contras**:
- Acopla o repositório a um plugin e a credenciais de API
- Perde-se a etapa de revisão: uma mudança no Figma entraria no código sem que ninguém avaliasse o impacto visual
- Ainda exigiria as adaptações de forma

**Razão para rejeição**: A etapa de revisão humana é desejável, não um obstáculo. Uma mudança de token atinge todos os componentes que usam a classe correspondente — isso merece avaliação, não propagação automática.

## Consequências

### Positivas

- Nenhuma ferramenta ou etapa de build adicional
- Os arquivos em `src/tokens/` são escritos à mão: legíveis, anotáveis com comentários e diretamente navegáveis
- As decisões que só existem no código (line-height, stack de fallback) ficam explícitas no lugar onde são usadas
- A etapa manual força revisão do impacto visual de cada mudança de token
- Os alias do Figma viram referências reais de objeto, o que preserva a intenção na estrutura do TypeScript ([ADR-0007](0007-tokens-em-duas-camadas.md))

### Negativas

- **Divergência silenciosa é o risco central.** Uma variável alterada no Figma sem novo export, ou um export sem a transcrição correspondente, não é detectado por nada. O `tsc` verifica tipo, não valor
- Um erro de digitação num hex produz uma cor errada que compila e passa desapercebida
- Toda mudança de token é trabalho manual proporcional ao número de tokens alterados
- Não há registro automático de quando cada token foi sincronizado
- Grupos do Figma sem destino em código (`Size.Gap`, `Size.Padding`, `Typography.Body`) só são identificáveis lendo os dois lados

### Neutras

- O `figmatokens.json` permanece versionado, servindo de referência para diff
- As adaptações de forma estão documentadas como tabela, o que torna a transcrição um procedimento e não improvisação
- O arquivo exportado declara `"com.figma.modeName": "Mode 3"` — um único modo, o que é coerente com a ausência de dark mode no código

## Trade-offs

Priorizamos **ausência de ferramenta e legibilidade dos arquivos de token** sobre **garantia de fidelidade ao Figma**. Aceitamos deliberadamente o risco de divergência silenciosa, e o gerenciamos por procedimento documentado e revisão visual — não por automação.

## Notas de Implementação

Mapeamento completo entre grupos do Figma e destinos em `src/tokens/`, incluindo os grupos sem destino, em `docs/integrations.md`, seção "Figma".

Tabela de adaptações de forma em `docs/best-practices/tokens.md`, regra T8. Procedimento de sincronização em `docs/integrations.md`.

Regra T7 do mesmo documento: todo token nasce no Figma, fluxo unidirecional. Adicionar valor direto em `src/tokens/` cria a divergência que este ADR aceita como risco — de forma evitável.

Tratamento de divergência quando detectada: `docs/best-practices/contributing.md`, seção "Divergência entre Figma e código".

## Validação

A decisão é bem-sucedida se:

- Nenhuma divergência entre `figmatokens.json` e `src/tokens/` for encontrada em auditoria
- O tempo de sincronização após mudança no Figma permanecer na escala de minutos
- Nenhum valor de token entrar em `src/tokens/` sem origem no Figma

O sinal de que a decisão deixou de valer: a primeira divergência que chegue a produção, ou o volume de tokens crescer ao ponto de a transcrição levar horas.

## Revisão

**2026-07-07**: Decisão inicial, considerada definitiva para o escopo atual (4 rampas de cor, 14 tokens de tamanho, 7 de tipografia, um único modo). Reabrir se entrar dark mode (que multiplicaria os modos), se surgir segunda plataforma de saída (iOS/Android), ou após a primeira divergência com impacto.
