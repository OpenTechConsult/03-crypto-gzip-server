import { Buffer } from 'node:buffer'
import { basename } from 'node:path'
import { request } from 'node:http'
import { log } from 'node:console'
import { createReadStream } from 'node:fs'
import { createGzip } from 'node:zlib'
// import { createCipheriv } from 'node:crypto'
const { randomBytes, createCipheriv } = await import('node:crypto')


const filename = process.argv[2]
const serverHost = process.argv[3]
const secret = Buffer.from(process.argv[4], 'hex')

const iv = randomBytes(16)

const httpRequestOptions = {
    hostname: serverHost,
    port: 3000,
    path: '/',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip',
        'X-Filename': basename(filename),
        'X-Initialization-Vector': iv.toString('hex')
    }
}

const req = request(httpRequestOptions, (res) => {
    log(`Server responded with ${res.statusCode}`)
})

createReadStream(filename)
    .pipe(createGzip())
    .pipe(createCipheriv('aes192', secret, iv))
    .pipe(req)
    .on('finish', () => {
        log('File successfully sent')
    })