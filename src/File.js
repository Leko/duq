// @flow
import fs, { type Stats } from 'fs'
import _debug from 'debug'

const debug = _debug('duq:file')

export default class File {
  path: string
  stat: Stats

  constructor (pathAbs: string) {
    this.path = pathAbs
    try {
      this.stat = fs.lstatSync(pathAbs)
    } catch (e) {
      debug(`No such file or directory ${pathAbs}`)
    }
  }

  get size (): number {
    return this.stat.size
  }

  get inodes (): number {
    return this.stat.ino
  }

  isDirectory (): boolean {
    return this.stat.isDirectory()
  }

  isSymbolicLink (): boolean {
    return this.stat.isSymbolicLink()
  }
}
