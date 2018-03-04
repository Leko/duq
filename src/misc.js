// @flow
import pkg from '../package.json'

export const version = (): string => pkg.version

export const usage = (): void => {
  console.log(`${pkg.description}

Usage:
  duq [-d depth] [-h] [-g] [-m] [-k] [--help] [--version] [TARGET] [QUERY]

Options:
  -d depth
    Display an entry for all files and directories depth directories deep.
  -h
    "Human-readable" output.
    Use unit suffixes: Byte, Kilobyte, Megabyte, Gigabyte, Terabyte and Petabyte.
  -g
    Display block counts in 1073741824-byte (1-Gbyte) blocks.
  -k
    Display block counts in 1024-byte (1-Kbyte) blocks.
  -m
    Display block counts in 1048576-byte (1-Mbyte) blocks.
  --help
    Display usage (this help)
  --version
    Display version and exit
Examples:
  duq /tmp -d 2
  `)
}
