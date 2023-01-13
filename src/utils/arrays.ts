export async function filterAsync<T>(
  array: T[],
  predicate: (value: T) => Promise<unknown>
): Promise<T[]> {
  const itemsAndUndefineds = await Promise.all(
    array.map(async (item) => {
      if (await predicate(item)) return item
    })
  )

  return itemsAndUndefineds.filter((item) => !!item) as T[]
}
