import { verifyUser } from './_lib/auth.js'
import { reserveQuota } from './_lib/quota.js'
import { ApiError } from './_lib/errors.js'
import { validateInput, validateOutput, buildPrompt } from '../shared/ai.js'
export function createHandler({ verify = verifyUser, reserve = reserveQuota, fetcher = fetch, env = process.env } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Use POST.', code: 'METHOD_NOT_ALLOWED' }) }
    try {
      const origin = req.headers.origin
      if (origin && req.headers.host && new URL(origin).host !== req.headers.host) throw new ApiError(403, 'ORIGIN_REJECTED', 'Requests must come from StudySync.')
      const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID
      if (!env.GEMINI_API_KEY || !projectId) throw new ApiError(503, 'NOT_CONFIGURED', 'The study assistant is not configured yet. Your notes are still available.')
      const token = /^Bearer (.+)$/.exec(req.headers.authorization || '')?.[1]
      const uid = await verify(token, projectId)
      let input
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        if (JSON.stringify(body || '').length > 65000) throw new Error('Request is too large.')
        input = validateInput(body)
      } catch (error) { throw new ApiError(400, 'INVALID_INPUT', error.message) }
      await reserve({ uid, token, projectId, fetcher })
      const { system, prompt, json } = buildPrompt(input)
      const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
      if (!/^[a-zA-Z0-9.-]+$/.test(model)) throw new ApiError(503, 'NOT_CONFIGURED', 'Invalid AI model configuration.')
      const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        signal: AbortSignal.timeout(35000), body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 6000, ...(json ? { responseMimeType: 'application/json' } : {}) },
        }),
      })
      if (!response.ok) {
        if (response.status === 429) throw new ApiError(429, 'PROVIDER_LIMIT', 'The AI provider is busy or out of quota. Please try again later.')
        if ([401, 403, 404].includes(response.status)) throw new ApiError(503, 'PROVIDER_CONFIGURATION', 'The AI service needs configuration. Please contact the app owner.')
        throw new ApiError(502, 'PROVIDER_ERROR', 'The AI service is temporarily unavailable. Try again shortly.')
      }
      const data = await response.json()
      const generated = data.candidates?.[0]?.content?.parts?.filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('')
      let result
      try { result = validateOutput(input.action, json ? JSON.parse(generated) : generated) }
      catch { throw new ApiError(502, 'INVALID_OUTPUT', 'The assistant returned incomplete materials. Please try again.') }
      return res.status(200).json({ result, model })
    } catch (error) {
      const timeout = ['TimeoutError', 'AbortError'].includes(error.name)
      const status = error instanceof ApiError ? error.status : timeout ? 504 : 500
      return res.status(status).json({ error: error instanceof ApiError ? error.message : timeout ? 'The request timed out. Please try again.' : 'The study assistant could not complete this request.', code: error.code || (timeout ? 'TIMEOUT' : 'INTERNAL_ERROR') })
    }
  }
}
export default createHandler()
