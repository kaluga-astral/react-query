import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';

import { QueryClient, createQueryClient } from '../../QueryClient';

import { useQuery } from './useQuery';

describe('useQuery1', () => {
  const queryKey = ['id'];
  let queryClient: QueryClient;

  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = createQueryClient();
    queryClient.setQueryData(queryKey, '1');
  });

  it('Prop:fetchPolicy: по-дефолту ответ не достается из кэша', async () => {
    const { result } = renderHook(() => useQuery(queryKey, async () => '2'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toBe('2');
  });

  it('Prop:fetchPolicy=network-only: по-дефолту ответ не достается из кэша', async () => {
    const { result } = renderHook(() => useQuery(queryKey, async () => '2'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toBe('2');
  });

  it('Prop:fetchPolicy=network-only: ответ записывается в кэш', async () => {
    const { result } = renderHook(() => useQuery(queryKey, async () => '2'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(queryClient.getQueryData(queryKey)).toBe('2');
  });

  it('Prop:fetchPolicy=сache-first: ответ берется из кэша', async () => {
    const { result } = renderHook(
      () => useQuery(queryKey, async () => '3', { fetchPolicy: 'cache-first' }),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toBe('1');
  });

  it('Prop:fetchPolicy: кэш для одноврменных запросов с разными fetch-policy синхронизируется', async () => {
    const { result } = renderHook(
      () => {
        const cacheFirstQuery = useQuery(queryKey, async () => '2', {
          fetchPolicy: 'cache-first',
        });
        const networkOnlyQuery = useQuery(queryKey, async () => '3');

        return { cacheFirstQuery, networkOnlyQuery };
      },
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.cacheFirstQuery.isSuccess).toBeTruthy();
      expect(result.current.networkOnlyQuery.isSuccess).toBeTruthy();
    });

    expect(result.current.cacheFirstQuery.data).toBe('3');
    expect(result.current.networkOnlyQuery.data).toBe('3');
  });
});
