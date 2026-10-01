import { it, expect, vi } from 'vitest'
import { installPreloadRecovery } from '../src/lib/preloadRecovery.js'

it('recovers a stale deployment import once without a reload loop', () => {
  const stored = new Map()
  let handler
  const target = {
    addEventListener: (_, fn) => { handler = fn },
    sessionStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    location: { reload: vi.fn() },
  }
  installPreloadRecovery(target)
  const first = { preventDefault: vi.fn() }
  handler(first)
  expect(first.preventDefault).toHaveBeenCalledOnce()
  expect(target.location.reload).toHaveBeenCalledOnce()
  const second = { preventDefault: vi.fn() }
  handler(second)
  expect(target.location.reload).toHaveBeenCalledOnce()
  expect(second.preventDefault).not.toHaveBeenCalled()
})
