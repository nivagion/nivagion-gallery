import { AdminNav } from "../../components/admin/AdminNav";
import { requireAdmin } from "../../lib/security";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#F2EDD5]">
      <AdminNav email={admin.email} mode={admin.mode} />
      <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
