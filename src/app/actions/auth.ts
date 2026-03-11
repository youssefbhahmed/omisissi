"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Check role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

    revalidatePath("/", "layout");
    if (profile?.role === 'cook') {
        redirect("/dashboard/cook");
    } else {
        redirect("/dashboard");
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const roleType = formData.get("roleType") as string; // 'family' or 'cook'

    // We pass is_cook in the metadata to trigger the SQL function properly
    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                is_cook: roleType === "cook",
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");

    if (roleType === 'cook') {
        redirect("/dashboard/cook");
    } else {
        redirect("/dashboard");
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/");
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const newPassword = formData.get("newPassword") as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: "Password must be at least 6 characters long." };
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updateFamilyProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const fullName = formData.get("fullName") as string;
    const address = formData.get("address") as string;
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;

    const updates: any = {
        full_name: fullName,
        address: address,
    };

    // If we successfully got coordinates from the RegionPicker, save them
    if (latStr && lngStr) {
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        // Save as separate float columns for easy JS access
        updates.lat = lat;
        updates.lng = lng;
        // Also save as PostGIS point for the distance RPC function
        updates.location = `POINT(${lng} ${lat})`;
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) {
        console.error("Error updating profile:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}

export async function updateCookProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const fullName = formData.get("fullName") as string;
    const address = formData.get("address") as string;
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;
    const bio = formData.get("bio") as string;
    const priceStr = formData.get("pricePerHour") as string;
    const specialtiesStr = formData.get("specialties") as string;

    // 1. Update Profile (Name & Location)
    const profileUpdates: any = {
        full_name: fullName,
        address: address,
    };

    if (latStr && lngStr) {
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        profileUpdates.lat = lat;
        profileUpdates.lng = lng;
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

    if (profileError) {
        console.error("Error updating cook profile:", profileError);
        return { error: profileError.message };
    }

    // 2. Update Cook Details (Bio, Price, Specialties)
    let specialtiesArray: string[] = [];
    if (specialtiesStr) {
        specialtiesArray = JSON.parse(specialtiesStr);
    }

    const detailsUpdates = {
        bio,
        price_per_session: parseFloat(priceStr) || 0,
        specialties: specialtiesArray,
        city: address?.split(',')[0]?.trim() || address // Simple extraction for city
    };

    const { error: detailsError } = await supabase
        .from('cook_details')
        .update(detailsUpdates)
        .eq('id', user.id);

    if (detailsError) {
        console.error("Error updating cook details:", detailsError);
        return { error: detailsError.message };
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}

export async function updateCookAvailability(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const availableDaysStr = formData.get("availableDays") as string;
    let availableDaysArray: string[] = [];
    if (availableDaysStr) {
        availableDaysArray = JSON.parse(availableDaysStr);
    }

    const { error } = await supabase
        .from('cook_details')
        .update({ available_days: availableDaysArray })
        .eq('id', user.id);

    if (error) {
        console.error("Error updating availability:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}
