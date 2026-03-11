"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCookProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const bio = formData.get("bio") as string;
    const specialties = formData.get("specialties") as string;
    const price = formData.get("price") as string;
    const city = formData.get("city") as string;

    const { error } = await supabase.from('cook_details').upsert({
        id: user.id,
        bio: bio,
        specialties: specialties,
        price_per_session: parseFloat(price),
        city: city
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/cook", "layout");
    return { success: true };
}
