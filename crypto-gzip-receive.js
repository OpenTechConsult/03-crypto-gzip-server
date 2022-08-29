import { log } from 'node:console'
import { createServer } from 'node:http'
import { basename, join } from 'node:path'
import { Buffer } from 'node:buffer'
import { createGunzip } from 'node:zlib'
import { createWriteStream } from 'node:fs'
const { randomBytes, createDecipheriv } = await import('node:crypto')


const secret = randomBytes(24)
log(`Generated secret: ${secret.toString('hex')}`)

const server = createServer((req, res) => {
    const filename = basename(req.headers['x-filename'])
    const iv = Buffer.from(req.headers['x-initialization-vector'], 'hex')
    const destFilename = join('received_files', filename)
    log(`File request received: ${filename}`)
    req.pipe(createDecipheriv('aes192', secret, iv))
        .pipe(createGunzip())
        .pipe(createWriteStream(destFilename))
        .on('finish', () => {
            res.writeHead(201, { 'Content-Type': 'text/plain' })
            res.end('OK\n')
            log(`File saved: ${destFilename}`)
        })

})

server.listen(3000, () => { log('Listening on http://localhost:3000') })