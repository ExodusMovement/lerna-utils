import { Volume } from 'memfs/lib/volume'
import { createFsFromJSON } from './testing'
import { readJson } from './fs'

describe('readJson', () => {
  let fs: Volume

  beforeEach(() => {
    fs = createFsFromJSON({
      'secret.json': 'asbf23uejsdasd',
      '/dir/other-file.txt': 'some other file',
    })
  })

  test('does not leak information via error message', async () => {
    await expect(readJson('secret.json', { filesystem: fs as never })).rejects.toThrow(
      /^Failed to parse secret.json$/
    )
  })

  test('does not parse non-json files', async () => {
    await expect(readJson('/dir/other-file.txt', { filesystem: fs as never })).rejects.toThrow(
      'Can only parse .json files. Received other-file.txt'
    )
  })
})
