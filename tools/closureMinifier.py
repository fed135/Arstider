import sys
import urllib
import httplib

print "::reading " + sys.argv[1]

with open(sys.argv[1]) as f:
    content = ''.join(f.readlines())

print "::finished"

params = urllib.urlencode([
    ('compilation_level', sys.argv[3]),
    ('output_format', 'json'),
    ('output_info', 'errors'),
    ('language', 'ECMASCRIPT5')
  ])

params = params + '&js_code=' + urllib.quote_plus(content)


# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
program1 = response.read()

print "writing to file " + sys.argv[2] + " .log"

f = open(sys.argv[2]+ " .log", 'w')

f.write(program1)

print "done!"

conn.close()
f.close()

params = urllib.urlencode([
    ('compilation_level', sys.argv[3]),
    ('output_format', 'text'),
    ('output_info', 'compiled_code'),
    ('language', 'ECMASCRIPT5')
  ])

params = params + '&js_code=' + urllib.quote_plus(content)


# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn2 = httplib.HTTPConnection('closure-compiler.appspot.com')
conn2.request('POST', '/compile', params, headers)
response = conn2.getresponse()
program1 = response.read()

print "writing to file " + sys.argv[2]

f2 = open(sys.argv[2], 'w')
f2.write(program1)

print "done!"

conn2.close()
f2.close()