# Architecture Decision Records (ADRs)

Este diretório contém os registros de decisões arquiteturais do **@ds/core**, o design system.

## O que é um ADR?

Um ADR captura uma decisão arquitetural importante: o contexto que a motivou, as alternativas consideradas, a escolha feita e suas consequências — incluindo as negativas.

Estes ADRs foram extraídos da implementação e validados com quem construiu o sistema. Todas as decisões registradas foram **conscientes e intencionais**; nenhuma é ratificação de acidente.

## Como ler

Se você tem cinco minutos, leia estes quatro — são os que restringem mais o que se pode fazer no repositório:

1. [ADR-0004: Zero dependências de runtime](0004-zero-dependencias-de-runtime.md) — a restrição de mais alto nível; várias outras derivam dela
2. [ADR-0003: Tailwind como única camada de estilo](0003-tailwind-como-unica-camada-de-estilo.md)
3. [ADR-0010: Especialização por intenção](0010-especializacao-de-componentes-por-intencao.md) — explica por que existe `DangerButton` e não `variant="danger"`
4. [ADR-0002: TypeScript strict como único gate](0002-typescript-strict-como-gate-de-qualidade.md) — define a fronteira entre o que é verificado e o que depende de revisão

## Índice de Decisões

### Decisões Ativas

| ADR | Título | Status | Categoria | Data |
|-----|--------|--------|-----------|------|
| [0001](0001-react-como-biblioteca-de-ui.md) | React como biblioteca de UI, com peerDependency ampla | Ativa | Stack | 2026-07-07 |
| [0002](0002-typescript-strict-como-gate-de-qualidade.md) | TypeScript strict como único gate automatizado de qualidade | Ativa | Qualidade | 2026-07-07 |
| [0003](0003-tailwind-como-unica-camada-de-estilo.md) | Tailwind CSS como única camada de estilo | Ativa | Stack | 2026-07-07 |
| [0004](0004-zero-dependencias-de-runtime.md) | Zero dependências de runtime | Ativa | Arquitetura | 2026-07-07 |
| [0005](0005-build-esm-only-com-css-em-subpath.md) | Build ESM-only em modo lib, com CSS em subpath separado | Ativa | Distribuição | 2026-07-07 |
| [0006](0006-distribuicao-por-workspace-local.md) | Distribuição por workspace local, com pacote privado | Ativa | Distribuição | 2026-07-07 |
| [0007](0007-tokens-em-duas-camadas.md) | Tokens de design em duas camadas: primitivo e semântico | Ativa | Tokens | 2026-07-07 |
| [0008](0008-transcricao-manual-dos-tokens-do-figma.md) | Transcrição manual dos tokens do Figma | Ativa | Tokens | 2026-07-07 |
| [0009](0009-estender-o-tema-do-tailwind.md) | Estender o tema do Tailwind em vez de substituí-lo | Ativa | Tokens | 2026-07-07 |
| [0010](0010-especializacao-de-componentes-por-intencao.md) | Especialização de componentes por intenção, não por variante | Ativa | API de Componentes | 2026-07-07 |
| [0011](0011-mapas-de-variante-tipados.md) | Mapas de variante tipados como mecanismo de variação visual | Ativa | API de Componentes | 2026-07-07 |
| [0012](0012-classname-como-unico-escape-hatch.md) | `className` como único escape hatch de estilo | Ativa | API de Componentes | 2026-07-07 |
| [0013](0013-container-e-item-separados.md) | Container e item como componentes separados, com estado na aplicação | Ativa | API de Componentes | 2026-07-07 |
| [0014](0014-elemento-nativo-primeiro.md) | Elemento nativo primeiro, customizado por exceção | Ativa | Acessibilidade | 2026-07-07 |
| [0015](0015-storybook-como-ambiente-de-verificacao.md) | Storybook como ambiente de desenvolvimento e verificação | Ativa | Qualidade | 2026-07-07 |

### Decisões Superseded (Substituídas)

Nenhuma.

### Decisões Deprecated (Descontinuadas)

Nenhuma.

## Categorias de Decisões

### Stack Tecnológica
- [ADR-0001](0001-react-como-biblioteca-de-ui.md): React como biblioteca de UI, com peerDependency ampla
- [ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md): Tailwind CSS como única camada de estilo

### Arquitetura
- [ADR-0004](0004-zero-dependencias-de-runtime.md): Zero dependências de runtime

### Distribuição e Integração
- [ADR-0005](0005-build-esm-only-com-css-em-subpath.md): Build ESM-only em modo lib, com CSS em subpath separado
- [ADR-0006](0006-distribuicao-por-workspace-local.md): Distribuição por workspace local, com pacote privado

### Tokens de Design
- [ADR-0007](0007-tokens-em-duas-camadas.md): Tokens de design em duas camadas: primitivo e semântico
- [ADR-0008](0008-transcricao-manual-dos-tokens-do-figma.md): Transcrição manual dos tokens do Figma
- [ADR-0009](0009-estender-o-tema-do-tailwind.md): Estender o tema do Tailwind em vez de substituí-lo

### API de Componentes
- [ADR-0010](0010-especializacao-de-componentes-por-intencao.md): Especialização de componentes por intenção, não por variante
- [ADR-0011](0011-mapas-de-variante-tipados.md): Mapas de variante tipados como mecanismo de variação visual
- [ADR-0012](0012-classname-como-unico-escape-hatch.md): `className` como único escape hatch de estilo
- [ADR-0013](0013-container-e-item-separados.md): Container e item como componentes separados, com estado na aplicação

### Acessibilidade
- [ADR-0014](0014-elemento-nativo-primeiro.md): Elemento nativo primeiro, customizado por exceção

### Qualidade e Verificação
- [ADR-0002](0002-typescript-strict-como-gate-de-qualidade.md): TypeScript strict como único gate automatizado de qualidade
- [ADR-0015](0015-storybook-como-ambiente-de-verificacao.md): Storybook como ambiente de desenvolvimento e verificação

### Segurança

Nenhum ADR. A biblioteca não coleta dados, não faz requisições de rede, não usa armazenamento do navegador e não tem dependências de runtime — não há superfície de segurança própria. Ver `docs/business-rules.md`, seção "Compliance e Regulamentações".

### Operações e Deploy

Nenhum ADR além de [ADR-0006](0006-distribuicao-por-workspace-local.md). Não há CI/CD, container ou infraestrutura neste repositório.

## Grafo de dependências entre decisões

Algumas decisões derivam de outras. Reabrir uma decisão de nível mais alto obriga a revisar as que dela dependem.

```
ADR-0004 (zero dependências de runtime)
   ├──► ADR-0003 (Tailwind)              rejeitou CSS-in-JS por causa do runtime
   │       └──► ADR-0009 (theme.extend)
   │       └──► ADR-0011 (mapas de variante)   rejeitou cva
   │               └──► ADR-0012 (className)   sem tailwind-merge, sobrescrita não garantida
   └──► ADR-0014 (nativo primeiro)        rejeitou Radix; o custo de a11y é nosso
           └──► ADR-0013 (container/item) sem Context de coordenação

ADR-0001 (React)  ──►  ADR-0005 (ESM-only)  ──►  ADR-0006 (workspace local)

ADR-0008 (transcrição manual)  ──►  ADR-0007 (duas camadas de token)

ADR-0002 (tsc como único gate)  ──►  ADR-0015 (Storybook verifica o resto)
```

Leitura prática: **[ADR-0004](0004-zero-dependencias-de-runtime.md) é a raiz.** Se a restrição de zero dependências for revista, ADR-0003, 0011, 0012, 0013 e 0014 mudam de contexto — várias das suas alternativas rejeitadas passam a estar disponíveis.

## Como Propor um Novo ADR

1. Copie [template.md](template.md).
2. Numere sequencialmente — o próximo é **0016**. Nunca reordene nem renumere.
3. Preencha todas as seções. As alternativas consideradas e as consequências **negativas** são as partes que dão valor ao documento; um ADR sem elas é só uma declaração.
4. Adicione a linha na tabela de decisões ativas e na categoria correspondente.
5. Atualize a tabela em [CLAUDE.md](../../CLAUDE.md).
6. Se a decisão substituir outra, marque a antiga como `Superseded por ADR-00XX` e mova-a para a tabela correspondente — **nunca delete um ADR**.

### O que merece um ADR

**Merece**: escolha de framework ou biblioteca de runtime; padrão arquitetural; estratégia de distribuição; formato de token; padrão de API de componente; decisão de acessibilidade estrutural; estratégia de verificação.

**Não merece**: convenção de nomenclatura; configuração de ferramenta; escolha de utilitário pequeno e reversível; decisão tática de implementação.

**Regra geral**: se reverter a decisão seria custoso ou obrigaria a mexer em muitos arquivos, provavelmente merece um ADR.

## Documentação Relacionada

| Documento | Conteúdo |
|---|---|
| [Visão Geral da Arquitetura](../architecture/system-overview.md) | Componentes, camadas, fluxo de dados, princípios |
| [Padrões de Comunicação](../architecture/communication-patterns.md) | Como as partes se comunicam: props, callbacks, contratos de build |
| [docs/stack.md](../../docs/stack.md) | Tecnologias e contrato do pacote, em detalhe |
| [docs/patterns.md](../../docs/patterns.md) | Padrões de código efetivamente presentes |
| [docs/business-rules.md](../../docs/business-rules.md) | Invariantes de comportamento (R1–R17) e de domínio (D1–D8) |
| [docs/best-practices/](../../docs/best-practices/) | Como escrever código novo, derivado destas decisões |
