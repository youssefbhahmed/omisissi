"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMenu(formData: FormData, selectedDishIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const price = parseFloat(priceStr);

    if (!name || isNaN(price) || selectedDishIds.length === 0) {
        return { error: "Name, price, and at least one dish are required." };
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
        return { error: "Failed to create menu." };
    }

    // 2. Insert into the junction table for each selected dish
    const menuDishesData = selectedDishIds.map(dishId => ({
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
        return { error: "Failed to link dishes to the new menu." };
    }

    revalidatePath("/dashboard/cook/menus");
    return { success: true };
}

export async function deleteMenu(menuId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

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
