import { describe, expect, it } from 'vitest'
import provider from '../src'

describe('should', () => {
  it('provider should be a provider function', () => {
    expect(typeof provider.init).toBe('function')
  })
})
