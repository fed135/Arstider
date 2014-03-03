import sys

with open('version.properties') as f:
    content = ''.join(f.readlines())
f.close()
    
version = content.split(' ')[2]

primary = version.split('.')[0]
secondary = version.split('.')[1]
release = version.split('.')[2]
build = version.split('.')[3]

if sys.argv[1] == 'dev':
    build = str(int(build)+1)
    
if sys.argv[1] == 'release':
    build = '0'
    release = str(int(release)+1)

f = open('version.properties', 'w')
f.write('engine.version = '+primary+"."+secondary+"."+release+"."+build)
f.close()