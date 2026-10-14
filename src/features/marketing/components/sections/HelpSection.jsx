import HelpForm from "../HelpForm";
import RevealOnScroll from "../common/RevealOnScroll";
import { PAGE_CONTAINER } from "../../data/dashboardData";

const HelpSection = () => {
  return (
    <RevealOnScroll>
      <section id="help" className="w-full border-t border-slate-100 bg-white">
        <div className={PAGE_CONTAINER}>
          <HelpForm />
        </div>
      </section>
    </RevealOnScroll>
  );
};

export default HelpSection;
