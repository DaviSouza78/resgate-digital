# Matriz de escopo e pendências

Referências: Avaliação.html e Regulamento-Framework-Arcade.pdf fornecidos pelo usuário. Esta matriz aplica os requisitos ao projeto; não realiza inscrição no concurso e não confirma submissão acadêmica.

| Requisito | Estado nesta entrega | Evidência / conclusão necessária |
| --- | --- | --- |
| Tema educação em tecnologia | IMPLEMENTADO | Puzzles de lógica, GDD e conteúdo JSON |
| Protótipo jogável | IMPLEMENTADO LOCAL E WEB | dist/index.html e testes offline |
| GDD com premissa, gênero, mecânicas e referências | DOCUMENTADO | docs/gdd.md e output/pdf/GDD.pdf |
| GDD em Markdown e PDF pela pipeline | IMPLEMENTADO | Markdown/PDF gerados na pipeline |
| Wireframes de menu/HUD/fim | PREPARADOS | docs/wireframes.svg |
| Interface web desktop/mobile | IMPLEMENTADO E TESTADO EM CHROMIUM | Capturas e E2E; outros browsers requerem teste |
| Offline e ZIP <25 MB | VERIFICADO LOCALMENTE | 12 ZIPs, checksums e relatórios |
| Sem coleta de dados pessoais | IMPLEMENTADO | Sem rede/cadastro; progresso local apagável |
| Versão e commit SHA na build | IMPLEMENTADO | SemVer, SHA Git e SHA-256 do artefato |
| Licenças, AI-USAGE e SBOM | IMPLEMENTADO | Inventário, MIT, SBOM local e npm sbom na CI; revisão humana pendente |
| 15 unidade, 3 integração, cobertura >=70% core | TESTES PREPARADOS E EXECUTADOS | Relatórios locais e gate de CI |
| 2 E2E, regressão e smoke | PARCIAL | E2E offline/HTTP e smoke HML/produção aprovados no primeiro ciclo |
| Bug real corrigido com regressão | DOCUMENTADO E TESTADO | Sessão em release revogada após rollback; docs/REGRESSAO.md e tests/loader.test.cjs |
| Equipe fixa, nome e RA | PARCIAL | 4 nomes, funções e RAs preenchidos; data de registro acadêmico e aceite humanos pendentes |
| Histórico, >=10 PRs e contribuição em >=3 integráveis/pessoa | PARCIAL | Repositório e 12 commits reais; PRs revisados e participação humana pendentes |
| CI/GitHub Actions, lint, gitleaks, audit, Dependabot | IMPLEMENTADO | Pipeline de testes/cobertura/sintaxe, Gitleaks e audit; Dependabot configurado |
| HML/PRD, artefato único, aprovação, GitHub Release | PARCIAL | HML/PRD publicados; job de 12 releases implementado; aprovação futura via ambiente |
| Azul-verde/canário e rollback <5 min | PARCIAL | Azul-verde e rollback implementados; falta demonstração cronometrada |
| Sondas 15 min, 2 alertas, painel /status/, DORA | IMPLEMENTADO; VALIDAR EXECUÇÃO | Workflow monitor.yml; métricas sem amostra ficam não medidas; agenda GitHub pode atrasar |
| Pitch <=90 s com gameplay real e legendas | PREPARADO E VERIFICADO LOCALMENTE | MP4 de gameplay real automatizado com IA, 70,92 s e legendas; validar artefato CI |
| Relatório técnico PDF <=12 páginas | PREPARADO | PDF gerado por script com quatro páginas, evidências e limites humanos explícitos |
| Triagem integral e pacote submissao/ | PRÉVIA PREPARADA | scripts/submission.py valida pacote; --strict exige evidências públicas e humanas e prazo |
| Ficha de entrega e banca | PENDENTE | Preencher formulário, apresentar e demonstrar esteira |
| Inscrição no concurso | OPCIONAL E NÃO REALIZADA | Elegibilidade, Instagram, Google Drive e aceite do regulamento |

## Restrições preservadas

Jogo estático, sem backend, serviço pago, contêiner, cadastro, marcas de terceiros ou imagens externas. MIT e uso de IA explícito. Nenhum commit, contribuição, aprovação, teste remoto ou data histórica foi inventado. Os doze pacotes funcionam offline e integram o site.

## Datas documentais

Registro da equipe: 02/10/2026; prévia: 05/10/2026; entrega/banca: 09/10/2026, antes do início da aula conforme HTML. Concurso opcional: 21/10/2026 às 23h59 de Brasília conforme PDF fornecido. A geração dos arquivos não comprova cumprimento de prazo nem deve ser retrodatada. Sem consultar alterações externas do concurso nesta etapa.
