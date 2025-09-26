import Providers from '@/providers';
import RegisterExplainer from '@/components/RegisterExplainer';

export default function RegisterPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <RegisterExplainer />
          {/* Legacy form removed */}
        </div>
      </main>
    </Providers>
  );
}
