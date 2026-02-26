import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const useAnalyticsTracker = (postId?: string) => {
    const location = useLocation();
    const { slug } = useParams();

    useEffect(() => {
        const trackView = async () => {
            // Simple session ID using localStorage
            let sessionId = localStorage.getItem('blog_session_id');
            if (!sessionId) {
                sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                localStorage.setItem('blog_session_id', sessionId);
            }

            const pageSlug = slug || (location.pathname === '/' ? 'home' : location.pathname);

            try {
                await supabase.from('page_views').insert([{
                    post_id: postId || null,
                    page_slug: pageSlug,
                    session_id: sessionId,
                    referrer: document.referrer || null
                }]);
            } catch (error) {
                console.error("Analytics error:", error);
            }
        };

        trackView();
    }, [location.pathname, postId, slug]);
};
