# Boas Práticas do Design System

Estes quatro guias definem **como escrever código novo** neste repositório. Os documentos em [../](../) descrevem o que existe hoje; estes descrevem o padrão a seguir.

| Guia | Quando ler |
|---|---|
| [tokens.md](tokens.md) | Antes de adicionar, alterar ou renomear qualquer token; antes de escrever um valor de cor ou tamanho em componente |
| [component-api.md](component-api.md) | Antes de criar um componente novo ou adicionar prop a um existente |
| [accessibility.md](accessibility.md) | Ao construir qualquer componente interativo — especialmente controles customizados |
| [contributing.md](contributing.md) | Antes de abrir PR; ao decidir se uma mudança é breaking |

---

## Os cinco princípios

Tudo nos guias deriva destes cinco. Em caso de dúvida sobre um caso não coberto, decida por eles.

### 1. O token é a única fonte de valor

Nenhum valor de cor, espaçamento, raio ou tipografia é escrito diretamente em componente. Se o valor não existe como token, a decisão é adicionar o token — não escrever o valor.

> Por quê: um hex escrito em componente é invisível para o design. Ele não aparece no Figma, não é auditável e não muda quando a paleta muda.

### 2. O componente possui sua superfície, não seu contexto

Dimensão interna, cor, raio, tipografia e estados pertencem ao componente. Margem, posição, largura de contexto e z-index pertencem ao layout que o contém.

> Por quê: um componente que carrega margem própria força toda aplicação a lutar contra ela. Ver [R14](../business-rules.md#r14--superfície-do-controle-é-fornecida-pela-biblioteca-posicionamento-pela-aplicação).

### 3. A intenção fica visível no ponto de uso

Uma ação destrutiva é `<DangerButton>`, não `<Button variant="danger">`. Quem lê a tela de chamada entende a intenção sem abrir a definição do componente.

> Por quê: é a decisão arquitetural que dá nome a este sistema. Ver [D3](../business-rules.md#d3--especialização-por-intenção-não-por-variante). O custo aceito é duplicação de classes base entre componentes irmãos.

### 4. Acessibilidade é requisito, não melhoria

Um componente sem nome acessível, sem foco visível ou sem suporte a teclado está incompleto — não "pendente de melhoria".

> Por quê: sem dependências de terceiros (Radix, Headless UI), nada resolve isso por nós. Ver [accessibility.md](accessibility.md).

### 5. O tipo é o contrato; o resto é revisão

`Record<Variant, string>` garante que o mapa cubra a união. Nada garante que a string de classe esteja correta. Onde o tipo não alcança, a garantia é o checklist de PR.

> Por quê: conhecer a fronteira entre o que `tsc` pega e o que não pega evita falsa confiança. Ver [contributing.md](contributing.md#o-que-o-tsc-não-pega).

---

## Referência rápida

**Adicionando um componente**

```
src/components/<categoria>/<Nome>/
├── <Nome>.tsx           # implementação
├── <Nome>.stories.tsx   # variantes, tamanhos, estados
└── index.ts             # export { Nome }; export type { NomeProps }
```

Depois: registrar em `src/components/<categoria>/index.ts`.

**Ordem canônica do array de classes**

```
estrutura → transição → foco → disabled → variante → tamanho → className
```

**Checklist mínimo antes do PR**

- [ ] Nenhum valor literal onde existe token
- [ ] `disabled` tratado (visual + interação)
- [ ] Foco visível
- [ ] Nome acessível em controle sem texto
- [ ] `type="button"` em botão que não é submit
- [ ] Story cobrindo variantes, tamanhos e estados
- [ ] `npm run build` passa
- [ ] `className` aceito e concatenado por último

Checklist completo em [contributing.md](contributing.md#checklist-de-pr).
