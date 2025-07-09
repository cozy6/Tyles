import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TaxOverview } from '@/components/taxes/tax-overview';

export default function TaxesPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <TaxOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}