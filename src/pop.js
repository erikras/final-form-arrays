// @flow
import type { MutableState, Mutator, Tools } from 'final-form'
import remove from './remove'

const pop: Mutator<any> = (
  [name]: any[],
  state: MutableState<any>,
  tools: Tools<any>
) => {
  const { getIn } = tools;
  const array = getIn(state.formState.values, name)
  return array && array.length > 0
    ? remove([name, array.length - 1], state, tools)
    : undefined
}

export default pop
