/**
 * @file hooks index
 * @description copy from https://github.com/qbox/www/blob/2020/front/2020/hooks/index.ts
 */

import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { ComposibleValidatable } from 'formstate-x'

/**
 * 类似 useEffect，区别是不会自动触发第一次执行，仅后续 deps 发生变更时才会执行
 * 相当于不带 `fireImmediately: true` 的 `reaction()`
 */
export function useOnChange(handler: () => void, deps: any[]) {
  const firstRef = useRef(true)
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    handler()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

export function useWhen(finished: boolean) {
  const [resolvers, setResolvers] = useState<Array<() => void>>([])

  useEffect(() => {
    if (finished) {
      resolvers.forEach(resolve => resolve())
      setResolvers([])
    }
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const createPromise = useCallback(() => {
    const promise = new Promise<void>(resolve => {
      setResolvers(v => [...v, resolve])
    })
    return promise
  }, [])

  return createPromise
}

export function useFormState<F extends ComposibleValidatable<any>>(createFormState: () => F): F {
  const [state] = useState(createFormState)
  useEffect(() => state.dispose, [state])
  return state
}

export function useInterval(handler: () => void, interval: number) {
  const handlerRef = useRef<() => void>(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    function tick() {
      handlerRef.current()
    }

    // interval > 0 时才有效
    if (interval > 0) {
      const intervalID = setInterval(tick, interval)

      return () => clearInterval(intervalID)
    }
  }, [interval])
}

/**
 * @warning don't use during render
 * @ref https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
 */
// eslint-disable-next-line space-before-function-paren
export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef<T | null>(null)

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback<T>(
    ((...args: any[]) => {
      // In a real implementation, this would throw if called during render
      const fn = handlerRef.current!
      return fn(...args)
    }) as T,
    []
  )
}
