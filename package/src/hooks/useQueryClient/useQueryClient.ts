import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { Context } from 'react';

import { QueryClient } from '../../QueryClient';

export type QueryContextOptions = {
  context?: Context<QueryClient | undefined>;
};

export const useQueryClient = (params: QueryContextOptions = {}) =>
  // any используется для того, чтобы привести тип QueryClient из tanstack в наш
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useTanstackQueryClient(params as any) as QueryClient;
