import { redirect } from "next/navigation";

// The cook directory moved to the public /cooks page (browsable without an
// account). This stub keeps old links and PWA shortcuts working.
export default function DiscoverRedirect() {
    redirect("/cooks");
}
