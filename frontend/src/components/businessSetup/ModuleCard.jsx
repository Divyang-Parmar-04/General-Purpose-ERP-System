import {CheckCircle2} from "lucide-react"

const ModuleCard = ({ module, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-md border cursor-pointer ${
      isActive
        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10"
        : "border-gray-300 dark:border-gray-700"
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium capitalize">
        {module.replace(/([A-Z])/g, " $1")}
      </span>
      {isActive && <CheckCircle2 size={16} className="text-blue-600" />}
    </div>
  </div>
);

export default ModuleCard;
