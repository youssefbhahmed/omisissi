"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addDish(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const dietaryTagsStr = formData.get("dietary_tags") as string;
    
    // Image Handling
    let finalImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"; // default placeholder
    const imageFile = formData.get("image_file") as File | null;
    const imageUrl = formData.get("image_url") as string;

    if (imageFile && imageFile.size > 0) {
        // Handle File Upload
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('dish-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return { error: "Failed to upload image. Please try again." };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('dish-images')
            .getPublicUrl(filePath);
            
        finalImageUrl = publicUrl;
    } else if (imageUrl && imageUrl.trim() !== "") {
        // Fallback to pasted link
        finalImageUrl = imageUrl;
    }

    let dietary_tags: string[] = [];
    if (dietaryTagsStr) {
        dietary_tags = JSON.parse(dietaryTagsStr);
    }

    const complexity = parseInt(formData.get("complexity") as string) || 2;

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
