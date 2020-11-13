// @flow
import type { MutableState, Mutator, Tools } from 'final-form'
import copyField from './copyField'

const swap: Mutator<any> = (
  [name, indexA, indexB]: any[],
  state: MutableState<any>,
  { changeValue }: Tools<any>
) => {
  if (indexA === indexB) {
    return
  }
  changeValue(state, name, (array: ?(any[])): any[] => {
    const copy = [...(array || [])]
    const a = copy[indexA]
    copy[indexA] = copy[indexB]
    copy[indexB] = a
    return copy
  })

  // swap all field state that begin with "name[indexA]" with that under "name[indexB]"
  const aPrefix = `${name}[${indexA}]`
  const bPrefix = `${name}[${indexB}]`
  const newFields = {}
  Object.keys(state.fields).forEach(key => {
    if (key.substring(0, aPrefix.length) === aPrefix) {
      const suffix = key.substring(aPrefix.length)
      const newKey = bPrefix + suffix
      copyField(state.fields, key, newFields, newKey)
    } else if (key.substring(0, bPrefix.length) === bPrefix) {
      const suffix = key.substring(bPrefix.length)
      const newKey = aPrefix + suffix
      copyField(state.fields, key, newFields, newKey)
    } else {
      // Keep this field that does not match the name
      newFields[key] = state.fields[key]
    }
  })

  state.fields = newFields
}

export default swap
