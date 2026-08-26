import { redirect } from "next/navigation";

// Cook profiles moved to the public /cooks/[id] page (visible without an
// account). This stub keeps old links working.
export default async function CookDetailsRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/cooks/${id}`);
}
