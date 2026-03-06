import { useState } from 'react';
import {useDispatch} from 'react-redux'
import { useNavigate, } from 'react-router-dom';
import {
    Building2,
    Briefcase, MapPin,
    LayoutDashboard, Loader2, Camera,
    IndianRupee,

} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '../../utils/general/cloudinary.util';


import ModuleCard from '../../components/businessSetup/ModuleCard';
import Section from '../../components/businessSetup/Section';
import InputField from '../../components/businessSetup/InputField';
import SelectField from '../../components/businessSetup/SelectField';
import { createBusiness } from '../../utils/admin/business.util';
import { setIsModuleChange } from '../../store/slices/auth.slice';


const Setup = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()


    const [isLoading, setIsLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    const [formData, setFormData] = useState({
        companyName: '',
        legalName: '',
        businessType: 'Private Limited',
        industry: 'Technology',
        email: '',
        phone: '',
        website: '',
        addressLine: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        currencyCode: 'INR',
        currencySymbol: '₹',
        taxType: 'GST',
        taxPercentage: 0,
        modules: {
            core: true,
            userManagement: true,
            departments: true,
            reports: true,
            // auditLogs: true,
            documents: true,
            hr: false,
            tasks: false,
            projects: false,
            inventory: false,
            finance: false,
            accounting: false,
            sales: false,
            crm: false
        }


    });

    const industries = ["IT", "Manufacturing", "Retail", "Healthcare", "Education", "Construction", "Service", "Other"];
    const businessTypes = ["Sole Proprietorship", "Partnership", "Private Limited", "Public Limited", "Non-Profit"];
    const taxTypes = ["GST", "VAT", "SALES", "NONE"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleModule = (moduleName) => {
        setFormData(prev => ({
            ...prev,
            modules: {
                ...prev.modules,
                [moduleName]: !prev.modules[moduleName]
            }
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.companyName) {
            return toast.error("Company Name is required");
        }

        setIsLoading(true);

        try {
            let logoData = { url: "", publicId: "" };

            if (logoFile) {
                const uploadedLogo = await uploadToCloudinary(logoFile);
                if (uploadedLogo) logoData = uploadedLogo;
            }

            const businessData = {
                companyName: formData.companyName,
                legalName: formData.legalName,
                businessType: formData.businessType,
                industry: formData.industry,
                email: formData.email,
                phone: formData.phone,
                website: formData.website,
                address: {
                    addressLine: formData.addressLine,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    pincode: formData.pincode
                },
                logo: logoData,
                modules: formData.modules,
                currencySettings: {
                    code: formData.currencyCode,
                    symbol: formData.currencySymbol
                },
                taxSettings: {
                    type: formData.taxType,
                    percentage: Number(formData.taxPercentage)
                }
            };

            const res = await createBusiness(businessData);

            if (res?.success) {
                toast.success("Business setup successful!");
                navigate("/admin/dashboard");
                dispatch(setIsModuleChange())
            } else {
                toast.error(res?.message);
            }

        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:text-white dark:bg-gray-950 py-10 px-4 sm:px-6 transition-colors">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 mb-3">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                        Create Your Business
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Provide business details to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Business Identity */}
                    <Section title="Business Identity" icon={<Briefcase size={18} />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Logo */}
                            <div className="flex flex-col items-center gap-3">
                                <label className="w-36 h-36 border border-dashed border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center cursor-pointer bg-white dark:bg-gray-900">
                                    {logoPreview ? (
                                        <img src={logoPreview} className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                        <Camera className="h-8 w-8 text-gray-400" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                </label>

                            </div>

                            {/* Fields */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                                <InputField label="Legal Name" name="legalName" value={formData.legalName} onChange={handleInputChange} />
                                <SelectField label="Business Type" name="businessType" value={formData.businessType} onChange={handleInputChange} options={businessTypes} />
                                <SelectField label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} options={industries} />
                                <InputField label="Website" name="website" value={formData.website} onChange={handleInputChange} />
                                <InputField label="Business Email" name="email" value={formData.email} onChange={handleInputChange} />
                                <InputField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                        </div>
                    </Section>

                    {/* Address */}
                    <Section title="Office Address" icon={<MapPin size={18} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <InputField label="Address" name="addressLine" value={formData.addressLine} onChange={handleInputChange} />
                            <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} />
                            <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} />
                            <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} />
                            <InputField label="Country" name="country" value={formData.country} onChange={handleInputChange} />
                        </div>
                    </Section>

                    {/* Finance */}
                    <Section title="Finance & Localization" icon={<IndianRupee size={18} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <InputField label="Currency Code" name="currencyCode" value={formData.currencyCode} onChange={handleInputChange} />
                            <InputField label="Symbol" name="currencySymbol" value={formData.currencySymbol} onChange={handleInputChange} />
                            <SelectField label="Tax Type" name="taxType" value={formData.taxType} onChange={handleInputChange} options={taxTypes} />
                            <InputField label="Tax %" name="taxPercentage" type="number" value={formData.taxPercentage} onChange={handleInputChange} />
                        </div>
                    </Section>

                    {/* Modules */}
                    <Section title="Active Modules" icon={<LayoutDashboard size={18} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.keys(formData.modules).map(m => (
                                <ModuleCard
                                    key={m}
                                    module={m}
                                    isActive={formData.modules[m]}
                                    onClick={() => toggleModule(m)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 text-white rounded-md font-medium flex justify-center items-center disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Finish Setup"}
                    </button>
                </form>
            </div>
        </div>
    );

};


export default Setup;
