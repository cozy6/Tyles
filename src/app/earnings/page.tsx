import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EarningsOverview } from '@/components/earnings/earnings-overview';

export default function EarningsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <EarningsOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}