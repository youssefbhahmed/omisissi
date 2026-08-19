import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileSettingsClient from "./ProfileSettingsClient";

export default async function FamilyProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // Cooks manage their profile from the cook dashboard
    if (profile?.role === 'cook') {
        redirect("/dashboard/cook/profile");
    }

    return (
        <ProfileSettingsClient
            profile={profile}
            email={user.email || ""}
            isCook={false}
            cookDetails={null}
        />
    );
}
