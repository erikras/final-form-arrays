// @flow
import type { MutableState, Mutator, Tools } from 'final-form'
import moveFieldState from './moveFieldState'
import { escapeRegexTokens } from './utils'

const countBelow = (array, value) =>
  array.reduce((count, item) => (item < value ? count + 1 : count), 0)

const removeBatch: Mutator<any> = (
  [name, indexes]: any[],
  state: MutableState<any>,
  { changeValue }: Tools<any>
) => {
  const sortedIndexes: number[] = [...indexes]
  sortedIndexes.sort((a, b) => a - b)
  // remove duplicates
  for (let i = 0; i < sortedIndexes.length; i++) {
    if (i > 0 && sortedIndexes[i] === sortedIndexes[i - 1]) {
      sortedIndexes.splice(i--, 1)
    }
  }

  let returnValue = []
  changeValue(state, name, (array: ?(any[])): ?(any[]) => {
    // use original order of indexes for return value
    returnValue = indexes.map(index => array && array[index])
    if (!array || !sortedIndexes.length) {
      return array
    }

    const copy = [...array]
    const removed = []
    sortedIndexes.forEach((index: number) => {
      copy.splice(index - removed.length, 1)
      removed.push(array && array[index])
    })
    return copy
  })

  // now we have to remove any subfields for our indexes,
  // and decrement all higher indexes.
  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`)
  const newState = { ...state, fields: {} }
  Object.keys(state.fields).forEach(key => {
    const tokens = pattern.exec(key)
    if (tokens) {
      const fieldIndex = Number(tokens[1])
      if (!~sortedIndexes.indexOf(fieldIndex)) {
        // not one of the removed indexes
        // shift all higher ones down
        const decrementedKey = `${name}[${fieldIndex -
          countBelow(sortedIndexes, fieldIndex)}]${tokens[2]}`
        moveFieldState(newState, state.fields[key], decrementedKey, state)
      }
    } else {
      newState.fields[key] = state.fields[key]
    }
  })
  state.fields = newState.fields
  return returnValue
}

export default removeBatch
