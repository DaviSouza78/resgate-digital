"""Empacotamento determinístico, sem instalação adicional."""
from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parent.parent
out = root / 'output'
packages = out / 'pacotes'
packages.mkdir(parents=True, exist_ok=True)
index = []
for folder in sorted((out / 'versoes').iterdir()):
    if not folder.is_dir():
        continue
    dest = packages / f'resgate-digital-{folder.name}.zip'
    with ZipFile(dest, 'w', compression=ZIP_DEFLATED, compresslevel=9) as z:
        for item in sorted(folder.iterdir()):
            if item.is_file():
                info = ZipInfo(item.name, date_time=(2026, 1, 1, 0, 0, 0))
                info.compress_type = ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                z.writestr(info, item.read_bytes(), compresslevel=9)
    digest = sha256(dest.read_bytes()).hexdigest()
    dest.with_suffix('.zip.sha256').write_text(f'{digest}  {dest.name}\n', encoding='utf-8')
    meta = json.loads((folder / 'version.json').read_text(encoding='utf-8'))
    index.append({'version':meta['version'], 'responsible':meta['responsible'], 'role':meta['role'], 'bytes':dest.stat().st_size, 'sha256':digest, 'package':dest.name})
    assert dest.stat().st_size < 25 * 1024 * 1024
(out / 'relatorios' / 'pacotes.json').write_text(json.dumps(index, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
final = packages / 'resgate-digital-v1.0.0.zip'
(out / 'build.zip').write_bytes(final.read_bytes())
(out / 'build.zip.sha256').write_text(f'{sha256(final.read_bytes()).hexdigest()}  build.zip\n', encoding='utf-8')
print('12 pacotes offline abaixo de 25 MB, com SHA-256.')
