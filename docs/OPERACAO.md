# Verificação e entrega

O projeto mantém doze etapas por integrante e função em SQUAD.md. Atualizações operacionais preparadas com IA usam autoria de automação; não acrescentam contribuição humana fictícia.

1. Instale Node 24, Python 3, Git e FFmpeg. Rode npm ci; instale reportlab==4.4.10 e pypdf==6.10.0. Instale Playwright 1.62.1 separadamente e seu Chromium.
2. Rode npm run lint e npm run test:coverage. Gere os GDDs com python scripts/gdd_pdf.py. npm run test:reproducible executa duas builds e compara doze checksums.
3. Rode npm run test:e2e; node scripts/pitch.cjs grava gameplay real com legendas e exporta MP4. node scripts/dora-report.cjs coleta evidência pública. python scripts/report_pdf.py gera relatório limitado a doze páginas.
4. npm run build:site e python scripts/package-site.py preparam o artefato único. Rode npm run preview e npm run test:site para verificar links, jogo, celular e homologação.
5. python scripts/submission.py gera uma prévia com manifesto, PDF, vídeo, ZIP e URL. A prévia não declara aprovação integral. A pipeline arquiva a mesma preparação.
6. Revisem e integrem os PRs na ordem indicada em docs/PRS.md. Outra pessoa deve revisar cada PR. CI verde e uma aprovação são obrigatórios. Não desabilitar a proteção da main. Cada integrante confirma suas contribuições em human-contributions.json, sem preencher participação fictícia.
7. Após os merges, aprovem o ambiente producao. Executem os workflows Exercício controlado dos alertas e Demonstração pública de rollback. Este último troca duas releases válidas, mede recuperação por sondas e restaura a original. Requer aprovação de produção.
8. Disparem Triagem final de submissão informando os três IDs dos workflows aprovados. O pacote final só passa com acesso público, revisões e contribuição humanas comprovadas, exercícios aprovados e prazo válido. O horário informado pelo usuário é 09/10/2026 às 23:59 (-03:00); aceite acadêmico deve ser confirmado.

Os RAs foram informados pelo usuário. A inscrição acadêmica, aceite do regulamento e apresentação em banca são atos da equipe. O vídeo demonstra jogo real por automação e não atribui voz ou fala aos integrantes. O relatório contém retrospectiva técnica da preparação assistida por IA; a equipe complementa sua experiência pessoal.

As tags v0.1.0 a v1.0.0 preservam as doze etapas individuais. A entrega operacional corrigida recebe uma tag anotada v1.0.0+ci.<SHA>, com buildVersion no version.json e ativos gerados pela pipeline a partir do mesmo artefato promovido. Isso preserva o histórico das etapas e publica o pacote atual, GDD, SBOM, relatório e vídeo, sem atribuir uma quarta versão a um integrante. Não sobrescrever os ativos históricos para ocultar diferenças de preparação.

Variáveis opcionais de runtime local: RD_NODE_PATH, RD_PYTHON_PATH, RD_GIT_PATH, RD_FFMPEG_PATH, RESGATE_DIGITAL_PLAYWRIGHT_PATH e RESGATE_DIGITAL_BROWSER_PATH. Na CI, os executáveis estão no PATH. Tokens só são lidos do ambiente da sessão; nunca colocar credenciais em arquivos ou comandos de publicação.
