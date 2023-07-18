import { Volume } from 'memfs/lib/volume'
import { normalizePackages } from './user-input'
import { createFsFromJSON } from './utils/testing'

describe('normalizePackages', () => {
  let fs: Volume

  const packageContents = {
    storageMobile: JSON.stringify({
      name: '@exodus/storage-mobile',
    }),
    config: JSON.stringify({
      name: '@exodus/config',
    }),
    formatting: JSON.stringify({
      name: '@exodus/formatting',
    }),
    theUltimatePackage: JSON.stringify({
      name: '@exodus/the-ultimate-package',
    }),
  }
  const lernaConfig = JSON.stringify({
    packages: ['libraries/*', 'modules/*', 'deeply/nested/package/root/*'],
    version: 'independent',
    npmClient: 'yarn',
    useWorkspaces: true,
    useNx: true,
  })

  beforeEach(() => {
    fs = createFsFromJSON({
      'lerna.json': lernaConfig,
      'modules/storage-mobile/package.json': packageContents.storageMobile,
      'deeply/nested/package/root/the-ultimate-package/package.json':
        packageContents.theUltimatePackage,
      'modules/config/package.json': packageContents.config,
      'libraries/formatting/package.json': packageContents.formatting,
    })
  })

  it('should trim spaces', async () => {
    const result = await normalizePackages({
      packagesCsv: ' libraries/formatting, modules/config ',
      filesystem: fs as never,
    })
    expect(result).toEqual(['libraries/formatting', 'modules/config'])
  })

  it('should remove empty values', async () => {
    const result = await normalizePackages({
      packagesCsv: ',libraries/formatting, ,modules/config,',
      filesystem: fs as never,
    })
    expect(result).toEqual(['libraries/formatting', 'modules/config'])
  })

  it('should normalize paths', async () => {
    const result = await normalizePackages({
      packagesCsv: 'formatting,config',
      filesystem: fs as never,
    })
    expect(result).toEqual(['libraries/formatting', 'modules/config'])
  })

  it('should normalize package names', async () => {
    const result = await normalizePackages({
      packagesCsv: '@exodus/formatting, @exodus/config ',
      filesystem: fs as never,
    })
    expect(result).toEqual(['libraries/formatting', 'modules/config'])
  })

  it('should normalize deeply nested package name', async () => {
    const result = await normalizePackages({
      packagesCsv: '@exodus/the-ultimate-package',
      filesystem: fs as never,
    })
    expect(result).toEqual(['deeply/nested/package/root/the-ultimate-package'])
  })

  it('should normalize deeply nested short name', async () => {
    const result = await normalizePackages({
      packagesCsv: 'the-ultimate-package',
      filesystem: fs as never,
    })
    expect(result).toEqual(['deeply/nested/package/root/the-ultimate-package'])
  })

  it('should throw for non existing short names', async () => {
    const promise = normalizePackages({
      packagesCsv: 'batcave, formatting',
      filesystem: fs as never,
    })
    await expect(promise).rejects.toThrow()
  })

  it('should throw for non existing package names', async () => {
    const promise = normalizePackages({
      packagesCsv: '@exodus/formatting,@exodus/wayne-enterprises,@exodus/batcave',
      filesystem: fs as never,
    })
    await expect(promise).rejects.toThrow()
  })

  it('should throw for non existing package roots', async () => {
    const promise = normalizePackages({
      packagesCsv: 'packages/formatting,misc/test',
      filesystem: fs as never,
    })
    await expect(promise).rejects.toThrow()
  })
})
