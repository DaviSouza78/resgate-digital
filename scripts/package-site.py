from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
from hashlib import sha256
root=Path(__file__).resolve().parent.parent
output=root/'output'
for name,source in [('site-build.zip',output/'site-artifact'),('site-github-pages.zip',root/'site')]:
    target=output/name
    with ZipFile(target,'w',compression=ZIP_DEFLATED,compresslevel=9) as z:
        for file in sorted(source.rglob('*')):
            if file.is_file():
                info=ZipInfo(file.relative_to(source).as_posix(),date_time=(2026,1,1,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,file.read_bytes(),compresslevel=9)
    digest=sha256(target.read_bytes()).hexdigest();target.with_suffix('.zip.sha256').write_text(f'{digest}  {target.name}\n',encoding='utf-8')
    print(f'{name}: {target.stat().st_size} bytes')
    assert target.stat().st_size<25*1024*1024
