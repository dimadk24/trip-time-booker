import { useQuery } from '@tanstack/react-query'
import { PublicUser, UserResponse } from '../types'
import { queryClient } from './react-query-client'

const userQueryKey = ['user']

export const useUserQuery = () => {
  return useQuery({
    queryKey: userQueryKey,
    queryFn: async () => {
      const response = await fetch('/api/user')
      const json = (await response.json()) as UserResponse
      if (json.error) {
        throw new Error(json.message)
      }
      if (!response.ok) {
        throw new Error(
          `User request error, response status: ${response.status}`
        )
      }
      return json.data
    },
    staleTime: Infinity,
  })
}

export const setUserData = (user: PublicUser) => {
  return queryClient.setQueryData(userQueryKey, user)
}

export const invalidateUser = () =>
  queryClient.invalidateQueries({ queryKey: userQueryKey })
