"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, DollarSign, Calendar, User, CheckCircle, XCircle, Clock, Search, Filter, Plus, X } from "lucide-react";

interface Payment {
  _id: string;
  invoiceId: {
    _id: string;
    invoiceNumber: string;
    total: number;
    customerId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    vehicleId: {
      _id: string;
      make: string;
      model: string;
      year: number;
      licensePlate: string;
    };
  };
  amount: number;
  paymentMethod: "cash" | "card" | "bank_transfer" | "check";
  paymentDate: string;
  status: "pending" | "completed" | "failed" | "refunded";
  reference: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const { t } = useTranslation("common");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  
  // Payment creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    notes: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        const paymentsArray = Array.isArray(data.payments) ? data.payments : (Array.isArray(data) ? data : []);
        setPayments(paymentsArray);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices");
      if (response.ok) {
        const data = await response.json();
        const invoicesArray = Array.isArray(data.invoices) ? data.invoices : (Array.isArray(data) ? data : []);
        setInvoices(invoicesArray);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const handlePaymentStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setPayments(prev => 
          prev.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: newStatus as any }
              : payment
          )
        );
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;

    setCreating(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          ...paymentForm
        }),
      });

      if (response.ok) {
        // Refresh payments list
        await fetchPayments();
        // Reset form and close modal
        setPaymentForm({
          amount: "",
          paymentMethod: "cash",
          paymentDate: new Date().toISOString().split("T")[0],
          reference: "",
          notes: ""
        });
        setSelectedInvoiceId("");
        setShowCreateModal(false);
      } else {
        throw new Error("Failed to create payment");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment");
    } finally {
      setCreating(false);
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const selectedInvoice = invoices.find(inv => inv._id === invoiceId);
    if (selectedInvoice) {
      setPaymentForm(prev => ({
        ...prev,
        amount: selectedInvoice.totalAmount?.toString() || ""
      }));
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.invoiceId?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId?.customerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId?.customerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId?.vehicleId?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "refunded":
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <DollarSign className="h-4 w-4" />;
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "check":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Payment Management
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  Track and manage customer payments
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F13F33]">
                    ${payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Payments</div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Search Payments
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by invoice number, customer, or vehicle..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="mr-3 h-7 w-7 text-[#F13F33]" />
              Payments ({filteredPayments.length})
            </h2>
            
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Payments Found</h3>
                <p className="text-gray-600">No payments match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div key={payment._id} className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-center">
                      {/* Payment Info */}
                      <div className="lg:col-span-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Payment #{payment._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Invoice: {payment.invoiceId?.invoiceNumber || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-900">
                              {payment.invoiceId?.customerId?.firstName || 'N/A'} {payment.invoiceId?.customerId?.lastName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.invoiceId?.vehicleId?.make || 'N/A'} {payment.invoiceId?.vehicleId?.model || 'N/A'} ({payment.invoiceId?.vehicleId?.year || 'N/A'})
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xl font-bold text-[#F13F33]">
                              ${payment.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              of ${payment.invoiceId?.total?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(payment.paymentMethod)}
                          <div>
                            <p className="font-bold text-gray-900 capitalize">
                              {payment.paymentMethod.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.reference}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.paymentDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                        {payment.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePaymentStatusUpdate(payment._id, "completed")}
                              className="text-green-600 hover:text-green-800 text-sm font-bold px-3 py-1 rounded-lg hover:bg-green-50 transition-all duration-300"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handlePaymentStatusUpdate(payment._id, "failed")}
                              className="text-red-600 hover:text-red-800 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-300"
                            >
                              Mark Failed
                            </button>
                          </div>
                        )}
                        {payment.status === "completed" && (
                          <button
                            onClick={() => handlePaymentStatusUpdate(payment._id, "refunded")}
                            className="text-gray-600 hover:text-gray-800 text-sm font-bold px-3 py-1 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {payment.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {payment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl">
              <div className="px-8 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Plus className="mr-3 h-7 w-7 text-[#F13F33]" />
                    Create New Payment
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePayment} className="space-y-6">
                  {/* Invoice Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select Invoice *
                    </label>
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => handleInvoiceChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      required
                    >
                      <option value="">Select an invoice</option>
                      {invoices.map((invoice) => (
                        <option key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber} - {invoice.customerId?.firstName} {invoice.customerId?.lastName} - ${invoice.totalAmount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Payment Amount *
                      </label>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Payment Method *
                      </label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Date */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        required
                      />
                    </div>

                    {/* Reference */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        value={paymentForm.reference}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder={t('ui.enter_transaction_reference')}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                      rows={3}
                      placeholder="Additional payment notes..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 border-2 border-gray-200 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? t('ui.creating') : t('ui.create_payment')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
