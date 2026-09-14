# 6. Distribuição por workspace local, com pacote privado

Data: 2026-07-07

## Status

Ativa

## Contexto

O design system precisa chegar às aplicações consumidoras. As opções de distribuição diferem em custo de infraestrutura, velocidade do ciclo de iteração e rigor de versionamento.

No estágio atual, o design system e as aplicações consumidoras evoluem juntos: um componente é criado porque uma aplicação precisa dele, e a API se ajusta durante essa integração. Um ciclo de publicação que exija versionar, publicar e reinstalar a cada ajuste tornaria essa iteração lenta a ponto de desencorajar o uso da biblioteca.

## Decisão

Vamos distribuir o pacote como **`"private": true`, consumido por workspace npm ou dependência `file:`**, sem publicação em registry.

```json
{ "name": "@ds/core", "version": "0.0.1", "private": true }
```

```json
// na aplicação consumidora
{ "dependencies": { "@ds/core": "file:../design_system" } }
```

O `dist/` é ignorado pelo git e gerado localmente com `npm run build`. Publicar, neste modelo, significa **reconstruir**.

## Alternativas Consideradas

### Alternativa 1: Publicar em registry privado (npm privado, GitHub Packages, Artifactory)

**Descrição**: Versionar e publicar; consumidores instalam por versão.

**Prós**:
- Versionamento rigoroso — cada consumidor fixa a versão que usa
- Consumidores atualizam quando querem, não quando o disco muda
- Histórico de versões auditável
- Modelo padrão da indústria para bibliotecas compartilhadas

**Contras**:
- Exige infraestrutura: registry, credenciais, pipeline de publicação
- Cada iteração vira ciclo de versionar → publicar → reinstalar
- Durante desenvolvimento acoplado, o ciclo é lento o bastante para desencorajar mudanças na biblioteca
- Requer CI, que não existe no projeto

**Razão para rejeição**: O custo de infraestrutura e a lentidão do ciclo não se justificam enquanto biblioteca e consumidores evoluem juntos. É a direção natural quando o design system estabilizar.

### Alternativa 2: Monorepo com ferramenta dedicada (Turborepo, Nx, pnpm workspaces)

**Descrição**: Orquestrador de monorepo com cache de build e grafo de dependências.

**Prós**:
- Build incremental com cache — resolve o problema de esquecer de reconstruir
- Watch cruzado: mudança na biblioteca reflete na aplicação sem passo manual
- Orquestração de tarefas entre pacotes

**Contras**:
- Camada de ferramenta e configuração a mais
- O repositório do design system é independente hoje, não parte de um monorepo estruturado
- Benefício proporcional ao número de pacotes; com dois ou três, é pequeno

**Razão para rejeição**: A ferramenta resolveria a principal dor deste modelo (o passo manual de rebuild), mas exige reestruturar os repositórios num monorepo — decisão maior do que a de distribuição.

### Alternativa 3: Git submodule ou dependência git

**Descrição**: `"@ds/core": "git+ssh://..."` apontando para um commit ou tag.

**Prós**:
- Versionamento por commit sem registry
- Não exige infraestrutura

**Contras**:
- Exige que o `dist/` seja commitado, ou um passo de build no `postinstall`
- Submodules são notoriamente difíceis de operar
- Ciclo de iteração ainda envolve commit e push

**Razão para rejeição**: Combina o atrito da publicação com a fragilidade do versionamento por commit. Nem rápido nem rigoroso.

## Consequências

### Positivas

- Zero infraestrutura: sem registry, credenciais ou CI
- Ciclo de iteração curto — `npm run build` e a mudança está disponível
- Mudanças na API podem ser validadas na aplicação real antes de estabilizar
- Sem risco de publicar acidentalmente (`private: true` faz o `npm publish` falhar)

### Negativas

- **Não há versionamento efetivo.** Todos os consumidores usam sempre o estado do disco; não existe "ficar numa versão anterior" nem rollback
- **O rebuild é manual e fácil de esquecer.** Não há watch cruzado. O sintoma — "a mudança não aparece" — é confuso e recorrente
- **Uma mudança breaking atinge todos os consumidores simultaneamente**, sem período de migração
- Requer que o design system esteja presente no sistema de arquivos, em caminho relativo previsível
- Sem histórico de versões; combinado com a ausência de git no repositório, não há registro de evolução além destes ADRs
- Consumidor precisa rodar `npm install` no design system também

### Neutras

- A disciplina de `major`/`minor`/`patch` permanece necessária como **comunicação**, mesmo sem publicação — está documentada em `docs/best-practices/contributing.md`
- `dist/` no `.gitignore` significa que um clone novo não funciona até o primeiro build
- Se a aplicação também usa Tailwind, precisa estender a própria config com os tokens — o `content` da biblioteca cobre apenas o próprio `src/` ([ADR-0003](0003-tailwind-como-unica-camada-de-estilo.md))

## Trade-offs

Priorizamos **velocidade de iteração e ausência de infraestrutura** sobre **rigor de versionamento e isolamento entre consumidores**. Aceitamos que não exista rollback e que mudanças breaking se propaguem de imediato — o que só é sustentável enquanto o número de consumidores é pequeno e as equipes são próximas.

## Notas de Implementação

Fluxo de sincronização:

```bash
cd design_system && npm run build   # regenera dist/
# na aplicação: reiniciar o dev server ou reinstalar
```

Contrato de consumo completo, incluindo a tabela de sintomas de falha, em `docs/integrations.md`.

## Validação

A decisão é bem-sucedida se:

- O ciclo "mudar componente → ver na aplicação" permanecer abaixo de um minuto
- Nenhuma mudança breaking pegar um consumidor de surpresa (comunicação funcionando)

O sinal de que a decisão deixou de valer: um terceiro consumidor entrar, ou uma equipe externa passar a depender do pacote. Nesse ponto, a ausência de versionamento deixa de ser aceitável.

## Revisão

**2026-07-07**: Decisão inicial. Migrar para registry privado quando (a) houver consumidor mantido por outra equipe, ou (b) a necessidade de fixar versão aparecer.
