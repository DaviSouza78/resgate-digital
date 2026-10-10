# Resgate Digital

Protótipo simples de programação por comandos. O jogador controla um submarino que recupera estações de conhecimento: o jogador organiza instruções e observa sua execução em uma grade 2D.

## Jogar agora, sem internet

Abra `dist/index.html` no navegador. Alternativamente, extraia **todos** os arquivos de `output/build.zip` e abra `index.html`. Não abra o HTML ainda dentro do visualizador do ZIP. Nenhum servidor é necessário.

Há cinco fases curtas: sequência, direção, repetição, depuração e condição. Comandos: avançar, esquerda, direita, repetir de 2 a 4 avanços, e "se obstáculo: esquerda; senão: avançar". Vitória: alcançar a estação. Derrota: colisão ou fim dos comandos antes do objetivo. Tentativas ilimitadas, dicas e execução lenta. Progresso salvo apenas neste navegador, com botão para apagar.

## As 12 versões

Consulte `docs/VERSOES.md`. Cada pasta `output/versoes/vX.Y.Z/` tem um jogo local cumulativo, e cada ZIP em `output/pacotes/` é independente. São **três etapas por pessoa**, com função fixa alinhada ao trabalho. Essas etapas não constituem commits humanos ou releases no GitHub.

## Construir e verificar

Node.js 22 ou posterior e Python 3. O runtime do jogo não tem dependências.

```text
npm ci
npm test
npm run test:coverage
npm run build
python scripts/package.py
npm run triagem
```

O PDF do GDD é gerado antes do build por `python scripts/gdd_pdf.py` (exige ReportLab); ele será integrado à futura pipeline. Para o teste de navegador, disponibilize Playwright por `RESGATE_DIGITAL_PLAYWRIGHT_PATH` ou instale-o em um ambiente de ferramentas separado e rode `npm run test:e2e`. A variável deve apontar ao módulo Playwright; o navegador Chromium também deve estar instalado no ambiente dessa ferramenta. Nenhum desses recursos entra no jogo.

Se usar Chrome já instalado em vez do Chromium gerenciado por Playwright, informe o caminho do executável em `RESGATE_DIGITAL_BROWSER_PATH`.

Relatórios em `output/relatorios/`: JUnit, cobertura, E2E, build, pacotes e triagem local. O build valida conteúdo, soluções e sintaxe JavaScript. O empacotamento usa ZIP com timestamps fixos. Para reproduzir o pacote byte a byte, use o mesmo código, PDF e valor de `SOURCE_DATE_EPOCH`.

## Escopo e limitações

Esta entrega implementa o **jogo local**, sua documentação e verificação. A criação do repositório e a publicação do site foram adiadas a pedido do usuário. Não há GitHub Actions, site público, PRs, aprovação de produção, ambientes HML/PRD, monitoramento remoto, métricas DORA, vídeo real ou demonstração de rollback. Consulte `docs/REQUISITOS.md`: não apresentar a triagem local como aprovação integral da avaliação.

O campo `commit` de version.json é nulo enquanto não houver repositório; `sourceHash` verifica o conteúdo local e não substitui SHA de commit. A licença MIT é proposta, a confirmar pela equipe. RAs e aceite real ainda pendentes.

## Git futuro

Estratégia proposta: GitHub Flow, `main` protegida, branches `feature/*` curtas, uma revisão por outra pessoa e CI aprovado antes do merge. Conventional Commits e tags anotadas. Preservar o histórico real; não retroagir datas nem fabricar participação. O versionamento local de doze etapas não substitui a tag de prévia nem o registro histórico exigido pelo professor.

## Privacidade

Nenhum dado identificável é solicitado, nenhum servidor é contatado e não existe telemetria. Apenas um mapa `{fase: estrelas}` é salvo no localStorage a partir de v0.8.0; se o navegador bloquear o armazenamento, o jogo continua sem persistência. Não há cookies, ranking ou fontes remotas.
