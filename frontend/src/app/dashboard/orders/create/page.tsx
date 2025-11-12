import { Suspense } from 'react';
import DashboardLayout from '../../../../components/DashboardLayout';
import CreateOrderForm from '../../../../components/CreateOrderForm';

export default function CreateOrderPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="text-gray-600">Загрузка формы...</div>
        </div>
      }>
        <CreateOrderForm />
      </Suspense>
    </DashboardLayout>
  );
}
