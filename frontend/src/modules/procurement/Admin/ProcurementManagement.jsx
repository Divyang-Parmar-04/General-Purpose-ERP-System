import React, { useEffect, useState } from "react";
import {
  Truck,
  Package,
  Plus,
  RefreshCw,
  FileText,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getVendors,
  getPurchaseOrders,
  updatePOStatus,
  getPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  convertToPurchaseOrder,
  deleteVendor,
} from "../../../utils/admin/procurement.util";

import toast from "react-hot-toast";
import ConvertToPOModal from "../components/ConvertToPOModal";
import PRDetailModal from "../components/PRDetailModal";
import PODetailModal from "../components/PODetailModal";
import VendorFormModal from "../components/VendorFormModal";

const ProcurementManagement = () => {
  const [activeTab, setActiveTab] = useState("REQUESTS");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [vendors, setVendors] = useState([]);

  // View modals state
  const [prViewModalOpen, setPrViewModalOpen] = useState(false);
  const [poViewModalOpen, setPoViewModalOpen] = useState(false);
  const [selectedPRId, setSelectedPRId] = useState(null);
  const [selectedPOId, setSelectedPOId] = useState(null);

  // Vendor form modal state
  const [vendorFormOpen, setVendorFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const tabs = [
    { id: "REQUESTS", label: "Purchase Requests", icon: ClipboardList },
    { id: "ORDERS", label: "Purchase Orders", icon: Package },
    { id: "VENDORS", label: "Vendors", icon: Truck },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === "REQUESTS") result = await getPurchaseRequests();
      else if (activeTab === "ORDERS") result = await getPurchaseOrders();
      else result = await getVendors();

      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.message || `Failed to load ${activeTab.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("Connection error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const result = await getVendors();
      if (result.success) {
        setVendors(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const handlePOStatus = async (id, status) => {
    if (!window.confirm(`Mark this PO as "${status}"?`)) return;

    try {
      const result = await updatePOStatus(id, status);
      if (result.success) {
        toast.success(`PO marked as ${status}`);
        fetchData();
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleApprovePR = async (id) => {
    if (!window.confirm("Approve this purchase request?")) return;

    try {
      const result = await approvePurchaseRequest(id);
      if (result.success) {
        toast.success("Purchase request approved");
        fetchData();
      } else {
        toast.error(result.message || "Approval failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleRejectPR = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const result = await rejectPurchaseRequest(id, reason);
      if (result.success) {
        toast.success("Purchase request rejected");
        fetchData();
      } else {
        toast.error(result.message || "Rejection failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleOpenConvertModal = (pr) => {
    setSelectedPR(pr);
    setConvertModalOpen(true);
  };

  const handleConvertToPO = async (data) => {
    try {
      const result = await convertToPurchaseOrder(selectedPR._id, data);
      if (result.success) {
        toast.success("Successfully converted to Purchase Order");
        setConvertModalOpen(false);
        setSelectedPR(null);
        fetchData();
      } else {
        toast.error(result.message || "Conversion failed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // View modal handlers
  const handleViewPR = (prId) => {
    setSelectedPRId(prId);
    setPrViewModalOpen(true);
  };

  const handleViewPO = (poId) => {
    setSelectedPOId(poId);
    setPoViewModalOpen(true);
  };

  // Vendor management handlers
  const handleAddVendor = () => {
    setSelectedVendor(null);
    setVendorFormOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setVendorFormOpen(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }

    try {
      const result = await deleteVendor(vendorId);
      if (result.success) {
        toast.success("Vendor deleted successfully");
        fetchData();
      } else {
        toast.error(result.message || "Failed to delete vendor");
      }
    } catch (error) {
      toast.error("Error deleting vendor");
    }
  };

  const handleVendorFormSuccess = () => {
    fetchData();
  };

  const getStatusBadge = (status) => {
    const base = "inline-block px-3 py-1 text-xs font-medium rounded-full";
    const statusMap = {
      RECEIVED: `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`,
      DELIVERED: `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`,
      APPROVED: `${base} bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300`,
      PENDING: `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`,
      ORDERED: `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300`,
      CONVERTED_TO_PO: `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300`,
      CANCELLED: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
      REJECTED: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
      default: `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`,
    };
    return statusMap[status] || statusMap.default;
  };

  const getPriorityBadge = (priority) => {
    const base = "inline-block px-2 py-0.5 text-xs font-medium rounded";
    const priorityMap = {
      URGENT: `${base} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,
      HIGH: `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300`,
      MEDIUM: `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300`,
      LOW: `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`,
    };
    return priorityMap[priority] || priorityMap.MEDIUM;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-lg">
              <Truck className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Procurement
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Purchase Requests • Orders • Vendors • Supply Chain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 border cursor-pointer border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            {activeTab === "VENDORS" && (
              <button
                onClick={handleAddVendor}
                className="px-4 py-2.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Vendor
              </button>
            )}
            
          </div>
        </div>

        {/* Tabs */}
        <div className="w-[90vw] md:w-[100%] overflow-x-auto  inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === tab.id
                  ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-lg overflow-x-auto w-[90vw] md:w-[100%]">
          {loading ? (
            <div className="py-16 text-center text-gray-500 flex flex-col justify-center items-center gap-2">
              <Loader2 className="animate-spin h-10 w-10"  />
              Loading {activeTab.toLowerCase()}...
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No {activeTab.toLowerCase()} found
            </div>
          ) : activeTab === "REQUESTS" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    PR # / Title
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    Requested By
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Est. Amount
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {data.map((pr) => (
                  <tr key={pr._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-medium">{pr.requestNumber}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pr.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{pr.requestedBy?.name || "—"}</div>
                      <div className="text-xs text-gray-500">
                        {pr.department?.name || "No Dept"}
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">
                      ₹{(pr.totalEstimatedAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-center">
                      <span className={getPriorityBadge(pr.priority)}>
                        {pr.priority}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={getStatusBadge(pr.status)}>
                        {pr.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {pr.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprovePR(pr._id)}
                              className="p-2 text-gray-500 hover:text-green-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectPR(pr._id)}
                              className="p-2 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {pr.status === "APPROVED" && (
                          <button
                            onClick={() => handleOpenConvertModal(pr)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                            title="Convert to PO"
                          >
                            Convert to PO
                          </button>
                        )}
                        <button
                          onClick={() => handleViewPR(pr._id)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View Details"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "ORDERS" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    PO # / Vendor
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Total Value
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Expected Delivery
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {data.map((po) => (
                  <tr key={po._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-medium">{po.poNumber || "—"}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {po.vendorId?.name || "Unknown Vendor"}
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">
                      ₹{(po.grandTotal || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                      {po.expectedDeliveryDate
                        ? new Date(po.expectedDeliveryDate).toLocaleDateString("en-IN")
                        : "TBD"}
                    </td>
                    <td className="p-4 text-center">
                      <span className={getStatusBadge(po.status)}>
                        {po.status || "PENDING"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {po.status !== "RECEIVED" && po.status !== "DELIVERED" && (
                          <button
                            onClick={() => handlePOStatus(po._id, "RECEIVED")}
                            className="p-2 text-gray-500 hover:text-green-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Mark as Received"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewPO(po._id)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View PO Details"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b">
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    Vendor
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    Category / Type
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    Contact
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </th>
                  <th className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="p-4 text-right font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {data.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{vendor.name || "—"}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {vendor.type || "General"}
                    </td>
                    <td className="p-4">
                      {vendor.contacts?.[0] && (
                        <div className="text-sm">
                          <div>{vendor.contacts[0].name}</div>
                          <div className="text-gray-500">
                            {vendor.contacts[0].phone || vendor.contacts[0].email}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                      {vendor.address?.billing?.city ||
                        vendor.address?.shipping?.city ||
                        "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${vendor.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                      >
                        {vendor.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor._id)}
                          className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Convert to PO Modal */}
      {convertModalOpen && (
        <ConvertToPOModal
          isOpen={convertModalOpen}
          onClose={() => {
            setConvertModalOpen(false);
            setSelectedPR(null);
          }}
          purchaseRequest={selectedPR}
          vendors={vendors}
          onConvert={handleConvertToPO}
        />
      )}

      {/* PR Detail View Modal */}
      <PRDetailModal
        isOpen={prViewModalOpen}
        onClose={() => {
          setPrViewModalOpen(false);
          setSelectedPRId(null);
        }}
        prId={selectedPRId}
        onApprove={handleApprovePR}
        onReject={handleRejectPR}
        onConvert={handleOpenConvertModal}
      />

      {/* PO Detail View Modal */}
      <PODetailModal
        isOpen={poViewModalOpen}
        onClose={() => {
          setPoViewModalOpen(false);
          setSelectedPOId(null);
        }}
        poId={selectedPOId}
        onUpdateStatus={handlePOStatus}
      />

      {/* Vendor Form Modal */}
      <VendorFormModal
        isOpen={vendorFormOpen}
        onClose={() => {
          setVendorFormOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
        onSuccess={handleVendorFormSuccess}
      />
    </div>
  );
};

export default ProcurementManagement;