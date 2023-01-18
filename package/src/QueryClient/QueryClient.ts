import {
  QueryClientConfig,
  QueryFunction,
  QueryKey,
  FetchQueryOptions as TanstackFetchQueryOptions,
  QueryClient as TanstackQueryClient,
  parseQueryArgs,
} from '@tanstack/react-query';

import { QueryClientCache } from '../enums';
import { QueryFetchPolicy } from '../types';

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

    if (args.fetchPolicy === 'cache-first') {
      return super.fetchQuery({
        ...args,
        cacheTime: QueryClientCache.MaxLong,
        staleTime: QueryClientCache.MaxLong,
      });
    }

    // если не cache-first, то не кэшируем ответ
    return super.fetchQuery({
      ...args,
      // ответ еще лежит 5 минут в кэше, если нужно будет получить к нему доступ руками
      cacheTime: QueryClientCache.Few,
      staleTime: QueryClientCache.NoCache,
    });
  }
}

/**
 * @description Фабрика для создания QueryClient с дефолтными параметрами
 * По-дефолту отключается refetch при потере фокуса на странице + устанавливается долгий кэш на 2 часа
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        cacheTime: QueryClientCache.MaxLong,
        refetchOnWindowFocus: false,
      },
    },
  });

export type { QueryFunction, FetchQueryOptions, QueryClientConfig };
