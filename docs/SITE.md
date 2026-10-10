# Site estático Resgate Digital

Repositório: https://github.com/DaviSouza78/resgate-digital

Endereço de produção: https://davisouza78.github.io/resgate-digital/

## Estrutura exigida pela avaliação

`site/index.html` é o carregador que lê `rollout.json`, preserva a versão durante a sessão e encaminha para `/releases/<hash>/index.html`. O artefato contém a apresentação do projeto, jogo em `/jogo/`, GDD, política de privacidade, doze versões e downloads offline. Os caminhos são relativos e foram testados sob o prefixo `/resgate-digital/` do GitHub Pages.

`/hml/` contém o mesmo artefato usado em produção. As releases são preservadas, identificadas pelo SHA-256 do conteúdo; esse identificador é separado do SHA Git registrado em version.json. `/status/` informa disponibilidade, latência, versão, canário e métricas DORA a partir de dados observados; métricas sem dados são apresentadas como não medidas.

## Build e publicação

```text
npm ci
python scripts/gdd_pdf.py
npm run build
python scripts/package.py
npm run build:site
python scripts/package-site.py
npm run preview
```

Fontes: site-src/. Resultado gerado: site/ (ignorado pelo Git). A branch gh-pages recebe os arquivos exclusivamente pelo workflow .github/workflows/esteira.yml. O job ci constrói o artefato uma vez e executa os testes; deploy-hml publica e verifica o jogo por HTTP; deploy-prd promove o mesmo artefato por azul-verde e executa smoke, revertendo se houver falha. rollback.yml permite rollback manual pela pipeline sem recompilar.

O primeiro ciclo de CI/HML/PRD foi aprovado. A publicação inicial foi autorizada pelo usuário; a aprovação para futuras promoções pode ser configurada no ambiente producao. monitor.yml usa sondas de 15 minutos, armazenamento CSV em observabilidade e Issues de alerta. Rollback cronometrado, alertas sob falha real, revisões humanas e entrega acadêmica requerem evidências próprias.

## Privacidade e segurança

Sem cadastro, ads, analytics ou recursos externos de runtime. Apenas progresso local. O GitHub Pages processa requisições de hospedagem conforme suas políticas. O token fornecido pelo usuário é usado apenas em memória para autenticação e não entra no Git, nos artefatos ou no site. Os workflows usam GITHUB_TOKEN.

## Responsáveis

Davi: plataforma, build, releases e publicação. Lucas: conteúdo, premissa e apresentação pedagógica. Miguel: motor e verificação do jogo/site. Lucca: integridade, privacidade, licenças e observabilidade. As doze etapas têm autores nominais designados conforme contributors.json, com três commits de versão por pessoa; conferir docs/COMMITS.md após registro. A autoria nominal não é prova de trabalho humano sem IA ou de revisão acadêmica.
