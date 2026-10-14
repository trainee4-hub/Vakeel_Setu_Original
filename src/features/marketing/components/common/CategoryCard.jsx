import { memo } from "react";
import {
  FaBalanceScale,
  FaBuilding,
  FaBriefcase,
  FaFileContract,
  FaGavel,
  FaHome,
  FaLandmark,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import {
  FiBookOpen,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";

/*
  Maps existing Material Symbol icon names from category.icon
  to React Icons.

  This allows existing category data to remain unchanged.
*/
const CATEGORY_ICON_MAP = {
  gavel: FaGavel,
  balance: FaBalanceScale,
  account_balance: FaLandmark,
  apartment: FaBuilding,
  business_center: FaBriefcase,
  description: FiFileText,
  article: FiFileText,
  contract: FaFileContract,
  family_restroom: FaUsers,
  groups: FaUsers,
  home: FaHome,
  shield: FaShieldAlt,
  security: FaShieldAlt,
  menu_book: FiBookOpen,
  book: FiBookOpen,
};

const CategoryIcon = ({ icon, className = "" }) => {
  const IconComponent =
    CATEGORY_ICON_MAP[icon] || FiHelpCircle;

  return (
    <IconComponent
      className={className}
      aria-hidden="true"
    />
  );
};

const CategoryCard = memo(function CategoryCard({
  category,
  variant,
  onSelect,
}) {
  const toneClasses =
    category.tone === "emerald"
      ? "border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50"
      : "border-amber-100 hover:border-amber-300 hover:shadow-amber-100/50";

  const iconTone =
    category.tone === "emerald"
      ? "text-emerald-600 bg-emerald-50"
      : "text-amber-600 bg-amber-50";

  if (variant === "row") {
    return (
      <button
        onClick={onSelect}
        className={`group flex w-full items-center gap-4 rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${toneClasses}`}
        type="button"
      >
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconTone}`}
        >
          <CategoryIcon
            icon={category.icon}
            className="text-xl"
          />
        </div>

        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-700">
            {category.label}
          </div>

          <div className="text-[10px] font-medium text-slate-400">
            View Specialists
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={`group flex min-w-0 flex-col items-center justify-center rounded-2xl border bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${toneClasses}`}
      type="button"
    >
      <div
        className={`mb-4 flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${iconTone}`}
      >
        <CategoryIcon
          icon={category.icon}
          className="text-2xl"
        />
      </div>

      <div className="text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-700">
        {category.label}
      </div>
    </button>
  );
});

export default CategoryCard;