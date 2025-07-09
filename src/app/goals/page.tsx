import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { GoalsOverview } from '@/components/goals/goals-overview';

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <GoalsOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}