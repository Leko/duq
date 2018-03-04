// @flow
import { cpus } from 'os'
import path, { sep } from 'path'
import minimist from 'minimist'
import filesize from 'file-size'
import _debug from 'debug'
import main from './master'
import { usage, version } from './misc'

const debug = _debug(`duq:master`)

const identity = (size: number): string => `${size}`
const humanize = (size: number): string => {
  const fSize = filesize(size)
  if (options.k) {
    return fSize.to('KB', true)
  } else if (options.m) {
    return fSize.to('MB', true)
  } else if (options.g) {
    return fSize.to('GB', true)
  } else {
    return fSize.human('si')
  }
}

const options = minimist(process.argv.slice(2), {
  boolean: ['h', 'k', 'm', 'g'],
})

if (options.help) {
  usage()
  process.exit(0)
}
if (options.version) {
  version()
  process.exit(0)
}

try {
  if (!options._ || options._.length === 0) {
    throw new Error('TARGET must be required')
  }
  if (!options._ || options._.length === 1) {
    throw new Error('QUERY must be required')
  }
  if (options.concurrency && !parseInt(options.concurrency)) {
    throw new Error(`Invalid concurrency: ${options.concurrency}`)
  }
} catch (e) {
  console.error(`Invalid options: ${e.message}\n`)
  usage()
  process.exit(1)
}

const [target] = options._
const targetAbs = target.startsWith(sep) ? target : path.join(process.cwd(), target)
const concurrency = options.concurrency ? parseInt(options.concurrency) : cpus().length
const sizeDecorator = options.h ? humanize : identity

debug(`Parsed`, { targetAbs, concurrency, options })
main(targetAbs, concurrency, sizeDecorator).catch(console.error)
