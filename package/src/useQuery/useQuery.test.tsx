import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';

import { QueryClient, createQueryClient } from '../QueryClient';
import { QueryFetchPolicy } from '../types';

import { useQuery } from './useQuery';

describe('useQuery', () => {
  let queryClient: QueryClient;

  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  async function* createRequests() {
    yield '1';
    yield '2';
  }

  const useTestHook = ({
    fetchPolicy,
    requests,
  }: {
    fetchPolicy?: QueryFetchPolicy;
    requests: ReturnType<typeof createRequests>;
  }) => {
    const [enabled, setEnabled] = useState(true);

    const handleCallRequest = () => {
      setEnabled(true);
    };

    const query = useQuery(
      ['id'],
      () => requests.next().then(({ value }) => value),
      {
        enabled,
        fetchPolicy,
        onSuccess: () => {
          // скидываем в false для того, чтобы можно было тригернуть второй запрос
          setEnabled(false);
        },
      },
    );

    return { query, onCallRequest: handleCallRequest };
  };

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  it('Prop:fetchPolicy: по-дефолту ответ не кэшируется', async () => {
    const requests = createRequests();

    const { result } = renderHook(() => useTestHook({ requests }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.query.data).toBe('1');
    });

    await act(() => {
      result.current.onCallRequest();
    });

    await waitFor(() => {
      expect(result.current.query.data).toBe('2');
    });
  });

  it('Prop:fetchPolicy=network-only: ответ не кэшируется', async () => {
    const requests = createRequests();

    const { result } = renderHook(() => useTestHook({ requests }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.query.data).toBe('1');
    });

    await act(() => {
      result.current.onCallRequest();
    });

    await waitFor(() => {
      expect(result.current.query.data).toBe('2');
    });
  });

  it('Prop:fetchPolicy=cache-first: ответ берется из кэша', async () => {
    const requests = createRequests();

    const { result } = renderHook(
      () => useTestHook({ requests, fetchPolicy: 'cache-first' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.query.data).toBe('1'));

    await act(() => {
      result.current.onCallRequest();
    });

    await waitFor(() => {
      expect(result.current.query.data).toBe('1');
    });
  });
});
