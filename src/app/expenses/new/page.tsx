import { MobileLayout } from "@/components/layout/mobile-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ExpenseForm } from '@/components/expenses/expense-form';

export default function NewExpensePage() {
  return (
    <ProtectedRoute>
      <MobileLayout>
        <ExpenseForm />
      </MobileLayout>
    </ProtectedRoute>
  );
}