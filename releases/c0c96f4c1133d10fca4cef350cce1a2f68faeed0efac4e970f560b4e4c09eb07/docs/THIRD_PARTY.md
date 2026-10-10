# Inventário de ativos e dependências

O jogo distribuído não incorpora bibliotecas, fontes, imagens, áudio ou serviços externos.

| Componente | Origem/autoria | Licença / condição |
| --- | --- | --- |
| Motor, interface, puzzles, CSS e SVG do submarino | Criados neste projeto com assistência de OpenAI Codex; revisão humana pendente conforme AI-USAGE.md | MIT, publicação autorizada pelo usuário |
| Tipografia | Fontes de sistema já disponíveis no dispositivo | Nenhum arquivo de fonte distribuído |
| Símbolos dos comandos | Caracteres Unicode renderizados pelo sistema | Nenhum pacote de ícones distribuído |
| Playwright | https://github.com/microsoft/playwright | Apache-2.0; ferramenta de teste, não incluída na build |
| Node.js | https://github.com/nodejs/node | Licenças do runtime; ferramenta de build/teste, não incluída na build |
| Python | https://www.python.org/ | PSF; ferramenta de empacotamento, não incluída na build |
| ReportLab | https://www.reportlab.com/ | BSD; ferramenta de geração do PDF, não incluída na build |

Não há marcas, personagens ou logotipos de terceiros, inclusive SENAI ou Framework. O jogador controla um submarino genérico desenhado em SVG no código. O SBOM local lista a aplicação sem dependências de runtime. A pipeline também executa npm sbom. Gitleaks 8.30.1 (MIT) é usado somente na CI para verificar segredos; o binário baixado é conferido por SHA-256 e não integra a distribuição.
