import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../auth";
import Navbar from "@app/layouts/Navbar";
import { FindLawyer, AdvocateProfile } from "../../advocate";

import IpcWiki from "../components/LegalAssistant";
import UserProfile from "./UserProfile";
import Bookings from "./Bookings";
import MessageConsultations from "./MessageConsultations";
import ChatRoom from "./ChatRoom";

import { HomePage, DashboardStyles } from "../../marketing";
import { getDashboardActivePage } from "../utils/dashboardUtils";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
    updateProfile,
  } = useAuth();

  const activePage = getDashboardActivePage(
    location.pathname,
  );

  const [overlayPage, setOverlayPage] =
    useState(null);

  const [
    selectedAdvocateId,
    setSelectedAdvocateId,
  ] = useState(null);

  const [
    selectedConsultationId,
    setSelectedConsultationId,
  ] = useState(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleCloseOverlay =
    useCallback(() => {
      setOverlayPage(null);
    }, []);

  const handleOpenAdvocateProfile =
    useCallback((advocateId) => {
      if (!advocateId) return;

      setSelectedAdvocateId(
        advocateId,
      );

      setOverlayPage(
        "advocate-profile",
      );
    }, []);

  const handleOpenChat =
    useCallback((consultationId) => {
      if (!consultationId) return;

      setSelectedConsultationId(
        consultationId,
      );

      setOverlayPage("chatroom");
    }, []);

  const handleConsultationBooked =
    useCallback(
      (id, type) => {
        if (type === "message") {
          setSelectedConsultationId(
            id,
          );

          setOverlayPage(
            "chatroom",
          );

          return;
        }

        setOverlayPage(null);
        navigate("/bookings");
      },
      [navigate],
    );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [activePage]);

  useEffect(() => {
    setOverlayPage(null);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-600 antialiased selection:bg-amber-500/30">
      <DashboardStyles />

      <Navbar />

      <div className="pt-20">
        <div
          key={activePage}
          className="animate-enter"
        >
          {overlayPage ===
            "advocate-profile" &&
          selectedAdvocateId ? (
            <main className="min-h-screen pb-12 sm:pb-16 lg:pb-20">
              <AdvocateProfile
                advocateId={
                  selectedAdvocateId
                }
                onBack={
                  handleCloseOverlay
                }
                currentUser={user}
                onConsultationBooked={
                  handleConsultationBooked
                }
              />
            </main>
          ) : overlayPage ===
              "chatroom" &&
            selectedConsultationId ? (
            <main className="min-h-screen pb-12 sm:pb-16 lg:pb-20">
              <ChatRoom
                consultationId={
                  selectedConsultationId
                }
                user={user}
                onBack={
                  handleCloseOverlay
                }
              />
            </main>
          ) : (
            <Routes>
              <Route
                path="find-lawyer"
                element={
                  <main className="min-h-screen pb-12 sm:pb-16 lg:pb-20">
                    <FindLawyer
                      onViewAdvocate={(
                        id,
                      ) => {
                        navigate(
                          `/find-lawyer/${id}`,
                        );
                      }}
                    />
                  </main>
                }
              />

              <Route
                path="user-profile"
                element={
                  <main className="min-h-screen pb-12 sm:pb-16 lg:pb-20">
                    <UserProfile
                      user={user}
                      onLogout={
                        handleLogout
                      }
                      onEditProfile={
                        updateProfile
                      }
                      onViewAdvocate={
                        handleOpenAdvocateProfile
                      }
                      onViewChat={
                        handleOpenChat
                      }
                      onViewAllHistory={() =>
                        navigate(
                          "/bookings",
                        )
                      }
                    />
                  </main>
                }
              />

              <Route
                path="bookings"
                element={
                  <main className="min-h-screen pb-12 sm:pb-16 lg:pb-20">
                    <Bookings
                      user={user}
                      onBack={() =>
                        navigate("/")
                      }
                      onViewChat={
                        handleOpenChat
                      }
                      onFindLawyer={() =>
                        navigate(
                          "/find-lawyer",
                        )
                      }
                    />
                  </main>
                }
              />

              <Route
                path="messages"
                element={
                  <main className="min-h-screen pb-12 sm:pb-16 lg:pb-20">
                    <MessageConsultations
                      user={user}
                      onBack={() =>
                        navigate("/")
                      }
                      onViewChat={
                        handleOpenChat
                      }
                      onFindLawyer={() =>
                        navigate(
                          "/find-lawyer",
                        )
                      }
                    />
                  </main>
                }
              />

              <Route
                path="ipc-wiki"
                element={
                  <main className="min-h-[calc(100vh-5rem)]">
                    <IpcWiki
                      user={user}
                    />
                  </main>
                }
              />

              <Route
                path=""
                element={
                  <HomePage />
                }
              />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
