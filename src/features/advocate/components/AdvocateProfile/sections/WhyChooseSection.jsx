import React from "react";

import {
  FaAward,
  FaCheck,
  FaGavel,
  FaLandmark,
  FaStar,
  FaUserCheck,
} from "react-icons/fa";

import {
  FiBriefcase,
  FiCheckCircle,
  FiShield,
  FiThumbsUp,
  FiUsers,
} from "react-icons/fi";

/**
 * Maps existing Material Symbol icon names coming from whyChooseList
 * to React Icons.
 */
const ICON_MAP = {
  verified: FaUserCheck,
  verified_user: FiShield,
  check: FaCheck,
  check_circle: FiCheckCircle,
  star: FaStar,
  gavel: FaGavel,
  account_balance: FaLandmark,
  workspace_premium: FaAward,
  military_tech: FaAward,
  groups: FiUsers,
  group: FiUsers,
  work: FiBriefcase,
  business_center: FiBriefcase,
  thumb_up: FiThumbsUp,
};

/**
 * Renders only badges backed by real, verifiable data.
 * The list itself is derived by the container;
 * this component adds no business logic.
 */
export default function WhyChooseSection({
  advocateName,
  whyChooseList,
}) {
  if (!whyChooseList?.length) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        Why Choose {advocateName}
      </h2>

      <div className="grid sm:grid-cols-2 gap-3">
        {whyChooseList.map((item, idx) => {
          const Icon = ICON_MAP[item.icon] || FiCheckCircle;

          return (
            <div
              key={idx}
              className="flex items-center gap-3 bg-amber-50/50 border border-amber-100 rounded-2xl px-4 py-3"
            >
              <span className="size-8 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Icon
                  className="text-base"
                  aria-hidden="true"
                />
              </span>

              <span className="text-sm font-semibold text-slate-700">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}