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
import useConsultationBooking from "./hooks/useConsultationBooking";
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

import BookingModal from "./modals/BookingModal";
import ReviewModal from "./modals/ReviewModal";

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

  const { isLoggedIn, user } = useAuth();

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
  } = useAdvocateProfile(advocateId);

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
  });

  /* =========================================================
     SIMILAR ADVOCATES
  ========================================================= */

  const similar = useSimilarAdvocates({
    advocateId,
    advocate,
  });

  /* =========================================================
     BOOKING
  ========================================================= */

  const bookingState = useConsultationBooking({
    advocateId,
    advocate,
    isLoggedIn,
    navigate,
    location,
    onConsultationBooked,
  });

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

     Only API isOnline controls presence.
  ========================================================= */

  const isOnline =
    advocate?.isOnline === true;

  /* =========================================================
     CONSULTATION SERVICES
  ========================================================= */

  const voiceCall =
    advocate?.eliteMembership?.voiceCall ||
    null;

  const videoCall =
    advocate?.eliteMembership?.videoCall ||
    null;

  const officeVisit =
    advocate?.eliteMembership?.officeVisit ||
    null;

  const isVoiceActive =
    voiceCall?.status === "active";

  const isVideoActive =
    videoCall?.status === "active";

  const isOfficeActive =
    officeVisit?.status === "active";

  const voiceFee =
    voiceCall?.fee ?? null;

  const videoFee =
    videoCall?.fee ?? null;

  const officeFee =
    officeVisit?.fee ?? null;

  const voiceDuration =
    voiceCall?.duration ?? null;

  const videoDuration =
    videoCall?.duration ?? null;

  const { consultType } =
    bookingState;

  const activeFee =
    consultType === "video"
      ? videoFee
      : consultType === "voice"
        ? voiceFee
        : consultType === "office"
          ? officeFee
          : null;

  const activeDuration =
    consultType === "video"
      ? videoDuration
      : consultType === "voice"
        ? voiceDuration
        : null;

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

  const canBook =
    isVideoActive ||
    isVoiceActive ||
    isOfficeActive;

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
              advocateName={
                advocateName
              }
              highlight={
                highlightBooking
              }
              consultType={
                consultType
              }
              onConsultTypeChange={
                bookingState.setConsultType
              }
              activeFee={
                activeFee
              }
              activeDuration={
                activeDuration
              }
              canBook={canBook}
              onBookingClick={
                bookingState
                  .openBookingModal
              }
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

      {/* ================= BOOKING MODAL ================= */}

      <BookingModal
        open={
          bookingState
            .isBookingModalOpen
        }
        mode="book"
        consultationId={null}
        advocateName={
          advocateName
        }
        advocatePhoto={
          profileImageUrl
        }
        advocateSpecialty={
          advocate?.bestPracticeArea ||
          practiceAreas?.[0] ||
          ""
        }
        consultType={
          bookingState.consultType
        }
        onConsultTypeChange={
          bookingState.setConsultType
        }
        activeFee={activeFee}
        videoFee={videoFee}
        voiceFee={voiceFee}
        officeFee={officeFee}
        gstRate={18}
        platformFee={25}
        selectedDate={
          bookingState.selectedDate
        }
        onDateChange={
          bookingState.onDateChange
        }
        selectedTimeSlot={
          bookingState.selectedTimeSlot
        }
        onSlotSelect={
          bookingState
            .setSelectedTimeSlot
        }
        groupedSlots={
          bookingState.groupedSlots
        }
        availabilityLoading={
          false
        }
        availabilityError=""
        isSlotPast={
          bookingState.isSlotPast
        }
        subjectOptions={
          SUBJECT_OPTIONS
        }
        bookingSubject={
          bookingState.bookingSubject
        }
        onSubjectChange={
          bookingState
            .setBookingSubject
        }
        bookingDescription={
          bookingState
            .bookingDescription
        }
        onDescriptionChange={
          bookingState
            .onDescriptionChange
        }
        booking={
          bookingState.booking
        }
        bookingError=""
        onClose={
          bookingState
            .closeBookingModal
        }
        onConfirm={
          bookingState.submitBooking
        }
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