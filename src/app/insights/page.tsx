import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { InsightsOverview } from '@/components/insights/insights-overview';

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <InsightsOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}