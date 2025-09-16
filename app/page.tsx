import RegisterExplainer from '@/components/RegisterExplainer';
import ChainDataForm from '@/components/ChainDataForm';
import RegisterPostDemo from '@/components/RegisterPostDemo';

export default function Page() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <ChainDataForm />
        <RegisterPostDemo />
      </div>
    </main>
  );
}
