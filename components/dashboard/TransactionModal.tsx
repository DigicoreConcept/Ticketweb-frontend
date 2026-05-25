import React from "react";
import Modal from "@/components/ui/Modal";
import { Transaction } from "@/lib/api";

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const colorClass = colors[status] || "bg-white/10 text-white border-white/20";

  return (
    <div className="flex justify-center">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} mt-3`}>
        {status}
      </span>
    </div>
  );
};

const DetailRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
    <span className="text-sm text-white/50">{label}</span>
    <span className={`text-sm text-white font-medium text-right max-w-[60%] truncate ${mono ? "font-mono text-xs" : ""}`} title={value}>
      {value}
    </span>
  </div>
);

export function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  if (!transaction) return null;

  const isCredit = transaction.amount > 0;

  return (
    <Modal isOpen={!!transaction} onClose={onClose} title="Transaction Detail">
      <div className="space-y-4 p-2">
        {/* Amount — big and coloured */}
        <div className="text-center py-4">
          <p className={`text-4xl font-black ${isCredit ? "text-green-400" : "text-white"}`}>
            {isCredit ? "+" : ""}₦{Math.abs(transaction.amount).toLocaleString()}
          </p>
          <StatusBadge status={transaction.status} />
        </div>

        {/* Detail rows */}
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
          <DetailRow label="Type"        value={transaction.type.replace("_", " ")} />
          <DetailRow label="Reference"   value={transaction.reference_id} mono />
          <DetailRow label="Description" value={transaction.description} />
          <DetailRow label="Date"        value={new Date(transaction.created_at).toLocaleString()} />
        </div>
      </div>
    </Modal>
  );
}
