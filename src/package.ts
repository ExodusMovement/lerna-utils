import * as path from 'path'
import * as fs from 'fs'
import { readJson } from './utils/fs'
import { LernaConfig, PackageJson } from './utils/types'
import { filterAsync } from './utils/arrays'

type DefaultParams = {
  filesystem?: typeof fs
}

export async function getPackageRoots({ filesystem = fs }: DefaultParams = {}) {
  const lernaConfig = await readJson<LernaConfig>('lerna.json', { filesystem })
  const packageRoots = lernaConfig?.packages ?? ['packages/*']

  return packageRoots.map((root: string) => {
    if (root.endsWith('*')) return path.dirname(root)

    return root
  })
}

export async function getPackagePaths({ filesystem = fs }: DefaultParams) {
  const packageRoots = await getPackageRoots({ filesystem })
  const paths = await Promise.all(
    packageRoots.map(async (root) => {
      const folders = await filesystem.promises.readdir(root).catch(() => [])
      const filtered = await filterAsync(folders, (folder) =>
        filesystem.promises.stat(path.join(root, folder, 'package.json')).catch(() => false)
      )

      return filtered.map((folder) => path.join(root, folder))
    })
  )
  return paths.flat()
}

type GetPackagePathsByFolderParams = {
  packageRoots: string[]
} & DefaultParams

export async function getPackagePathsByFolder({
  filesystem = fs,
}: GetPackagePathsByFolderParams): Promise<{ [folder: string]: string }> {
  const packageRoots = await getPackageRoots({ filesystem })
  const folderPaths = await Promise.all(
    packageRoots.map(async (root) => {
      const folders = await filesystem.promises.readdir(root)
      return folders.map((folder) => [folder, path.join(root, folder)])
    })
  )
  return Object.fromEntries(folderPaths.flat())
}

export async function getPackageNameByPath(
  packagePath: string,
  { filesystem = fs }: DefaultParams = {}
) {
  const packageJson = await readJson<PackageJson>(path.join(packagePath, 'package.json'), {
    filesystem,
  })

  return packageJson?.name
}

export async function parsePackageFiles<T>(
  relativePath: string,
  { filesystem = fs }: DefaultParams
): Promise<{ path: string; content: T }[]> {
  const packagePaths = await getPackagePaths({ filesystem })

  return Promise.all(
    packagePaths.map(async (packagePath) => {
      const filePath = path.join(packagePath, relativePath)

      const content = await readJson<T>(filePath, { filesystem })

      return { path: filePath, content }
    })
  ).then((them) => them.filter((it) => !!it.content) as { path: string; content: T }[])
}
