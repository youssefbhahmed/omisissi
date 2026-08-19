"use client";

import React, { useMemo, useState } from "react";
import { FilterControls, EMPTY_FILTERS, type CookFilters } from "./FilterControls";
import CookGrid from "./CookGrid";
import type { DiscoverCook } from "@/lib/types";

export default function DiscoverClient({ cooks, hasLocation }: { cooks: DiscoverCook[]; hasLocation: boolean }) {
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<CookFilters>(EMPTY_FILTERS);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return cooks.filter((cook) => {
            if (q) {
                const haystack = [cook.full_name, cook.city, ...cook.specialties]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            if (filters.specialties.length > 0) {
                const cookSpecialties = cook.specialties.map((s) => s.toLowerCase());
                const hasAny = filters.specialties.some((s) => cookSpecialties.includes(s.toLowerCase()));
                if (!hasAny) return false;
            }
            if (filters.minRating > 0 && (cook.rating_average ?? 0) < filters.minRating) {
                return false;
            }
            const price = cook.price_per_hour ?? 0;
            if (filters.minPrice != null && price < filters.minPrice) return false;
            if (filters.maxPrice != null && price > filters.maxPrice) return false;
            return true;
        });
    }, [cooks, search, filters]);

    return (
        <>
            <div style={{ marginBottom: "24px" }}>
                <FilterControls
                    search={search}
                    onSearchChange={setSearch}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            </div>
            <CookGrid cooks={filtered} hasLocation={hasLocation} />
        </>
    );
}
