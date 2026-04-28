import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./components/admin-shell";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authenticated: false, isAdmin: false };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("admin")
    .eq("user_id", user.id)
    .single();

  return { authenticated: true, isAdmin: !!userRow?.admin };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, isAdmin } = await checkAdmin();

  if (!authenticated) {
    redirect("/login");
  }

  if (!isAdmin) {
    redirect("/home");
  }

  return <AdminShell>{children}</AdminShell>;
}
