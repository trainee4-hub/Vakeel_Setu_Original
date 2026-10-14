import { useCallback, useMemo, useState } from "react";
import {
  DASHBOARD_CATEGORIES,
  PAGE_CONTAINER,
} from "../../data/dashboardData";
import RevealOnScroll from "../common/RevealOnScroll";
import CategoryCard from "../common/CategoryCard";

const CategoriesSection = ({ onSelectCategory }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const doubledCategories = useMemo(
    () => [...DASHBOARD_CATEGORIES, ...DASHBOARD_CATEGORIES],
    [],
  );

  const handleToggle = useCallback(() => {
    setShowAllCategories((previous) => !previous);
  }, []);

  return (
    <RevealOnScroll>
      <section className="bg-slate-50 py-12 sm:py-16 lg:py-20">
        <div className={PAGE_CONTAINER}>
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Browse Categories
              </h2>

              <p className="text-sm text-slate-500 sm:text-base">
                Select a legal category to instantly filter advocates on
                Find Lawyer.
              </p>
            </div>

            <button
              onClick={handleToggle}
              className="self-start rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-amber-400 hover:text-amber-700 md:self-auto"
              type="button"
            >
              {showAllCategories ? "Show Less" : "See All Categories"}
            </button>
          </div>

          <div className="relative w-full">
            <div className="w-full max-w-full">
              {showAllCategories ? (
                <div className="grid grid-cols-1 gap-4 animate-enter sm:grid-cols-2 lg:grid-cols-3">
                  {DASHBOARD_CATEGORIES.map((category) => (
                    <CategoryCard
                      key={category.label}
                      category={category}
                      variant="grid"
                      onSelect={() => onSelectCategory(category.value)}
                    />
                  ))}
                </div>
              ) : (
                <div className="mask-linear-fade relative h-[360px] overflow-hidden">
                  <div
                    className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-16 bg-gradient-to-b from-slate-50 to-transparent"
                    aria-hidden="true"
                  />

                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-slate-50 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 gap-4 py-2 animate-vertical-scroll hover:pause-animation sm:grid-cols-2 lg:grid-cols-3">
                    {doubledCategories.map((category, index) => (
                      <CategoryCard
                        key={`${category.label}-${index}`}
                        category={category}
                        variant="row"
                        onSelect={() => onSelectCategory(category.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
};

export default CategoriesSection;
