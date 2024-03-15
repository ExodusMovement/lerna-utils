import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'

export async function readJson<ReturnType>(
  filePath: string,
  { filesystem }: { filesystem: typeof fs }
): Promise<ReturnType | undefined> {
  assert(
    path.extname(filePath) === '.json',
    `Can only parse .json files. Received ${path.basename(filePath)}`
  )

  let content: string
  try {
    content = await filesystem.promises.readFile(filePath, 'utf8')
  } catch {
    return undefined
  }

  try {
    return JSON.parse(content)
  } catch {
    throw new Error(`Failed to parse ${filePath}`)
  }
}
