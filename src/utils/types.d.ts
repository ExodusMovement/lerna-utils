import * as fs from 'fs'

export type LernaConfig = {
  packages?: string[]
}

export type PackageJson = {
  name: string
}

export type Filesystem = typeof fs
