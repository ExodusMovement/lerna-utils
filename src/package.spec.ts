import { Volume } from 'memfs/lib/volume'
import {
  getPackageNameByPath,
  getPackagePaths,
  getPackagePathsByFolder,
  getPackageRoots,
  getPathsByPackageNames,
  parsePackageFiles,
} from './package'
import { createFsFromJSON } from './utils/testing'

describe('package', () => {
  let fs: Volume

  describe('getPackageRoots', () => {
    it('should return normalized package roots', async () => {
      fs = createFsFromJSON({
        'lerna.json': JSON.stringify({
          packages: ['libraries', 'modules/*', 'single/package', 'nested/**/package'],
        }),
        'libraries/wayne-manor/package.json': 'some content',
        'modules/wayne-tower/package.json': 'some content',
        'single/package/package.json': 'some content',
        'nested/bruce-wayne/package/package.json': 'some content',
        'nested/batman/package/package.json': 'some content',
      })

      await expect(getPackageRoots({ filesystem: fs as never })).resolves.toEqual([
        'libraries',
        'modules',
        'single/package',
        'nested/bruce-wayne/package',
        'nested/batman/package',
      ])
    })

    it('should return normalized paths for grouped package roots', async () => {
      fs = createFsFromJSON({
        'lerna.json': JSON.stringify({
          packages: [
            'libraries',
            'modules/exchange/{exchange,exchange-monitors}',
            'single/package',
          ],
        }),
        'libraries/wayne-manor/package.json': 'some content',
        'modules/exchange/exchange/package.json': 'some content',
        'modules/exchange/exchange-monitors/package.json': 'some content',
        'single/package/package.json': 'some content',
      })

      await expect(getPackageRoots({ filesystem: fs as never })).resolves.toEqual([
        'libraries',
        'single/package',
        'modules/exchange/exchange',
        'modules/exchange/exchange-monitors',
      ])
    })
  })

  describe('getPackageNameByPath', () => {
    beforeEach(() => {
      fs = createFsFromJSON({
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

  const setup = (
    additionalContents: { [path: string]: string } = {},
    additionalPackages: string[] = []
  ) => {
    fs = createFsFromJSON({
      'lerna.json': JSON.stringify({
        packages: ['modules/*', 'libraries/*', 'empty/*', ...additionalPackages],
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

    it('should return path for a single package root', async () => {
      setup(
        {
          'single/package/package.json': JSON.stringify({
            name: '@exodus/package',
          }),
        },
        ['single/package', 'groups/{bruce,batman}']
      )

      await expect(getPackagePaths({ filesystem: fs as never })).resolves.toEqual([
        'modules/wayne-manor',
        'libraries/wayne-tower',
        'single/package',
      ])
    })

    it('should return paths for grouped packages', async () => {
      setup(
        {
          'groups/bruce/package.json': JSON.stringify({
            name: '@exodus/bruce',
          }),
          'groups/batman/package.json': JSON.stringify({
            name: '@exodus/batman',
          }),
        },
        ['groups/{bruce,batman}']
      )

      await expect(getPackagePaths({ filesystem: fs as never })).resolves.toEqual([
        'modules/wayne-manor',
        'libraries/wayne-tower',
        'groups/bruce',
        'groups/batman',
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

  describe('parsePackageFiles', () => {
    it('should parse files as JSON and return contents ', async () => {
      fs = createFsFromJSON({
        'lerna.json': JSON.stringify({
          packages: ['modules/*', 'libraries/*', 'empty/*'],
        }),
        'modules/wayne-manor/package.json': JSON.stringify({
          name: '@exodus/wayne-manor',
        }),
        'libraries/wayne-tower/package.json': JSON.stringify({
          name: '@exodus/wayne-tower',
        }),
        'libraries/without-coverage/package.json': JSON.stringify({
          name: '@exodus/without-coverage',
        }),
        'modules/wayne-manor/coverage/coverage-summary.json': JSON.stringify({
          lines: { total: 42 },
        }),
        'libraries/wayne-tower/coverage/coverage-summary.json': JSON.stringify({
          lines: { total: 73 },
        }),
      })

      await expect(
        parsePackageFiles<{ lines: { total: number } }>('coverage/coverage-summary.json', {
          filesystem: fs as never,
        })
      ).resolves.toEqual([
        {
          path: 'modules/wayne-manor/coverage/coverage-summary.json',
          content: { lines: { total: 42 } },
        },
        {
          path: 'libraries/wayne-tower/coverage/coverage-summary.json',
          content: { lines: { total: 73 } },
        },
      ])
    })
  })

  describe('getPathsByPackageNames', () => {
    it('should return paths keyed by package name', async () => {
      setup()

      await expect(
        getPathsByPackageNames({
          filesystem: fs as never,
        })
      ).resolves.toEqual({
        '@exodus/wayne-manor': 'modules/wayne-manor',
        '@exodus/wayne-tower': 'libraries/wayne-tower',
      })
    })
  })
})
