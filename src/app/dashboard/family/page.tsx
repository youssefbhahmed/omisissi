import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle, XCircle, MapPin, ChefHat, Calendar, Phone, Star } from "lucide-react";
import CancelBookingButton from "./CancelBookingButton";
import ReviewForm from "./ReviewForm";
import type { BookingListItem } from "@/lib/types";
import Link from "next/link";

const CANCEL_WINDOW_HOURS = 48;

function hoursUntil(date: string, time: string): number {
    return (Date.parse(`${date}T${time.slice(0, 5)}:00Z`) - Date.now()) / 3600_000;
}

export default async function FamilyBookingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Any account can book as a client — including cooks booking other cooks —
    // so this page is open to every logged-in user. Bookings are matched on
    // family_id, which is the booker regardless of their role.

    // Fetch all bookings for this family. The cook's profile is fetched in a
    // second query because the bookings FKs reference auth.users, which
    // PostgREST cannot traverse to embed public.profiles.
    const { data: rawBookings } = await supabase
        .from('bookings')
        .select(`
            *,
            menu:menus(name),
            dishes:booking_dishes(
                dish_id,
                quantity,
                dish:dishes(name)
            )
        `)
        .eq('family_id', user.id)
        .order('created_at', { ascending: false });

    const bookings = (rawBookings || []) as BookingListItem[];

    const cookIds = [...new Set(bookings.map((b) => b.cook_id))];
    const { data: cookProfiles } = cookIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', cookIds)
        : { data: [] };

    for (const booking of bookings) {
        booking.partner = cookProfiles?.find((p) => p.id === booking.cook_id) ?? null;
    }

    // Reveal the cook's phone for accepted/ongoing bookings
    await Promise.all(
        bookings
            .filter((b) => b.status === "accepted" || b.status === "in_progress")
            .map(async (b) => {
                const { data } = await supabase.rpc('get_booking_contact', { p_booking_id: b.id });
                b.partner_phone = data?.[0]?.phone ?? null;
            })
    );

    // Which completed bookings has this family already reviewed?
    const { data: myReviews } = await supabase
        .from('reviews')
        .select('booking_id, rating')
        .eq('family_id', user.id);
    const reviewByBooking = new Map((myReviews ?? []).map((r) => [r.booking_id, r.rating]));

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return { bg: "rgba(235, 171, 33, 0.1)", color: "var(--brand-primary)" };
            case "accepted": return { bg: "rgba(34, 197, 94, 0.1)", color: "var(--brand-success)" };
            case "declined": case "cancelled": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" };
            case "completed": return { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
            default: return { bg: "var(--bg-subtle)", color: "var(--text-muted)" };
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case "pending": return <Clock size={16} />;
            case "accepted": case "completed": return <CheckCircle size={16} />;
            case "declined": case "cancelled": return <XCircle size={16} />;
            default: return null;
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                    My Bookings
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>
                    Track your upcoming meals and past requests.
                </p>
            </div>

            {bookings.length === 0 ? (
                <div className="card" style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", color: "var(--text-muted)" }}>
                        <Calendar size={32} />
                    </div>
                    <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 12px 0", color: "var(--text-heading)" }}>No bookings yet</h3>
                    <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
                        You haven&apos;t requested any home-cooked meals yet. Head over to the discover page to find a cook near you.
                    </p>
                    <Link href="/cooks" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>Discover Cooks</Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {bookings.map((booking) => {
                        const sColor = getStatusColor(booking.status);
                        const cookName = booking.partner?.full_name || "Unknown Cook";
                        const cookAvatar = booking.partner?.avatar_url || "/hero-tunisian-food-1.png";

                        return (
                            <div key={booking.id} className="card" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid var(--border-light)", flexWrap: "wrap", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                                            <img src={cookAvatar} alt={cookName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 4px 0", fontWeight: 700, fontSize: "18px", color: "var(--text-heading)" }}>{cookName}</h3>
                                            <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Calendar size={14} />
                                                {new Date(booking.scheduled_date).toLocaleDateString("en-GB")} at {booking.scheduled_time?.slice(0, 5)}
                                                {Number(booking.duration_hours) > 0 && ` (${booking.duration_hours}h)`}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                        {(booking.status === "pending" ||
                                            (booking.status === "accepted" && hoursUntil(booking.scheduled_date, booking.scheduled_time) > CANCEL_WINDOW_HOURS)) && (
                                            <CancelBookingButton bookingId={booking.id} />
                                        )}
                                        <div style={{
                                            backgroundColor: sColor.bg, color: sColor.color,
                                            padding: "6px 12px", borderRadius: "99px",
                                            fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                                            display: "flex", alignItems: "center", gap: "6px"
                                        }}>
                                            <StatusIcon status={booking.status} /> {booking.status}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: "20px", gap: "24px", backgroundColor: "var(--bg-base)" }} className="grid grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <h4 style={{ fontSize: "13px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", margin: "0 0 12px 0", letterSpacing: "0.5px" }}>Order Details</h4>
                                        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-surface)" }}>
                                            {booking.menu ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                                    <ChefHat size={16} color="var(--brand-primary)" /> Set Menu: {booking.menu.name}
                                                </div>
                                            ) : booking.dishes && booking.dishes.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-body)", fontSize: "14px" }}>
                                                    {booking.dishes.map((d) => (
                                                        <li key={d.dish_id}>{d.quantity}x {d.dish?.name || "Dish"}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>No specific dishes selected</span>
                                            )}
                                        </div>

                                        {booking.grocery_delivery && (
                                            <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-body)", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ backgroundColor: "var(--brand-primary)", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>EXTRA</span>
                                                Grocery Shopping Included
                                            </div>
                                        )}

                                        {(booking.status === "accepted" || booking.status === "in_progress") && (
                                            <div style={{ marginTop: "12px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-body)" }}>
                                                <Phone size={16} color="var(--brand-success)" />
                                                {booking.partner_phone ? (
                                                    <span>Call {cookName.split(' ')[0]}: <a href={`tel:${booking.partner_phone}`} style={{ fontWeight: 700, color: "var(--brand-success)", textDecoration: "none" }}>{booking.partner_phone}</a></span>
                                                ) : (
                                                    <span style={{ color: "var(--text-muted)" }}>{cookName.split(' ')[0]} hasn&apos;t added a phone number yet.</span>
                                                )}
                                            </div>
                                        )}

                                        {booking.status === "completed" && (
                                            <div style={{ marginTop: "12px" }}>
                                                {reviewByBooking.has(booking.id) ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>
                                                        <Star size={16} fill="var(--brand-primary)" color="var(--brand-primary)" />
                                                        You rated this meal {reviewByBooking.get(booking.id)}/5
                                                    </div>
                                                ) : (
                                                    <ReviewForm bookingId={booking.id} cookName={cookName} />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: "13px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", margin: "0 0 12px 0", letterSpacing: "0.5px" }}>Location & Price</h4>
                                        <div style={{ marginBottom: "16px", fontSize: "14px", color: "var(--text-body)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                            <MapPin size={16} color="var(--text-muted)" style={{ marginTop: "2px" }} />
                                            <div>
                                                <strong>{booking.location === "client_home" ? "My Home" : "Cook's Home (Pickup)"}</strong>
                                                {booking.address && <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>{booking.address}</div>}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-heading)" }}>
                                            {booking.total_price} <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>TND total</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
