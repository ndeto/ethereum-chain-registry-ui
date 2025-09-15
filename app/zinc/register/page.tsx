import RegisterExplainer from '@/components/RegisterExplainer'
import ChainDataForm from '@/components/ChainDataForm'
import RegisterPostDemo from '@/components/RegisterPostDemo'

export const metadata = {
  title: 'Register — Zinc Theme',
  description: 'Register a chain (ERC‑7785) with a consistent Tailwind Zinc theme.'
}

export default function ZincRegisterPage() {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-8">
          <RegisterExplainer />
          <ChainDataForm />
          <RegisterPostDemo />
        </div>
      </div>
    </section>
  )
}

