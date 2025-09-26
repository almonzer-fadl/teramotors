"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  FileText,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface InspectionItem {
  itemId: string;
  condition: string;
  notes: string;
  priority: string;
  estimatedCost: number;
  recommendations: string;
}

interface VehicleInspection {
  _id: string;
  vehicleId: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  mechanicId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  templateId: {
    _id: string;
    name: string;
  };
  inspectionDate: string;
  mileage: number;
  overallCondition: string;
  items: InspectionItem[];
  totalEstimatedCost: number;
  recommendations: string;
  nextInspectionDate: string;
  status: string;
  createdAt: string;
}

export default function InspectionDetailsPage() {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [inspection, setInspection] = useState<VehicleInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [creatingEstimate, setCreatingEstimate] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInspection();
    }
  }, [id]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInspection(data);
        // Pre-select items that need repair
        const itemsNeedingRepair = data.items
          .filter((item: InspectionItem) => 
            item.condition === 'poor' || item.condition === 'critical'
          )
          .map((item: InspectionItem) => item.itemId);
        setSelectedItems(itemsNeedingRepair);
      }
    } catch (error) {
      console.error("Failed to fetch inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const createEstimate = async () => {
    if (selectedItems.length === 0) {
      alert(t("inspections.select_items_for_estimate"));
      return;
    }

    setCreatingEstimate(true);
    try {
      const response = await fetch("/api/estimates/from-inspection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionId: id,
          selectedItems: inspection?.items.filter(item => 
            selectedItems.includes(item.itemId)
          )
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/estimates/${data.estimate._id}`);
      } else {
        const error = await response.json();
        alert(error.message || t("estimates.failed_to_create"));
      }
    } catch (error) {
      console.error("Failed to create estimate:", error);
      alert(t("estimates.failed_to_create"));
    } finally {
      setCreatingEstimate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!inspection) {
    return <div>{t("inspections.not_found")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/inspections"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("inspections.inspection_details")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {inspection.vehicleId.make} {inspection.vehicleId.model} - {inspection.vehicleId.licensePlate}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/inspections/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("forms.edit")}
          </Link>
          <button
            onClick={createEstimate}
            disabled={creatingEstimate || selectedItems.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {creatingEstimate ? t("estimates.creating") : t("estimates.create_from_inspection")}
          </button>
        </div>
      </div>

      {/* Inspection Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.customer")}
            </h3>
            <p className="text-sm text-gray-900">
              {inspection.customerId.firstName} {inspection.customerId.lastName}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.mechanic")}
            </h3>
            <p className="text-sm text-gray-900">
              {inspection.mechanicId.userId.firstName} {inspection.mechanicId.userId.lastName}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.inspection_date")}
            </h3>
            <p className="text-sm text-gray-900">
              {new Date(inspection.inspectionDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.mileage")}
            </h3>
            <p className="text-sm text-gray-900">
              {inspection.mileage.toLocaleString()} km
            </p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.overall_condition")}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              inspection.overallCondition === 'excellent' ? 'bg-green-100 text-green-800' :
              inspection.overallCondition === 'good' ? 'bg-blue-100 text-blue-800' :
              inspection.overallCondition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {t(`forms.condition_${inspection.overallCondition}`)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.total_estimated_cost")}
            </h3>
            <p className="text-sm text-gray-900 font-semibold">
              ${inspection.totalEstimatedCost.toFixed(2)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("inspections.status")}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              inspection.status === 'completed' ? 'bg-green-100 text-green-800' :
              inspection.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {t(`inspections.status_${inspection.status}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Inspection Items */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t("inspections.inspection_items")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("inspections.select_items_for_estimate")}
          </p>
        </div>
        
        <div className="space-y-3">
          {inspection.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.itemId)}
                    onChange={() => handleItemSelection(item.itemId)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {item.itemId}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.condition === 'good' ? 'bg-green-100 text-green-800' :
                        item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        item.condition === 'poor' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(`forms.condition_${item.condition}`)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        item.priority === 'safety' ? 'bg-orange-100 text-orange-800' :
                        item.priority === 'recommended' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`forms.priority_${item.priority}`)}
                      </span>
                    </div>
                    
                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>{t("forms.notes")}:</strong> {item.notes}
                      </p>
                    )}
                    
                    {item.recommendations && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>{t("forms.recommendations")}:</strong> {item.recommendations}
                      </p>
                    )}
                    
                    {item.estimatedCost > 0 && (
                      <p className="text-sm font-medium text-gray-900">
                        <strong>{t("forms.estimated_cost")}:</strong> ${item.estimatedCost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {inspection.recommendations && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t("inspections.recommendations")}
          </h2>
          <p className="text-sm text-gray-600">
            {inspection.recommendations}
          </p>
        </div>
      )}
    </div>
  );
}
