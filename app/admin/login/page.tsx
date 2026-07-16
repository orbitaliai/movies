import { isAdmin } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 via-white to-violet-100 px-5 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-violet-200/50">
        <Link href="/" className="mb-8 flex items-center gap-3 font-black">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-500 text-xl">
            A
          </span>
          Aurora Cinemas
        </Link>
        <p className="text-sm font-bold tracking-widest text-violet-400 uppercase">
          Team access
        </p>
        <h1 className="mt-2 text-3xl font-black">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use the demo credentials to manage cinemas and showtimes.
        </p>
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Incorrect username or password.
          </div>
        )}
        <form action={login} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold">
            Username
            <input
              required
              name="username"
              autoComplete="username"
              defaultValue="admin"
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              required
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="admin"
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <button className="w-full rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-500">
            Sign in
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-400">
          Demo only · admin / admin
        </p>
      </div>
    </main>
  );
}
