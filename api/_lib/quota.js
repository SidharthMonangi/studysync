import { ApiError } from './errors.js'
// Firestore rules enforce the same daily limit and cooldown on every instance.
export async function reserveQuota({ uid, token, projectId, fetcher = fetch, now = new Date() }) {
  const day = now.toISOString().slice(0, 10).replaceAll('-', '')
  const name = `projects/${projectId}/databases/(default)/documents/users/${uid}/aiUsage/${day}`
  const base = `https://firestore.googleapis.com/v1/${name}`
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const options = { headers, signal: AbortSignal.timeout(10000) }
  const current = await fetcher(base, options)
  if (!current.ok && current.status !== 404) throw new ApiError(503, 'STORAGE_UNAVAILABLE', 'Study assistant storage is unavailable. Please try again later.')
  const data = current.ok ? await current.json() : null
  const count = Number(data?.fields?.count?.integerValue || 0)
  const previous = Date.parse(data?.fields?.lastRequest?.timestampValue || '')
  if (count >= 20) throw new ApiError(429, 'DAILY_LIMIT', 'You have used today’s 20 AI requests. Try again tomorrow (UTC).')
  if (Number.isFinite(previous) && now.getTime() - previous < 10000) throw new ApiError(429, 'COOLDOWN', 'Please wait 10 seconds between AI requests.')
  const commit = await fetcher(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`, {
    ...options, method: 'POST', body: JSON.stringify({ writes: [{
      update: { name, fields: { count: { integerValue: String(count + 1) } } },
      updateTransforms: [{ fieldPath: 'lastRequest', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: data ? { updateTime: data.updateTime } : { exists: false },
    }] }),
  })
  if (!commit.ok) {
    if ([403, 409, 412].includes(commit.status)) throw new ApiError(429, 'QUOTA_CONFLICT', 'Please wait before retrying. Your study assistant usage limit could not be reserved.')
    throw new ApiError(503, 'STORAGE_UNAVAILABLE', 'Unable to reserve an AI request. Please try later.')
  }
}
