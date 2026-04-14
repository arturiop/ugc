import { useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import SharedAppHeader from "./SharedAppHeader";

export default function AppShellHeader() {
    const location = useLocation();
    const isSharedMode = location.pathname.startsWith("/shared/");

    return isSharedMode ? <SharedAppHeader /> : <AppHeader />;
}
