import { Link as RouterLink } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';

export default function Page404() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 420,
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 'clamp(48px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography
          sx={{
            color: 'text.secondary',
            mb: 4,
          }}
        >
          This page no longer exists, or it has been moved.
        </Typography>

        <Button
          component={RouterLink}
          to="/"
          variant="outlined"
          size="large"
          sx={{
            px: 4,
            borderRadius: 999,
          }}
        >
          Return home
        </Button>
      </Box>
    </Box>
  );
}