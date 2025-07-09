import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MenuOverview } from '@/components/menu/menu-overview';

export default function MenuPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <MenuOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}