import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop: Resets window scroll position to the top on every route change.
 * Must be placed inside <BrowserRouter> in App.tsx.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
