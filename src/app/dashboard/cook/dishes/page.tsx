import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DishesClient from "./DishesClient";

export default async function CookDishesPage() {
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

    // Fetch their dishes, ordered newest first
    const { data: dishes } = await supabase
        .from('dishes')
        .select('*')
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

    return <DishesClient initialDishes={dishes || []} />;
}
