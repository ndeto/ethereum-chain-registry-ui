import Providers from '@/providers';
import RegisterExplainer from '@/components/RegisterExplainer';
import ChainDataForm from '@/components/ChainDataForm';
import RegisterPostDemo from '@/components/RegisterPostDemo';

export default function RegisterPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <RegisterExplainer />
          <ChainDataForm />
          <RegisterPostDemo />
        </div>
      </main>
    </Providers>
  );
}

