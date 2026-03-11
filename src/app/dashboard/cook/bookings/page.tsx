import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle, XCircle, MapPin, ChefHat, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import BookingsClient from "./BookingsClient";

export default async function CookBookingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's profile to verify they are a cook
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== "cook") {
        redirect("/dashboard/profile");
    }

    // Fetch all bookings requests for this cook
    const { data: rawBookings } = await supabase
        .from('bookings')
        .select(`
            *,
            family_profile:profiles!bookings_family_id_fkey(full_name, avatar_url),
            menu:menus(name),
            dishes:booking_dishes(
                quantity,
                dish:dishes(name)
            )
        `)
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

    // Separate into pending vs active/past
    const bookings = rawBookings || [];
    const pendingRequests = bookings.filter((b: any) => b.status === "pending");
    const otherBookings = bookings.filter((b: any) => b.status !== "pending");

    return (
        <div>
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Booking Requests
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>
                        Manage your upcoming meals and review new requests from families.
                    </p>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="card" style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", color: "var(--text-muted)" }}>
                        <Calendar size={32} />
                    </div>
                    <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 12px 0", color: "var(--text-heading)" }}>No requests yet</h3>
                    <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
                        Make sure your profile looks great and your schedule is up to date to start receiving booking requests from families!
                    </p>
                </div>
            ) : (
                <BookingsClient 
                    pendingRequests={pendingRequests} 
                    otherBookings={otherBookings} 
                />
            )}
        </div>
    );
}
