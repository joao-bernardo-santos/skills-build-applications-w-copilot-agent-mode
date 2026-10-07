const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()

export const API_BASE_URL = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000'

function getRecords(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.results)) {
      return payload.results
    }
    if (Array.isArray(payload.data)) {
      return payload.data
    }
  }

  throw new TypeError('The API response must be an array or a paginated response.')
}

export async function fetchCollection(path, { signal } = {}, fetchImpl = fetch) {
  const response = await fetchImpl(`${API_BASE_URL}${path}`, { signal })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }

  return getRecords(await response.json())
}
