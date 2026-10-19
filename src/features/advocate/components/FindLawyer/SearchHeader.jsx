import React, { useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchHeader = ({
  tempFilters,
  setTempFilters,
  handleSearch,
  onSearchInputChange,
  onClearSearch,
}) => {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      setTempFilters({ searchQuery: "" });
      handleSearch();
    }
    inputRef.current?.focus();
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (onSearchInputChange) {
      onSearchInputChange(value);
    } else {
      setTempFilters({ searchQuery: value });
    }
  };

  return (
    <>
      <section className="mb-7 text-center">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Find Your <span className="text-amber-600">Legal Counsel</span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-slate-500 md:text-lg">
          Find the right advocate based on your legal requirements.
        </p>
      </section>

      <section className="mb-8">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row">
          <div className="group relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <FiSearch className="text-[20px] text-slate-400 transition-colors group-focus-within:text-amber-500" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={tempFilters.searchQuery}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search by name, specialty, city or keyword..."
              className="w-full h-12 pl-12 pr-11 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
            />

            {Boolean(tempFilters.searchQuery) && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute inset-y-0 right-3.5 my-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <FiX className="text-[17px]" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="h-12 px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <FiSearch className="text-[20px]" />
            Search
          </button>
        </div>
      </section>
    </>
  );
};

export default SearchHeader;