// @flow

const add = (a, b): number => a + b

export const sum = (nums: Array<number>): number => nums.reduce(add, 0)
