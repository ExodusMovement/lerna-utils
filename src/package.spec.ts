import { Volume } from 'memfs/lib/volume'
import {
  getPackageNameByPath,
  getPackagePaths,
  getPackagePathsByFolder,
  getPackageRoots,
} from './package'

describe('package', () => {
  let fs: Volume

  describe('getPackageRoots', () => {
    it('should return normalized package roots', async () => {
      fs = Volume.fromJSON({
        'lerna.json': JSON.stringify({
          packages: ['libraries/*', 'modules/*', 'single/package'],
        }),
      })

      await expect(getPackageRoots({ filesystem: fs as never })).resolves.toEqual([
        'libraries',
        'modules',
        'single/package',
      ])
    })
  })

  describe('getPackageNameByPath', () => {
    beforeEach(() => {
      fs = Volume.fromJSON({
        'lerna.json': JSON.stringify({
          packages: ['packages/*'],
        }),
        'packages/wayne-manor/package.json': JSON.stringify({
          name: '@exodus/wayne-manor',
        }),
      })
    })

    it('should return package name', async () => {
      await expect(
        getPackageNameByPath('packages/wayne-manor', { filesystem: fs as never })
      ).resolves.toEqual('@exodus/wayne-manor')
    })

    it('should return undefined when package not found', async () => {
      await expect(
        getPackageNameByPath('packages/not-here', { filesystem: fs as never })
      ).resolves.toBeUndefined()
    })
  })

  const setup = (additionalContents: { [path: string]: string } = {}) => {
    fs = Volume.fromJSON({
      'lerna.json': JSON.stringify({
        packages: ['modules/*', 'libraries/*', 'empty/*'],
      }),
      'modules/wayne-manor/package.json': JSON.stringify({
        name: '@exodus/wayne-manor',
      }),
      'libraries/wayne-tower/package.json': JSON.stringify({
        name: '@exodus/wayne-tower',
      }),
      ...additionalContents,
    })
  }

  describe('getPackagePaths', () => {
    it('should return paths of packages found under package roots', async () => {
      setup()

      await expect(getPackagePaths({ filesystem: fs as never })).resolves.toEqual([
        'modules/wayne-manor',
        'libraries/wayne-tower',
      ])
    })

    it('should not return paths of folder without package.json', async () => {
      setup({
        'libraries/leftover-from-exploration-on-branch/lib/index.js': 'nothing here',
      })

      await expect(getPackagePaths({ filesystem: fs as never })).resolves.toEqual([
        'modules/wayne-manor',
        'libraries/wayne-tower',
      ])
    })
  })

  describe('getPackagePathsByFolder', () => {
    it('should return package paths keyed by package folder', async () => {
      setup()
      await expect(getPackagePathsByFolder({ filesystem: fs as never })).resolves.toEqual({
        'wayne-manor': 'modules/wayne-manor',
        'wayne-tower': 'libraries/wayne-tower',
      })
    })

    it('should not return paths of folder without package.json', async () => {
      setup({
        'libraries/leftover-from-exploration-on-branch/lib/index.js': 'nothing here',
      })

      await expect(getPackagePathsByFolder({ filesystem: fs as never })).resolves.toEqual({
        'wayne-manor': 'modules/wayne-manor',
        'wayne-tower': 'libraries/wayne-tower',
      })
    })
  })
})
