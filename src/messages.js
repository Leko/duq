// @flow
export const MESSAGE_GET_SIZE_DONE = 'MESSAGE_GET_SIZE_DONE'
export const MESSAGE_GET_SIZE_START = 'MESSAGE_GET_SIZE_START'
export const MESSAGE_BUSY = 'MESSAGE_BUSY'
export const MESSAGE_IDLE = 'MESSAGE_IDLE'
export const MESSAGE_PROGRESS = 'MESSAGE_PROGRESS'

type GetSizeDoneMessage = {
  type: typeof MESSAGE_GET_SIZE_DONE,
  size: number,
}
type GetSizeStartMessage = {
  type: typeof MESSAGE_GET_SIZE_START,
  paths: Array<string>,
}
type BusyMessage = {
  type: typeof MESSAGE_BUSY,
}
type IdleMessage = {
  type: typeof MESSAGE_IDLE,
}

export type Message =
  GetSizeDoneMessage
  | GetSizeStartMessage
  | BusyMessage
  | IdleMessage
