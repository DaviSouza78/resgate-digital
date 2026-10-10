# Relatório técnico — base para conclusão futura

Este arquivo não é o relatório final da avaliação. Completar após a esteira estar publicada e converter em PDF de até 12 páginas.

## Problema e solução

Contato inicial com lógica de programação através de cinco puzzles locais. Evita backend, contas, multiplayer e assets pesados para manter o escopo simples.

## Arquitetura

Motor puro em src/core/engine.js; conteúdo em content/levels.json; interface em web/; build em scripts/; doze etapas em versions.json. O build gera dados JavaScript locais para funcionar com file:// sem fetch. JSON é mantido como fonte e artefato. Programas são interpretados por operações permitidas, sem eval.

## Alternativas

Canvas/Phaser: dispensados para reduzir dependências e melhorar uso de controles nativos. Backend/ranking: dispensados por complexidade e privacidade. Exportação Godot: dispensada por tamanho e toolchain. A biblioteca padrão de testes Node foi escolhida como equivalente local a Vitest/Jest; o HTML aceita equivalentes se justificados. O professor deve avaliar a justificativa quando a pipeline for implementada.

## Evidências locais

Consultar output/relatorios/: JUnit, cobertura, E2E offline, capturas desktop/mobile, metadados, pacotes e triagem. Hash do conteúdo não equivale ao SHA Git. SBOM local sem bibliotecas de runtime não substitui execução de npm sbom na futura esteira.

## Evidências pendentes

Links de PR, clone limpo remoto, CI verde, HML/E2E, produção/smoke, aprovação, releases, canário/azul-verde, rollback cronometrado, alertas reais, painel, quatro métricas DORA, comparação com lead time de 11 dias e melhoria mensurada. Registrar bug REAL capturado e corrigido com teste; o erro pedagógico da fase 4 é intencional e não conta.

## Retrospectiva e contribuição

Preencher por humanos: testes com usuários, resultados, aprendizados, dificuldades, revisões de IA, PRs de cada pessoa em pelo menos três integráveis e participação na banca. Não atribuir implementação humana automaticamente a partir do responsável de uma versão.
