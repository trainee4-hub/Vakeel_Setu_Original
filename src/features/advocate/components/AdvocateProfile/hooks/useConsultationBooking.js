import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAuthToken } from "@/utils/auth";
import {
  API_BASE_URL,
  TIME_SLOTS,
  formatIndianDate,
  groupSlotsByPeriod,
  isSlotPastForDate,
} from "../utils/advocateProfileUtils";

/**
 * Owns consultation type + the whole booking form.
 *
 * POST /api/consultation is preserved byte-for-byte, including:
 *   - office requires both a date and a time slot
 *   - subject required; "Other" additionally requires notes
 *   - non-office appends "Preferred time: <date> at <slot>" to the description
 *   - description sent as undefined when empty
 *   - scheduledDate / scheduledTimeSlot sent ONLY for office
 *   - Bearer token, and NO credentials: "include" (matching the original)
 */
export default function useConsultationBooking({
  advocateId,
  advocate,
  isLoggedIn,
  navigate,
  location,
  onConsultationBooked,
}) {
  const [consultType, setConsultType] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [booking, setBooking] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* Captured ONCE, synchronously, on the very first render. Reading
     location.state?.openBookingModal fresh inside an effect would let that
     effect fire and clear the state before `advocate` had loaded; if anything
     then re-rendered or remounted this component, the "open the modal" intent
     would already be gone. A ref captured on mount survives regardless of when
     location.state is cleared. */
  const openBookingModalRef = useRef(
    Boolean(location.state?.openBookingModal),
  );

  /* Opens the booking modal automatically after a login redirect. Gated on
     `advocate` being loaded so it can never fire before the page — and the
     modal's own trigger — actually exist. The ref is consumed (set to false)
     so a later refetch can't reopen the modal. */
  useEffect(() => {
    if (!advocate) return;

    if (openBookingModalRef.current) {
      openBookingModalRef.current = false;
      setIsBookingModalOpen(true);
      navigate(location.pathname);
    }
  }, [advocate, navigate, location.pathname]);

  /* Clear the previous advocate's booking form so profile A's data can never
     appear on profile B. */
  useEffect(() => {
    setIsBookingModalOpen(false);
    setBooking(false);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setBookingSubject("");
    setBookingDescription("");
  }, [advocateId]);

  /* Default consultation type, chosen from the services this advocate has
     actually configured. */
  useEffect(() => {
    if (!advocate) return;

    const voiceActive = advocate.eliteMembership?.voiceCall?.status === "active";
    const videoActive = advocate.eliteMembership?.videoCall?.status === "active";
    const officeActive =
      advocate.eliteMembership?.officeVisit?.status === "active";

    if (videoActive) {
      setConsultType("video");
    } else if (voiceActive) {
      setConsultType("voice");
    } else if (officeActive) {
      setConsultType("office");
    } else {
      setConsultType("");
    }
  }, [advocate]);

  /* ---------------------------------------------------------------------
     SLOTS
  --------------------------------------------------------------------- */

  const groupedSlots = useMemo(() => groupSlotsByPeriod(TIME_SLOTS), []);

  const isSlotPast = useCallback(
    (slot) => isSlotPastForDate(slot, selectedDate),
    [selectedDate],
  );

  const hasAvailableSlotToday = useMemo(() => {
    if (
      selectedDate &&
      new Date().toISOString().split("T")[0] === selectedDate
    ) {
      return TIME_SLOTS.some((slot) => !isSlotPastForDate(slot, selectedDate));
    }
    return true;
  }, [selectedDate]);

  /* ---------------------------------------------------------------------
     FORM HANDLERS
  --------------------------------------------------------------------- */

  const handleDateChange = useCallback((value) => {
    setSelectedDate(value);
    setSelectedTimeSlot("");
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setBookingDescription(value.slice(0, 500));
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  const handleBookingClick = useCallback(() => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: location.pathname,
          openBookingModal: true,
        },
      });

      return;
    }

    setIsBookingModalOpen(true);
  }, [isLoggedIn, navigate, location.pathname]);

  /* ---------------------------------------------------------------------
     SUBMIT — POST /consultation
  --------------------------------------------------------------------- */

  const submitBooking = useCallback(async () => {
    if (consultType === "office" && (!selectedDate || !selectedTimeSlot)) {
      return alert(
        "Please select both a date and a time slot for your office visit.",
      );
    }
    if (!bookingSubject) {
      return alert("Please select a subject.");
    }
    if (bookingSubject === "Other" && !bookingDescription.trim()) {
      return alert(
        "Notes for Lawyer are required when 'Other' is selected as the subject.",
      );
    }

    setBooking(true);

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/consultation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          advocateId: advocateId,
          type: consultType,
          subject: bookingSubject,
          description: (() => {
            const notes = bookingDescription.trim();
            if (consultType !== "office" && selectedDate && selectedTimeSlot) {
              const preferredNote = `Preferred time: ${formatIndianDate(
                selectedDate,
              )} at ${selectedTimeSlot}`;
              return notes ? `${notes}\n\n${preferredNote}` : preferredNote;
            }
            return notes || undefined;
          })(),
          scheduledDate: consultType === "office" ? selectedDate : undefined,
          scheduledTimeSlot:
            consultType === "office" ? selectedTimeSlot : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (isMountedRef.current) {
          setIsBookingModalOpen(false);
        }

        alert(
          consultType === "office"
            ? "Consultation booked successfully! You will be notified once the advocate confirms."
            : "Consultation request sent! You will be notified once the advocate accepts.",
        );

        if (onConsultationBooked) {
          onConsultationBooked(data.consultation._id, consultType);
        }
      } else {
        alert(data.message || data.error || "Failed to book consultation");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book consultation. Please try again.");
    } finally {
      if (isMountedRef.current) {
        setBooking(false);
      }
    }
  }, [
    consultType,
    selectedDate,
    selectedTimeSlot,
    bookingSubject,
    bookingDescription,
    advocateId,
    onConsultationBooked,
  ]);

  return {
    consultType,
    setConsultType,

    isBookingModalOpen,
    openBookingModal: handleBookingClick,
    closeBookingModal,
    booking,

    selectedDate,
    onDateChange: handleDateChange,
    selectedTimeSlot,
    setSelectedTimeSlot,

    bookingSubject,
    setBookingSubject,
    bookingDescription,
    onDescriptionChange: handleDescriptionChange,

    groupedSlots,
    isSlotPast,
    hasAvailableSlotToday,

    submitBooking,
  };
}