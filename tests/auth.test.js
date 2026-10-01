import { beforeAll, expect, it, vi } from 'vitest'
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose'
const state = vi.hoisted(() => ({ keys: null }))
vi.mock('jose', async original => ({ ...(await original()), createRemoteJWKSet: () => (...args) => state.keys(...args) }))
import { verifyUser } from '../api/_lib/auth.js'
let privateKey
beforeAll(async () => {
 const pair = await generateKeyPair('RS256'); privateKey = pair.privateKey
 const jwk = await exportJWK(pair.publicKey); jwk.kid = 'test'; jwk.alg = 'RS256'
 state.keys = createLocalJWKSet({ keys: [jwk] })
})
async function token(overrides = {}) {
 const now = Math.floor(Date.now() / 1000)
 return new SignJWT({ sub: 'alice', aud: 'demo-studysync', iss: 'https://securetoken.google.com/demo-studysync', iat: now, exp: now + 3600, auth_time: now, ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(privateKey)
}
it('accepts a valid signed Firebase token', async () => expect(await verifyUser(await token(), 'demo-studysync')).toBe('alice'))
it('rejects missing credentials', async () => expect(verifyUser(null, 'demo-studysync')).rejects.toMatchObject({ status: 401 }))
it.each([
 { aud: 'different-project' }, { iss: 'https://attacker.example' }, { exp: 1 }, { exp: undefined }, { sub: '' }, { auth_time: 9999999999 }, { iat: 9999999999 },
])('rejects invalid token claims %j', async claims => expect(verifyUser(await token(claims), 'demo-studysync')).rejects.toMatchObject({ status: 401 }))
it('rejects a forged signature', async () => {
 const signed = await token(); const parts = signed.split('.'); parts[2] = 'invalid'
 await expect(verifyUser(parts.join('.'), 'demo-studysync')).rejects.toMatchObject({ status: 401 })
})
