import ChainAssignForm from '@/components/ChainAssignForm'

export const metadata = {
  title: 'Assign — Zinc Theme',
  description: 'Assign a human label to a chain ID (ERC‑7785) in a zinc theme.'
}

export default function ZincAssignPage() {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <ChainAssignForm />
      </div>
    </section>
  )
}

