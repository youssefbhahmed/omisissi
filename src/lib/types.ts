/* ============================================
   TypeScript type definitions shared across 
   the Foodie application.
   ============================================ */

export type UserRole = "family" | "cook" | "admin";

export interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone?: string;
    location?: {
        city: string;
        lat: number;
        lng: number;
    };
    createdAt: string;
}

export interface CookProfile {
    id: string;
    userId: string;
    bio: string;
    specialties: string[];
    photoUrl: string;
    rating: number;
    reviewCount: number;
    pricePerHour: number;
    isVerified: boolean;
    isAvailable: boolean;
    yearsExperience: number;
    cuisines: string[];
    dietaryOptions: string[];
    availableDays: string[];
    completedBookings: number;
}

export interface Review {
    id: string;
    cookId: string;
    familyId: string;
    familyName: string;
    familyAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    servings: number;
    prepTime: number; // minutes
    ingredients: Ingredient[];
    dietaryTags: string[];
}

export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string; // produce, dairy, meat, pantry, etc.
}

export interface WeeklyMenu {
    id: string;
    name: string;
    description: string;
    items: MenuItem[];
    totalPrice: number;
    isCustom: boolean;
}

export interface GroceryList {
    id: string;
    menuId: string;
    items: GroceryItem[];
    estimatedCost: number;
    deliveryFee?: number;
}

export interface GroceryItem {
    ingredient: Ingredient;
    checked: boolean;
}

export interface Booking {
    id: string;
    familyId: string;
    cookId: string;
    menuId: string;
    status: "pending" | "accepted" | "declined" | "in_progress" | "completed" | "cancelled";
    scheduledDate: string;
    scheduledTime: string;
    location: "client_home" | "cook_home";
    address?: string;
    totalPrice: number;
    groceryDelivery: boolean;
    notes?: string;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    bookingId: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
}
