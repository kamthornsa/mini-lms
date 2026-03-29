import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Providers } from "@/components/providers";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar
          userName={session.user?.name ?? session.user?.email ?? ""}
        />
        <main className="flex-1 p-8 pt-20 md:pt-8 bg-muted/20 overflow-y-auto">
          {children}
        </main>
      </div>
    </Providers>
  );
}
