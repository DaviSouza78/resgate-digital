"""Gera o GDD local em PDF a partir do Markdown, para integração futura ao CI."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

root = Path(__file__).resolve().parent.parent
target = root / 'output' / 'pdf' / 'GDD.pdf'
target.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ResgateDigitalTitle', fontName='Helvetica-Bold', fontSize=23, leading=28, textColor=HexColor('#006963'), spaceAfter=16))
styles.add(ParagraphStyle(name='ResgateDigitalHeading', fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=HexColor('#006963'), spaceBefore=14, spaceAfter=8, keepWithNext=True))
styles.add(ParagraphStyle(name='ResgateDigitalBody', fontName='Helvetica', fontSize=9.5, leading=14, textColor=HexColor('#153843'), spaceAfter=8, alignment=TA_LEFT))
source=(root / 'docs' / 'gdd.md').read_text(encoding='utf-8')
def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(HexColor('#d9e2db'))
    canvas.line(44,42,A4[0]-44,42)
    canvas.setFont('Helvetica',8)
    canvas.setFillColor(HexColor('#526b72'))
    canvas.drawString(44,28,f'Resgate Digital | GDD v{doc.resgate_version} | Entrega local')
    canvas.drawRightString(A4[0]-44,28,str(doc.page))
    canvas.restoreState()
def write_pdf(text, destination, version):
    story=[]
    for paragraph in text.split('\n\n'):
        paragraph=paragraph.strip()
        if not paragraph:
            continue
        if paragraph.startswith('# '):
            story.append(Paragraph(escape(paragraph[2:]), styles['ResgateDigitalTitle']))
            story.append(Paragraph('PROTÓTIPO EDUCATIVO / DOCUMENTO DE DESIGN', styles['ResgateDigitalHeading']))
        elif paragraph.startswith('## '):
            story.append(Paragraph(escape(paragraph[3:]), styles['ResgateDigitalHeading']))
        else:
            clean=paragraph.replace('→', ' > ').replace('—', '-').replace('–', '-')
            story.append(Paragraph(escape(clean).replace('\n','<br/>'), styles['ResgateDigitalBody']))
    destination.parent.mkdir(parents=True, exist_ok=True)
    doc=SimpleDocTemplate(str(destination),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=42,bottomMargin=56,title=f'Resgate Digital - GDD v{version}',author='Equipe Resgate Digital - preparação assistida por IA',invariant=1)
    doc.resgate_version=version
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
write_pdf(source,target,'1.0.0')
for stage in json.loads((root / 'versions.json').read_text(encoding='utf-8'))['versions']:
    v=stage['version']
    text=source.replace('Versão do GDD: 1.0.0.',f'Versão do GDD: {v}.')
    if v!='1.0.0':
        note=f"## Escopo desta etapa local\n\nResponsável designado: {stage['responsible']}. Função: {stage['role']}. Esta build contém {stage['levels']} missão(ões). Mudança da etapa: {stage['change']} As descrições das cinco fases e da esteira nas seções seguintes são o planejamento do produto final v1.0.0; funcionalidades posteriores não estão presentes nesta etapa. Não houve publicação nem registro histórico no Git.\n\n"
        title,remaining=text.split('\n\n',1)
        text=title+'\n\n'+note+remaining
    write_pdf(text,root / 'output' / 'pdf' / 'etapas' / f'GDD-v{v}.pdf',v)
print(f'GDD gerado: {target}')
