"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DishCategory } from "@/lib/types";

const DISH_CATEGORIES: DishCategory[] = ['starter', 'main', 'dessert', 'side', 'other'];
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // matches the "Max 5MB" shown in the UI
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

export async function addDish(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'cook') {
        return { error: "Only cooks can add dishes." };
    }

    const name = ((formData.get("name") as string) || "").trim().slice(0, 120);
    const description = ((formData.get("description") as string) || "").trim().slice(0, 1000);
    const category = formData.get("category") as DishCategory;
    const dietaryTagsStr = formData.get("dietary_tags") as string;
    const complexity = parseInt(formData.get("complexity") as string, 10);

    if (!name) {
        return { error: "Please give the dish a name." };
    }
    if (!DISH_CATEGORIES.includes(category)) {
        return { error: "Please choose a valid category." };
    }
    if (!Number.isInteger(complexity) || complexity < 1 || complexity > 4) {
        return { error: "Please choose a valid complexity level." };
    }

    let dietary_tags: string[] = [];
    if (dietaryTagsStr) {
        try {
            const parsed = JSON.parse(dietaryTagsStr);
            if (!Array.isArray(parsed) || !parsed.every((t) => typeof t === "string" && t.length <= 40) || parsed.length > 12) {
                return { error: "Invalid dietary tags." };
            }
            dietary_tags = parsed;
        } catch {
            return { error: "Invalid dietary tags." };
        }
    }

    // Image handling: an uploaded file wins over a pasted link
    let finalImageUrl = DEFAULT_IMAGE_URL;
    const imageFile = formData.get("image_file") as File | null;
    const imageUrl = ((formData.get("image_url") as string) || "").trim();

    if (imageFile && imageFile.size > 0) {
        const ext = ALLOWED_IMAGE_TYPES[imageFile.type];
        if (!ext) {
            return { error: "Only JPEG, PNG, or WEBP images are allowed." };
        }
        if (imageFile.size > MAX_IMAGE_BYTES) {
            return { error: "Image must be 5MB or smaller." };
        }

        // Store under a per-user folder so storage policies can enforce ownership
        const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('dish-images')
            .upload(filePath, imageFile, { contentType: imageFile.type });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return { error: "Failed to upload image. Please try again." };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('dish-images')
            .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
    } else if (imageUrl) {
        if (!/^https?:\/\//.test(imageUrl) || imageUrl.length > 2048) {
            return { error: "The image link must be a valid http(s) URL." };
        }
        finalImageUrl = imageUrl;
    }

    const { error } = await supabase.from('dishes').insert({
        cook_id: user.id,
        name,
        description,
        category,
        image_url: finalImageUrl,
        dietary_tags,
        complexity
    });

    if (error) {
        console.error("Error adding dish:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/cook/dishes");
    return { success: true };
}

export async function deleteDish(dishId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)
        .eq('cook_id', user.id); // Security: ensure they own it

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/cook/dishes");
    return { success: true };
}
