import { observable } from '@trpc/server/observable'
import type { TRPCLink } from '@trpc/client'
import type { AppRouter } from '../../server/trpc/routers/_app'
import { mockHandlers } from './services'
import type { OperationType } from './types'

export const mockLink: TRPCLink<AppRouter> = () => {
  return ({ op }) =>
    observable((observer) => {
      if (op.type === 'subscription') {
        observer.complete()
        return
      }

      const handler = mockHandlers[op.path as keyof typeof mockHandlers]

      if (!handler) {
        observer.error(new Error(`No mock handler implemented for path "${op.path}"`) as any)
        return
      }

      const resolver = handler[op.type as OperationType]

      if (!resolver) {
        observer.error(
          new Error(`No mock ${op.type} handler implemented for path "${op.path}"`) as any
        )
        return
      }

      try {
        const data = resolver(op.input)
        observer.next({
          result: {
            type: 'data',
            data,
          },
        })
        observer.complete()
      } catch (error) {
        observer.error(error as any)
      }
    })
}

