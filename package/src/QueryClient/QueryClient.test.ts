import { QueryClient, createQueryClient } from './QueryClient';

describe('QueryClient.fetchQuery', () => {
  const queryKey = ['id'];
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    queryClient.setQueryData(queryKey, '1');
  });

  it('options:fetchPolicy: по дефолту ответ не достается из кэша', async () => {
    const res = await queryClient.fetchQuery<string | void>(
      queryKey,
      () => '2',
    );

    expect(res).toBe('2');
  });

  it('options:fetchPolicy=network-only: ответ не достается из кэша', async () => {
    const res = await queryClient.fetchQuery<string | void>(
      queryKey,
      () => '2',
      { fetchPolicy: 'network-only' },
    );

    expect(res).toBe('2');
  });

  it('options:fetchPolicy=network-only: ответ кэшируется', async () => {
    await queryClient.fetchQuery<string | void>(queryKey, () => '2', {
      fetchPolicy: 'network-only',
    });

    expect(queryClient.getQueryData(queryKey)).toBe('2');
  });

  it('options:fetchPolicy=cache-first: ответ достается из кэша', async () => {
    const res = await queryClient.fetchQuery<string | void>(
      queryKey,
      () => '2',
      { fetchPolicy: 'cache-first' },
    );

    expect(res).toBe('1');
  });
});
