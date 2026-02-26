import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface AnalyticsStats {
    totalViews: number;
    viewsToday: number;
    uniqueVisitors: number;
    topPosts: { title: string; views: number }[];
    viewsHistory: { date: string; views: number }[];
}

export const useAnalytics = () => {
    const [stats, setStats] = useState<AnalyticsStats>({
        totalViews: 0,
        viewsToday: 0,
        uniqueVisitors: 0,
        topPosts: [],
        viewsHistory: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            // 1. Total Views
            const { count: totalViews } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true });

            // 2. Views Today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: viewsToday } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            // 3. Unique Visitors (Sessions) - This is a rough estimate given Supabase head queries
            const { data: sessions } = await supabase
                .from('page_views')
                .select('session_id');
            const uniqueVisitors = new Set(sessions?.map(s => s.session_id)).size;

            // 4. Top Posts
            const { data: viewsData } = await supabase
                .from('page_views')
                .select('page_slug, post_id, posts(title)');

            const postCounts: Record<string, { title: string, count: number }> = {};
            (viewsData as any)?.forEach((v: any) => {
                const key = v.page_slug;
                const title = v.posts?.title || key;
                if (!postCounts[key]) postCounts[key] = { title, count: 0 };
                postCounts[key].count++;
            });

            const topPosts = Object.values(postCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(p => ({ title: p.title, views: p.count }));

            setStats({
                totalViews: totalViews || 0,
                viewsToday: viewsToday || 0,
                uniqueVisitors,
                topPosts,
                viewsHistory: [] // Can be implemented with grouping later
            });
        } catch (error) {
            console.error("Analytics fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return { stats, isLoading, refresh: fetchAnalytics };
};
