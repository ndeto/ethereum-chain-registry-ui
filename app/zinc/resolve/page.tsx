import ChainResolverForm from '@/components/ChainResolverForm'

export const metadata = {
  title: 'Resolve — Zinc Theme',
  description: 'Resolve chain labels to IDs and inspect CAIP‑2 in a zinc theme.'
}

export default function ZincResolvePage() {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <ChainResolverForm />
      </div>
    </section>
  )
}

