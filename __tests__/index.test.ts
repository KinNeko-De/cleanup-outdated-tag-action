/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../src/main')

describe('index', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('calls run when imported', async () => {
    const main = await import('../src/main')
    await import('../src/index')

    expect(main.run).toHaveBeenCalled()
  })
})
