import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EarningsForm } from '@/components/earnings/earnings-form';

export default function NewEarningsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <EarningsForm />
      </MobileLayout>
    </ProtectedRoute>
  );
}