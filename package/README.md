# @astral/react-query

Пакет, расширяющий ```@tanstack/react-query```.

## Мотивация
React-query имеют свою специфику работы с кэшом (```staleTime```, ```cacheTime```).
Пакет призван упростить работу с кэшом и настройку ```QueryClient```.

## API

### createQueryClient

Фабрика для создания QueryClient с дефолтными параметрами.

По-дефолту:
- отключает refetch при потере фокуса на странице
- устанавливается долгий кэш на 2 часа, но при этом ```staleTime``` = 0

### useQuery

К стандартному хуку из react-query добавляется параметр: ```fetchPolicy```.

#### options.fetchPolicy

```ts
type UseQueryOptions<TData, TError = unknown> = { 
//...
  /**
   * @description Указывает на то, как кэшировать запрос.
   * network-only - ответ не будет кэшироваться
   * сache-first - если в кэше есть данные, то запрос не будет выполнен
   * @default network-only
   * */
  fetchPolicy?: QueryFetchPolicy;
//...
};

export type QueryFetchPolicy = 'network-only' | 'cache-first';
```

#### Examples

В данном примере, если у кэше есть запись по ключу 'tariffs', то данные возьмутся из кэша:

```tsx
const TariffList = () => {
    const { data: tariffList } = useQuery(['tariffs'], () => fetchTariffs(), {
        fetchPolicy: 'cache-first',
    });

    return tariffList?.map(({ name }) => <span>{name}</span>);
};
```

Здесь данные будут запрашивать всегда свежие данные, независимо от того, есть ли данные в кэше:

```tsx
const TariffList = () => {
    const { data: tariffList } = useQuery(['tariffs'], () => fetchTariffs(), {
        fetchPolicy: 'network-only',
    });

    return tariffList?.map(({ name }) => <span>{name}</span>);
};
```

Здесь также будут запрашивать всегда свежие данные (по-дефолту ```network-only```):

```tsx
const TariffList = () => {
    const { data: tariffList } = useQuery(['tariffs'], () => fetchTariffs());

    return tariffList?.map(({ name }) => <span>{name}</span>);
};
```

### QueryClient.fetchQuery

Расширенный метод react-query.
Позволяет выполнять запрос вне контекста react. По дефолту не кэширует ответ. Для включения кэширования необходимо использовать ```fetchPolicy: 'cache-first'```

Добавлен параметр: ```fetchPolicy```

#### options.fetchPolicy

```ts
type UseQueryOptions<TData, TError = unknown> = { 
//...
  /**
   * @description Указывает на то, как кэшировать запрос.
   * network-only - ответ не будет кэшироваться
   * сache-first - если в кэше есть данные, то запрос не будет выполнен
   * @default network-only
   * */
  fetchPolicy?: QueryFetchPolicy;
//...
};

export type QueryFetchPolicy = 'network-only' | 'cache-first';
```

#### Examples

```ts
import { QueryFetchPolicy, createQueryClient } from '@astral/react-query';

const queryClient = createQueryClient();

const getTariffs = (
  count: number,
  { fetchPolicy }?: { fetchPolicy: QueryFetchPolicy } = {},
) =>
  queryClient.fetchQuery<{ list: string[] }, { error: Error }>(
    ['tariffs', count],
    () => fetch('https://astral.ru/tariffs'),
    { fetchPolicy },
  );

// данные достанутся из кэша, если уже был такой запрос
await getTariffs(22, { fetchPolicy: 'cache-first' });

// всегда будут запрашиваться свежие данные
await getTariffs(22);

// всегда будут запрашиваться свежие данные
await getTariffs(22, { fetchPolicy: 'network-only' });
```
