import { useCallback } from 'react'

export default function useDebounce<Fn extends (...args: any[]) => void = any>(fn: Fn, timeout = 199): Fn {
  let timer: NodeJS.Timeout
  return useCallback((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(fn, timeout, ...args)
  }, []) as Fn
}
