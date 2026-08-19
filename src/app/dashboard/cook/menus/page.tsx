import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MenusClient from "./MenusClient";
import type { Dish } from "@/lib/types";

export default async function CookMenusPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Ensure they are a cook
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'cook') {
        redirect("/dashboard");
    }

    // Fetch their available A La Carte dishes
    const { data: dishes } = await supabase
        .from('dishes')
        .select('*')
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch their Set Menus, including the nested individual dishes via the junction table
    const { data: menusRaw } = await supabase
        .from('menus')
        .select(`
            *,
            menu_dishes (
                dishes (*)
            )
        `)
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

    // Flatten the junction nested array into a clean array of dishes for the frontend
    const menus = menusRaw?.map(m => ({
        ...m,
        dishes: (m.menu_dishes as { dishes: Dish | null }[]).map((md) => md.dishes).filter((d): d is Dish => Boolean(d))
    })) || [];

    return <MenusClient menus={menus} availableDishes={dishes || []} />;
}
