"""Relatorio tecnico gerado com evidencias verificaveis, sem presumir revisoes humanas."""
from pathlib import Path
from xml.sax.saxutils import escape
import json
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
out = root / 'output'
styles = getSampleStyleSheet()
styles['BodyText'].fontSize = 10
styles['BodyText'].leading = 15
story = []
def heading(text): story.append(Paragraph(escape(text), styles['Heading1']))
def paragraph(text):
    story.append(Paragraph(escape(text), styles['BodyText']))
    story.append(Spacer(1, 12))
def evidence(name):
    p = out / 'relatorios' / name
    return json.loads(p.read_text('utf-8')) if p.exists() else None
def page(): story.append(PageBreak())
heading('Resgate Digital — Relatório técnico')
paragraph('Versão 1.0.0. Preparação assistida por IA. Este documento distingue implementação, execução local, evidência pública e participação humana. Fonte primária das evidências: relatórios JSON gerados pelos scripts e execuções do GitHub Actions; nenhum resultado pendente é apresentado como realizado.')
heading('1. Proposta, escopo e decisões')
paragraph('Puzzle educativo de programação para iniciantes: controlar um submarino e resgatar alvos em cinco missões. Sequência, direção, repetição, depuração e condição compõem a progressão. Tentativas ilimitadas, dicas, estrelas e pontos oferecem feedback. Jogo em HTML/CSS/JavaScript sem dependências de produção, cadastro ou rede. O ZIP abre index.html em navegador; não exige executável Windows.')
paragraph('Escolhemos comandos visuais e tabuleiro pequeno para reduzir complexidade, manter acesso em celular e computador e permitir testes determinísticos do motor. Código UMD permite execução no navegador offline e testes Node. Separação: src/core para regras, content para missões, web para apresentação, src/ops e scripts para operação. localStorage guarda apenas progresso no dispositivo e oferece exclusão.')
heading('2. Equipe e contribuição individual')
members = json.loads((root/'contributors.json').read_text('utf-8'))['contributors']
rows = [[Paragraph('Integrante / RA', styles['BodyText']), Paragraph('Função', styles['BodyText'])]]
for m in members: rows.append([Paragraph(escape(m['name']+' / '+m.get('ra','PENDENTE')),styles['BodyText']),Paragraph(escape(m['role']),styles['BodyText'])])
t=Table(rows,colWidths=[285,222]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#e0f2ef')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.3,HexColor('#a5bab7')),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8)]));story.append(t)
paragraph('SQUAD.md define uma função por pessoa e três etapas por responsável. Há doze snapshots cumulativos. A atribuição nominal de commits foi autorizada pelo usuário, e a preparação com IA está em AI-USAGE.md. Essa atribuição não comprova participação humana em três integráveis. Contribuições, revisões por outra pessoa e retrospectiva pessoal devem ser confirmadas pelos integrantes, conforme docs/CONTRIBUICOES.md.')
page()
heading('3. Qualidade e regressões')
coverage=evidence('cobertura.json')
paragraph('Cobertura local do motor: '+(f"{coverage['lines']}% linhas; {coverage['branches']}% ramos; {coverage['functions']}% funções. Limite exigido: 70%." if coverage else 'ainda não executada nesta preparação.'))
paragraph('Unidade cobre movimentos, colisões, limites, energia, orientação, repetição e condições. Integração valida conteúdo e soluções, loader e publicação. E2E exercita vitórias nas cinco missões, todas as versões, reinício durante execução, celular, funcionamento offline e limpeza dos dados. Falha no CI impede merge da main protegida.')
paragraph('Bug real registrado em docs/REGRESSAO.md: reutilização do diretório Git de publicação falhava ao adicionar origin novamente, afetando rollback no mesmo job. A correção reutiliza a configuração existente; teste cria remoto Git temporário e publica mais de uma vez. Outra regressão cobre sessão com release revogada para migrar o jogador à estável. Evidências são os testes, não uma alegação de indisponibilidade pública.')
heading('4. Segurança e autoria')
paragraph('Gitleaks examina o histórico completo e oculta segredos em logs. npm audit bloqueia vulnerabilidade crítica de produção. Dependabot verifica dependências e Actions; SBOM CycloneDX inventaria componentes. LICENSE, THIRD_PARTY.md e AI-USAGE.md identificam licença e assistência de IA. O jogo não coleta nome, e-mail nem dados sensíveis. Credencial GitHub não integra código, ZIP ou site. Testes de alertas são explicitamente rotulados como exercício.')
heading('5. Build e release')
repro=evidence('reprodutibilidade.json')
paragraph('Reprodutibilidade: '+('duas execuções comparadas; consulte output/relatorios/reprodutibilidade.json para hashes e resultado.' if repro else 'script implementado; execução ainda pendente.'))
paragraph('SOURCE_DATE_EPOCH fixa a data no commit; PDFs usam geração determinística e ZIPs usam ordem e timestamps fixos. version.json registra versão, commit do build e commit da etapa. Há checksums SHA-256, GDD por versão e doze ZIPs abaixo de 25 MB. Tags anotadas identificam as etapas históricas; novas alterações operacionais não reescrevem essa autoria nem a data dos commits.')
page()
heading('6. Esteira, promoção e recuperação')
paragraph('Push e PR acionam instalação, lint, testes/cobertura, segurança, geração dos PDFs, build e empacotamento. Homologação recebe o artefato aprovado e roda E2E. Produção exige aprovação do ambiente e promove o mesmo artefato. Releases são preservadas por hash; azul-verde troca o ponteiro. Smoke falho aciona rollback automático; workflow manual permite recuperação controlada.')
rollback=evidence('rollback-publico.json')
paragraph('Exercício público de rollback: '+(json.dumps(rollback,ensure_ascii=False)[:1400] if rollback else 'workflow preparado, mas execução e tempo de recuperação ainda pendentes. Não há comprovação de menos de cinco minutos até sua execução.'))
heading('7. Observabilidade e DORA')
dora=evidence('dora-melhoria.json')
if dora:
    paragraph('Métricas observadas no painel público: '+json.dumps(dora.get('dora',{}),ensure_ascii=False))
    paragraph('Ciclos de homologação: '+json.dumps(dora.get('cycles',[]),ensure_ascii=False))
    paragraph(dora['method']+' Decisão: '+dora['decision'])
else: paragraph('Coleta pública de DORA ainda pendente nesta preparação.')
paragraph('Cron executa sondas a cada 15 minutos; o agendador GitHub pode atrasar. Produção e homologação registram HTTP, latência, versão e commit. HTTP diferente de 200 ou latência maior que dois segundos abre Issue; recuperação fecha automaticamente. Painel /status/ apresenta frequência de deploy, lead time, taxa de falha de mudanças e tempo de recuperação; sem incidente resolvido, recuperação permanece não medida, em vez de zero fictício.')
alerts=evidence('alertas-exercicio.json')
paragraph('Exercício de alertas: '+('evidência disponível em output/relatorios/alertas-exercicio.json; incidentes locais simulados, sem alegar falha pública.' if alerts else 'roteiro e workflow preparados; execução com abertura e fechamento real de Issues ainda pendente.'))
page()
heading('8. Entrega e comunicação')
pitch=out/'video'/'pitch.json'
paragraph('Vídeo: '+(f"gameplay real automatizado, legendas visíveis, {json.loads(pitch.read_text('utf-8'))['durationSeconds']:.1f} segundos de gravação. A triagem mede a duração do arquivo final." if pitch.exists() else 'gravação ainda pendente.'))
paragraph('O pacote de submissão reúne GDD, relatório, URL pública, build.zip, instruções offline, vídeo, legendas e manifesto SHA-256. Triagem confere arquivos, hashes, duração, limite do relatório, equipe e prazo informado pelo usuário: 09/10/2026 às 23:59, fuso America/Montevideo. Entrega posterior ao horário não recebe aprovação automática.')
heading('9. Retrospectiva e limitações')
paragraph('Aprendizado técnico desta preparação com IA: reutilizar o remoto evita falha de rollback; manter um artefato entre ambientes evita divergência; fixar a data no commit permite comparação de hashes. A decisão de manter as missões pequenas reduziu dependências e permitiu ampla cobertura do motor. Próxima melhoria: acompanhar novos ciclos DORA e entrevistar jogadores para avaliar aprendizagem, sem confundir testes automatizados com avaliação pedagógica.')
paragraph('A equipe deve escrever sua retrospectiva pessoal e confirmar contribuição e revisões. Dez PRs criados não equivalem a dez PRs revisados por outra pessoa. Aprovação obrigatória de produção precisa ocorrer realmente. Evidências de exercício devem registrar execução e tempo, não apenas existência do workflow. Esses limites ficam explícitos no pacote e não são removidos para simular conformidade.')
target=out/'pdf'/'Relatorio-tecnico.pdf';target.parent.mkdir(parents=True,exist_ok=True)
def footer(canvas,doc):
    canvas.setFont('Helvetica',8);canvas.drawString(44,28,'Resgate Digital | relatório técnico | preparação assistida por IA');canvas.drawRightString(A4[0]-44,28,str(doc.page))
doc=SimpleDocTemplate(str(target),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=40,bottomMargin=50,invariant=1,title='Resgate Digital - relatório técnico',author='Equipe Resgate Digital / assistência de IA')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
pages=len(PdfReader(target).pages)
if pages>12: raise RuntimeError('Relatório excede 12 páginas')
print(f'Relatório técnico: {pages} páginas.')
