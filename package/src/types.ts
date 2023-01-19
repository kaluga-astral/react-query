import { NetworkMode } from '@tanstack/react-query';

import { QueryClientCache } from './enums';

export type { QueryKey } from '@tanstack/react-query';

export type QueryClientNetworkMode = NetworkMode;

export type QueryClientCacheParams = {
  cacheTime?: QueryClientCache;
  networkMode?: QueryClientNetworkMode;
};

export type QueryFetchPolicy = 'network-only' | 'cache-first';
