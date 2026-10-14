import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import usePremiumAdvocates from "../hooks/usePremiumAdvocates";
import useDashboardScrollTarget from "../hooks/useDashboardScrollTarget";

import HeroSection from "../components/sections/HeroSection";
import CategoriesSection from "../components/sections/CategoriesSection";
import LegalExcellenceSection from "../components/sections/LegalExcellenceSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import FaqSection from "../components/sections/FaqSection";
import HelpSection from "../components/sections/HelpSection";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useDashboardScrollTarget();

  const {
    premiumAdvocates,
    premiumAdvocatesTripled,
    premiumAdvocatesLoading,
    premiumAdvocatesError,
  } = usePremiumAdvocates();

  const handleSelectCategory = useCallback(
    (category) => {
      if (!category) return;

      navigate(
        `/find-lawyer?category=${encodeURIComponent(category)}`,
      );

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    },
    [navigate],
  );

  const handleBookConsultation = useCallback(
    (advocateId) => {
      if (!advocateId) {
        console.error("Advocate ID is missing");
        return;
      }

      if (user) {
        navigate(`/find-lawyer/${advocateId}`, {
          state: {
            scrollToBooking: true,
          },
        });

        return;
      }

      navigate("/login", {
        state: {
          from: `/find-lawyer/${advocateId}`,
          openBookingModal: true,
        },
      });
    },
    [navigate, user],
  );

  const handleViewProfile = useCallback(
    (advocateId) => {
      if (!advocateId) {
        console.error("Advocate ID is missing");
        return;
      }

      navigate(`/find-lawyer/${advocateId}`);
    },
    [navigate],
  );

  const handleViewMarqueeAdvocate = useCallback(
    (advocate) => {
      const advocateId = advocate?.id || advocate?._id;

      if (!advocateId) {
        console.error("Advocate ID is missing");
        return;
      }

      navigate(`/find-lawyer/${advocateId}`, {
        state: {
          advocateName: advocate?.fullName || null,
        },
      });
    },
    [navigate],
  );

  const handleFindLawyer = useCallback(() => {
    navigate("/find-lawyer");
  }, [navigate]);

  const handleHowItWorks = useCallback(() => {
    navigate("/", {
      state: {
        scrollTo: "how-it-works",
      },
    });
  }, [navigate]);

  return (
    <main className="bg-slate-50 pb-0">
      <HeroSection
        onFindLawyer={handleFindLawyer}
        onHowItWorks={handleHowItWorks}
      />

      <CategoriesSection onSelectCategory={handleSelectCategory} />

      <LegalExcellenceSection
        advocates={premiumAdvocates}
        advocatesTripled={premiumAdvocatesTripled}
        loading={premiumAdvocatesLoading}
        error={premiumAdvocatesError}
        onViewAdvocate={handleViewMarqueeAdvocate}
      />

      <HowItWorksSection
        premiumAdvocates={premiumAdvocates}
        onBookConsultation={handleBookConsultation}
        onViewProfile={handleViewProfile}
      />

      <TestimonialsSection />

      <FaqSection />

      <HelpSection />
    </main>
  );
};

export default HomePage;
