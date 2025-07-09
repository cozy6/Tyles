import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReportsOverview } from '@/components/reports/reports-overview';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <ReportsOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}