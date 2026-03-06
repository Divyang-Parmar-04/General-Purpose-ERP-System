import { Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { updateUserProfileAPI } from "../../../utils/admin/user.util";
import { toast } from "react-hot-toast";

function UserProfile() {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user?.name || "",
        phone: user?.phone ? String(user.phone) : "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const res = await updateUserProfileAPI(profile);
    if (res.success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error(res.message || "Update failed");
    }
    setLoading(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            My Profile
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Personal information & contact details
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          Save Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleProfileChange}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

export default UserProfile;