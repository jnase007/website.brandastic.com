import Link from "next/link";
import { logout } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <Shell
      actions={
        <>
          <Link href="/admin" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Clients
          </Link>
          <Link href="/admin/new" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            New client
          </Link>
          <Link href="/admin/library" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Item library
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm font-semibold text-gray-400 hover:text-gray-900">
              Log out
            </button>
          </form>
        </>
      }
    >
      {children}
    </Shell>
  );
}
