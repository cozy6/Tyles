import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PlatformsOverview } from '@/components/platforms/platforms-overview';

export default function PlatformsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <PlatformsOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}