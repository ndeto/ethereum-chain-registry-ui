import RegisterExplainer from '@/components/RegisterExplainer';
import RegisterMinimalForm from '@/components/RegisterMinimalForm';
import RegisterPostDemo from '@/components/RegisterPostDemo';

export default function RegisterPage() {
  return (
    <main className="bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <RegisterExplainer />
        <RegisterMinimalForm />
        <RegisterPostDemo />
      </div>
    </main>
  );
}
