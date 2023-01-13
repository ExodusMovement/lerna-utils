import { filterAsync } from './arrays'

describe('arrays', () => {
  describe('filterAsync', () => {
    it('should filter based on provide predicate', async () => {
      const items = [0, 1, 2, 3, 4, 5, 6]
      const hasRest = async (number: number) => {
        await new Promise((resolve) => setTimeout(resolve, 1))
        return number % 2 !== 0
      }

      await expect(filterAsync(items, hasRest)).resolves.toEqual([1, 3, 5])
    })
  })
})
