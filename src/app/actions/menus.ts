"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMenu(formData: FormData, selectedDishIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté." };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'cook') {
        return { error: "Seuls les cuisiniers peuvent créer des menus." };
    }

    const name = ((formData.get("name") as string) || "").trim().slice(0, 120);
    const description = ((formData.get("description") as string) || "").trim().slice(0, 1000);
    const price = parseFloat(formData.get("price") as string);
    const dishIds = [...new Set(selectedDishIds)];

    if (!name || !Number.isFinite(price) || price < 0 || dishIds.length === 0) {
        return { error: "Le nom, le prix et au moins un plat sont requis." };
    }

    // Every dish in the package must belong to this cook
    const { data: ownedDishes } = await supabase
        .from('dishes')
        .select('id')
        .in('id', dishIds)
        .eq('cook_id', user.id);

    if (!ownedDishes || ownedDishes.length !== dishIds.length) {
        return { error: "Vous ne pouvez ajouter que vos propres plats à un menu." };
    }

    // 1. Insert the Menu
    const { data: newMenu, error: menuError } = await supabase
        .from('menus')
        .insert({
            cook_id: user.id,
            name,
            description,
            price
        })
        .select('id')
        .single();

    if (menuError || !newMenu) {
        console.error("Error creating menu:", menuError);
        return { error: "Échec de la création du menu." };
    }

    // 2. Insert into the junction table for each selected dish
    const menuDishesData = dishIds.map(dishId => ({
        menu_id: newMenu.id,
        dish_id: dishId
    }));

    const { error: junctionError } = await supabase
        .from('menu_dishes')
        .insert(menuDishesData);

    if (junctionError) {
        console.error("Error linking dishes to menu:", junctionError);
        // Clean up the created menu since joining failed
        await supabase.from('menus').delete().eq('id', newMenu.id);
        return { error: "Échec de l’association des plats au nouveau menu." };
    }

    revalidatePath("/dashboard/cook/menus");
    return { success: true };
}

export async function deleteMenu(menuId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Vous devez être connecté." };

    // Because of ON DELETE CASCADE in the database schema, 
    // deleting the menu will automatically delete the rows in menu_dishes.
    const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId)
        .eq('cook_id', user.id); // Security: ensure they own it

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/cook/menus");
    return { success: true };
}
