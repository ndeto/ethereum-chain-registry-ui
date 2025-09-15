export default function ZincHome() {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
            <span>ERC‑7785</span>
            <span className="text-zinc-500">Zinc Theme</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Zinc‑Themed Demo</h1>
          <p className="max-w-2xl text-sm text-zinc-400">
            This route uses a consistent Tailwind Zinc gray palette and integrates Reown AppKit for wallet connections.
            Use the Connect button in the header to link a wallet.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="text-base font-medium">Register</h2>
            <p className="mt-1 text-sm text-zinc-400">Go to the original Register flow.</p>
            <a href="/" className="mt-3 inline-flex items-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200">Open Register</a>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="text-base font-medium">Learn</h2>
            <p className="mt-1 text-sm text-zinc-400">Docs, specs and references.</p>
            <a href="/learn" className="mt-3 inline-flex items-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200">Open Learn</a>
          </div>
        </div>
      </div>
    </section>
  )
}

