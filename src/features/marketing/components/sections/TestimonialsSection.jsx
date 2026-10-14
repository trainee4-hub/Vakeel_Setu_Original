import { FaQuoteLeft } from "react-icons/fa";

import RevealOnScroll from "../common/RevealOnScroll";
import {
  PAGE_CONTAINER,
  TESTIMONIALS,
} from "../../data/dashboardData";

const TestimonialsSection = () => {
  return (
    <RevealOnScroll>
      <section className="bg-slate-50 py-12 sm:py-16 lg:py-24">
        <div className={`${PAGE_CONTAINER} text-center`}>
          <h2 className="mb-10 text-2xl font-bold text-slate-900 sm:mb-16 sm:text-3xl">
            Trusted by Users & Corporations
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.author}
                className="
                  group
                  relative
                  mt-6
                  flex
                  flex-col
                  items-center
                  rounded-3xl
                  border
                  border-slate-100
                  bg-white
                  p-8
                  text-center
                  shadow-lg
                  shadow-slate-200/50
                  transition-transform
                  duration-500
                  hover:-translate-y-2
                "
              >
                <div
                  className="
                    absolute
                    -top-6
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-900
                    text-amber-500
                    shadow-lg
                    transition-transform
                    group-hover:scale-110
                  "
                  aria-hidden="true"
                >
                  <FaQuoteLeft className="text-xl" />
                </div>

                <p className="mb-8 mt-6 leading-relaxed text-slate-600 italic">
                  "{testimonial.text}"
                </p>

                <div className="mt-auto w-full border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-bold text-slate-900">
                    {testimonial.author}
                  </h4>

                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
};

export default TestimonialsSection;