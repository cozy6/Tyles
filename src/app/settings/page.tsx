import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SettingsOverview } from '@/components/settings/settings-overview';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <SettingsOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}