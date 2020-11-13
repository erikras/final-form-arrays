import swap from './swap'
import { getIn, setIn } from 'final-form'

describe('swap', () => {
  const getOp = (from, to) => {
    const changeValue = jest.fn()
    swap(['foo', from, to], { fields: {} }, { changeValue })
    return changeValue.mock.calls[0][2]
  }

  it('should do nothing if indexA and indexB are equal', () => {
    const changeValue = jest.fn()
    const result = swap(['foo', 1, 1], { fields: {} }, { changeValue })
    expect(result).toBeUndefined()
    expect(changeValue).not.toHaveBeenCalled()
  })

  it('should call changeValue once', () => {
    const changeValue = jest.fn()
    const state = { fields: {} }
    const result = swap(['foo', 0, 2], state, { changeValue })
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
    expect(result.length).toBe(2)
    expect(result[0]).toBeUndefined()
    expect(result[1]).toBeUndefined()
  })

  it('should swap values at specified indexes', () => {
    const op = getOp(0, 2)
    const array = ['a', 'b', 'c', 'd']
    const result = op(array)
    expect(result).not.toBe(array) // copied
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(['c', 'b', 'a', 'd'])
  })

  it('should swap field state as well as values', () => {
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
    swap(['foo', 0, 2], state, { changeValue })
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['carrot', 'banana', 'apple', 'date']
        }
      },
      fields: {
        'foo[2]': {
          name: 'foo[2]',
          touched: true,
          error: 'Error A',
          lastFieldState: undefined
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: true,
          error: 'Error B',
          lastFieldState: 'anything' // unchanged
        },
        'foo[0]': {
          name: 'foo[0]',
          touched: false,
          error: 'Error C',
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

  it('should swap field state for deep fields and different shapes', () => {
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
            { dog: 'apple dog', cat: 'apple cat', rock: 'black' },
            { dog: 'banana dog', cat: 'banana cat' },
            { dog: 'carrot dog', cat: 'carrot cat', axe: 'golden' },
            { dog: 'date dog', cat: 'date cat' }
          ]
        }
      },
      fields: {
        'foo[0].dog': {
          name: 'foo[0].dog',
          touched: true,
          error: 'Error A Dog',
          lastFieldState: 'anything'
        },
        'foo[0].cat': {
          name: 'foo[0].cat',
          touched: false,
          error: 'Error A Cat',
          lastFieldState: 'anything'
        },
        'foo[0].rock': {
          name: 'foo[0].rock',
          touched: false,
          error: 'Error A Rock',
          lastFieldState: 'anything'
        },
        'foo[1].dog': {
          name: 'foo[1].dog',
          touched: true,
          error: 'Error B Dog',
          lastFieldState: 'anything'
        },
        'foo[1].cat': {
          name: 'foo[1].cat',
          touched: true,
          error: 'Error B Cat',
          lastFieldState: 'anything'
        },
        'foo[2].dog': {
          name: 'foo[2].dog',
          touched: true,
          error: 'Error C Dog',
          lastFieldState: 'anything'
        },
        'foo[2].cat': {
          name: 'foo[2].cat',
          touched: false,
          error: 'Error C Cat',
          lastFieldState: 'anything'
        },
        'foo[2].axe': {
          name: 'foo[2].axe',
          touched: false,
          error: 'Error C Axe',
          lastFieldState: 'anything'
        },
        'foo[3].dog': {
          name: 'foo[3].dog',
          touched: false,
          error: 'Error D Dog',
          lastFieldState: 'anything'
        },
        'foo[3].cat': {
          name: 'foo[3].cat',
          touched: true,
          error: 'Error D Cat',
          lastFieldState: 'anything'
        }
      }
    }
    swap(['foo', 0, 2], state, { changeValue })
    expect(state).toEqual({
      formState: {
        values: {
          foo: [
            { dog: 'carrot dog', cat: 'carrot cat', axe: 'golden' },
            { dog: 'banana dog', cat: 'banana cat' },
            { dog: 'apple dog', cat: 'apple cat', rock: 'black' },
            { dog: 'date dog', cat: 'date cat' }
          ]
        }
      },
      fields: {
        'foo[2].dog': {
          name: 'foo[2].dog',
          touched: true,
          error: 'Error A Dog',
          lastFieldState: undefined
        },
        'foo[2].cat': {
          name: 'foo[2].cat',
          touched: false,
          error: 'Error A Cat',
          lastFieldState: undefined
        },
        'foo[2].rock': {
          name: 'foo[2].rock',
          touched: false,
          error: 'Error A Rock',
          lastFieldState: undefined
        },
        'foo[1].dog': {
          name: 'foo[1].dog',
          touched: true,
          error: 'Error B Dog',
          lastFieldState: 'anything' // unchanged
        },
        'foo[1].cat': {
          name: 'foo[1].cat',
          touched: true,
          error: 'Error B Cat',
          lastFieldState: 'anything' // unchanged
        },
        'foo[0].dog': {
          name: 'foo[0].dog',
          touched: true,
          error: 'Error C Dog',
          lastFieldState: undefined
        },
        'foo[0].cat': {
          name: 'foo[0].cat',
          touched: false,
          error: 'Error C Cat',
          lastFieldState: undefined
        },
        'foo[0].axe': {
          name: 'foo[0].axe',
          touched: false,
          error: 'Error C Axe',
          lastFieldState: undefined
        },
        'foo[3].dog': {
          name: 'foo[3].dog',
          touched: false,
          error: 'Error D Dog',
          lastFieldState: 'anything' // unchanged
        },
        'foo[3].cat': {
          name: 'foo[3].cat',
          touched: true,
          error: 'Error D Cat',
          lastFieldState: 'anything' // unchanged
        }
      }
    })
  })

  it('should preserve functions in field state', () => {
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
          lastFieldState: 'anything',
          change: () => 'foo[0]'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: true,
          error: 'Error B',
          lastFieldState: 'anything',
          change: () => 'foo[1]'
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: false,
          error: 'Error C',
          lastFieldState: 'anything',
          change: () => 'foo[2]'
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'Error D',
          lastFieldState: 'anything',
          change: () => 'foo[3]'
        }
      }
    }
    swap(['foo', 0, 2], state, { changeValue })
    expect(state.fields['foo[0]'].change()).toBe('foo[0]')
    expect(state.fields['foo[1]'].change()).toBe('foo[1]')
    expect(state.fields['foo[2]'].change()).toBe('foo[2]')
    expect(state.fields['foo[3]'].change()).toBe('foo[3]')
  })
})
