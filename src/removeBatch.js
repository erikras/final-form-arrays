// @flow
import type { MutableState, Mutator, Tools } from 'final-form'
import copyField from './copyField'
import { escapeRegexTokens } from './utils'

const binarySearch = (list: number[], value: number): number => {
  // This algorithm assumes the items in list is unique
  let first = 0
  let last = list.length - 1
  let middle = 0

  while (first <= last) {
    middle = Math.floor((first + last) / 2)
    if (list[middle] === value) {
      return middle
    }

    if (list[middle] > value) {
      last = middle - 1
    } else {
      first = middle + 1
    }
  }

  return ~first
}

const removeBatch: Mutator<any> = (
  [name, indexes]: any[],
  state: MutableState<any>,
  { changeValue }: Tools<any>
) => {
  if (indexes.length === 0) {
    return []
  }

  const sortedIndexes: number[] = [...indexes]
  sortedIndexes.sort()

  // Remove duplicates
  for (let i = sortedIndexes.length - 1; i > 0; i -= 1) {
    if (sortedIndexes[i] === sortedIndexes[i - 1]) {
      sortedIndexes.splice(i, 1)
    }
  }

  let returnValue = []
  changeValue(state, name, (array: ?(any[])): ?(any[]) => {
    // use original order of indexes for return value
    returnValue = indexes.map(index => array && array[index])

    if (!array) {
      return array
    }

    const copy = [...array]
    for (let i = sortedIndexes.length - 1; i >= 0; i -= 1) {
      const index = sortedIndexes[i]
      copy.splice(index, 1)
    }

    return copy.length > 0
      ? copy
      : undefined
  })

  // now we have to remove any subfields for our indexes,
  // and decrement all higher indexes.
  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`)
  const newFields = {}
  Object.keys(state.fields).forEach(key => {
    const tokens = pattern.exec(key)
    if (tokens) {
      const fieldIndex = Number(tokens[1])
      const indexOfFieldIndex = binarySearch(sortedIndexes, fieldIndex)
      if (indexOfFieldIndex >= 0) {
        // One of the removed indices
        return
      }

      if (fieldIndex > sortedIndexes[0]) {
        // Shift all higher indices down
        const decrementedKey = `${name}[${fieldIndex - ~indexOfFieldIndex}]${
          tokens[2]
        }`
        copyField(state.fields, key, newFields, decrementedKey)
        return
      }
    }

    // Keep this field that does not match the name,
    // or has index smaller than what is being removed
    newFields[key] = state.fields[key]
  })

  state.fields = newFields
  return returnValue
}

export default removeBatch
