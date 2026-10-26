import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@features/auth";
import AdvocateProfileSkeleton from "../skeleton/AdvocateProfileSkeleton";

import useAdvocateProfile from "./hooks/useAdvocateProfile";
import useAdvocateLike from "./hooks/useAdvocateLike";
import useAdvocateReviews from "./hooks/useAdvocateReviews";
import useSavedLawyer from "./hooks/useSavedLawyer";
import useSimilarAdvocates from "./hooks/useSimilarAdvocates";

import AdvocateProfileHeader from "./header/AdvocateProfileHeader";
import ProfileSectionNav from "./header/ProfileSectionNav";

import AboutSection from "./sections/AboutSection";
import CertificatesSection from "./sections/CertificatesSection";
import ConsultationProcessSection from "./sections/ConsultationProcessSection";
import EducationSection from "./sections/EducationSection";
import FAQSection from "./sections/FAQSection";
import PracticeAreasSection from "./sections/PracticeAreasSection";
import ProfessionalBackgroundSection from "./sections/ProfessionalBackgroundSection";
import ReviewsSection from "./sections/ReviewsSection";
import SimilarAdvocatesSection from "./sections/SimilarAdvocatesSection";
import WhyChooseSection from "./sections/WhyChooseSection";

import ConsultationCard from "./sidebar/ConsultationCard";
import OfficeInformation from "./sidebar/OfficeInformation";

import AdvocateBookingModal from "./modals/AdvocateBookingModal";
import OfflineAdvocateDialog from "./modals/OfflineAdvocateDialog";
import ReviewModal from "./modals/ReviewModal";
import { getAdvocateBookingOptions } from "../../services/advocateBookingApi";

import ProfileErrorState from "./common/ProfileErrorState";

import {
  SECTION_LINKS,
  SUBJECT_OPTIONS,
} from "./utils/advocateProfileUtils";

const AdvocateProfile = ({
  advocateId,
  onBack,
  onConsultationBooked,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, user, token } = useAuth();

  const viewerIsAdvocate =
    String(user?.role || "").toLowerCase() ===
    "advocate";

  /* =========================================================
     ADVOCATE PROFILE
  ========================================================= */

  const {
    advocate,
    loading,
    fetchError,
    retryToken,
    retry,
  } = useAdvocateProfile(advocateId, token);

  const isOnline = advocate?.isOnline === true;

  /* =========================================================
     SAVED LAWYER
  ========================================================= */

  const saved = useSavedLawyer({
    advocateId,

    initialSaved:
      typeof advocate?.isSaved === "boolean"
        ? advocate.isSaved
        : null,

    isLoggedIn,
    viewerIsAdvocate,
    navigate,

    locationPathname: location.pathname,
  });

  /* =========================================================
     REVIEWS
  ========================================================= */

  const reviewsState = useAdvocateReviews({
    advocateId,
    profileRetryToken: retryToken,
    isLoggedIn,
    currentUser: user,
    navigate,
    locationPathname: location.pathname,
  });

  /* =========================================================
     LIKE
  ========================================================= */

  const like = useAdvocateLike({
    advocateId,

    initialLiked:
      typeof advocate?.isLiked === "boolean"
        ? advocate.isLiked
        : null,

    initialLikeCount:
      advocate?.likeCount ?? null,

    isLoggedIn,
    viewerIsAdvocate,
  });

  /* =========================================================
     SIMILAR ADVOCATES
  ========================================================= */

  const similar = useSimilarAdvocates({
    advocateId,
    advocate,
  });

  /* =========================================================
     ADVOCATE BOOKING
  ========================================================= */

  const [bookingOptions, setBookingOptions] = useState(null);
  const [bookingOptionsLoading, setBookingOptionsLoading] = useState(false);
  const [selectedBookingMode, setSelectedBookingMode] = useState("");
  const [isAdvocateBookingModalOpen, setIsAdvocateBookingModalOpen] = useState(false);
  const [isOfflineDialogOpen, setIsOfflineDialogOpen] = useState(false);

  const handleBookExpertFromOffline = useCallback(() => {
    const eventDetail = { handled: false };
    const customEvent = new CustomEvent("vakeelsetu:open-consultancy", {
      bubbles: true,
      cancelable: true,
      detail: eventDetail,
    });
    window.dispatchEvent(customEvent);

    setIsOfflineDialogOpen(false);

    if (!eventDetail.handled) {
      console.warn("No handler responded to vakeelsetu:open-consultancy");
      alert(
        "Our Expert Consultation assistant could not be opened automatically. Please click the Expert Consultation button at the bottom of your screen."
      );
    }
  }, []);

  useEffect(() => {
    if (!advocateId) return;
    let isCancelled = false;
    queueMicrotask(() => {
      if (!isCancelled) setBookingOptionsLoading(true);
    });
    getAdvocateBookingOptions(advocateId)
      .then((data) => {
        if (!isCancelled) {
          setBookingOptions(data);
          if (data?.modes?.[0]?.mode) {
            setSelectedBookingMode((prev) => prev || data.modes[0].mode);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch booking options:", err);
      })
      .finally(() => {
        if (!isCancelled) setBookingOptionsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [advocateId]);

  // Handle auto-reopen after login
  useEffect(() => {
    let shouldOpen = Boolean(location.state?.openBookingModal);
    let preferredMode = location.state?.selectedMode;

    try {
      const pendingRaw = sessionStorage.getItem("pending_advocate_booking");
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        if (pending?.advocateId === advocateId) {
          shouldOpen = true;
          if (pending.mode) preferredMode = pending.mode;
        }
      }
    } catch (e) {
      console.warn("Error reading pending booking from sessionStorage", e);
    }

    if (shouldOpen && bookingOptions) {
      try {
        sessionStorage.removeItem("pending_advocate_booking");
      } catch {
        // ignore
      }

      queueMicrotask(() => {
        if (preferredMode) {
          setSelectedBookingMode(preferredMode);
        }

        // If the advocate is offline, do NOT open the booking modal!
        if (!isOnline) {
          setIsOfflineDialogOpen(true);
        } else {
          setIsAdvocateBookingModalOpen(true);
        }
      });
    }
  }, [advocateId, bookingOptions, location.state, isOnline]);

  const handleProceedToBooking = useCallback(() => {
    if (!isOnline) {
      setIsOfflineDialogOpen(true);
      return;
    }

    if (!isLoggedIn) {
      try {
        sessionStorage.setItem(
          "pending_advocate_booking",
          JSON.stringify({
            advocateId,
            mode: selectedBookingMode,
          })
        );
      } catch (e) {
        console.warn("Could not save pending booking to sessionStorage", e);
      }

      navigate("/login", {
        state: {
          from: location.pathname,
          openBookingModal: true,
          selectedMode: selectedBookingMode,
        },
      });
      return;
    }

    setIsAdvocateBookingModalOpen(true);
  }, [isOnline, isLoggedIn, advocateId, selectedBookingMode, navigate, location.pathname]);

  /* =========================================================
     PAGE STATE
  ========================================================= */

  const [
    highlightBooking,
    setHighlightBooking,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState("about");

  const bookingSectionRef = useRef(null);

  /* =========================================================
     RESET WHEN ADVOCATE CHANGES
  ========================================================= */

/* =========================================================
   RESET WHEN ADVOCATE CHANGES
========================================================= */

useEffect(() => {
  const resetTimer = setTimeout(() => {
    setHighlightBooking(false);
    setActiveSection("about");
  }, 0);

  return () => {
    clearTimeout(resetTimer);
  };
}, [advocateId]);

/* =========================================================
   SCROLL TO BOOKING
========================================================= */

useEffect(() => {
  if (!advocate) {
    return undefined;
  }

  if (location.state?.scrollToBooking) {
    const startHighlightTimer = setTimeout(() => {
      setHighlightBooking(true);
    }, 0);

    const scrollTimer = setTimeout(() => {
      bookingSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);

    const highlightTimer = setTimeout(() => {
      setHighlightBooking(false);
    }, 2500);

    return () => {
      clearTimeout(startHighlightTimer);
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }

  window.scrollTo({
    top: 0,
    behavior: "instant",
  });

  return undefined;
}, [advocate, location.state]);

  /* =========================================================
     ACTIVE SECTION OBSERVER
  ========================================================= */

  useEffect(() => {
    if (!advocate) {
      return undefined;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(
                entry.target.id,
              );
            }
          });
        },
        {
          rootMargin:
            "-45% 0px -45% 0px",
          threshold: 0,
        },
      );

    SECTION_LINKS.forEach((link) => {
      const element =
        document.getElementById(link.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [
    advocate,
    similar.similarAdvocates.length,
  ]);

  /* =========================================================
     SIMILAR ADVOCATE NAVIGATION
  ========================================================= */

  const handleViewSimilarAdvocate =
    useCallback(
      (id) => {
        navigate(`/find-lawyer/${id}`);
      },
      [navigate],
    );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <AdvocateProfileSkeleton />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (!advocate) {
    return (
      <ProfileErrorState
        fetchError={fetchError}
        onBack={onBack}
        onRetry={retry}
      />
    );
  }

  /* =========================================================
     PROFILE DATA
  ========================================================= */

  const practiceAreas =
    advocate?.professionalCredentials
      ?.practiceAreas || [];

  const courts =
    advocate?.professionalCredentials
      ?.courtsPracticedIn || [];

  const languages =
    advocate?.personalDetails?.language
      ?.map((language) => {
        const value =
          String(language || "");

        return value
          ? value.charAt(0).toUpperCase() +
              value.slice(1)
          : "";
      })
      .filter(Boolean)
      .join(", ") || "English";

  const locationStr =
    [
      advocate?.personalDetails
        ?.location?.city,

      advocate?.personalDetails
        ?.location?.state,
    ]
      .filter(Boolean)
      .join(", ") || "India";

  const advocateName =
    advocate?.personalDetails?.fullName ||
    advocate?.fullName ||
    "Advocate";

  const yearsOfExperience =
    advocate?.professionalCredentials
      ?.yearsOfExperience ??
    advocate?.experienceYears ??
    0;

  const casesSolved =
    advocate?.professionalCredentials
      ?.casesSolved ??
    advocate?.casesHandled ??
    0;

  const professionalSummary =
    advocate?.professionalCredentials
      ?.professionalSummary ||
    advocate?.about ||
    advocate?.bio ||
    "";

  /* =========================================================
     ONLINE / OFFLINE

     IMPORTANT:
     status === ACTIVE is NOT online status.
     callAvailability is NOT online status.

     Only API isOnline controls presence (defined above).
  ========================================================= */


  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  const profileImageUrl =
    advocate?.personalDetails?.profileUrl ||
    advocate?.profilePhotoUrl ||
    advocate?.profileImage ||
    null;

  /* =========================================================
     OPTIONAL PROFILE DATA
  ========================================================= */

  const educationList =
    advocate?.education || [];

  const experienceList =
    advocate?.professionalExperience ||
    advocate?.experience ||
    [];

  const awards =
    advocate?.awards || [];

  const memberships =
    advocate?.memberships || [];

  const certificates =
    advocate?.certificates || [];

  const faqs =
    Array.isArray(advocate?.faqs)
      ? advocate.faqs
      : [];

  /* =========================================================
     OFFICE
  ========================================================= */

  const officeVisit = advocate?.eliteMembership?.officeVisit || null;
  const voiceFee = advocate?.eliteMembership?.voiceCall?.fee ?? null;
  const videoFee = advocate?.eliteMembership?.videoCall?.fee ?? null;
  const officeFee = officeVisit?.fee ?? null;

  const officeLocation =
    officeVisit?.officeLocation || "";

  const officeTimings =
    officeVisit?.timings || "";

  const officeParking =
    officeVisit?.parking || "";

  const officeAccessibility =
    officeVisit?.accessibility || "";

  const barCouncilNumber =
    advocate?.personalDetails
      ?.barCouncilRegistrationNumber ||
    advocate?.barCouncilId ||
    advocate?.barId ||
    null;

  const officeEmail =
    advocate?.personalDetails?.email ||
    null;

  const officePhone =
    advocate?.personalDetails?.phone
      ?.number || null;

  const mapsSearchLocation =
    officeLocation || locationStr;

  const officeMapsUrl =
    mapsSearchLocation
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          mapsSearchLocation,
        )}`
      : null;

  const officeMapEmbedUrl =
    mapsSearchLocation
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          mapsSearchLocation,
        )}&output=embed`
      : null;

  /* =========================================================
     RATINGS
  ========================================================= */

  const {
    reviewSummary,
    reviews,
  } = reviewsState;

  const safeReviews =
    Array.isArray(reviews)
      ? reviews
      : [];

  const ratingDistribution =
    reviewSummary?.distribution ||
    null;

  const reviewsCount =
    Number(
      reviewSummary?.totalReviews ??
        advocate?.totalReviews ??
        safeReviews.length ??
        0,
    ) || 0;

  let rawAverageRating = 0;

  if (
    reviewSummary?.averageRating != null
  ) {
    rawAverageRating =
      Number(
        reviewSummary.averageRating,
      ) || 0;
  } else if (
    advocate?.averageRating != null
  ) {
    rawAverageRating =
      Number(
        advocate.averageRating,
      ) || 0;
  } else if (
    safeReviews.length > 0
  ) {
    rawAverageRating =
      safeReviews.reduce(
        (sum, review) =>
          sum +
          Number(review?.rating || 0),
        0,
      ) / safeReviews.length;
  }

  const avgRating =
    Math.round(
      (rawAverageRating +
        Number.EPSILON) *
        10,
    ) / 10;

  const hasReviews =
    reviewsCount > 0;

  const filledStars =
    hasReviews
      ? Math.round(avgRating)
      : 0;

  /* =========================================================
     SUCCESS RATE
  ========================================================= */

  const casesHandled =
    advocate?.professionalCredentials
      ?.casesHandled;

  const casesTotal =
    advocate?.professionalCredentials
      ?.casesTotal;

  const successRate =
    typeof casesHandled === "number" &&
    typeof casesTotal === "number" &&
    casesTotal > 0
      ? Math.round(
          (casesHandled /
            casesTotal) *
            100,
        )
      : null;

  /* =========================================================
     NEXT AVAILABLE SLOT
  ========================================================= */

  const nextAvailableSlot =
    advocate?.availabilityStatus
      ?.nextAvailableSlot ||
    null;

  /* =========================================================
     WHY CHOOSE
  ========================================================= */

  const whyChooseList = [
    advocate?.isOnboardingCompleted && {
      icon: "verified_user",
      text: "Verified Professional",
    },

    avgRating >= 4 &&
      reviewsCount > 0 && {
        icon: "star",
        text: "Highly Rated by Clients",
      },

    casesSolved > 0 && {
      icon: "workspace_premium",
      text: `${casesSolved}+ Cases Successfully Handled`,
    },

    yearsOfExperience >= 5 && {
      icon: "military_tech",
      text: `${yearsOfExperience}+ Years of Experience`,
    },

    (voiceFee != null ||
      videoFee != null ||
      officeFee != null) && {
      icon: "payments",
      text: "Transparent Consultation Fees",
    },
  ].filter(Boolean);


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ================= HEADER ================= */}

      <div className="relative border border-slate-200 bg-white rounded-2xl shadow-sm mb-6">
        <AdvocateProfileHeader
          advocateName={advocateName}
          profileImageUrl={profileImageUrl}
          practiceAreas={practiceAreas}
          filledStars={filledStars}
          hasReviews={hasReviews}
          avgRating={avgRating}
          reviewsCount={reviewsCount}
          yearsOfExperience={
            yearsOfExperience
          }
          casesSolved={casesSolved}
          successRate={successRate}
          locationStr={locationStr}
          languages={languages}
          nextAvailableSlot={
            nextAvailableSlot
          }

          /*
           * Presence:
           * only photo indicator uses this.
           */
          isOnline={isOnline}

          /* Like */
          isLiked={like.isLiked}
          likeCount={like.likeCount}
          isLikeLoading={
            like.isLikeLoading
          }
          likeError={like.likeError}
          canLike={like.canLike}
          viewerIsAdvocate={
            viewerIsAdvocate
          }
          onLikeClick={like.toggleLike}

          /* Save */
          isSaved={saved.isSaved}
          savedLawyerLoading={
            saved.savedLawyerLoading
          }
          savingLawyer={
            saved.savingLawyer
          }
          savedLawyerError={
            saved.savedLawyerError
          }
          canSave={!viewerIsAdvocate}
          onSaveClick={
            saved.toggleSavedLawyer
          }
        />

        <ProfileSectionNav
          activeSection={activeSection}
          hasSimilarAdvocates={
            similar.similarAdvocates
              .length > 0
          }
        />
      </div>

      {/* ================= CONTENT ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}

        <div className="lg:col-span-8 space-y-6">
          <AboutSection
            advocateName={advocateName}
            professionalSummary={
              professionalSummary
            }
            yearsOfExperience={
              yearsOfExperience
            }
            casesSolved={casesSolved}
            practiceAreas={practiceAreas}
            courts={courts}
          />

          <WhyChooseSection
            advocateName={advocateName}
            whyChooseList={
              whyChooseList
            }
          />

          <EducationSection
            educationList={
              educationList
            }
          />

          <PracticeAreasSection
            bestPracticeArea={
              advocate?.bestPracticeArea
            }
            practiceAreas={
              practiceAreas
            }
            courts={courts}
          />

          <CertificatesSection
            certificates={
              certificates
            }
          />

          <ReviewsSection
            hasReviews={hasReviews}
            avgRating={avgRating}
            reviewsCount={
              reviewsCount
            }
            filledStars={
              filledStars
            }
            ratingDistribution={
              ratingDistribution
            }
            reviews={
              reviewsState.reviews
            }
            sortedReviews={
              reviewsState.sortedReviews
            }
            visibleReviews={
              reviewsState.visibleReviews
            }
            reviewsLoading={
              reviewsState.reviewsLoading
            }
            reviewsError={
              reviewsState.reviewsError
            }
            onRetry={retry}
            reviewSort={
              reviewsState.reviewSort
            }
            onReviewSortChange={
              reviewsState.setReviewSort
            }
            showAllReviews={
              reviewsState.showAllReviews
            }
            onToggleShowAllReviews={
              reviewsState
                .toggleShowAllReviews
            }
            rating={
              reviewsState.rating
            }
            hasRated={
              reviewsState.hasRated
            }
            onQuickRate={
              reviewsState
                .handleQuickRating
            }
            onOpenWriteReview={
              reviewsState
                .openWriteReview
            }
            myReview={
              reviewsState.myReview
            }
            onOpenEditReview={
              reviewsState
                .openEditReview
            }
            onAlreadySubmittedClick={
              reviewsState
                .handleAlreadySubmittedClick
            }
            reviewAlert={
              reviewsState.reviewAlert
            }
            onClearAlert={
              reviewsState.clearReviewAlert
            }
          />

          <ProfessionalBackgroundSection
            experienceList={
              experienceList
            }
            awards={awards}
            memberships={
              memberships
            }
            barCouncilNumber={
              barCouncilNumber
            }
            locationStr={
              locationStr
            }
          />

          <FAQSection
            faqs={faqs}
          />

          <ConsultationProcessSection />
        </div>

        {/* RIGHT */}

        <div className="lg:col-span-4 relative">
          <div className="lg:sticky lg:top-6 space-y-6">
            <ConsultationCard
              ref={bookingSectionRef}
              highlight={highlightBooking}
              selectedMode={selectedBookingMode}
              onSelectMode={setSelectedBookingMode}
              bookingOptions={bookingOptions}
              isOnline={isOnline}
              loading={bookingOptionsLoading}
              onProceed={handleProceedToBooking}
            />

            <OfficeInformation
              advocateName={
                advocateName
              }
              officeLocation={
                officeLocation
              }
              officeMapEmbedUrl={
                officeMapEmbedUrl
              }
              officeMapsUrl={
                officeMapsUrl
              }
              officePhone={
                officePhone
              }
              officeEmail={
                officeEmail
              }
              officeTimings={
                officeTimings
              }
              officeParking={
                officeParking
              }
              officeAccessibility={
                officeAccessibility
              }
            />
          </div>
        </div>
      </div>

      {/* ================= SIMILAR ================= */}

      <SimilarAdvocatesSection
        similarAdvocates={
          similar.similarAdvocates
        }
        isSimilarFallback={
          similar.isSimilarFallback
        }
        currentPracticeAreaNames={
          similar.currentPracticeAreaNames
        }
        scrollRef={
          similar.scrollRef
        }
        onMouseEnter={
          similar.handleMouseEnter
        }
        onMouseLeave={
          similar.handleMouseLeave
        }
        onInteractionStart={
          similar.handleInteractionStart
        }
        onInteractionEnd={
          similar.handleInteractionEnd
        }
        onViewAdvocate={
          handleViewSimilarAdvocate
        }
      />

      {/* ================= ADVOCATE BOOKING MODAL ================= */}

      <AdvocateBookingModal
        isOpen={isAdvocateBookingModalOpen}
        onClose={() => setIsAdvocateBookingModalOpen(false)}
        advocate={advocate}
        bookingOptions={bookingOptions}
        initialMode={selectedBookingMode}
        currentUser={user}
        onBookingComplete={onConsultationBooked}
      />

      <OfflineAdvocateDialog
        isOpen={isOfflineDialogOpen}
        onClose={() => setIsOfflineDialogOpen(false)}
        onBookExpert={handleBookExpertFromOffline}
        advocateName={advocateName}
      />

      {/* ================= REVIEW MODAL ================= */}

      <ReviewModal
        open={
          reviewsState
            .isWriteReviewOpen
        }
        isEditing={
          reviewsState
            .isEditingReview
        }
        rating={
          reviewsState.rating
        }
        reviewText={
          reviewsState.reviewText
        }
        submitting={
          reviewsState
            .submittingReview
        }
        onRatingChange={
          reviewsState.setRating
        }
        onReviewTextChange={
          reviewsState
            .onReviewTextChange
        }
        onSubmit={
          reviewsState
            .submitFullReview
        }
        onClose={
          reviewsState
            .closeWriteReview
        }
      />
    </div>
  );
};

export default AdvocateProfile;