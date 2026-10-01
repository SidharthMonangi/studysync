import { createRemoteJWKSet, jwtVerify } from 'jose'
import { ApiError } from './errors.js'
const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))
export async function verifyUser(token, projectId) {
  if (!token) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in to use the study assistant.')
  try {
    const { payload } = await jwtVerify(token, keys, {
      algorithms: ['RS256'], requiredClaims: ['sub', 'iat', 'exp', 'auth_time'], audience: projectId, issuer: `https://securetoken.google.com/${projectId}`,
    })
    if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128 || !Number.isInteger(payload.iat) || payload.iat > Date.now() / 1000 || !Number.isInteger(payload.auth_time) || payload.auth_time > Date.now() / 1000) throw new Error('Invalid user')
    return payload.sub
  } catch {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Your session expired. Sign in again.')
  }
}
