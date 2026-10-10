# Resgate Digital

Puzzle educativo simples: programe um submarino para resgatar estações de conhecimento. Cinco fases ensinam sequência, direção, repetição, depuração e condição.

Site: https://davisouza78.github.io/resgate-digital/

Repositório: https://github.com/DaviSouza78/resgate-digital

## Jogar offline

Baixe o ZIP no site, extraia todos os arquivos e abra index.html no navegador. Não exige instalação, servidor ou executável .exe. Todos os pacotes estão abaixo de 25 MB. Há tentativas ilimitadas, dicas, velocidade ajustável e progresso local apagável.

## Equipe e versões

Doze etapas cumulativas, com uma função fixa e três commits de versão por integrante. Consulte SQUAD.md, docs/VERSOES.md e docs/COMMITS.md. Os e-mails foram fornecidos pelo usuário. Código, snapshots e commits preparados com IA; revisão e participação humanas não são presumidas. Essas etapas não substituem os PRs revisados e contribuições em três integráveis exigidos pela avaliação.

## Build e validação

Node.js >=22, Python 3 com ReportLab e Playwright como ferramenta de teste. O jogo não tem dependências de runtime.

```text
npm ci
npm run test:coverage
python scripts/gdd_pdf.py
npm run build
python scripts/package.py
npm run triagem
npm run build:site
python scripts/package-site.py
npm run preview
npm run test:site
```

RESGATE_DIGITAL_PLAYWRIGHT_PATH aponta ao módulo instalado separadamente; RESGATE_DIGITAL_BROWSER_PATH pode apontar ao Chrome. npm run test:e2e testa o jogo offline. Relatórios, capturas, cobertura, JUnit, GDD e pacotes ficam em output/.

A pipeline esteira.yml gera o artefato uma vez, publica /hml/, verifica por HTTP e promove o mesmo conteúdo para /releases/<sha256>/. version.json registra também o SHA Git. A raiz usa rollout.json; rollback.yml troca a versão estável sem recompilar. monitor.yml registra sondas e alertas; /status/ apresenta métricas observadas. Consulte docs/SITE.md.

## Escopo acadêmico

O primeiro ciclo remoto de CI, homologação e produção foi aprovado. docs/REQUISITOS.md distingue implementação de evidência acadêmica: RAs, revisão humana, dez PRs revisados, contribuições em integráveis, vídeo real, relatório final, banca e confirmação de prazos continuam pendentes. Não apresentar esta entrega como aprovação integral do trabalho.

Licença MIT, inventário THIRD_PARTY.md e declaração AI-USAGE.md. Sem cadastro, analytics, cookies próprios ou ativos externos. A hospedagem processa requisições conforme as políticas do GitHub.
