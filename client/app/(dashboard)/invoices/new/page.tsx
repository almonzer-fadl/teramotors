"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "jobCard" | "manual";

interface SelectOption {
  value: string;
  label: string;
}
type CustomerOption = SelectOption;
type VehicleOption = SelectOption;
type JobCardOption = SelectOption;

interface ServiceLine {
  name: string;
  quantity: number;
  laborHours: number;
  laborRate: number;
}

interface PartLine {
  name: string;
  quantity: number;
  cost: number;
}

function NewInvoiceContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>("jobCard");
  const [submitting, setSubmitting] = useState(false);

  // Job card flow
  const [jobCards, setJobCards] = useState<JobCardOption[]>([]);
  const [selectedJobCardId, setSelectedJobCardId] = useState<string>("");

  // Manual flow
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [services, setServices] = useState<ServiceLine[]>([
    { name: "", quantity: 1, laborHours: 1, laborRate: 0 },
  ]);
  const [parts, setParts] = useState<PartLine[]>([{ name: "", quantity: 1, cost: 0 }]);

  // Common fields
  const [dueDate, setDueDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState<string>("");

  // Prefill from query (?jobCardId=...)
  useEffect(() => {
    const jc = params.get("jobCardId");
    if (jc) {
      setMode("jobCard");
      setSelectedJobCardId(jc);
    }
  }, [params]);

  useEffect(() => {
    // Load job cards for selection
    const loadJobCards = async () => {
      try {
        const res = await fetch("/api/job-cards");
        if (!res.ok) return;
        const data = await res.json();
        const options: JobCardOption[] = (Array.isArray(data) ? data : []).map((jc: any) => ({
          value: jc._id,
          label: `${jc.customerId?.firstName || ""} ${jc.customerId?.lastName || ""} - ${jc.vehicleId?.make || ""} ${jc.vehicleId?.model || ""} ${jc.vehicleId?.licensePlate ? `(${jc.vehicleId.licensePlate})` : ""}`.trim(),
        }));
        setJobCards(options);
      } catch (e) {
        // ignore
      }
    };

    // Load customers for manual
    const loadCustomers = async () => {
      try {
        const res = await fetch(`/api/customers?limit=50&sort=createdAt&direction=desc`);
        if (!res.ok) return;
        const json = await res.json();
        const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
        const options: CustomerOption[] = items.map((c: any) => ({
          value: c._id,
          label: `${c.firstName} ${c.lastName}`,
        }));
        setCustomers(options);
      } catch (e) {
        // ignore
      }
    };

    // Load vehicles for manual
    const loadVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        if (!res.ok) return;
        const items = await res.json();
        const options: VehicleOption[] = (Array.isArray(items) ? items : []).map((v: any) => ({
          value: v._id,
          label: `${v.year || ""} ${v.make || ""} ${v.model || ""} ${v.licensePlate ? `(${v.licensePlate})` : ""}`.trim(),
        }));
        setVehicles(options);
      } catch (e) {
        // ignore
      }
    };

    loadJobCards();
    loadCustomers();
    loadVehicles();
  }, []);

  const totalManual = useMemo(() => {
    const servicesTotal = services.reduce((sum, s) => sum + (Number(s.quantity || 0) * Number(s.laborHours || 0) * Number(s.laborRate || 0)), 0);
    const partsTotal = parts.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.cost || 0)), 0);
    return servicesTotal + partsTotal;
  }, [services, parts]);

  function updateService(index: number, patch: Partial<ServiceLine>) {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  }

  function addService() {
    setServices(prev => [...prev, { name: "", quantity: 1, laborHours: 1, laborRate: 0 }]);
  }

  function removeService(index: number) {
    setServices(prev => prev.filter((_, i) => i !== index));
  }

  function updatePart(index: number, patch: Partial<PartLine>) {
    setParts(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p));
  }

  function addPart() {
    setParts(prev => [...prev, { name: "", quantity: 1, cost: 0 }]);
  }

  function removePart(index: number) {
    setParts(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload: any = {
        notes: notes || undefined,
        paymentMethod: paymentMethod || undefined,
        dueDate: dueDate || undefined,
      };

      if (mode === "jobCard") {
        payload.jobCardId = selectedJobCardId || undefined;
      } else {
        payload.customerId = selectedCustomerId || undefined;
        payload.vehicleId = selectedVehicleId || undefined;
        payload.services = services.filter(s => s.name && s.quantity > 0);
        payload.partsUsed = parts.filter(p => p.name && p.quantity > 0);
      }

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        const id = json?.invoice?._id;
        if (id) {
          router.push(`/invoices/${id}`);
          return;
        }
        router.push("/invoices");
      }
    } catch (err) {
      // no-op
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">Create an invoice from a Job Card or manually.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/invoices" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Back to Invoices</Link>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <span className="label-text me-2">From Job Card</span>
                <input
                  type="radio"
                  name="mode"
                  className="radio radio-primary"
                  checked={mode === "jobCard"}
                  onChange={() => setMode("jobCard")}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text me-2">Manual</span>
                <input
                  type="radio"
                  name="mode"
                  className="radio radio-primary"
                  checked={mode === "manual"}
                  onChange={() => setMode("manual")}
                />
              </label>
            </div>

            {mode === "jobCard" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">
                    <span className="label-text">Job Card</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedJobCardId}
                    onChange={(e) => setSelectedJobCardId(e.target.value)}
                  >
                    <option value="">Select a Job Card</option>
                    {jobCards.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label"><span className="label-text">Customer</span></label>
                    <select
                      className="select select-bordered w-full"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">Select a Customer</option>
                      {customers.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text">Vehicle</span></label>
                    <select
                      className="select select-bordered w-full"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                    >
                      <option value="">Select a Vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Services</h3>
                    <button type="button" className="btn btn-sm" onClick={addService}>Add Service</button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {services.map((s, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <input
                          type="text"
                          placeholder="Service name"
                          className="input input-bordered w-full"
                          value={s.name}
                          onChange={(e) => updateService(i, { name: e.target.value })}
                        />
                        <div>
                          <label className="label"><span className="label-text">Qty</span></label>
                          <input
                            type="number"
                            min={1}
                            className="input input-bordered w-full"
                            value={s.quantity}
                            onChange={(e) => updateService(i, { quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="label"><span className="label-text">Labor hours</span></label>
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            className="input input-bordered w-full"
                            value={s.laborHours}
                            onChange={(e) => updateService(i, { laborHours: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="label"><span className="label-text">Labor rate</span></label>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            className="input input-bordered w-full"
                            value={s.laborRate}
                            onChange={(e) => updateService(i, { laborRate: Number(e.target.value) })}
                          />
                        </div>
                        <button type="button" className="btn btn-error" onClick={() => removeService(i)}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Parts</h3>
                    <button type="button" className="btn btn-sm" onClick={addPart}>Add Part</button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {parts.map((p, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Part name"
                          className="input input-bordered w-full"
                          value={p.name}
                          onChange={(e) => updatePart(i, { name: e.target.value })}
                        />
                        <div>
                          <label className="label"><span className="label-text">Qty</span></label>
                          <input
                            type="number"
                            min={1}
                            className="input input-bordered w-full"
                            value={p.quantity}
                            onChange={(e) => updatePart(i, { quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="label"><span className="label-text">Unit cost</span></label>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            className="input input-bordered w-full"
                            value={p.cost}
                            onChange={(e) => updatePart(i, { cost: Number(e.target.value) })}
                          />
                        </div>
                        <button type="button" className="btn btn-error" onClick={() => removePart(i)}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Manual total (est.): {totalManual.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label"><span className="label-text">Due Date</span></label>
                <input type="date" className="input input-bordered w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="label"><span className="label-text">Payment Method</span></label>
                <select className="select select-bordered w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text">Notes</span></label>
                <input type="text" className="input input-bordered w-full" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => router.push("/invoices")}>Cancel</button>
              <button type="submit" className={`btn btn-primary ${submitting ? "loading" : ""}`} disabled={submitting}>
                {submitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
