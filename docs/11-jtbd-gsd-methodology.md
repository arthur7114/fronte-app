# Metodologia JTBD + GSD

## Objetivo

Este documento define como o produto deve ser desenvolvido daqui para frente.

A metodologia combina:

- `JTBD` para decidir o que importa para o usuario
- `GSD` para transformar decisao em entrega pequena, verificavel e documentada

Use este documento sempre que for planejar, implementar ou retomar uma tarefa.

---

## Principio central

Cada entrega deve responder duas perguntas:

1. Qual job real o usuario esta tentando resolver?
2. Qual menor entrega util move esse job para frente agora?

Se uma tarefa nao conecta com um job claro, ela deve ser adiada, reduzida ou reescrita.

---

## Formula JTBD

Use este formato para qualquer feature:

```text
Quando [situacao],
eu quero [motivacao ou acao],
para conseguir [resultado esperado].
```

Exemplo:

```text
Quando estou criando minha presenca organica do zero,
eu quero responder perguntas simples sobre meu negocio,
para receber uma estrategia inicial sem depender de um especialista.
```

---

## Loop GSD

Cada ciclo de trabalho deve seguir esta ordem:

1. Ler `AGENTS.md`
2. Ler `docs/README.md`
3. Ler `docs/12-execution-roadmap.md`
4. Identificar a fase atual e o proximo passo
5. Carregar apenas os docs numerados relevantes
6. Definir o job do usuario
7. Implementar a menor entrega verificavel
8. Validar
9. Atualizar docs afetados
10. Atualizar o progresso em `docs/12-execution-roadmap.md`

---

## Tamanho ideal de entrega

Uma entrega boa deve ser pequena o suficiente para:

- caber em um ciclo claro de implementacao
- ter criterio de aceite objetivo
- deixar o produto mais utilizavel
- poder ser validada sem depender de uma grande cadeia de trabalho futura

Evite tarefas como "implementar analytics inteiro".

Prefira tarefas como "registrar clique em CTA e exibir contagem basica por artigo".

---

## Definicao de pronto

Uma etapa so esta pronta quando:

- o comportamento principal foi implementado
- os estados vazios, erro e carregamento foram considerados quando aplicavel
- a validacao adequada foi executada
- os docs relevantes foram atualizados
- `docs/12-execution-roadmap.md` registra o que foi feito e qual e o proximo passo

---

## Comandos de conversa

Use estes comandos simples com a IA:

```text
Continue de onde parou.
```

Retoma a partir do ponteiro atual em `docs/12-execution-roadmap.md`.

```text
Vamos para o proximo passo.
```

Fecha a etapa atual se estiver validada e inicia a proxima.

```text
Planeje a proxima entrega pelo metodo JTBD + GSD.
```

Cria ou revisa o recorte da proxima entrega antes de codar.

```text
Atualize o roadmap com o que acabamos de concluir.
```

Atualiza progresso, decisoes e proximo passo sem implementar codigo.

---

## Regra de memoria do projeto

O estado do projeto nao deve depender da memoria da conversa.

Ao final de cada ciclo, salve:

- fase atual
- tarefa concluida
- arquivos alterados
- validacoes feitas
- decisoes tomadas
- proximo passo recomendado

O lugar oficial para isso e `docs/12-execution-roadmap.md`.
