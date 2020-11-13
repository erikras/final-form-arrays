import removeBatch from './removeBatch'
import { getIn, setIn } from 'final-form'

describe('removeBatch', () => {
  const getOp = value => {
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
    removeBatch(['foo', value], state, { changeValue })
    return changeValue.mock.calls[0][2]
  }

  it('should call changeValue once', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = jest.fn((state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    })
    function blur0() {}
    function change0() {}
    function focus0() {}
    function blur1() {}
    function change1() {}
    function focus1() {}
    function blur2() {}
    function change2() {}
    function focus2() {}
    const state = {
      formState: {
        values: {
          foo: ['one', 'two', 'three']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'First Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          blur: blur1,
          change: change1,
          focus: focus1,
          touched: false,
          error: 'Second Error'
        },
        'foo[2]': {
          name: 'foo[2]',
          blur: blur2,
          change: change2,
          focus: focus2,
          touched: true,
          error: 'Third Error'
        }
      }
    }
    const result = removeBatch(['foo', [1, 2]], state, { changeValue })
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['two', 'three'])
    expect(changeValue).toHaveBeenCalled()
    expect(changeValue).toHaveBeenCalledTimes(1)
    expect(changeValue.mock.calls[0][0]).toBe(state)
    expect(changeValue.mock.calls[0][1]).toBe('foo')
    expect(typeof changeValue.mock.calls[0][2]).toBe('function')
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['one']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'First Error',
          lastFieldState: undefined
        }
      }
    })
  })

  it('should not matter if indexes are out of order', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = jest.fn((state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    })
    function blur0() {}
    function change0() {}
    function focus0() {}
    function blur1() {}
    function change1() {}
    function focus1() {}
    function blur2() {}
    function change2() {}
    function focus2() {}
    const state = {
      formState: {
        values: {
          foo: ['one', 'two', 'three']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'First Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          blur: blur1,
          change: change1,
          focus: focus1,
          touched: false,
          error: 'Second Error'
        },
        'foo[2]': {
          name: 'foo[2]',
          blur: blur2,
          change: change2,
          focus: focus2,
          touched: true,
          error: 'Third Error'
        }
      }
    }
    const result = removeBatch(['foo', [2, 0]], state, { changeValue })
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['three', 'one'])
    expect(changeValue).toHaveBeenCalled()
    expect(changeValue).toHaveBeenCalledTimes(1)
    expect(changeValue.mock.calls[0][0]).toBe(state)
    expect(changeValue.mock.calls[0][1]).toBe('foo')
    expect(typeof changeValue.mock.calls[0][2]).toBe('function')
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['two']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: false,
          error: 'Second Error',
          lastFieldState: undefined
        }
      }
    })
  })

  it('should return undefined if array is undefined', () => {
    const op = getOp([0, 1])
    const result = op(undefined)
    expect(result).toBeUndefined()
  })

  it('should keep the original state if no indexes are specified to be removed', () => {
    const array = ['a', 'b', 'c', 'd', 'e']
    function blur0() {}
    function change0() {}
    function focus0() {}
    const state = {
      formState: {
        values: {
          foo: array
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'A Error'
        }
      }
    }
    const changeValue = jest.fn()
    const returnValue = removeBatch(['foo[0]', []], state, {
      changeValue
    })
    expect(returnValue).toEqual([])
    expect(state.formState.values.foo).toBe(array) // no change
    expect(state).toEqual({
      formState: {
        values: {
          foo: array
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'A Error'
        }
      }
    })
  })

  it('should remove the values at the specified indexes', () => {
    const op = getOp([1, 3])
    const result = op(['a', 'b', 'c', 'd', 'e'])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['a', 'c', 'e'])
  })

  it('should ignore duplicate indexes', () => {
    const op = getOp([1, 1, 1, 3])
    const result = op(['a', 'b', 'c', 'd', 'e'])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['a', 'c', 'e'])
  })

  it('should adjust higher indexes when removing', () => {
    const array = ['a', 'b', 'c', 'd', 'e']
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    function blur0() {}
    function blur1() {}
    function blur2() {}
    function blur3() {}
    function blur4() {}
    function change0() {}
    function change1() {}
    function change2() {}
    function change3() {}
    function change4() {}
    function focus0() {}
    function focus1() {}
    function focus2() {}
    function focus3() {}
    function focus4() {}
    const state = {
      formState: {
        values: {
          foo: array,
          anotherField: 42
        }
      },
      fields: {
        'foo[4]': {
          name: 'foo[4]',
          blur: blur4,
          change: change4,
          focus: focus4,
          touched: true,
          error: 'E Error'
        },
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'A Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          blur: blur1,
          change: change1,
          focus: focus1,
          touched: false,
          error: 'B Error'
        },
        'foo[2]': {
          name: 'foo[2]',
          blur: blur2,
          change: change2,
          focus: focus2,
          touched: true,
          error: 'C Error'
        },
        'foo[3]': {
          name: 'foo[3]',
          blur: blur3,
          change: change3,
          focus: focus3,
          touched: false,
          error: 'D Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    }
    const returnValue = removeBatch(['foo', [1, 3]], state, { changeValue })
    expect(returnValue).toEqual(['b', 'd'])
    expect(state.formState.values.foo).not.toBe(array) // copied
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['a', 'c', 'e'],
          anotherField: 42
        }
      },
      fields: {
        'foo[2]': {
          name: 'foo[2]',
          blur: blur2,
          change: change2,
          focus: focus2,
          touched: true,
          error: 'E Error',
          lastFieldState: undefined
        },
        'foo[0]': {
          name: 'foo[0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'A Error',
          lastFieldState: undefined
        },
        'foo[1]': {
          name: 'foo[1]',
          blur: blur1,
          change: change1,
          focus: focus1,
          touched: true,
          error: 'C Error',
          lastFieldState: undefined
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    })
  })

  it('should adjust higher indexes when removing (nested arrays)', () => {
    const array = ['a', 'b', 'c', 'd', 'e']
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    function blur0() {}
    function blur1() {}
    function blur2() {}
    function blur3() {}
    function blur4() {}
    function change0() {}
    function change1() {}
    function change2() {}
    function change3() {}
    function change4() {}
    function focus0() {}
    function focus1() {}
    function focus2() {}
    function focus3() {}
    function focus4() {}
    const state = {
      formState: {
        values: {
          foo: [array],
          anotherField: 42
        }
      },
      fields: {
        'foo[0][4]': {
          name: 'foo[0][4]',
          blur: blur4,
          change: change4,
          focus: focus4,
          touched: true,
          error: 'E Error'
        },
        'foo[0][0]': {
          name: 'foo[0][0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'A Error'
        },
        'foo[0][1]': {
          name: 'foo[0][1]',
          blur: blur1,
          change: change1,
          focus: focus1,
          touched: false,
          error: 'B Error'
        },
        'foo[0][2]': {
          name: 'foo[0][2]',
          blur: blur2,
          change: change2,
          focus: focus2,
          touched: true,
          error: 'C Error'
        },
        'foo[0][3]': {
          name: 'foo[0][3]',
          blur: blur3,
          change: change3,
          focus: focus3,
          touched: false,
          error: 'D Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    }
    const returnValue = removeBatch(['foo[0]', [1, 3]], state, {
      changeValue
    })
    expect(returnValue).toEqual(['b', 'd'])
    expect(state.formState.values.foo).not.toBe(array) // copied
    expect(state).toEqual({
      formState: {
        values: {
          foo: [['a', 'c', 'e']],
          anotherField: 42
        }
      },
      fields: {
        'foo[0][2]': {
          name: 'foo[0][2]',
          blur: blur2,
          change: change2,
          focus: focus2,
          touched: true,
          error: 'E Error',
          lastFieldState: undefined
        },
        'foo[0][0]': {
          name: 'foo[0][0]',
          blur: blur0,
          change: change0,
          focus: focus0,
          touched: true,
          error: 'A Error',
          lastFieldState: undefined
        },
        'foo[0][1]': {
          name: 'foo[0][1]',
          blur: blur1,
          change: change1,
          focus: focus1,
          touched: true,
          error: 'C Error',
          lastFieldState: undefined
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    })
  })
})
