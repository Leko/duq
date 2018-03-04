// @flow
import cluster from 'cluster'
import fs from 'fs'
import path from 'path'
import _debug from 'debug'
import {
  MESSAGE_GET_SIZE_DONE,
  MESSAGE_GET_SIZE_START,
  MESSAGE_BUSY,
  MESSAGE_IDLE,
  // MESSAGE_PROGRESS,
  type Message,
} from './messages'
import { sum } from './utils'
import File from './File'

const debug = _debug(`duq:worker:id=${cluster.worker.id}`)

const send = (message: Message) => {
  const nativeSend = process.send
  if (!nativeSend) {
    throw new Error('process.send is not implemented')
  }
  debug(`Send message: ${JSON.stringify(message)}`)
  nativeSend(message)
}
const inProgress = (fn) => {
  send({ type: MESSAGE_BUSY })
  try {
    fn()
    send({ type: MESSAGE_IDLE })
  } catch (error) {
    send({ type: MESSAGE_IDLE })
    throw error
  }
}

cluster.worker.on('message', (message: Message) => {
  switch (message.type) {
    case MESSAGE_GET_SIZE_START: {
      inProgress(() => {
        // $FlowFixMe
        const sizes: Array<number> = message.paths.map(p => diggSync(new File(p)))
        // $FlowFixMe
        send({ type: MESSAGE_GET_SIZE_DONE, size: sum(sizes) })
      })
      return
    }
    default:
      throw new Error(`Invalid type: ${message.type}`)
  }
})

const diggSync = (directory: File): number => {
  if (directory.isSymbolicLink()) {
    return 0 // Skip calculate size in symlink
  }
  if (!directory.isDirectory()) {
    return directory.size
  }

  debug(`Visit ${directory.path}`)
  // send({ type: MESSAGE_PROGRESS, message: `Calculating size for '${directory.path}'` })
  const sizes = fs.readdirSync(directory.path)
    .map(f => new File(path.join(directory.path, f)))
    .map(f => f.isDirectory() ? diggSync(f) : f.size)

  return sum(sizes)
}

debug(`Started with pid=${cluster.worker.process.pid}`)
send({ type: MESSAGE_IDLE })
