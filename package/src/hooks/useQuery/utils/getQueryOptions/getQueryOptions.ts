import { QueryClientCache } from '../../../../enums';
import { QueryFetchPolicy, QueryKey } from '../../../../types';

type Params = {
  fetchPolicy: QueryFetchPolicy;
  queryKey: QueryKey;
  cacheTime?: number;
  staleTime?: number;
};

type Result = {
  cacheTime?: number;
  staleTime?: number;
  queryKey: QueryKey;
};

/**
 * @description Возвращает options для кэширования
 * */
export const getQueryOptions = ({
  fetchPolicy,
  queryKey,
  cacheTime,
  staleTime,
}: Params): Result => {
  // если в параметрах присутствует staleTime или cacheTime, то игнорируется fetchPolicy
  if (typeof staleTime === 'number' || typeof cacheTime === 'number') {
    return {
      queryKey,
      cacheTime,
      staleTime,
    };
  }

  if (fetchPolicy === 'network-only') {
    return {
      // подмешивается доп. ключ для того, чтобы результат запроса не взялся из кэша
      queryKey: [...queryKey, 'no-cache'],
      // не кэшируем запрос с 'no-cache' ключем
      cacheTime: QueryClientCache.NoCache,
      // не кэшируем запрос с 'no-cache' ключем
      staleTime: QueryClientCache.NoCache,
    };
  }

  return {
    queryKey,
    cacheTime: QueryClientCache.MaxLong,
    staleTime: QueryClientCache.MaxLong,
  };
};
