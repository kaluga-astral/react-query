import {
  QueryClientConfig,
  QueryFunction,
  FetchQueryOptions as TanstackFetchQueryOptions,
  QueryClient as TanstackQueryClient,
  parseQueryArgs,
} from '@tanstack/react-query';

import { QueryClientCache } from '../enums';
import { QueryFetchPolicy, QueryKey } from '../types';

type FetchQueryOptions<
  TQueryFnData = unknown,
  TQueryError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = TanstackFetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey> & {
  /**
   * @description Политика кэширования
   * network-only - ответ не будет кэшироваться
   * сache-first - если в кэше есть данные, то запрос не будет выполнен. Данные заберутся из кэша
   * @default network-only
   * */
  fetchPolicy?: QueryFetchPolicy;
};

/**
 * @description Клиент для управления кэшем
 */
export class QueryClient<TError = unknown> extends TanstackQueryClient {
  public defaultFetchPolicy: QueryFetchPolicy = 'network-only';

  /**
   * @description Позволяет выполнять запрос вне контекста react. По дефолту не кэширует ответ. Для включения кэширования необходимо использовать fetchPolicy: 'cache-first'
   * @param options.fetchPolicy - Политика кэширования
   *  network-only - ответ не будет кэшироваться
   *  сache-first - если в кэше есть данные, то запрос не будет выполнен. Данные заберутся из кэша
   *
   *  @example
   * ```ts
   * import { QueryFetchPolicy, createQueryClient } from '@astral/react-query';
   *
   * const queryClient = createQueryClient();
   *
   * const getTariffs = (
   *   count: number,
   *   { fetchPolicy }: { fetchPolicy: QueryFetchPolicy },
   * ) =>
   *   queryClient.fetchQuery<{ list: string[] }, { error: Error }>(
   *     ['tariffs', count],
   *     () => fetch('https://astral.ru/tariffs'),
   *     { fetchPolicy },
   *   );
   *
   * await getTariffs(22, { fetchPolicy: 'cache-first' });
   * ```
   * */
  public fetchQuery<
    TQueryFnData = unknown,
    TQueryError = TError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: FetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey>,
  ): Promise<TData>;
  public fetchQuery<
    TQueryFnData = unknown,
    TQueryError = TError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    queryKey: TQueryKey,
    options?: FetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey>,
  ): Promise<TData>;
  public fetchQuery<
    TQueryFnData = unknown,
    TQueryError = TError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    queryKey: TQueryKey,
    queryFn: QueryFunction<TQueryFnData, TQueryKey>,
    options?: FetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey>,
  ): Promise<TData>;
  public fetchQuery<
    TQueryFnData = unknown,
    TQueryError = TError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    arg1:
      | TQueryKey
      | FetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey>,
    arg2?:
      | QueryFunction<TQueryFnData, TQueryKey>
      | FetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey>,
    arg3?: FetchQueryOptions<TQueryFnData, TQueryError, TData, TQueryKey>,
  ): Promise<TData> {
    const args = parseQueryArgs(arg1, arg2, arg3);
    const { fetchPolicy = this.defaultFetchPolicy } = args;

    const { cacheTime, staleTime } =
      fetchPolicy === 'network-only'
        ? {
            // кэшируем ответ, чтобы к нему можно было получить доступ в будущем
            cacheTime: QueryClientCache.MaxLong,
            // этот парамер позволит не брать для этого запроса данные из кэша
            staleTime: QueryClientCache.NoCache,
          }
        : {
            cacheTime: QueryClientCache.MaxLong,
            staleTime: QueryClientCache.MaxLong,
          };

    return super.fetchQuery<TQueryFnData, TQueryError, TData, TQueryKey>({
      ...args,
      cacheTime,
      staleTime,
    });
  }
}

/**
 * @description Фабрика для создания QueryClient с дефолтными параметрами
 * @param {QueryClientConfig} config - Конфиг QueryClient
 * @example
 * ```ts
 * createQueryClient({ defaultOptions: {} })
 * createQueryClient()
 * ```
 *
 * По-дефолту отключается refetch при потере фокуса на странице + устанавливается долгий кэш на 2 часа
 */
export const createQueryClient = (config?: QueryClientConfig) => {
  const defaultOptions = {
    queries: {
      staleTime: 0,
      cacheTime: QueryClientCache.MaxLong,
      refetchOnWindowFocus: false,
      retry: false,
    },
  };

  return new QueryClient(config || { defaultOptions });
};

export { QueryClientCache };

export type { QueryFunction, FetchQueryOptions, QueryClientConfig };
