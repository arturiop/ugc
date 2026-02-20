import { Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { Box } from '@mui/material';

export const Loadable =
  <P extends object>(Component: LazyExoticComponent<ComponentType<P>>) =>
  (props: P) =>
    (
      <Suspense
        fallback={
          <Box
            sx={{
              minHeight: '100vh',
              width: '100%',
              background: (theme) => `
                linear-gradient(
                  120deg,
                    ${theme.palette.background.paper},
                    ${theme.palette.background.neutral},
                    ${theme.palette.background.paper}
                )
              `,
              backgroundSize: '200% 200%',
              animation: 'wind 6s ease-in-out infinite',

              '@keyframes wind': {
                '0%': {
                  backgroundPosition: '0% 50%',
                },
                '50%': {
                  backgroundPosition: '100% 50%',
                },
                '100%': {
                  backgroundPosition: '0% 50%',
                },
              },
            }}
          />
        }
      >
        <Component {...props} />
      </Suspense>
    );