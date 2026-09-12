import React, { useEffect } from 'react';
import { Printer, X, Download, ShieldCheck, Building2, Calendar, User, CreditCard } from 'lucide-react';

const PrintableInvoice = ({ folio, onClose }) => {
  if (!folio) return null;

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const invoiceNumber = `INV-${folio.booking?.id || '8901'}-${new Date().getFullYear()}`;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static print:inset-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden print:border-none print:shadow-none print:max-w-none cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Header - Hidden during print */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-serif text-sm font-semibold">Grand Horizon Hotel</span>
            <span className="text-slate-400 text-xs hidden sm:inline">• Guest Folio & Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer border border-slate-700"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div className="p-5 sm:p-8 md:p-12 text-slate-800 bg-white" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-slate-900 uppercase">
                Grand Horizon
              </h1>
              <p className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-medium">
                Hotel & Luxury Suites
              </p>
              <p className="text-xs text-slate-500 mt-2">
                100 Waterfront Promenade • San Francisco, CA 94105<br />
                Direct: +1 (800) 555-0199 • concierge@efoyhotel.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-amber-400 font-mono text-xs font-bold rounded">
                TAX INVOICE
              </span>
              <div className="text-xs font-mono text-slate-600 mt-2">
                <div>Invoice #: <span className="font-bold text-slate-900">{invoiceNumber}</span></div>
                <div>Date: {today}</div>
                <div>Status: <span className="font-semibold text-emerald-700 uppercase">Settled / Closed</span></div>
              </div>
            </div>
          </div>

          {/* Guest & Stay Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Guest Information
              </span>
              <div className="font-bold text-sm text-slate-900">{folio.guestName}</div>
              <div className="text-slate-600">{folio.booking?.email || 'guest@efoyhotel.com'}</div>
              <div className="text-slate-600">{folio.booking?.phone || '+1 (555) 234-5678'}</div>
              <div className="text-slate-500 text-[11px] mt-1">Horizon Privilege Club VIP Member</div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Stay Overview
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Room Assigned:</span>
                <span className="font-bold text-slate-900">Room {folio.roomNumber} ({folio.roomType})</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Period of Stay:</span>
                <span className="text-slate-700">{folio.booking?.checkIn} → {folio.booking?.checkOut}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-slate-900">{folio.nights} Night(s)</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-6">
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
              Folio Itemization & Charges
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-2">Description</th>
                    <th className="py-2.5 px-2 text-center">Qty / Nights</th>
                    <th className="py-2.5 px-2 text-right">Unit Rate</th>
                    <th className="py-2.5 px-2 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Accommodation charge */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-slate-900">
                        Accommodation - {folio.roomType} (Room {folio.roomNumber})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Standard luxury tariff, daily housekeeping & valet included
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-slate-700">{folio.nights}</td>
                    <td className="py-3 px-2 text-right font-mono">${folio.roomRate?.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">
                      ${folio.roomTotal?.toFixed(2)}
                    </td>
                  </tr>

                  {/* Food orders */}
                  {folio.foodOrders && folio.foodOrders.length > 0 && (
                    folio.foodOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>Room Service Order #{ord.id}</span>
                            <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded">
                              {ord.createdAt}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ord.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-medium text-slate-700">
                          {ord.items.reduce((s, i) => s + i.qty, 0)} items
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-slate-500">-</td>
                        <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">
                          ${ord.total?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
            <div className="w-full max-w-xs space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Room Charges:</span>
                <span className="font-mono">${folio.roomTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>In-Room Dining (Food & Beverage):</span>
                <span className="font-mono">${folio.foodTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">${(folio.roomTotal + folio.foodTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State Tax & Hospitality Surcharge (12%):</span>
                <span className="font-mono">${folio.taxes?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-900 text-sm font-bold text-slate-900">
                <span>Grand Total Settled:</span>
                <span className="font-mono text-base text-amber-700">${folio.grandTotal?.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-500 text-right pt-1">
                Payment Received • Electronic Authorization Approved
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Grand Horizon Luxury Guarantee</p>
              <p className="mt-0.5 max-w-sm leading-relaxed">
                Thank you for staying with us. All charges have been settled. Any ancillary mini-bar charges will be reconciled within 24 hours.
              </p>
            </div>

            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span>Guest Signature</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span>Authorized Front Desk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls - Hidden during print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-mono">Invoice #{invoiceNumber}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer size={14} />
              <span>Print Tax Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
            >
              Close & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;
