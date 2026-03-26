export function Toaster() {
    return null;
}

const noop = (..._args: unknown[]) => undefined;

export const toast = {
    success: noop,
    error: noop,
    warning: noop,
    info: noop,
    message: noop,
};
