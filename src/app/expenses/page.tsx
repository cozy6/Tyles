import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ExpensesOverview } from '@/components/expenses/expenses-overview';

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <ExpensesOverview />
      </MobileLayout>
    </ProtectedRoute>
  );
}