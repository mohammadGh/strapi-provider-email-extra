import { describe, expect, it } from 'vitest'
import { HelloFromMyTypeScriptLibrary } from '../src'

describe('should', () => {
  it('my hello msg should be exported correctly', () => {
    expect(HelloFromMyTypeScriptLibrary).toEqual('Hi, it\'s just another starter library!')
  })
})
