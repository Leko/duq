// @flow
import MultilineUpdate from 'multiline-update'
import truncate from 'cli-truncate'

export default class ProgressBar {
  stream: tty$WriteStream
  adapter: any

  constructor (stream: tty$WriteStream) {
    this.stream = stream
    this.adapter = new MultilineUpdate(stream)
  }

  update (id: number | string, message: string) {
    const line = truncate(`${message}`, this.stream.columns - 10, { position: 'middle' })
    this.adapter.update(id, line)
  }
}
