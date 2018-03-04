// @flow
import EventEmitter from 'events'
import _debug from 'debug'
import {
  MESSAGE_BUSY,
  MESSAGE_IDLE,
  // MESSAGE_PROGRESS,
  type Message,
} from './messages'

const debug = _debug('duq:WorkerManager')

const IDLE = 0
const BUSY = 1

export default class WorkerManager extends EventEmitter {
  worker: cluster$Worker
  state: typeof IDLE | typeof BUSY

  constructor (worker: cluster$Worker) {
    super()

    this.worker = worker
    this.state = BUSY

    worker.on('message', (message: Message) => {
      switch (message.type) {
        case MESSAGE_BUSY:
          this.makeBusy()
          break
        case MESSAGE_IDLE:
          this.makeIdle()
          break
        // case MESSAGE_PROGRESS:
        //   this.emit('progress', message.message)
        //   break
      }
      this.emit('message', message)
    })
  }

  get id (): number {
    return this.worker.id
  }

  makeIdle (): void {
    this.state = IDLE
    debug(`Worker id=${this.id} is now idle (state=${this.state})`)
    this.emit('idle', this)
  }

  makeBusy (): void {
    this.state = BUSY
    debug(`Worker id=${this.id} is now busy (state=${this.state})`)
  }

  kill (signal: string = 'SIGTERM'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker.once('exit', (exitCode: number, signal: string) => {
          const exitStatus = signal ? `signal=${signal}` : `exitCode=${exitCode}`
          debug(`worker id=${this.worker.id} died with ${exitStatus}`)
          resolve()
        })
        debug(`Send signal=${signal} to worker id=${this.id}`)
        this.worker.kill(signal)
      } catch (e) {
        reject(e)
      }
    })
  }

  dispatch (message: Message): void {
    this.state = BUSY
    this.worker.send(message)
  }

  isIdle (): boolean {
    return this.state === IDLE
  }

  isBusy (): boolean {
    return this.state === BUSY
  }
}
