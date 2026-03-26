import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams as useRouteParams } from "react-router-dom";

export function useRouter() {
    const navigate = useNavigate();

    const push = useCallback((href: string) => navigate(href), [navigate]);
    const replace = useCallback((href: string) => navigate(href, { replace: true }), [navigate]);
    const back = useCallback(() => navigate(-1), [navigate]);

    return useMemo(
        () => ({
            push,
            replace,
            back,
        }),
        [push, replace, back]
    );
}

export function useParamsSafe() {
    return useRouteParams();
}

export const useParams = useParamsSafe;

export function usePathname() {
    return useLocation().pathname;
}
