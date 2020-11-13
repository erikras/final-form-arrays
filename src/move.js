// @flow
import type { MutableState, Mutator, Tools } from 'final-form'
import copyField from './copyField'
import { escapeRegexTokens } from './utils'

const move: Mutator<any> = (
  [name, from, to]: any[],
  state: MutableState<any>,
  { changeValue }: Tools<any>
) => {
  if (from === to) {
    return
  }
  changeValue(state, name, (array: ?(any[])): any[] => {
    const copy = [...(array || [])]
    const value = copy[from]
    copy.splice(from, 1)
    copy.splice(to, 0, value)
    return copy
  })

  const newFields = {}
  const pattern = new RegExp(`^${escapeRegexTokens(name)}\\[(\\d+)\\](.*)`)
  let lowest
  let highest
  let increment
  if (from > to) {
    lowest = to
    highest = from
    increment = 1
  } else {
    lowest = from
    highest = to
    increment = -1
  }
  Object.keys(state.fields).forEach(key => {
    const tokens = pattern.exec(key)
    if (tokens) {
      const fieldIndex = Number(tokens[1])
      if (fieldIndex === from) {
        const newKey = `${name}[${to}]${tokens[2]}`
        copyField(state.fields, key, newFields, newKey)
        return
      }
      
      if (lowest <= fieldIndex && fieldIndex <= highest) {
        // Shift all indices
        const newKey = `${name}[${fieldIndex + increment}]${tokens[2]}`
        copyField(state.fields, key, newFields, newKey)
        return
      }
    }

    // Keep this field that does not match the name,
    // or has index smaller or larger than affected range
    newFields[key] = state.fields[key]
  })

  state.fields = newFields
}

export default move
