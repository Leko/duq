// @flow
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import _debug from 'debug'
import {
  MESSAGE_GET_SIZE_DONE,
  MESSAGE_GET_SIZE_START,
  type Message,
} from './messages'
import { sum } from './utils'
import File from './File'
import WorkerPool from './WorkerPool'
// import ProgressBar from './ProgressBar'
import type WorkerManager from './WorkerManager'

const debug = _debug(`duq:master`)
// const bar = new ProgressBar(process.stdout)

const task = (files: Array<File>, pool: WorkerPool): Promise<number> => {
  const paths: Array<string> = files.map(f => f.path)
  const targets = paths.join(', ')
  const taskId = crypto.createHash('md5').update(targets, 'utf8').digest('hex')
  // debug(`Task ${taskId}(${targets}) request to start`)
  return new Promise((resolve, reject) => {
    const main = (worker: WorkerManager) => {
      // Maybe steal by another event listener
      if (worker.isBusy()) {
        return
      }
      const finished = (message: Message) => {
        debug(`Message received from worker id=${worker.id}: ${JSON.stringify(message)}`)
        if (message.type === MESSAGE_GET_SIZE_DONE) {
          worker.removeListener('message', finished)
          resolve(message.size)
        }
      }

      pool.removeListener('idle', main)
      debug(`Task ${taskId} Got idle worker id=${worker.id}`)

      worker.on('message', finished)
      worker.worker.on('error', reject) // FIXME: wrap
      worker.dispatch({ type: MESSAGE_GET_SIZE_START, paths })
      debug(`Task ${taskId} started with id=${worker.id}`)
    }

    pool.on('idle', main)
  })
}

const digg = async (directory: File, pool: WorkerPool) => {
  // bar.update('master', `Visit ${directory.path}`)
  debug(`Visit ${directory.path}`)
  const nodes = fs.readdirSync(directory.path)
    .map(f => new File(path.join(directory.path, f)))
    .filter(f => f.stat !== null && !f.stat.isSymbolicLink())
  const { files, directories } = nodes.reduce((acc, file) => {
    const type = file.stat.isDirectory() ? 'directories' : 'files'
    acc[type].push(file)
    return acc
  }, { files: [], directories: [] })

  const eatFromLargest = (beforeSize) => {
    if (sortedDirs.length === 0) return Promise.resolve(beforeSize)

    const target = sortedDirs.pop()
    return digg(target, pool).then(size => eatFromLargest(beforeSize + size))
  }
  const eatFromSmallest = (beforeSize) => {
    if (sortedDirs.length === 0) return Promise.resolve(beforeSize)

    const target = sortedDirs.shift()
    return task([target], pool).then(size => eatFromSmallest(beforeSize + size))
  }

  const sortedDirs = directories.sort((dirA, dirB) => predicate(dirA) - predicate(dirB))
  const filesSum = sum(files.map(f => f.size))
  const [masterSum, workerSum] = await Promise.all([eatFromLargest(0), eatFromSmallest(0)])

  return filesSum + masterSum + workerSum
}

const predicate = (file) => {
  return file.inodes
}

// FIXME
export default async function main (
  directory: string,
  concurrency: number,
  sizeDecorator: (number) => string,
): Promise<void> {
  if (!fs.existsSync(directory)) {
    throw new Error(`${directory} does not exists`)
  }
  if (!fs.statSync(directory).isDirectory()) {
    throw new Error(`${directory} is not a directory`)
  }

  const rootFile = new File(directory)
  const workerPath = path.join(__dirname, 'worker.js')
  const pool = new WorkerPool(workerPath, concurrency - 1) // -1 means main process
  pool.on('progress', (worker: WorkerManager, message) => {
    // bar.update(worker.id, message)
  })
  const total = await digg(rootFile, pool)
  console.log(sizeDecorator(total))
  await pool.killAll()
  pool.removeAllListeners('progress')
}
