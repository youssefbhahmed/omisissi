import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileSettingsClient from "../../../dashboard/profile/ProfileSettingsClient";

export default async function CookProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: cookDetails } = await supabase.from('cook_details').select('*').eq('id', user.id).single();

    return (
        <ProfileSettingsClient 
            profile={profile} 
            email={user.email || ""} 
            isCook={true} 
            cookDetails={cookDetails} 
        />
    );
}
