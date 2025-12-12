"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Trash2, FileText, Wrench, Package, Plus, Loader2 } from "lucide-react";
import { socketService } from "../../lib/services/socket";
import { useTranslation } from "react-i18next";
import { useSession } from "../../lib/hooks/useSession";
import InlineInspectionCreator from "./InlineInspectionCreator";
import SearchableComboBox, { SearchableComboBoxOption } from "../ui/SearchableComboBox";
import QuickCreateCustomer from "./QuickCreateCustomer";
import QuickCreateVehicle from "./QuickCreateVehicle";
import QuickCreatePart from "./QuickCreatePart";
import QuickCreateService from "./QuickCreateService";
import Link from "next/link";
import PrintModal from "@/components/pdf/PrintModal";

interface AppointmentMinimal {
  _id: string;
}
interface CustomerMinimal {
  _id: string;
  firstName: string;
  lastName: string;
}
interface VehicleMinimal {
  _id: string;
  make: string;
  model: string;
  year: number;
  customerId: string | { _id: string };
}
interface ServiceMinimal {
  _id: string;
  name: string;
  laborHours: number;
  laborRate: number;
}
interface PartMinimal {
  _id: string;
  name: string;
  compatibleVehicles?: string[];
}
interface EstimateMinimal {
  _id: string;
  estimateNumber: string;
  customerName: string;
  vehicleName: string;
}

interface JobCardFormData {
  appointmentId: string;
  customerId: string;
  vehicleId: string;
  inspectionId?: string;
  estimateId?: string; // Added for repair from estimate flow
  type: "regular" | "inspection" | "repair";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedStartTime: string;
  estimatedEndTime: string;
  services: { serviceId: string; quantity: number; laborHours: number; laborRate: number }[];
  partsUsed: { partId: string; quantity: number; cost: number }[];
  notes: string;
}

export default function JobCardForm({
  jobCardId,
  appointmentId,
}: {
  jobCardId?: string;
  appointmentId?: string;
}) {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const scrollPositionRef = useRef<number | null>(null);

  const isAdmin = user?.role === 'admin';
  const [appointments, setAppointments] = useState<AppointmentMinimal[]>([]);
  const [customers, setCustomers] = useState<CustomerMinimal[]>([]);
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [services, setServices] = useState<ServiceMinimal[]>([]);
  const [parts, setParts] = useState<PartMinimal[]>([]);
  const [estimates, setEstimates] = useState<EstimateMinimal[]>([]); // Added for repair flow
  const [isInspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isPartModalOpen, setPartModalOpen] = useState(false);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [linkedInvoiceId, setLinkedInvoiceId] = useState<string | null>(null);
  const [printModalData, setPrintModalData] = useState<{ invoice: any; jobCard?: any } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState(false);
  const [formData, setFormData] = useState<JobCardFormData>({
    appointmentId: "",
    customerId: "",
    vehicleId: "",
    inspectionId: "",
    estimateId: "",
    type: "regular",
    status: "pending",
    priority: "medium",
    estimatedStartTime: "",
    estimatedEndTime: "",
    services: [],
    partsUsed: [],
    notes: "",
  });


  const isEditing = !!jobCardId;

  const pricingTotals = useMemo(() => {
    const servicesTotal = formData.services.reduce((total, service) => {
      const quantity = Number(service.quantity) || 0;
      const laborHours = Number(service.laborHours) || 0;
      const laborRate = Number(service.laborRate) || 0;
      return total + quantity * laborHours * laborRate;
    }, 0);

    const partsTotal = formData.partsUsed.reduce((total, part) => {
      const quantity = Number(part.quantity) || 0;
      const cost = Number(part.cost) || 0;
      return total + quantity * cost;
    }, 0);

    const partsVat = partsTotal * 0.15;
    const grandTotal = servicesTotal + partsTotal + partsVat;

    return { servicesTotal, partsTotal, partsVat, grandTotal };
  }, [formData.services, formData.partsUsed]);

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [i18n.language]);

  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const fetchJobCard = async () => {
    try {
      const response = await fetch(`/api/job-cards/${jobCardId}`);
      if (response.ok) {
        const jobCard = await response.json();
        
        // Transform services to match form data structure
        const transformedServices = jobCard.services?.map((service: any) => ({
          serviceId: typeof service.serviceId === 'object' ? service.serviceId._id : service.serviceId,
          quantity: service.quantity || 1,
          laborHours: service.laborHours || 0,
          laborRate: service.laborRate || 0,
        })) || [];
        
        // Transform parts to match form data structure
        const transformedParts = jobCard.partsUsed?.map((part: any) => ({
          partId: typeof part.partId === 'object' ? part.partId._id : part.partId,
          quantity: part.quantity || 1,
          cost: part.cost || 0,
        })) || [];

        setFormData({
          appointmentId: jobCard.appointmentId?._id || "",
          customerId: jobCard.customerId?._id || "",
          vehicleId: jobCard.vehicleId?._id || "",
          inspectionId: jobCard.inspectionId?._id || jobCard.inspectionId || "",
          type: jobCard.type || "regular", // FIX: add missing 'type' property as required by JobCardFormData
          status: jobCard.status || "pending",
          priority: jobCard.priority || "medium",
          estimatedStartTime: jobCard.estimatedStartTime
            ? new Date(jobCard.estimatedStartTime).toISOString().slice(0, 16)
            : "",
          estimatedEndTime: jobCard.estimatedEndTime
            ? new Date(jobCard.estimatedEndTime).toISOString().slice(0, 16)
            : "",
          services: transformedServices,
          partsUsed: transformedParts,
          notes: jobCard.notes || "",
          estimateId: jobCard.estimateId || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch job card:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (isEditing) {
      fetchJobCard();
    } else if (appointmentId) {
      fetchAppointmentDetails(appointmentId);
    }
  }, [jobCardId, isEditing, appointmentId]);

  useEffect(() => {
    if (!isEditing || !jobCardId) {
      setLinkedInvoiceId(null);
      return;
    }
    const fetchLinkedInvoice = async () => {
      try {
        const response = await fetch(`/api/job-cards/${jobCardId}/invoice`);
        if (response.ok) {
          const data = await response.json();
          setLinkedInvoiceId(data.invoice?._id || null);
        } else {
          setLinkedInvoiceId(null);
        }
      } catch (error) {
        console.error('Failed to fetch linked invoice:', error);
        setLinkedInvoiceId(null);
      }
    };
    fetchLinkedInvoice();
  }, [isEditing, jobCardId]);

  // Restore scroll position after parts/services update
  useEffect(() => {
    if (scrollPositionRef.current !== null) {
      const scrollY = scrollPositionRef.current;
      // Aggressively restore scroll position
      const restore = () => window.scrollTo(0, scrollY);
      restore();
      requestAnimationFrame(restore);
      setTimeout(restore, 10);
      setTimeout(restore, 50);
      setTimeout(restore, 100);
      setTimeout(() => {
        scrollPositionRef.current = null;
      }, 150);
    }
  }, [formData.services.length, formData.partsUsed.length]);

  const fetchInitialData = async () => {
    try {
      const [
        appointmentsRes,
        customersRes,
        vehiclesRes,
        servicesRes,
        partsRes,
        estimatesRes,
      ] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/customers"),
        fetch("/api/vehicles"),
        fetch("/api/services"),
        fetch("/api/parts"),
        fetch("/api/estimates?status=pending"), // Fetch pending estimates
      ]);
      
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        const appointmentsArray = Array.isArray(data.appointments) ? data.appointments : (Array.isArray(data) ? data : []);
        setAppointments(appointmentsArray);
      }
      
      if (customersRes.ok) {
        const json = await customersRes.json();
        const items = Array.isArray(json.customers) ? json.customers : (Array.isArray(json) ? json : []);
        setCustomers(items);
      } else {
        console.error("Failed to fetch customers:", customersRes.status, customersRes.statusText);
      }
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        const vehiclesArray = Array.isArray(data.vehicles) ? data.vehicles : (Array.isArray(data) ? data : []);
        setVehicles(vehiclesArray);
      }
      
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        const servicesArray = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setServices(servicesArray);
      }
      
      if (partsRes.ok) {
        const data = await partsRes.json();
        const partsArray = Array.isArray(data.parts) ? data.parts : (Array.isArray(data) ? data : []);
        setParts(partsArray);
      }

      if (estimatesRes.ok) {
        const data = await estimatesRes.json();
        const pendingEstimates = Array.isArray(data.estimates) ? data.estimates : [];
        setEstimates(pendingEstimates.map((est: any) => ({
            _id: est._id,
            estimateNumber: est.estimateNumber,
            customerName: `${est.customerId?.firstName || ''} ${est.customerId?.lastName || ''}`,
            vehicleName: `${est.vehicleId?.make || ''} ${est.vehicleId?.model || ''}`,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setAppointments([]);
      setCustomers([]);
      setVehicles([]);
      setServices([]);
      setParts([]);
      setEstimates([]);
    }
  };

  const fetchAppointmentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (response.ok) {
        const appointment = await response.json();
        setFormData((prev) => ({
          ...prev,
          appointmentId: appointment._id,
          customerId: appointment.customerId._id,
          vehicleId: appointment.vehicleId._id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    }
  };

  const handleCreateFromEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch('/api/job-cards/from-inspection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estimateId: formData.estimateId }),
        });

        if (response.ok) {
            socketService.emitJobCreated();
            router.push('/job-cards');
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to create job card from estimate.');
        }
    } catch (error) {
        console.error("Failed to create job card from estimate:", error);
        alert('An error occurred while creating the job card from the estimate.');
    } finally {
        setLoading(false);
    }
  };

  const persistJobCard = async () => {
    try {
      const url = isEditing ? `/api/job-cards/${jobCardId}` : "/api/job-cards";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.message || t("forms.failed_to_save_job_card"));
        return null;
      }

      const data = await response.json();
      socketService.emitJobCreated();
      return data?.jobCard || data;
    } catch (error) {
      console.error("Failed to save job card:", error);
      alert(t("forms.failed_to_save_job_card"));
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // If creating from an estimate, use the dedicated handler
    if (formData.estimateId && !isEditing) {
        await handleCreateFromEstimate(e);
        return;
    }

    e.preventDefault();
    setLoading(true);

    try {
      const savedJobCard = await persistJobCard();
      if (savedJobCard) {
        router.push("/job-cards");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEstimateChange = async (estimateId: string) => {
    if (!estimateId) {
        setFormData(prev => ({
            ...prev,
            estimateId: '',
            customerId: '',
            vehicleId: '',
            services: [],
            partsUsed: [],
            notes: '',
        }));
        return;
    }
    try {
        const response = await fetch(`/api/estimates/${estimateId}`);
        if (response.ok) {
            const estimate = await response.json();
            setFormData(prev => ({
                ...prev,
                estimateId: estimate._id,
                customerId: estimate.customerId?._id || estimate.customerId,
                vehicleId: estimate.vehicleId?._id || estimate.vehicleId,
                notes: estimate.notes || '',
                inspectionId: estimate.inspectionId || '',
                services: (estimate.services || []).map((s: any) => ({
                    serviceId: s.serviceId?._id || s.serviceId,
                    quantity: s.quantity,
                    laborHours: s.laborHours,
                    laborRate: s.laborRate,
                })),
                partsUsed: (estimate.parts || []).map((p: any) => ({
                    partId: p.partId?._id || p.partId,
                    quantity: p.quantity,
                    cost: p.unitCost, // Map unitCost from estimate to cost
                })),
            }));
        }
    } catch (error) {
        console.error("Failed to fetch estimate details:", error);
    }
  };

  const handleSaveAndCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, save the job card
      const jobCardResponse = await fetch("/api/job-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!jobCardResponse.ok) {
        const error = await jobCardResponse.json();
        alert(error.message || t("forms.failed_to_save_job_card"));
        return;
      }

      const jobCardResult = await jobCardResponse.json();
      const jobCardId = jobCardResult.jobCard._id;
      socketService.emitJobCreated();

      // Automatically create invoice with job card data
      const invoiceResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobCardId: jobCardId,
          customerId: formData.customerId,
          vehicleId: formData.vehicleId,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          paymentMethod: "cash",
          notes: formData.notes || "",
        }),
      });

      if (invoiceResponse.ok) {
        const invoiceResult = await invoiceResponse.json();
        alert(t("invoices.invoice_created_successfully"));
        router.push(`/invoices/${invoiceResult.invoice._id}`);
      } else {
        // Job card was saved, but invoice creation failed
        alert(t("invoices.failed_to_create_invoice") + " " + t("job_cards.job_card_saved_successfully"));
        router.push("/job-cards");
      }
    } catch (error) {
      console.error("Failed to save job card and create invoice:", error);
      alert(t("forms.failed_to_save_job_card"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, save the job card
      const jobCardResponse = await fetch("/api/job-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!jobCardResponse.ok) {
        const error = await jobCardResponse.json();
        alert(error.message || t("forms.failed_to_save_job_card"));
        return;
      }

      const jobCardResult = await jobCardResponse.json();
      const jobCardId = jobCardResult.jobCard._id;
      socketService.emitJobCreated();

      // Automatically create estimate with job card data
      const estimateResponse = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobCardId: jobCardId,
          customerId: formData.customerId,
          vehicleId: formData.vehicleId,
          services: formData.services,
          parts: formData.partsUsed,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          status: "pending",
          notes: formData.notes || "",
        }),
      });

      if (estimateResponse.ok) {
        const estimateResult = await estimateResponse.json();
        alert(t("estimates.estimate_created_successfully"));
        router.push(`/estimates/${estimateResult.estimate._id}`);
      } else {
        // Job card was saved, but estimate creation failed
        alert(t("estimates.failed_to_create_estimate") + " " + t("job_cards.job_card_saved_successfully"));
        router.push("/job-cards");
      }
    } catch (error) {
      console.error("Failed to save job card and create estimate:", error);
      alert(t("forms.failed_to_save_job_card"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAndPrintInvoice = async () => {
    if (!isEditing || !linkedInvoiceId) {
      alert(t('invoices.print_error'));
      return;
    }
    setPrintingInvoice(true);
    const savedJobCard = await persistJobCard();
    if (!savedJobCard) {
      setPrintingInvoice(false);
      return;
    }
    try {
      const invoiceResponse = await fetch(`/api/invoices/${linkedInvoiceId}`);
      if (!invoiceResponse.ok) {
        throw new Error('Failed to fetch invoice');
      }
      const invoiceData = await invoiceResponse.json();
      setPrintModalData({
        invoice: invoiceData.invoice,
        jobCard: invoiceData.jobCard || savedJobCard,
      });
      setIsPrintModalOpen(true);
    } catch (error) {
      console.error('Failed to prepare invoice for printing:', error);
      alert(t('invoices.print_error'));
    } finally {
      setPrintingInvoice(false);
    }
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    if (field === 'serviceId') {
      const service = services.find(s => s._id === value);
      if (service) {
        updatedServices[index].laborHours = service.laborHours;
        updatedServices[index].laborRate = service.laborRate;
      }
    }

    // Recalculate end time based on total labor hours
    let estimatedEndTime = '';
    if (formData.estimatedStartTime) {
        const totalLaborHours = updatedServices.reduce((sum, s) => sum + (s.laborHours || 0), 0);
        const startTime = new Date(formData.estimatedStartTime);
        const endTime = new Date(startTime.getTime() + (totalLaborHours * 60 * 60 * 1000));
        estimatedEndTime = endTime.toISOString().slice(0, 16);
    }

    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      estimatedEndTime: estimatedEndTime
    }));
  };

  const addService = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;

    handleInputChange("services", [
      ...formData.services,
      { serviceId: "", quantity: 1, laborHours: 0, laborRate: 0 },
    ]);
  };

  const removeService = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    scrollPositionRef.current = window.scrollY;

    const updatedServices = formData.services.filter((_, i) => i !== index);
    handleInputChange("services", updatedServices);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === 'customerId' && !prev.estimateId) { // Only auto-select vehicle if not linked to an estimate
        newFormData.vehicleId = '';
        const customerVehicles = vehicles.filter(v => {
            const customerId = typeof v.customerId === 'object' ? v.customerId._id : v.customerId;
            return customerId === value;
        });
        if (customerVehicles.length > 0) {
            newFormData.vehicleId = customerVehicles[0]._id;
        }
      }
      return newFormData;
    });
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    const updatedParts = [...formData.partsUsed];
    updatedParts[index] = { ...updatedParts[index], [field]: value };

    // Auto-fill cost when part selected
    if (field === 'partId') {
      const selected = parts.find(p => p._id === value) as any;
      if (selected && typeof selected.cost === 'number') {
        updatedParts[index].cost = selected.cost;
      } else if (selected && typeof selected.sellingPrice === 'number') {
        updatedParts[index].cost = selected.sellingPrice;
      }
    }

    handleInputChange("partsUsed", updatedParts);
  };

  const addPart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;

    handleInputChange("partsUsed", [
      ...formData.partsUsed,
      { partId: "", quantity: 1, cost: 0 },
    ]);
  };

  const removePart = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    scrollPositionRef.current = window.scrollY;

    const updatedParts = formData.partsUsed.filter((_, i) => i !== index);
    handleInputChange("partsUsed", updatedParts);
  };



  // Handler for customer creation
  const handleCustomerCreated = (customer: { _id: string; firstName: string; lastName: string }) => {
    setCustomers(prev => [...prev, customer]);
    handleInputChange('customerId', customer._id);
    fetchInitialData(); // Refresh data
  };

  // Handler for vehicle creation
  const handleVehicleCreated = (vehicle: { _id: string; make: string; model: string; year: number }) => {
    const newVehicle: VehicleMinimal = {
      _id: vehicle._id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      customerId: formData.customerId,
    };
    setVehicles(prev => [...prev, newVehicle]);
    handleInputChange('vehicleId', vehicle._id);
    fetchInitialData(); // Refresh data
  };

  // Handler for part creation
  const handlePartCreated = (part: { _id: string; name: string }) => {
    const newPart: PartMinimal = {
      _id: part._id,
      name: part.name,
    };
    setParts(prev => [...prev, newPart]);
    fetchInitialData(); // Refresh data
  };

  // Handler for service creation
    const handleServiceCreated = (service: { _id: string; name: string; laborHours: number; laborRate: number }) => {
      const newService: ServiceMinimal = {
        _id: service._id,
        name: service.name,
        laborHours: service.laborHours,
        laborRate: service.laborRate,
      };
      setServices(prev => [...prev, newService]);
      fetchInitialData(); // Refresh data
    };
  
    const estimateOptions: SearchableComboBoxOption[] = estimates.map(e => ({
      value: e._id,
      label: `${e.estimateNumber} - ${e.customerName} (${e.vehicleName})`,
      searchText: `${e.estimateNumber} ${e.customerName} ${e.vehicleName}`,
    }));
  
    const customerOptions: SearchableComboBoxOption[] = customers.map(c => ({
      value: c._id,
      label: `${c.firstName} ${c.lastName}`,
      searchText: `${c.firstName} ${c.lastName}`,
    }));
  
    const vehicleOptions: SearchableComboBoxOption[] = vehicles
      .filter((v) => {
        if (!formData.customerId) return false;
        const customerId = typeof v.customerId === 'object' ? v.customerId._id : v.customerId;
        return customerId === formData.customerId;
      })
      .map(v => ({
        value: v._id,
        label: `${v.make} ${v.model} (${v.year})`,
        searchText: `${v.make} ${v.model} ${v.year}`,
      }));
  
    const partOptions: SearchableComboBoxOption[] = parts.map(p => ({
      value: p._id,
      label: p.name,
      searchText: p.name,
    }));
  
    const serviceOptions: SearchableComboBoxOption[] = services.map(s => ({
      value: s._id,
      label: s.name,
      searchText: s.name,
    }));
  
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <InlineInspectionCreator
        isOpen={isInspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        defaultCustomerId={formData.customerId}
        defaultVehicleId={formData.vehicleId}
        onCreated={(insp) => setFormData(prev => ({ ...prev, inspectionId: insp._id }))}
      />
      <QuickCreateCustomer
        isOpen={isCustomerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onCreated={handleCustomerCreated}
      />
      <QuickCreateVehicle
        isOpen={isVehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        customerId={formData.customerId}
        onCreated={handleVehicleCreated}
      />
      <QuickCreatePart
        isOpen={isPartModalOpen}
        onClose={() => setPartModalOpen(false)}
        onCreated={handlePartCreated}
      />
      <QuickCreateService
        isOpen={isServiceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onCreated={handleServiceCreated}
      />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="me-6 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] transition-all duration-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:bg-gray-800 group"
                >
                  <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {isEditing ? t("forms.edit_job_card") : t("forms.new_job_card")}
                  </h1>
                  <p className="mt-3 text-base text-gray-700 dark:text-gray-300">
                    {isEditing
                      ? t("forms.update_job_card_details")
                      : t("forms.create_new_job_card")}
                  </p>
                </div>
              </div>

              {/* Job Type Toggle Buttons */}
              <div className="relative flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl">
                {['regular', 'inspection', 'repair'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange("type", type)}
                    className="relative px-6 py-3 rounded-xl font-semibold text-sm transition-colors z-10 w-32 text-center"
                  >
                    {formData.type === type && (
                      <motion.div
                        layoutId="jobTypePill"
                        className="absolute inset-0 bg-white dark:bg-gray-700 shadow-md rounded-xl"
                        style={{ borderRadius: 12 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-20 ${formData.type === type ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                      {t(`job_types.${type}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Main Details Section - Customer and Vehicle Only */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center me-4">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t("forms.job_card_Main_details")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* START: Estimate Selector for Repair Job Cards */}
                {formData.type === 'repair' && !isEditing && (
                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Create from Estimate
                        </label>
                        <SearchableComboBox
                            value={formData.estimateId ?? ''}
                            onChange={(value) => handleEstimateChange(value)}
                            options={estimateOptions}
                            placeholder="Select an estimate to auto-fill form"
                            emptyMessage="No pending estimates found"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Selecting an estimate will automatically fill customer, vehicle, and service details.
                        </p>
                    </div>
                )}
                {/* END: Estimate Selector */}

                {/* Show Customer/Vehicle selectors if not creating a repair card from scratch, or after an estimate is selected */}
                {(formData.type !== 'repair' || isEditing || formData.estimateId) && (
                    <>
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            {t("forms.customer")} <span className="text-red-500">*</span>
                        </label>
                        <SearchableComboBox
                            value={formData.customerId}
                            onChange={(value) => handleInputChange("customerId", value)}
                            options={customerOptions}
                            placeholder={t("forms.select_customer")}
                            required={true}
                            onCreateNew={() => setCustomerModalOpen(true)}
                            createNewLabel={t("customers.create_new_customer")}
                            emptyMessage={t("customers.no_customers_found")}
                            disabled={!!formData.estimateId}
                        />
                        </div>
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            {t("forms.vehicle")} <span className="text-red-500">*</span>
                        </label>
                        <SearchableComboBox
                            value={formData.vehicleId}
                            onChange={(value) => handleInputChange("vehicleId", value)}
                            options={vehicleOptions}
                            placeholder={t("forms.select_vehicle")}
                            required={true}
                            disabled={!formData.customerId || !!formData.estimateId}
                            onCreateNew={() => {
                              if (!formData.customerId) {
                                alert(t('job_cards.select_customer_first'));
                                return;
                              }
                              setVehicleModalOpen(true);
                            }}
                            createNewLabel={t("vehicles.create_new_vehicle")}
                            emptyMessage={t("vehicles.no_vehicles_found")}
                        />
                        <div className="mt-3" />
                        </div>
                    </>
                )}

                {/* Job Type */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.job_type")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  >
                    <option value="regular">{t("job_types.regular")}</option>
                    <option value="inspection">{t("job_types.inspection")}</option>
                    <option value="repair">{t("job_types.repair")}</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.type === 'regular' && t("job_types.regular_desc")}
                    {formData.type === 'inspection' && t("job_types.inspection_desc")}
                    {formData.type === 'repair' && t("job_types.repair_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          {formData.type === 'inspection' ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl p-8 text-center">
                <div className="flex items-center mb-4 justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {t("forms.services")}
                    </h3>
                </div>
                <p className="text-blue-800 dark:text-blue-400">
                    This is an inspection job card. The services section is disabled.
                </p>
                <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg text-yellow-900 dark:text-yellow-400">
                    <p className="font-bold">Developer Reminder:</p>
                    <p>Remember to add auto-filled/recommendations for the inspection services we have.</p>
                </div>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Existing Services Section Content */}
              <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center me-4">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t("forms.services")}
                </h3>
              </div>
              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 items-center mb-4"
                >
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.service')}</label>
                    <SearchableComboBox
                      value={service.serviceId}
                      onChange={(value) => handleServiceChange(index, "serviceId", value)}
                      options={serviceOptions}
                      placeholder={t("forms.select_service")}
                      onCreateNew={() => setServiceModalOpen(true)}
                      createNewLabel={t("services.create_new_service")}
                      emptyMessage={t("services.no_services_found")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.qty')}</label>
                    <input
                      type="number"
                      value={service.quantity}
                      onChange={(e) =>
                        handleServiceChange(index, "quantity", parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('job_cards.labor_hours')}</label>
                    <input
                      type="number"
                      value={service.laborHours}
                      onChange={(e) =>
                        handleServiceChange(index, "laborHours", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    />
                  </div>
                  {isAdmin ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.labor_placeholder')}</label>
                      <input
                        type="number"
                        value={service.laborRate}
                        onChange={(e) =>
                          handleServiceChange(index, "laborRate", parseFloat(e.target.value))
                        }
                        className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.labor_placeholder')}</label>
                      <div className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center">
                        {t("job_cards.admin_only")}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => removeService(index, e)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => addService(e)}
                className="mt-4 inline-flex items-center px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#F97402] dark:hover:border-[#F97402] hover:text-[#F97402] transition-all duration-200"
              >
                <Wrench className="me-2 h-4 w-4" />
                {t("forms.add_service")}
              </button>
            </div>
            </div>
          )}

          {/* Parts Used Section */}
          {formData.type !== 'inspection' && (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-8 py-8">
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center me-4">
                    <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t("forms.parts_used")}
                    </h3>
                </div>
                {formData.partsUsed.map((part, index) => (
                    <div
                    key={index}
                    className="grid grid-cols-4 gap-4 items-center mb-4"
                    >
                    <div className="col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('job_cards.select_part')}</label>
                        <SearchableComboBox
                        value={part.partId}
                        onChange={(value) => handlePartChange(index, "partId", value)}
                        options={partOptions}
                        placeholder={t("forms.select_part")}
                        onCreateNew={() => setPartModalOpen(true)}
                        createNewLabel={t("inventory.create_new_part")}
                        emptyMessage={t("inventory.no_parts_found")}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.qty')}</label>
                        <input
                        type="number"
                        value={part.quantity}
                        onChange={(e) =>
                            handlePartChange(index, "quantity", parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                    </div>
                    {isAdmin ? (
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.cost_placeholder')}</label>
                        <input
                            type="number"
                            name="cost"
                            value={part.cost}
                            onChange={(e) =>
                            handlePartChange(index, "cost", parseFloat(e.target.value))
                            }
                            className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                        </div>
                    ) : (
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.cost_placeholder')}</label>
                        <div className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center">
                            {t("job_cards.admin_only")}
                        </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={(e) => removePart(index, e)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={(e) => addPart(e)}
                    className="mt-4 inline-flex items-center px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#F97402] dark:hover:border-[#F97402] hover:text-[#F97402] transition-all duration-200"
                >
                    <Package className="me-2 h-4 w-4" />
                    {t("forms.add_part")}
                </button>
                </div>
            </div>
          )}

          {/* Pricing Summary Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t("job_cards.pricing_summary.title")}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t("job_cards.pricing_summary.description")}
                  </p>
                </div>
                <div className="inline-flex flex-col items-start px-5 py-4 rounded-2xl border border-[#F97402]/30 bg-[#F97402]/5 text-[#F97402]">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {t("job_cards.pricing_summary.grand_total")}
                  </span>
                  <span className="text-2xl font-bold mt-1">
                    {formatCurrency(pricingTotals.grandTotal)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {t("job_cards.pricing_summary.services_total")}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(pricingTotals.servicesTotal)}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {t("job_cards.pricing_summary.parts_total")}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(pricingTotals.partsTotal)}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {t("job_cards.pricing_summary.parts_vat")}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(pricingTotals.partsVat)}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {t("job_cards.pricing_summary.grand_total")}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(pricingTotals.grandTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Job Card Details Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t("job_cards.additional_details")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  >
                    <option value="pending">{t("estimates.pending")}</option>
                    <option value="in-progress">{t("forms.in_progress")}</option>
                    <option value="completed">{t("forms.completed")}</option>
                    <option value="cancelled">{t("forms.cancelled")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.priority")}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  >
                    <option value="low">{t("forms.low")}</option>
                    <option value="medium">{t("forms.medium")}</option>
                    <option value="high">{t("forms.high")}</option>
                    <option value="urgent">{t("forms.urgent")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.start_time")}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedStartTime}
                    onChange={(e) =>
                      handleInputChange("estimatedStartTime", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.end_time")}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedEndTime}
                    onChange={(e) =>
                      handleInputChange("estimatedEndTime", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.notes")}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200 resize-none"
                    placeholder={t('ui.enter_job_card_notes')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {formData.inspectionId ? (
              <Link
                href={`/inspections/${formData.inspectionId}`}
                className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200"
              >
                {t('inspections.view_inspection')}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setInspectionModalOpen(true)}
                disabled={!formData.customerId || !formData.vehicleId}
                className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                <Plus className="me-2 h-5 w-5" />
                {t('inspections.new_inspection')}
              </button>
            )}

            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAndCreateInvoice}
                  disabled={!formData.customerId || !formData.vehicleId || loading}
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  <FileText className="me-2 h-5 w-5" />
                  {t('job_cards.save_and_create_invoice')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndCreateEstimate}
                  disabled={!formData.customerId || !formData.vehicleId || loading}
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  <FileText className="me-2 h-5 w-5" />
                  {t('job_cards.save_and_create_estimate')}
                </button>
              </>
            )}

            {isEditing && linkedInvoiceId && (
              <button
                type="button"
                onClick={handleUpdateAndPrintInvoice}
                disabled={printingInvoice || loading}
                className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {printingInvoice ? (
                  <>
                    <Loader2 className="me-2 h-5 w-5 animate-spin" />
                    {t('invoices.update_job_card_and_invoice')}
                  </>
                ) : (
                  <>
                    <FileText className="me-2 h-5 w-5" />
                    {t('invoices.update_job_card_and_invoice')}
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200"
            >
              <X className="me-2 h-5 w-5" />
              {t("forms.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              <Save className="me-2 h-5 w-5" />
              {loading
                ? t("forms.saving")
                : isEditing
                ? t("forms.update_job_card")
                : t("forms.save_job_card")}
            </button>
          </div>
        </form>
      </div>

      {printModalData && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintModalData(null);
          }}
          invoice={printModalData.invoice}
          jobCard={printModalData.jobCard}
          language={i18n.language}
        />
      )}

    </div>
  );
}
