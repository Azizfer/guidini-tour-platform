// Server component layout that protects admin routes
import AdminShell from "@/components/admin/components/admin-shell"
import AdminAuth from "./components/AdminAuth"

export const metadata = {
  title: "Admin | Guidini",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuth>
      <AdminShell />
    </AdminAuth>
  )
}

