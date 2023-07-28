import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { PublicUser, UserResponse } from '../types'
import { queryClient } from './react-query-client'

const userQueryKey = ['user']

export const useUserQuery = () => {
  return useQuery({
    queryKey: userQueryKey,
    queryFn: async () => {
      const { data: responseData } = await axios.get<UserResponse>('/api/user')
      if (responseData.error) {
        throw new Error(responseData.message)
      }
      return responseData.data
    },
    staleTime: Infinity,
  })
}

export const setUserData = (user: PublicUser) => {
  return queryClient.setQueryData(userQueryKey, user)
}

export const invalidateUser = () =>
  queryClient.invalidateQueries({ queryKey: userQueryKey })
