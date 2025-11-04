import { Suspense } from 'react';
import DashboardLayout from '../../../../../components/DashboardLayout';
import EditOrderForm from '../../../../../components/EditOrderForm';

export default function EditOrderPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="text-gray-600">Загрузка заказа...</div>
        </div>
      }>
        <EditOrderForm orderId={params.id} />
      </Suspense>
    </DashboardLayout>
  );
}

