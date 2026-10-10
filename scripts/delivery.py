"""Reúne o projeto, as doze etapas e as evidências locais sem criar repositório."""
from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root=Path(__file__).resolve().parent.parent
output=root/'output'
target=output/'Resgate-Digital-entrega-local.zip'
files=[]
for directory in ['src','web','site-src','.github','etapas','content','docs','tests','scripts','dist']:
    files.extend((root/directory).rglob('*'))
for directory in ['versoes','pacotes','pdf','relatorios','video','submissao']:
    files.extend((output/directory).rglob('*'))
for name in ['package.json','package-lock.json','versions.json','contributors.json','human-contributions.json','submission.json','eslint.config.mjs','project.json','README.md','SQUAD.md','THIRD_PARTY.md','AI-USAGE.md','LICENSE','.gitignore']:
    files.append(root/name)
files.extend([output/'build.zip',output/'build.zip.sha256'])
with ZipFile(target,'w',compression=ZIP_DEFLATED,compresslevel=9) as z:
    for file in sorted(set(files)):
        if not file.is_file() or 'raw' in file.parts:
            continue
        name=file.relative_to(root).as_posix()
        info=ZipInfo(name,date_time=(2026,1,1,0,0,0))
        info.compress_type=ZIP_DEFLATED
        info.external_attr=0o100644 << 16
        z.writestr(info,file.read_bytes(),compresslevel=9)
target.with_suffix('.zip.sha256').write_text(f'{sha256(target.read_bytes()).hexdigest()}  {target.name}\n',encoding='utf-8')
print(f'Entrega completa: {target.name} ({target.stat().st_size} bytes).')
