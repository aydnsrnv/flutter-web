export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight">Jobly Web</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Web version of Jobly powered by Next.js and Supabase.
        </p>

        <div className="mt-8 flex gap-3">
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            href="/login"
          >
            Login
          </a>
        </div>
      </main>
    </div>
  );
}
