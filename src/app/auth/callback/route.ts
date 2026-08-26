import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth landing point: exchanges the provider code for a session, applies the
// role the user picked on the signup page (new accounts only), and routes
// them to the right dashboard. Brand-new accounts that arrived without a
// role choice are asked to pick one.
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const rolePref = searchParams.get("role");

    // Optional local path to return to (e.g. the cook page a visitor was
    // booking from). Never follow absolute/protocol-relative URLs.
    const rawNext = searchParams.get("next");
    const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=oauth`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error("OAuth code exchange failed:", error);
        return NextResponse.redirect(`${origin}/login?error=oauth`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(`${origin}/login?error=oauth`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, created_at')
        .eq('id', user.id)
        .single();

    const accountAgeMs = profile ? Date.now() - Date.parse(profile.created_at) : Infinity;

    // Signup page with "I want to cook" selected → apply the choice
    if (rolePref === "cook" && profile?.role !== "cook" && accountAgeMs < 15 * 60_000) {
        const { error: roleError } = await supabase.rpc('set_signup_role', { p_role: 'cook' });
        if (!roleError) {
            return NextResponse.redirect(`${origin}/dashboard/cook`);
        }
        console.error("set_signup_role failed:", roleError);
    }

    // Brand-new account that never picked a role (came from the login page)
    if (!rolePref && profile?.role === "family" && accountAgeMs < 2 * 60_000) {
        return NextResponse.redirect(`${origin}/auth/choose-role`);
    }

    if (next) {
        return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
        profile?.role === "cook" ? `${origin}/dashboard/cook` : `${origin}/dashboard`
    );
}
