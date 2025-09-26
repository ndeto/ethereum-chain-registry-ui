import RegisterExplainer from '@/components/RegisterExplainer';
import RegisterMinimalForm from '@/components/RegisterMinimalForm';

export default function Page() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <RegisterExplainer />
        <RegisterMinimalForm />
        {/* Resolve CTA removed */}
      </div>
    </main>
  );
}
