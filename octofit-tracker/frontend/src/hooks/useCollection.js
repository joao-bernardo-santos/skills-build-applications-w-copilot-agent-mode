import { useCallback, useEffect, useState } from 'react'
import { fetchCollection } from '../lib/api.js'

export function useCollection(path, fetchImpl) {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    setIsLoading(true)
    setError('')
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetchCollection(path, { signal: controller.signal }, fetchImpl)
      .then(setRecords)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load data.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [fetchImpl, path, reloadKey])

  return { records, error, isLoading, reload }
}
