import os, sys
from PIL import Image

totalsaved = 0

def optimize_images(dir):

    count = 0
    for root, dirs, files in os.walk(dir):
        path = root.split("/")
        print (len(path) - 1) *'---' , os.path.basename(root)       
        for file in files:
            if ".png" in file:
                resave_image(root +"/"+ file)
                count += 1
            if ".jpg" in file:
                resave_image(root +"/"+ file)
                count += 1
    print " "
    print "Done!"
    print "Optimized %d image files" % count
    

def resave_image(file):
    global totalsaved
    print " "
    print "optimizing " + file + "..."
    prevsize = os.path.getsize(file)
    image = Image.open(file)
    image.save(file,quality=85,optimize=True)
    print str(prevsize) + " -----> " + str(os.path.getsize(file))
    saved = prevsize - os.path.getsize(file)
    totalsaved += saved
    if((prevsize - os.path.getsize(file)) < 0):
        print " Failed! File gained " +str(saved) + " bytes"
    else:
        print " Success! File lost " + str(saved) + " bytes (" + str(round((int(os.path.getsize(file))/int(prevsize))*100, 2)) + "%)"


if __name__ == "__main__":
    print "Compressing images..."
    optimize_images(sys.argv[1])
    print "Saved a total of " + str(totalsaved) + " bytes"