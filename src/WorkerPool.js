// @flow
import EventEmitter from 'events'
import cluster from 'cluster'
import _debug from 'debug'
import WorkerManager from './WorkerManager'

const debug = _debug('duq:WorkerPool')

export default class WorkerPool extends EventEmitter {
  workers: Array<WorkerManager>

  constructor (exec: string, concurrency: number) {
    super()

    cluster.setupMaster({ exec })
    cluster.on('exit', this.revive)

    this.workers = []
    for (let i = 0; i < concurrency; i++) {
      this.add(cluster.fork())
    }
  }

  add (worker: cluster$Worker): void {
    const manager = new WorkerManager(worker)
    manager.on('idle', () => {
      this.emit('idle', manager)
    })
    manager.on('progress', (message) => {
      this.emit('progress', manager, message)
    })
    this.workers.push(manager)
  }

  revive (worker: cluster$Worker, exitCode: number, signal: string): void {
    const index = this.workers.findIndex(w => w.worker === worker)
    if (index < 0) {
      throw new Error(`No manager found for id=${worker.id} pid=${worker.process.pid}`)
    }

    this.workers.splice(index, 1)
    const exitStatus = signal ? `signal=${signal}` : `exitCode=${exitCode}`
    debug(`worker id=${worker.id} died with ${exitStatus}. restarting...`)
    this.add(cluster.fork())
  }

  killAll (signal?: string): Promise<Array<void>> {
    cluster.removeListener('exit', this.revive)
    return Promise.all(this.workers.map((manager: WorkerManager) => manager.kill(signal)))
  }
}
