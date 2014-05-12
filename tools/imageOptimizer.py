import os, sys

def png_optimize(dir):
    findcmd = 'find %s -name "*.png" -print' % dir

    count = 0
    for f in os.popen(findcmd).readlines():
        count += 1
        file = str(f[:-1])
        image = Image.open(file)
        image.save(file,quality=85,optimize=True)
    print "Optimized %d .png files" % count
    
def jpg_optimize(dir):
    findcmd = 'find %s -name "*.jpg" -print' % dir

    count = 0
    for f in os.popen(findcmd).readlines():
        count += 1
        file = str(f[:-1])
        image = Image.open(file)
        image.save(file,quality=70,optimize=True)
    print "Optimized %d .jpg files" % count

if __name__ == "__main__":
    print "Compressing PNG images..."
    png_optimize(sys.argv[1])
    print "Compressing JPG images..."
    jpg_optimize(sys.argv[1])
    print "Done!"