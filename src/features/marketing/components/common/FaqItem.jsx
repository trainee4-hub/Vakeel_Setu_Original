import { memo } from "react";
import { IoChevronDown } from "react-icons/io5";

const FaqItem = memo(function FaqItem({
  faq,
  index,
  isOpen,
  onToggle,
}) {
  const faqPanelId = `faq-panel-${index}`;
  const faqButtonId = `faq-button-${index}`;

  return (
    <div
      className={`
        w-full
        overflow-hidden
        rounded-xl
        border
        bg-white
        transition-all
        duration-300
        ${
          isOpen
            ? "border-amber-200 shadow-md shadow-amber-100/40"
            : "border-slate-200 hover:border-slate-300"
        }
      `}
    >
      <button
        type="button"
        id={faqButtonId}
        aria-expanded={isOpen}
        aria-controls={faqPanelId}
        onClick={onToggle}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          sm:gap-4
          sm:px-5
          sm:py-3.5
          md:px-6
        "
      >
        <div
          className={`
            flex
            size-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-[10px]
            font-extrabold
            transition-all
            duration-300
            ${
              isOpen
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-500"
            }
          `}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <span
          className={`
            min-w-0
            flex-1
            text-sm
            font-bold
            leading-5
            transition-colors
            md:text-[15px]
            ${isOpen ? "text-slate-900" : "text-slate-700"}
          `}
        >
          {faq.question}
        </span>

        <div
          className={`
            ml-3
            flex
            size-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            transition-all
            duration-300
            sm:ml-5
            ${
              isOpen
                ? "border-amber-100 bg-amber-50 text-amber-600"
                : "border-slate-100 bg-slate-50 text-slate-400"
            }
          `}
          aria-hidden="true"
        >
          <IoChevronDown
            className={`
              text-[18px]
              transition-transform
              duration-300
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </div>
      </button>

      <div
        id={faqPanelId}
        role="region"
        aria-labelledby={faqButtonId}
        className={`
          grid
          transition-all
          duration-300
          ease-out
          ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
        `}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pl-[3.25rem] sm:px-5 sm:pl-[4rem] md:px-6 md:pl-[4.5rem]">
            <div className="max-w-4xl border-l-2 border-amber-200 pl-4">
              <p className="text-sm leading-6 text-slate-500">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FaqItem;