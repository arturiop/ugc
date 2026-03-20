import { ButtonProps } from '@mui/material';
import { alpha, Theme } from '@mui/material/styles';

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// NEW VARIANT
declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        soft: true;
    }
}

export default function Button(theme: Theme) {
    const isLight = theme.palette.mode === 'light';

    const rootStyle = (ownerState: ButtonProps) => {
        const inheritColor = ownerState.color === 'inherit';

        const containedVariant = ownerState.variant === 'contained';

        const outlinedVariant = ownerState.variant === 'outlined';

        const textVariant = ownerState.variant === 'text';

        const softVariant = ownerState.variant === 'soft';

        const smallSize = ownerState.size === 'small';

        const largeSize = ownerState.size === 'large';

        const defaultStyle = {
            ...(inheritColor && {
                // CONTAINED
                ...(containedVariant && {
                    'backgroundColor': "#0B0D12",
                    'color': theme.palette.common.white,
                    '&:hover': {
                        boxShadow: theme.customShadows.z8,
                        backgroundColor: "#151922",
                    },
                }),
                // OUTLINED
                ...(outlinedVariant && {
                    'borderColor': "#0B0D12",
                    'color': "#0B0D12",
                    '&:hover': {
                        borderColor: "#151922",
                        backgroundColor: alpha("#0B0D12", 0.04),
                    },
                }),
                // TEXT
                ...(textVariant && {
                    'color': "#0B0D12",
                    '&:hover': {
                        backgroundColor: alpha("#0B0D12", 0.04),
                    },
                }),
                // SOFT
                ...(softVariant && {
                    'color': "#0B0D12",
                    'backgroundColor': alpha("#0B0D12", 0.08),
                    '&:hover': {
                        backgroundColor: alpha("#0B0D12", 0.16),
                    },
                }),
            }),
        };

        const colorStyle = COLORS.map((color) => ({
            ...(ownerState.color === color && {
                // CONTAINED
                ...(containedVariant && {
                    '&:hover': {
                        boxShadow: theme.customShadows[color],
                    },
                }),
                // SOFT
                ...(softVariant && {
                    'color': theme.palette[color][isLight ? 'dark' : 'light'],
                    'backgroundColor': alpha(theme.palette[color].main, 0.16),
                    '&:hover': {
                        backgroundColor: alpha(theme.palette[color].main, 0.32),
                    },
                }),
            }),
        }));

        const disabledState = {
            '&.Mui-disabled': {
                // SOFT
                ...(softVariant && {
                    backgroundColor: theme.palette.action.disabledBackground,
                }),
            },
        };

        const size = {
            ...(smallSize && {
                height: 30,
                fontSize: 13,
                ...(softVariant && {
                    padding: '4px 10px',
                }),
            }),
            ...(largeSize && {
                height: 48,
                fontSize: 15,
                ...(softVariant && {
                    padding: '8px 22px',
                }),
            }),
        };

        return [...colorStyle, defaultStyle, disabledState, size];
    };

    return {
        MuiButton: {
            defaultProps: {
                disableElevation: true,
                color: 'inherit',
            },

            styleOverrides: {
                root: ({ ownerState }: { ownerState: ButtonProps }) => rootStyle(ownerState),
            },
        },
    };
}
