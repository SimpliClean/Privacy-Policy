include node-core

request = require 'request'

a = 1

b = 'a'

c = true

d = false

e = null

f = b ++ 'b'

g = 4 * 3 / 7 ^ 9 - 15 + 75 * 9

sum a b = a + b

h = sum 4 5 ^ 1 + 16 * 7 / (4 + a)

print h

re = /hello/

reGlobal = /hello/g

match = re.exec 'hello'

match2 = reGlobal.exec 'qwertyiophello123123hello'

print match

print match2

letin = let x = 15 in x ^ 4 * 5

caller = do
     a <- getLine 'random string'
     err res <- IO (request 'http://google.com')
     maybeErr err (putLine err)
     let ob = {f: 25}
     defineProp ob 'b' 45
     delete ob.b
     putLine res.body
     return res.body

do
  body <- caller
  putLine body


main = do
    putLine 'Hello world'
