import pop from './pop'
import { getIn, setIn } from 'final-form'

describe('pop', () => {
  it('should call changeValue once', () => {
    const changeValue = jest.fn()
    const state = {
      formState: {
        values: {
          foo: ['one', 'two']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'First Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'Second Error'
        }
      }
    }
    const result = pop(['foo'], state, { changeValue, getIn, setIn })
    expect(result).toBeUndefined()
    expect(changeValue).toHaveBeenCalled()
    expect(changeValue).toHaveBeenCalledTimes(1)
    expect(changeValue.mock.calls[0][0]).toBe(state)
    expect(changeValue.mock.calls[0][1]).toBe('foo')
    expect(typeof changeValue.mock.calls[0][2]).toBe('function')
  })

  it('should return undefined if array is undefined', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: undefined
        }
      },
      fields: {}
    }
    const returnValue = pop(['foo'], state, { changeValue, getIn, setIn })
    expect(returnValue).toBeUndefined()
    const result = state.formState.foo
    expect(result).toBeUndefined()
  })

  it('should return empty array if array is empty', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: []
        }
      },
      fields: {}
    }
    const returnValue = pop(['foo'], state, { changeValue, getIn, setIn })
    expect(returnValue).toBeUndefined()
    const result = state.formState.values.foo
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  it('should pop value off the end of array and return it', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = jest.fn((state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    })  
    const state = {
      formState: {
        values: {
          foo: ['a', 'b', 'c']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'First Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'Second Error'
        }
      }
    }
    const returnValue = pop(['foo'], state, { changeValue, getIn, setIn })
    const result = state.formState.values.foo
    expect(returnValue).toBe('c')
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['a', 'b'])
  })

  it('should pop value off the end of array and return it', () => {
    const array = ['a', 'b', 'c', 'd']
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: array,
          anotherField: 42
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'A Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'B Error'
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: true,
          error: 'C Error'
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'D Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    }
    const returnValue = pop(['foo'], state, { changeValue, getIn, setIn })
    expect(returnValue).toBe('d')
    expect(Array.isArray(state.formState.values.foo)).toBe(true)
    expect(state.formState.values.foo).not.toBe(array) // copied
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['a', 'b', 'c'],
          anotherField: 42
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'A Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'B Error'
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: true,
          error: 'C Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    })
  })

  it('should pop value off the end of array and return it (nested arrays)', () => {
    const array = ['a', 'b', 'c', 'd']
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: [array],
          anotherField: 42
        }
      },
      fields: {
        'foo[0][0]': {
          name: 'foo[0][0]',
          touched: true,
          error: 'A Error'
        },
        'foo[0][1]': {
          name: 'foo[0][1]',
          touched: false,
          error: 'B Error'
        },
        'foo[0][2]': {
          name: 'foo[0][2]',
          touched: true,
          error: 'C Error'
        },
        'foo[0][3]': {
          name: 'foo[0][3]',
          touched: false,
          error: 'D Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    }
    const returnValue = pop(['foo[0]'], state, { changeValue, getIn, setIn })
    expect(returnValue).toBe('d')
    expect(Array.isArray(state.formState.values.foo)).toBe(true)
    expect(state.formState.values.foo).not.toBe(array) // copied
    expect(state).toEqual({
      formState: {
        values: {
          foo: [['a', 'b', 'c']],
          anotherField: 42
        }
      },
      fields: {
        'foo[0][0]': {
          name: 'foo[0][0]',
          touched: true,
          error: 'A Error'
        },
        'foo[0][1]': {
          name: 'foo[0][1]',
          touched: false,
          error: 'B Error'
        },
        'foo[0][2]': {
          name: 'foo[0][2]',
          touched: true,
          error: 'C Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    })
  })
})
