import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ActivityOverview } from '@/components/activity/activity-overview';

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <ActivityOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}