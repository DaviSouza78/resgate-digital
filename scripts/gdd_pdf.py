"""GDD deterministico por versao, com wireframes e diagrama visual da esteira."""
from pathlib import Path
import json, os, subprocess, re
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
root=Path(__file__).resolve().parent.parent
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleRD',fontName='Helvetica-Bold',fontSize=23,leading=28,textColor=HexColor('#006963'),spaceAfter=16))
styles.add(ParagraphStyle(name='HeadingRD',fontName='Helvetica-Bold',fontSize=13,leading=17,textColor=HexColor('#006963'),spaceBefore=14,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='BodyRD',fontName='Helvetica',fontSize=9.5,leading=14,spaceAfter=8))
context=json.loads(subprocess.check_output([os.environ.get('RD_NODE_PATH','node'),str(root/'scripts/build-context.cjs')],cwd=root,text=True))
source=(root/'docs/gdd.md').read_text('utf-8')
source=re.sub(r'Data da preparação: [0-9/]+','Data da preparação: '+context['localDate'],source)
class PipelineDiagram(Flowable):
    def __init__(self):
        super().__init__();self.width=507;self.height=145
    def draw(self):
        c=self.canv
        for i,(top,bottom) in enumerate([('PR + revisão','CI obrigatória'),('Lint / testes','GDD / build único'),('HML + E2E','Mesmo artefato'),('Aprovação','PRD + smoke')]):
            x=i*128;c.setFillColor(HexColor('#006963'));c.roundRect(x,70,115,55,7,fill=1,stroke=0)
            c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',9);c.drawCentredString(x+57,104,top);c.setFont('Helvetica',8);c.drawCentredString(x+57,85,bottom)
            if i<3:c.setStrokeColor(HexColor('#153843'));c.line(x+115,97,x+127,97)
        c.setFillColor(HexColor('#153843'));c.setFont('Helvetica',9);c.drawString(0,45,'Falha no smoke > rollback do ponteiro, preservando a URL e as releases.')
        c.drawString(0,24,'Sondas 15 min > Issues > status / DORA > melhoria > próximo PR.')
class Wireframes(Flowable):
    def __init__(self):
        super().__init__();self.width=507;self.height=155
    def draw(self):
        c=self.canv
        panels=[('MENU',['Resgate Digital','Escolher missão','Conceito + objetivo','Jogar / dados locais']),('HUD',['Mapa + submarino','Blocos / posição','Comandos / programa','Executar / reiniciar']),('FIM',['Estação recuperada','Estrelas / pontos','Conceito aprendido','Próxima / repetir'])]
        for i,(title,lines) in enumerate(panels):
            x=i*172;c.setStrokeColor(HexColor('#006963'));c.roundRect(x,10,160,130,5,fill=0,stroke=1)
            c.setFont('Helvetica-Bold',10);c.drawString(x+10,121,title);c.setFont('Helvetica',9)
            for j,line in enumerate(lines):c.drawString(x+10,99-j*23,line)
def footer(canvas,doc):
    canvas.saveState();canvas.setFont('Helvetica',8);canvas.setFillColor(HexColor('#526b72'));canvas.drawString(44,28,f'Resgate Digital | GDD v{doc.resgate_version} | {context["localDate"]}');canvas.drawRightString(A4[0]-44,28,str(doc.page));canvas.restoreState()
def write_pdf(text,destination,version):
    story=[]
    for paragraph in text.split('\n\n'):
        paragraph=paragraph.strip()
        if not paragraph:continue
        if paragraph.startswith('![Diagrama da esteira]'):story.append(PipelineDiagram())
        elif paragraph.startswith('![Wireframes]'):story.append(Wireframes())
        elif paragraph.startswith('# '):story.append(Paragraph(escape(paragraph[2:]),styles['TitleRD']))
        elif paragraph.startswith('## '):story.append(Paragraph(escape(paragraph[3:]),styles['HeadingRD']))
        else:story.append(Paragraph(escape(paragraph.replace('→',' > ').replace('—','-').replace('–','-')).replace('\n','<br/>'),styles['BodyRD']))
    destination.parent.mkdir(parents=True,exist_ok=True)
    doc=SimpleDocTemplate(str(destination),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=42,bottomMargin=56,title=f'Resgate Digital - GDD v{version}',author='Equipe Resgate Digital - preparação assistida por IA',invariant=1);doc.resgate_version=version;doc.build(story,onFirstPage=footer,onLaterPages=footer)
write_pdf(source,root/'output/pdf/GDD.pdf','1.0.0')
for stage in json.loads((root/'versions.json').read_text('utf-8'))['versions']:
    v=stage['version'];text=source.replace('Versão do GDD: 1.0.0.',f'Versão do GDD: {v}.')
    if v!='1.0.0':
        title,remaining=text.split('\n\n',1)
        text=title+f"\n\n## Escopo desta etapa\n\nResponsável: {stage['responsible']}. Função: {stage['role']}. {stage['levels']} missão(ões). Mudança: {stage['change']} As descrições posteriores referem-se ao produto final; funcionalidades posteriores não integram esta etapa. Snapshot cumulativo preparado com IA, registrado na data real.\n\n"+remaining
    write_pdf(text,root/'output/pdf/etapas'/f'GDD-v{v}.pdf',v)
print('GDD e doze PDFs por etapa gerados com diagramas.')
