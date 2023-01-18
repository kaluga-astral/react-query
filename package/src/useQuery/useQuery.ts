import {
  UseQueryOptions as UseTanStackQueryOptions,
  UseQueryResult as UseTanStackQueryResult,
  useQuery as useTanStackQuery,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { QueryFetchPolicy } from '../types';
import { QueryClientCache } from '../enums';

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
  key: string[],
  fnData: () => Promise<TData>,
  options: UseQueryOptions<TData, TError> = {},
): UseQueryResult<TData, TError> => {
  const { fetchPolicy, ...queryOptions } = options;

  const cache = useMemo(() => {
    if (fetchPolicy === 'cache-first') {
      return {
        cacheTime: QueryClientCache.MaxLong,
        staleTime: QueryClientCache.MaxLong,
      };
    }

    // делаем так, чтобы запрос не сохранился в кэше
    return {
      // на всякий случай ответ еще лежит 5 минут в кэше, если нужно будет получить к нему доступ руками
      cacheTime: QueryClientCache.Few,
      staleTime: QueryClientCache.NoCache,
    };
  }, [fetchPolicy]);

  return useTanStackQuery<TData, TError>(key, fnData, {
    ...queryOptions,
    ...cache,
  });
};
