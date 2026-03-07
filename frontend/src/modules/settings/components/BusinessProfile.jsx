import { Save, Loader2, RefreshCw, Trash2, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBusinessAPI,
  updateBusinessProfileAPI,
  updateModulesAPI,
  updateCurrencyAPI,
  updateTaxSettingsAPI,
  deleteBusinessAPI,
} from "../../../utils/admin/business.util";
import { toast } from "react-hot-toast";
import { setIsModuleChange, logout } from "../../../store/slices/auth.slice";
import { useNavigate } from "react-router-dom";

const Section = ({ title, onSave, children, loading }) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <button
        onClick={onSave}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
        Save Changes
      </button>
    </div>
    <div className="space-y-5">{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
    />
  </div>
);

function BusinessProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.name === "ADMIN" || user?.role?.name === "SUPER_ADMIN";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [business, setBusiness] = useState({
    companyName: "",
    legalName: "",
    businessType: "",
    industry: "",
    email: "",
    phone: "",
    website: "",
    logo: "",
    address: { addressLine: "", city: "", state: "", country: "", pincode: "" },
    modules: {},
    currencySettings: { code: "", symbol: "", name: "" },
    taxSettings: { enabled: false, type: "", label: "", percentage: 0 },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const deleteTargetText = "DELETE BUSINESS";

  useEffect(() => {
    if (isAdmin) {
      fetchBusinessData();
    }
  }, [isAdmin]);

  const fetchBusinessData = async () => {
    setFetching(true);
    const res = await getBusinessAPI();
    if (res.success) {
      setBusiness((prev) => ({ ...prev, ...res.business }));
    }
    setFetching(false);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({
      ...prev,
      currencySettings: { ...prev.currencySettings, [name]: value },
    }));
  };

  const handleTaxChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setBusiness((prev) => ({
      ...prev,
      taxSettings: { ...prev.taxSettings, [name]: val },
    }));
  };

  const toggleModule = (key) => {
    setBusiness((prev) => ({
      ...prev,
      modules: { ...prev.modules, [key]: !prev.modules[key] },
    }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { companyName, legalName, businessType, industry, email, phone, website, address } = business;
    const res = await updateBusinessProfileAPI({
      companyName,
      legalName,
      businessType,
      industry,
      email,
      phone,
      website,
      address,
    });
    if (res.success) toast.success("Profile updated");
    else toast.error(res.message || "Update failed");
    setLoading(false);
  };

  const handleUpdateModules = async () => {
    setLoading(true);
    const res = await updateModulesAPI({ modules: business.modules });
    if (res.success) {
      toast.success("Modules updated");
      dispatch(setIsModuleChange());
    } else {
      toast.error(res.message || "Update failed");
    }
    setLoading(false);
  };

  const handleUpdateCurrency = async () => {
    setLoading(true);
    const res = await updateCurrencyAPI({ currencySettings: business.currencySettings });
    if (res.success) toast.success("Currency settings updated");
    else toast.error(res.message || "Update failed");
    setLoading(false);
  };

  const handleUpdateTax = async () => {
    setLoading(true);
    const res = await updateTaxSettingsAPI({ taxSettings: business.taxSettings });
    if (res.success) toast.success("Tax settings updated");
    else toast.error(res.message || "Update failed");
    setLoading(false);
  };

  const handleDeleteBusiness = async () => {
    if (deleteConfirmText !== deleteTargetText) {
      toast.error("Please type the confirmation text exactly");
      return;
    }

    setLoading(true);
    const res = await deleteBusinessAPI();
    if (res.success) {
      toast.success("Business and all data deleted successfully");
      dispatch(logout());
      navigate("/login");
    } else {
      toast.error(res.message || "Deletion failed");
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-800 rounded-lg">
        Restricted Access: Admin Only
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Logo Preview */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 w-[200px]">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Company Logo</h3>
        <div className="flex items-center justify-center p-3 border-gray-300 dark:border-gray-700 rounded-lg">
          {business.logo ? (
            <img
              src={business?.logo?.url}
              alt="Company Logo"
              className="max-w-xs max-h-30 rounded-xl object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No logo uploaded</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Logo will appear here once uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* Business Details */}
      <Section title="Business Information" onSave={handleUpdateProfile} loading={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            name="companyName"
            value={business.companyName}
            onChange={handleTextChange}
            placeholder="Official company name"
          />
          <Input
            label="Legal Name"
            name="legalName"
            value={business.legalName}
            onChange={handleTextChange}
            placeholder="Registered legal name"
          />
          <Input
            label="Business Type"
            name="businessType"
            value={business.businessType}
            onChange={handleTextChange}
            placeholder="e.g. Private Limited, LLP"
          />
          <Input
            label="Industry"
            name="industry"
            value={business.industry}
            onChange={handleTextChange}
            placeholder="e.g. Technology, Retail"
          />
          <Input
            label="Business Email"
            name="email"
            value={business.email}
            onChange={handleTextChange}
            placeholder="contact@company.com"
          />
          <Input
            label="Business Phone"
            name="phone"
            value={business.phone}
            onChange={handleTextChange}
            placeholder="+91 98765 43210"
          />
          <Input
            label="Website"
            name="website"
            value={business.website}
            onChange={handleTextChange}
            placeholder="https://www.company.com"
          />
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Registered Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Address Line"
              name="addressLine"
              value={business.address?.addressLine}
              onChange={handleAddressChange}
              placeholder="Street address, building, etc."
            />
            <Input
              label="City"
              name="city"
              value={business.address?.city}
              onChange={handleAddressChange}
            />
            <Input
              label="State / Province"
              name="state"
              value={business.address?.state}
              onChange={handleAddressChange}
            />
            <Input
              label="Country"
              name="country"
              value={business.address?.country}
              onChange={handleAddressChange}
            />
            <Input
              label="PIN / ZIP Code"
              name="pincode"
              value={business.address?.pincode}
              onChange={handleAddressChange}
            />
          </div>
        </div>
      </Section>

      {/* Modules */}
      <Section title="Active Modules" onSave={handleUpdateModules} loading={loading}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.keys(business.modules || {}).map((mod) => (
            <button
              key={mod}
              disabled={mod === "core"}
              onClick={() => toggleModule(mod)}
              className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all ${business.modules[mod]
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500"
                } ${mod === "core" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {mod.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
      </Section>

      {/* Currency */}
      <Section title="Currency Settings" onSave={handleUpdateCurrency} loading={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Input
            label="Currency Code"
            name="code"
            value={business.currencySettings?.code}
            onChange={handleCurrencyChange}
            placeholder="INR"
          />
          <Input
            label="Symbol"
            name="symbol"
            value={business.currencySettings?.symbol}
            onChange={handleCurrencyChange}
            placeholder="₹"
          />
          <Input
            label="Currency Name"
            name="name"
            value={business.currencySettings?.name}
            onChange={handleCurrencyChange}
            placeholder="Indian Rupee"
          />
        </div>
      </Section>

      {/* Tax Settings */}
      <Section title="Tax Configuration" onSave={handleUpdateTax} loading={loading}>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="enabled"
              checked={business.taxSettings?.enabled || false}
              onChange={handleTaxChange}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Tax Calculation
            </label>
          </div>

          {business.taxSettings?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
              <Input
                label="Tax Label"
                name="label"
                value={business.taxSettings?.label}
                onChange={handleTaxChange}
                placeholder="GST / VAT"
              />
              <Input
                label="Tax Rate (%)"
                name="percentage"
                value={business.taxSettings?.percentage}
                onChange={handleTaxChange}
                placeholder="18"
                type="number"
              />
            </div>
          )}
        </div>
      </Section>

      {/* Danger Zone */}
      <div className="mt-12 border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/10 p-6 border-b border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Danger Zone</h3>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400/80">
            Once you delete a business, there is no going back. This will permanently remove all data, including employees, tasks, reports, and configurations associated with this business.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-900">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-red-500/20"
          >
            Delete Entire Business
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-lg mb-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    This action is irreversible. All employees, tasks, and data will be permanently lost.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                To confirm, please type <span className="font-bold text-red-600 dark:text-red-400">{deleteTargetText}</span> below:
              </p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type confirmation text..."
                className="w-full px-4 py-2 border border-red-200 dark:border-red-900/40 rounded-lg bg-red-50/20 dark:bg-red-900/10 focus:ring-2 focus:ring-red-500 outline-none mb-6 text-gray-900 dark:text-white"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBusiness}
                  disabled={deleteConfirmText !== deleteTargetText || loading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                  Delete Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessProfile;