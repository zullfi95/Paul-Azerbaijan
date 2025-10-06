import { Suspense } from 'react';
import CreateOrderForm from '../../../../components/CreateOrderForm';

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div>Loading Page...</div></div>}>
      <CreateOrderForm />
    </Suspense>
  );
}
