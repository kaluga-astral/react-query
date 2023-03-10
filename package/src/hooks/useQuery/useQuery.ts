import {
  UseQueryOptions as UseTanStackQueryOptions,
  UseQueryResult as UseTanStackQueryResult,
  useQuery as useTanStackQuery,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { useQueryClient } from '../useQueryClient';
import { QueryFetchPolicy, QueryKey } from '../../types';

import { getQueryOptions } from './utils';

export type UseQueryOptions<TData, TError = unknown> = UseTanStackQueryOptions<
  TData,
  TError
> & {
  /**
   * @description Указывает на то, как кэшировать запрос.
   * network-only - ответ не будет кэшироваться
   * сache-first - если в кэше есть данные, то запрос не будет выполнен
   * @default network-only
   * */
  fetchPolicy?: QueryFetchPolicy;
};

export type UseQueryResult<TData, TError = unknown> = UseTanStackQueryResult<
  TData,
  TError
>;

/**
 * @description Хук для запроса данных, обработки статусов и кэширования ответов. Для политик кэширования используется параметр fetch-policy
 * */
export const useQuery = <TData, TError = unknown>(
  key: QueryKey,
  fnData: () => Promise<TData>,
  options: UseQueryOptions<TData, TError> = {},
): UseQueryResult<TData, TError> => {
  const queryClient = useQueryClient();
  const { fetchPolicy = queryClient.defaultFetchPolicy, ...queryOptions } =
    options;

  const { cacheTime, staleTime, queryKey } = useMemo(
    () =>
      getQueryOptions({
        ...options,
        queryKey: key,
        fetchPolicy,
      }),
    [key, fetchPolicy, options.staleTime, options.cacheTime],
  );

  return useTanStackQuery<TData, TError>(queryKey, fnData, {
    ...queryOptions,
    cacheTime,
    staleTime,
    onSuccess: (data) => {
      //  при 'network-only' отдаются свежие данные, но при этом необходимо записать ответ в кэш, чтобы при необходимости его можно было использовать
      if (fetchPolicy === 'network-only') {
        queryClient.setQueryData<TData>(key, data);
      }

      queryOptions.onSuccess?.(data);
    },
  });
};
