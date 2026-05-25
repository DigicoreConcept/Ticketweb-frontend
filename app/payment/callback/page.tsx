'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyPayment } from '@/lib/api';
import { CheckCircle2, Ticket, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentCallback() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'ERROR'>('VERIFYING');
  const [order, setOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus('ERROR');
      setErrorMsg('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyPayment(reference);
        setOrder(data);
        setStatus('SUCCESS');
      } catch (err: any) {
        console.error(err);
        setStatus('ERROR');
        setErrorMsg(err.response?.data?.detail || 'Payment verification failed.');
      }
    };

    verify();
  }, [reference]);

  if (status === 'VERIFYING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-600 font-medium">Verifying your payment...</p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-100 text-center space-y-6 max-w-md w-full">
            <div className="flex justify-center">
                <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
                <p className="text-gray-600 mt-2">{errorMsg}</p>
            </div>
            <Link 
                href="/" 
                className="inline-block px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return Home
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center space-y-6 max-w-lg w-full">
        <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
            <p className="text-gray-600 mt-2">Thank you for your purchase. Your tickets have been sent to <strong>{order?.guest_email}</strong>.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-left border space-y-2">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Order Reference</p>
                <p className="font-mono text-lg font-medium text-gray-900">{order?.id}</p>
            </div>
            <div>
               <p className="text-xs font-semibold text-gray-500 uppercase">Total Amount</p>
               <p className="font-mono text-lg font-medium text-gray-900">
                    {(order?.total_amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
               </p>
            </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
            <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Ticket className="w-5 h-5"/>
              View My Tickets (Demo)
            </Link>
            <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
            >
                Return to Events
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>}>
            <PaymentCallback />
        </Suspense>
    )
}
