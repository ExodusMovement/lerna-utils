import * as fs from 'fs'

export type LernaConfig = {
  packages?: string[]
}

export type PackageJson = {
  name: string
  workspaces: string[] | { packages: string[] }
}

export type Filesystem = typeof fs
