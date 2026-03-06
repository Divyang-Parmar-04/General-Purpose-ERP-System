import React from "react";
import { X, Download, FileText } from "lucide-react";

const ViewInvoice = ({ isOpen, onClose, invoice, leads }) => {
  if (!isOpen || !invoice) return null;

  const getCustomerName = (customerId) => {
    const customer = leads?.find(l => l._id === customerId);
    return customer?.organizationName || customer?.contact?.name || "Unknown Customer";
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTaxPercentage = (taxCategory) => {
    switch (taxCategory) {
      case 'GST': return 18;
      case 'VAT': return 15;
      case 'PST': return 10;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Order: {invoice.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order Number</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{invoice.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{getCustomerName(invoice.customerId)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                  invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                  invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
                  <th className="p-4 text-center font-medium text-gray-600 dark:text-gray-300">Qty</th>
                  <th className="p-4 text-right font-medium text-gray-600 dark:text-gray-300">Unit Price</th>
                  <th className="p-4 text-right font-medium text-gray-600 dark:text-gray-300">Tax</th>
                  <th className="p-4 text-right font-medium text-gray-600 dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 text-gray-900 dark:text-gray-100">{item.description}</td>
                    <td className="p-4 text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-900 dark:text-gray-100">{invoice.currency} {item.unitPrice?.toFixed(2)}</td>
                    <td className="p-4 text-right text-gray-900 dark:text-gray-100">{invoice.currency} {item.taxAmount?.toFixed(2)}</td>
                    <td className="p-4 text-right font-semibold text-gray-900 dark:text-gray-100">{invoice.currency} {item.totalPrice?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {invoice.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.termsAndConditions && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Terms & Conditions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3 h-fit">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{invoice.currency} {invoice.subTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Tax:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {invoice.currency} {invoice.items?.reduce((sum, item) => sum + (item.taxAmount || 0), 0).toFixed(2)}
                </span>
              </div>
              {invoice.discount?.value > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    -{invoice.currency} {
                      invoice.discount.type === 'percentage'
                        ? ((invoice.subTotal * invoice.discount.value) / 100).toFixed(2)
                        : invoice.discount.value.toFixed(2)
                    }
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Grand Total:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{invoice.currency} {invoice.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {invoice.attachments?.length > 0 && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText size={18} />
                Attachments ({invoice.attachments.length})
              </h3>
              <div className="space-y-2">
                {invoice.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{attachment.name}</span>
                    <Download size={18} className="text-blue-600 dark:text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
