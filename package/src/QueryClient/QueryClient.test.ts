import { createQueryClient } from './QueryClient';

describe('QueryClient.fetchQuery', () => {
  async function* createRequests() {
    yield '1';
    yield '2';
  }

  it('options: по дефолту ответ не кэшируется', async () => {
    const queryClient = createQueryClient();
    const requests = createRequests();

    const callRequest = () =>
      queryClient.fetchQuery<string | void>(['id'], () =>
        requests.next().then(({ value }) => value),
      );

    const res1 = await callRequest();

    expect(res1).toBe('1');

    const res2 = await callRequest();

    expect(res2).toBe('2');
  });

  it('options:fetchPolicy=network-only: ответ не кэшируется', async () => {
    const queryClient = createQueryClient();
    const requests = createRequests();

    const callRequest = () =>
      queryClient.fetchQuery<string | void>(
        ['id'],
        () => requests.next().then(({ value }) => value),
        { fetchPolicy: 'network-only' },
      );

    const res1 = await callRequest();

    expect(res1).toBe('1');

    const res2 = await callRequest();

    expect(res2).toBe('2');
  });

  it('options:fetchPolicy=cache-first: второй запрос отдаст ответ из кэша', async () => {
    const queryClient = createQueryClient();
    const requests = createRequests();

    const callRequest = () =>
      queryClient.fetchQuery<string | void>(
        ['id'],
        () => requests.next().then(({ value }) => value),
        { fetchPolicy: 'cache-first' },
      );

    const res1 = await callRequest();

    expect(res1).toBe('1');

    const res2 = await callRequest();

    expect(res2).toBe('1');
  });
});
