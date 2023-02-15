import { ReactQueryDevtools as TanstackReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ComponentProps } from 'react';

export const ReactQueryDevtools = ({
  initialIsOpen = false,
  ...props
}: ComponentProps<typeof TanstackReactQueryDevtools>) => (
  <TanstackReactQueryDevtools {...props} initialIsOpen={initialIsOpen} />
);
