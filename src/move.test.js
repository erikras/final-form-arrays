import move from './move'
import { getIn, setIn } from 'final-form'

describe('move', () => {
  const getOp = (from, to) => {
    const changeValue = jest.fn()
    move(['foo', from, to], { fields: {} }, { changeValue })
    return changeValue.mock.calls[0][2]
  }

  it('should do nothing if from and to are equal', () => {
    const changeValue = jest.fn()
    const result = move(['foo', 1, 1], { fields: {} }, { changeValue })
    expect(result).toBeUndefined()
    expect(changeValue).not.toHaveBeenCalled()
  })

  it('should call changeValue once', () => {
    const changeValue = jest.fn()
    const state = { fields: {} }
    const result = move(['foo', 0, 2], state, { changeValue })
    expect(result).toBeUndefined()
    expect(changeValue).toHaveBeenCalled()
    expect(changeValue).toHaveBeenCalledTimes(1)
    expect(changeValue.mock.calls[0][0]).toBe(state)
    expect(changeValue.mock.calls[0][1]).toBe('foo')
    expect(typeof changeValue.mock.calls[0][2]).toBe('function')
  })

  it('should treat undefined like an empty array', () => {
    const op = getOp(0, 1)
    const result = op(undefined)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0]).toBeUndefined()
    expect(result[1]).toBeUndefined()
  })

  it('should move value from one index to another', () => {
    const op = getOp(0, 2)
    const array = ['a', 'b', 'c', 'd']
    const result = op(array)
    expect(result).not.toBe(array) // copied
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['b', 'c', 'a', 'd'])
  })

  it('should move field state from low index to high index', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: ['apple', 'banana', 'carrot', 'date']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'Error A',
          lastFieldState: 'anything'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: true,
          error: 'Error B',
          lastFieldState: 'anything'
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: false,
          error: 'Error C',
          lastFieldState: 'anything'
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'Error D',
          lastFieldState: 'anything'
        }
      }
    }
    move(['foo', 0, 2], state, { changeValue })
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['banana', 'carrot', 'apple', 'date']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'Error B',
          lastFieldState: undefined
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'Error C',
          lastFieldState: undefined
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: true,
          error: 'Error A',
          lastFieldState: undefined
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'Error D',
          lastFieldState: 'anything' // unchanged
        }
      }
    })
  })

  it('should move field state from high index to low index', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: ['apple', 'banana', 'carrot', 'date']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'Error A',
          lastFieldState: 'anything'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: true,
          error: 'Error B',
          lastFieldState: 'anything'
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: false,
          error: 'Error C',
          lastFieldState: 'anything'
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'Error D',
          lastFieldState: 'anything'
        }
      }
    }
    move(['foo', 2, 0], state, { changeValue })
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['carrot', 'apple', 'banana', 'date']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: false,
          error: 'Error C',
          lastFieldState: undefined
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: true,
          error: 'Error A',
          lastFieldState: undefined
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: true,
          error: 'Error B',
          lastFieldState: undefined
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'Error D',
          lastFieldState: 'anything' // unchanged
        }
      }
    })
  })

  it('should move deep field state from low index to high index', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: [
            { dog: 'apple dog', cat: 'apple cat' },
            { dog: 'banana dog', cat: 'banana cat' },
            { dog: 'carrot dog', cat: 'carrot cat' },
            { dog: 'date dog', cat: 'date cat' }
          ]
        }
      },
      fields: {
        'foo[0].dog': {
          name: 'foo[0].dog',
          touched: true,
          error: 'Error A Dog'
        },
        'foo[0].cat': {
          name: 'foo[0].cat',
          touched: false,
          error: 'Error A Cat'
        },
        'foo[1].dog': {
          name: 'foo[1].dog',
          touched: true,
          error: 'Error B Dog'
        },
        'foo[1].cat': {
          name: 'foo[1].cat',
          touched: true,
          error: 'Error B Cat'
        },
        'foo[2].dog': {
          name: 'foo[2].dog',
          touched: true,
          error: 'Error C Dog'
        },
        'foo[2].cat': {
          name: 'foo[2].cat',
          touched: false,
          error: 'Error C Cat'
        },
        'foo[3].dog': {
          name: 'foo[3].dog',
          touched: false,
          error: 'Error D Dog'
        },
        'foo[3].cat': {
          name: 'foo[3].cat',
          touched: true,
          error: 'Error D Cat'
        }
      }
    }
    move(['foo', 0, 2], state, { changeValue })
    expect(state).toEqual({
      formState: {
        values: {
          foo: [
            { dog: 'banana dog', cat: 'banana cat' },
            { dog: 'carrot dog', cat: 'carrot cat' },
            { dog: 'apple dog', cat: 'apple cat' },
            { dog: 'date dog', cat: 'date cat' }
          ]
        }
      },
      fields: {
        'foo[0].dog': {
          name: 'foo[0].dog',
          touched: true,
          error: 'Error B Dog'
        },
        'foo[0].cat': {
          name: 'foo[0].cat',
          touched: true,
          error: 'Error B Cat'
        },
        'foo[1].dog': {
          name: 'foo[1].dog',
          touched: true,
          error: 'Error C Dog'
        },
        'foo[1].cat': {
          name: 'foo[1].cat',
          touched: false,
          error: 'Error C Cat'
        },
        'foo[2].dog': {
          name: 'foo[2].dog',
          touched: true,
          error: 'Error A Dog'
        },
        'foo[2].cat': {
          name: 'foo[2].cat',
          touched: false,
          error: 'Error A Cat'
        },
        'foo[3].dog': {
          name: 'foo[3].dog',
          touched: false,
          error: 'Error D Dog'
        },
        'foo[3].cat': {
          name: 'foo[3].cat',
          touched: true,
          error: 'Error D Cat'
        }
      }
    })
  })

  it('should move deep field state from high index to low index', () => {
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: [
            { dog: 'apple dog', cat: 'apple cat' },
            { dog: 'banana dog', cat: 'banana cat' },
            { dog: 'carrot dog', cat: 'carrot cat' },
            { dog: 'date dog', cat: 'date cat' }
          ]
        }
      },
      fields: {
        'foo[0].dog': {
          name: 'foo[0].dog',
          touched: true,
          error: 'Error A Dog'
        },
        'foo[0].cat': {
          name: 'foo[0].cat',
          touched: false,
          error: 'Error A Cat'
        },
        'foo[1].dog': {
          name: 'foo[1].dog',
          touched: true,
          error: 'Error B Dog'
        },
        'foo[1].cat': {
          name: 'foo[1].cat',
          touched: true,
          error: 'Error B Cat'
        },
        'foo[2].dog': {
          name: 'foo[2].dog',
          touched: true,
          error: 'Error C Dog'
        },
        'foo[2].cat': {
          name: 'foo[2].cat',
          touched: false,
          error: 'Error C Cat'
        },
        'foo[3].dog': {
          name: 'foo[3].dog',
          touched: false,
          error: 'Error D Dog'
        },
        'foo[3].cat': {
          name: 'foo[3].cat',
          touched: true,
          error: 'Error D Cat'
        }
      }
    }
    move(['foo', 2, 0], state, { changeValue })
    expect(state).toEqual({
      formState: {
        values: {
          foo: [
            { dog: 'carrot dog', cat: 'carrot cat' },
            { dog: 'apple dog', cat: 'apple cat' },
            { dog: 'banana dog', cat: 'banana cat' },
            { dog: 'date dog', cat: 'date cat' }
          ]
        }
      },
      fields: {
        'foo[0].dog': {
          name: 'foo[0].dog',
          touched: true,
          error: 'Error C Dog'
        },
        'foo[0].cat': {
          name: 'foo[0].cat',
          touched: false,
          error: 'Error C Cat'
        },
        'foo[1].dog': {
          name: 'foo[1].dog',
          touched: true,
          error: 'Error A Dog'
        },
        'foo[1].cat': {
          name: 'foo[1].cat',
          touched: false,
          error: 'Error A Cat'
        },
        'foo[2].dog': {
          name: 'foo[2].dog',
          touched: true,
          error: 'Error B Dog'
        },
        'foo[2].cat': {
          name: 'foo[2].cat',
          touched: true,
          error: 'Error B Cat'
        },
        'foo[3].dog': {
          name: 'foo[3].dog',
          touched: false,
          error: 'Error D Dog'
        },
        'foo[3].cat': {
          name: 'foo[3].cat',
          touched: true,
          error: 'Error D Cat'
        }
      }
    })
  })
})
