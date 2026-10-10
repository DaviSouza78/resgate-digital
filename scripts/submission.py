"""Pacote e triagem: falhas humanas/publicas nunca recebem aprovacao ficticia."""
from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
from datetime import datetime
import json, os, re, subprocess, urllib.request
from pypdf import PdfReader

root=Path(__file__).resolve().parent.parent
output=root/'output'; target=output/'submissao';target.mkdir(parents=True,exist_ok=True)
for name in ['rollback-publico.json','alertas-exercicio.json']:
    archived=root/'docs'/'evidencias'/name;report=output/'relatorios'/name
    if archived.exists() and not report.exists():
        report.parent.mkdir(parents=True,exist_ok=True);report.write_bytes(archived.read_bytes())
config=json.loads((root/'submission.json').read_text('utf-8'))
sources={'GDD.pdf':output/'pdf'/'GDD.pdf','Relatorio-tecnico.pdf':output/'pdf'/'Relatorio-tecnico.pdf','build.zip':output/'build.zip','build.zip.sha256':output/'build.zip.sha256','pitch.mp4':output/'video'/'pitch.mp4','pitch.srt':output/'video'/'pitch.srt','version.json':root/'dist'/'version.json','SBOM.cdx.json':output/'relatorios'/'npm-sbom.cdx.json'}
for name in ['SQUAD.md','contributors.json','LICENSE','THIRD_PARTY.md','AI-USAGE.md','submission.json','delivery-exceptions.json']: sources[name]=root/name
sources['ENTREGA.md']=root/'docs'/'ENTREGA.md'
for name,file in sources.items():
    if not file.is_file(): raise RuntimeError('Arquivo obrigatório ausente: '+str(file))
    (target/name).write_bytes(file.read_bytes())
(target/'URL.txt').write_text(config['publicUrl']+'\n','utf-8')
(target/'INSTRUCOES-OFFLINE.txt').write_text('Extraia build.zip por completo. Abra index.html em Chrome, Edge ou Firefox. Nenhuma instalação, servidor, conta ou conexão é necessária. Progresso fica no navegador; use Limpar dados para excluir.\n','utf-8')
for name in ['reprodutibilidade.json','cobertura.json','dora-melhoria.json','rollback-publico.json','alertas-exercicio.json']:
    file=output/'relatorios'/name
    if file.exists(): (target/name).write_bytes(file.read_bytes())
failures=[]
academic_pending=[]
accepted_exceptions=[]
arguments=__import__('sys').argv
delivery_mode='--deliver' in arguments
members=json.loads((root/'contributors.json').read_text('utf-8'))['contributors']
if len(members)!=4 or any(not re.fullmatch(r'\d{8}',m.get('ra','')) for m in members) or len({m.get('ra') for m in members})!=4: failures.append('Equipe: quatro RAs válidos e únicos obrigatórios')
if len(PdfReader(target/'Relatorio-tecnico.pdf').pages)>12: failures.append('Relatório acima de 12 páginas')
if (target/'build.zip').stat().st_size>=25*1024*1024: failures.append('build.zip acima de 25 MB')
media=subprocess.run([os.environ.get('RD_FFMPEG_PATH','ffmpeg'),'-i',str(target/'pitch.mp4'),'-f','null','-'],capture_output=True,text=True)
match=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',media.stderr)
duration=sum(float(v)*f for v,f in zip(match.groups(),[3600,60,1])) if match else None
if media.returncode or duration is None or duration>90: failures.append('Vídeo inválido ou acima de 90 segundos')
if '--strict' in arguments or delivery_mode:
    try:
        with urllib.request.urlopen(config['publicUrl'],timeout=15) as response:
            if response.status!=200: failures.append('URL pública não retorna 200')
    except Exception as e: failures.append('URL pública inacessível: '+str(e))
    try:
        with urllib.request.urlopen(config['publicUrl']+'version.json?triage='+str(datetime.now().timestamp()),timeout=15) as response: deployed=json.load(response)
        expected=json.loads((target/'version.json').read_text('utf-8'))
        if deployed.get('commit')!=expected.get('commit') or deployed.get('version')!=expected.get('version'): failures.append('URL pública ainda não corresponde à versão e ao commit deste pacote')
    except Exception as e: failures.append('Metadados públicos indisponíveis: '+str(e))
    evidence=output/'relatorios'/'revisoes-humanas.json'
    review_report=json.loads(evidence.read_text('utf-8')) if evidence.exists() else {}
    if not review_report.get('passed'):
        exception=json.loads((root/'delivery-exceptions.json').read_text('utf-8'))
        if delivery_mode and exception.get('reviewRequirementWaived'):
            accepted_exceptions.append('Revisões formais dispensadas por informação do usuário; sem confirmação acadêmica independente')
        else: academic_pending.append('Dez PRs com revisão real por outra pessoa ainda não comprovados')
        if len(review_report.get('individual',[]))!=4 or any(len(m.get('integrables',[]))<3 for m in review_report.get('individual',[])):
            academic_pending.append('Contribuição humana individual em três integráveis ainda não comprovada')
    if evidence.exists(): (target/'revisoes-humanas.json').write_bytes(evidence.read_bytes())
    for name in ['rollback-publico.json','alertas-exercicio.json']:
        p=output/'relatorios'/name
        if not p.exists() or not json.loads(p.read_text('utf-8')).get('passed'): failures.append('Execução obrigatória sem comprovação: '+name)
    if datetime.now().astimezone()>datetime.fromisoformat(config['deadline']): academic_pending.append('Prazo informado já ultrapassado; prorrogação não comprovada')
else: failures.append('Prévia: validação pública, prazo, revisões humanas e exercícios requerem triagem --strict')
report={'mode':'authorized-delivery' if delivery_mode else 'strict' if '--strict' in arguments else 'preview','ready':not failures and not academic_pending and not accepted_exceptions,'deliverableReady':not failures,'readinessScope':'Disponibilidade técnica não equivale a conformidade acadêmica integral','checkedAt':datetime.now().astimezone().isoformat(),'durationSeconds':duration,'deadline':config['deadline'],'deadlineSource':config['deadlineSource'],'pending':failures,'academicPending':academic_pending,'acceptedExceptions':accepted_exceptions}
(target/'TRIAGEM.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf-8')
files=sorted(p for p in target.iterdir() if p.is_file() and p.name!='MANIFESTO.sha256')
(target/'MANIFESTO.sha256').write_text(''.join(sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in files),'utf-8')
for line in (target/'MANIFESTO.sha256').read_text('utf-8').splitlines():
    digest,name=line.split('  ')
    if sha256((target/name).read_bytes()).hexdigest()!=digest: raise RuntimeError('Checksum divergente: '+name)
archive=output/'Resgate-Digital-submissao.zip'
with ZipFile(archive,'w',compression=ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(target.iterdir()):
        if p.is_file():
            info=ZipInfo(p.name,date_time=(2026,1,1,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,p.read_bytes(),compresslevel=9)
archive.with_suffix('.zip.sha256').write_text(sha256(archive.read_bytes()).hexdigest()+'  '+archive.name+'\n','utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if failures and report['mode']!='preview' or report['mode']=='strict' and academic_pending: raise SystemExit(1)
