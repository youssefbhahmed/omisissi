import React from "react";
import SiteNav from "@/components/SiteNav";
import { createClient } from "@/lib/supabase/server";

// Public shell: the cook directory is browsable without an account —
// visitors only need to log in when they actually book.
export default async function CooksLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let role: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
        role = profile?.role ?? null;
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)", display: "flex", flexDirection: "column" }}>
            <SiteNav
                variant="solid"
                active="/cooks"
                authed={!!user}
                dashboardHref={role === "cook" ? "/dashboard/cook" : "/dashboard"}
            />

            <main style={{ flex: 1, padding: "40px 24px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
