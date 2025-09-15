import Caip2Lookup from '@/components/Caip2Lookup'

export const metadata = {
  title: 'CAIP‑2 — Zinc Theme',
  description: 'Inspect CAIP‑2 namespace/reference pairs in a zinc theme.'
}

export default function ZincCaip2Page() {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Caip2Lookup />
      </div>
    </section>
  )
}

