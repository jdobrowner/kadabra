export type OperationType = 'query' | 'mutation'

export type MockResolver = (input: any) => any

export interface MockRoute {
  query?: MockResolver
  mutation?: MockResolver
}

export type MockHandlers = Record<string, MockRoute>

