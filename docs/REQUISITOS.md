# Matriz de escopo e pendências

Referências: Avaliação.html e Regulamento-Framework-Arcade.pdf fornecidos pelo usuário. Esta matriz aplica os requisitos ao projeto; não realiza inscrição no concurso e não confirma submissão acadêmica.

| Requisito | Estado nesta entrega | Evidência / conclusão necessária |
| --- | --- | --- |
| Tema educação em tecnologia | IMPLEMENTADO | Puzzles de lógica, GDD e conteúdo JSON |
| Protótipo jogável | IMPLEMENTADO LOCALMENTE | dist/index.html e testes offline |
| GDD com premissa, gênero, mecânicas e referências | DOCUMENTADO | docs/gdd.md e output/pdf/GDD.pdf |
| GDD em Markdown e PDF pela pipeline | PARCIAL | Markdown/PDF locais; falta estágio no GitHub Actions |
| Wireframes de menu/HUD/fim | PREPARADOS | docs/wireframes.svg |
| Interface web desktop/mobile | IMPLEMENTADO E TESTADO EM CHROMIUM | Capturas e E2E; outros browsers requerem teste |
| Offline e ZIP <25 MB | VERIFICADO LOCALMENTE | 12 ZIPs, checksums e relatórios |
| Sem coleta de dados pessoais | IMPLEMENTADO | Sem rede/cadastro; progresso local apagável |
| Versão e commit SHA na build | PARCIAL | SemVer e hash local; SHA de commit pendente |
| Licenças, AI-USAGE e SBOM | PREPARADOS LOCALMENTE | Inventário, MIT proposta, SBOM sem dependências; aceite humano e execução de npm sbom futura |
| 15 unidade, 3 integração, cobertura >=70% core | TESTES PREPARADOS E EXECUTADOS | Relatórios locais; ainda integrar gate no PR |
| 2 E2E, regressão e smoke | PARCIAL | Regressão offline; smoke da URL/HML pendente |
| Bug real corrigido com regressão | PENDENTE | Bug intencional do puzzle não vale como bug real do software; registrar um defeito real quando observado |
| Equipe fixa, nome e RA | PARCIAL | 4 nomes/funções; RAs e data real de registro pendentes |
| Histórico, >=10 PRs e contribuição em >=3 integráveis/pessoa | ADIADO | Repositório ainda não criado; versões atribuídas não substituem participação |
| CI/GitHub Actions, lint, gitleaks, audit, Dependabot | ADIADO | Somente build, sintaxe e testes locais disponíveis |
| HML/PRD, artefato único, aprovação, GitHub Release | ADIADO | Criar e publicar depois, conforme pedido |
| Azul-verde/canário e rollback <5 min | ADIADO | Precisa de ambiente publicado e demonstração real |
| Sondas 15 min, 2 alertas, painel /status/, DORA | ADIADO | Verificação local não equivale a monitoramento remoto |
| Pitch <=90 s com gameplay real e legendas | PENDENTE | Roteiro preparado, gravação humana necessária |
| Relatório técnico PDF <=12 páginas | PENDENTE | Base de relatório Markdown; completar com evidências da esteira |
| Triagem integral e pacote submissao/ | PENDENTE | Triagem local não valida URL, vídeo, prazo ou dados acadêmicos |
| Ficha de entrega e banca | PENDENTE | Preencher formulário, apresentar e demonstrar esteira |
| Inscrição no concurso | OPCIONAL E NÃO REALIZADA | Elegibilidade, Instagram, Google Drive e aceite do regulamento |

## Restrições preservadas

Jogo estático, sem backend, serviço pago, contêiner, cadastro, marcas de terceiros ou imagens externas. MIT proposta e uso de IA explícito. Nenhum commit, contribuição, aprovação, teste remoto ou data histórica foi inventado. Os doze pacotes são locais.

## Datas documentais

Registro da equipe: 02/10/2026; prévia: 05/10/2026; entrega/banca: 09/10/2026, antes do início da aula conforme HTML. Concurso opcional: 21/10/2026 às 23h59 de Brasília conforme PDF fornecido. A geração dos arquivos não comprova cumprimento de prazo nem deve ser retrodatada. Sem consultar alterações externas do concurso nesta etapa.
