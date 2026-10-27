import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
const motion = Motion;
void motion;
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { apiRequest } from "@shared/services/apiClient";
import { getAuthToken } from "@/utils/auth";
import CallPhoneButton from "../components/CallPhoneButton";

/* =========================================================================
   ADVOCATE MESSAGES / CONNECTED CLIENTS

   REAL BACKEND CONTRACT
   -------------------------------------------------------------------------
   GET /api/advocate/case-connections

   Returns ONLY CONNECTED cases assigned to the authenticated advocate.

   Current backend README does NOT document:
   - send message
   - list messages
   - mark message as read
   - typing / real-time chat

   Therefore this page does not invent fake messaging endpoints.
============================================================================ */

/* =========================================================================
   HELPERS
============================================================================ */

const cleanText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getConnectionId = (connection) =>
  connection?.connectionId ||
  connection?.id ||
  connection?._id ||
  null;

const getClient = (connection) =>
  connection?.user ||
  connection?.client ||
  null;

const getClientName = (connection) => {
  const client = getClient(connection);

  return (
    cleanText(client?.fullName) ||
    cleanText(client?.name) ||
    "Client"
  );
};

const getInitials = (name) => {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "CL";

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getAttachments = (connection) =>
  Array.isArray(connection?.attachments)
    ? connection.attachments
    : [];

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getAttachmentName = (attachment, index) =>
  cleanText(
    attachment?.fileName ||
    attachment?.filename ||
    attachment?.originalName ||
    attachment?.name,
  ) || `Attachment ${index + 1}`;

/* =========================================================================
   SKELETON
============================================================================ */

const AdvocateMessagesSkeleton = () => (
  <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
    <div className="w-full animate-pulse space-y-5 sm:space-y-6">
      <div className="rounded-[26px] border border-slate-200/70 bg-white p-6">
        <div className="h-6 w-40 rounded-lg bg-slate-200" />
        <div className="mt-4 h-8 w-72 max-w-full rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-[420px] max-w-full rounded-lg bg-slate-100" />

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-[20px] bg-slate-100"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="xl:col-span-4">
          <div className="rounded-[26px] border border-slate-200 bg-white p-4">
            <div className="h-11 rounded-xl bg-slate-100" />

            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="min-h-[540px] rounded-[26px] border border-slate-200 bg-white p-6">
            <div className="h-12 w-12 rounded-2xl bg-slate-100" />
            <div className="mt-5 h-6 w-48 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-72 rounded-lg bg-slate-100" />

            <div className="mt-8 h-32 rounded-2xl bg-slate-100" />
            <div className="mt-4 h-44 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  </main>
);

/* =========================================================================
   CLIENT AVATAR
============================================================================ */

const ClientAvatar = ({ connection, size = "md" }) => {
  const client = getClient(connection);
  const name = getClientName(connection);

  const photo =
    client?.profilePhotoUrl ||
    client?.profileImage ||
    client?.avatar ||
    "";

  const sizeClass =
    size === "lg"
      ? "h-14 w-14 text-sm"
      : "h-11 w-11 text-xs";

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-2xl object-cover ring-1 ring-slate-200`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 font-extrabold text-amber-700`}
    >
      {getInitials(name)}
    </div>
  );
};

/* =========================================================================
   MAIN
============================================================================ */

export default function AdvocateMessages() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  /* =========================================================================
     FETCH REAL ADVOCATE CONNECTIONS
  ========================================================================== */

  const fetchConnections = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await apiRequest(
          "/advocate/case-connections",
          {
            method: "GET",
            token: getAuthToken(),
          },
        );

        const list =
          response?.connections ??
          response?.data?.connections ??
          response?.data ??
          [];

        const normalized = Array.isArray(list)
          ? list
          : [];

        setConnections(normalized);

        setSelectedId((previous) => {
          if (
            previous &&
            normalized.some(
              (entry) =>
                String(getConnectionId(entry)) ===
                String(previous),
            )
          ) {
            return previous;
          }

          return normalized.length
            ? getConnectionId(normalized[0])
            : null;
        });
      } catch (requestError) {
        if (requestError?.status === 401) {
          navigate("/login", {
            replace: true,
            state: {
              from: "/advocate/messages",
            },
          });

          return;
        }

        if (requestError?.status === 403) {
          setError(
            "This communication workspace is available only to Advocate accounts.",
          );

          return;
        }

        setError(
          requestError?.message ||
          "Unable to load your connected client cases.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  /* =========================================================================
     FILTER
  ========================================================================== */

  const filteredConnections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return connections;
    }

    return connections.filter((connection) => {
      const client = getClient(connection);

      const haystack = [
        getClientName(connection),
        client?.email,
        client?.phone,
        client?.city,
        client?.state,
        connection?.note,
        connection?.description,
        connection?.requestId,
        connection?.connectionId,
      ]
        .map(cleanText)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [connections, search]);

  const selectedConnection = useMemo(
    () =>
      connections.find(
        (entry) =>
          String(getConnectionId(entry)) ===
          String(selectedId),
      ) || null,
    [connections, selectedId],
  );

  /* =========================================================================
     STATS
  ========================================================================== */

  const stats = useMemo(() => {
    const attachments = connections.reduce(
      (total, connection) =>
        total + getAttachments(connection).length,
      0,
    );

    const latestTimestamp = connections.reduce(
      (latest, connection) => {
        const timestamp = new Date(
          connection?.connectedAt || 0,
        ).getTime();

        if (!Number.isFinite(timestamp)) {
          return latest;
        }

        return Math.max(latest, timestamp);
      },
      0,
    );

    return {
      connections: connections.length,
      attachments,
      latest: latestTimestamp
        ? formatDate(latestTimestamp)
        : "—",
    };
  }, [connections]);

  /* =========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return <AdvocateMessagesSkeleton />;
  }

  /* =========================================================================
     PAGE
  ========================================================================== */

  return (
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
      <div className="w-full space-y-5 sm:space-y-6">
        {/* ===============================================================
            HEADER
        =============================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-full w-80 bg-gradient-to-l from-amber-50/80 to-transparent" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-700">
                <MessageSquare size={13} />
                Client Communication
              </div>

              <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[29px]">
                Advocate Messages
              </h1>

              <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                Review clients officially connected to you and access
                their case information and contact details.
              </p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={13} />
                  Connected cases only
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() =>
                fetchConnections({
                  silent: true,
                })
              }
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* =============================================================
              STATS
          ============================================================= */}

          <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-[20px] border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <UserRound size={17} />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Connected Clients
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-950">
                {stats.connections}
              </p>
            </div>

            <div className="rounded-[20px] border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Paperclip size={17} />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Case Attachments
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-950">
                {stats.attachments}
              </p>
            </div>

            <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <Clock3 size={17} />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Latest Connection
              </p>

              <p className="mt-1 text-base font-extrabold text-slate-950">
                {stats.latest}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ===============================================================
            ERROR
        =============================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-800">
                Unable to load client connections
              </p>

              <p className="mt-0.5 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchConnections()}
              className="shrink-0 text-xs font-extrabold text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===============================================================
    WORKSPACE
================================================================ */}

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
          {/* =============================================================
      CONNECTED CLIENTS LIST
  ============================================================= */}

          <section className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] xl:col-span-4">
            <div className="shrink-0 border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-extrabold tracking-tight text-slate-950">
                    Connected Clients
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredConnections.length} available
                  </p>
                </div>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  CONNECTED
                </span>
              </div>

              <div className="relative mt-4">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search client or case..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
              </div>
            </div>

            {/* ===========================================================
        SCROLLABLE LIST
    =========================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredConnections.length ? (
                filteredConnections.map((connection, index) => {
                  const id = getConnectionId(connection);

                  const selected =
                    String(id) === String(selectedId);

                  const client = getClient(connection);

                  return (
                    <button
                      key={id || index}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className={`group mb-1 flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all last:mb-0 ${selected
                          ? "border-amber-200 bg-amber-50/70 shadow-sm"
                          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <ClientAvatar connection={connection} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {getClientName(connection)}
                          </p>

                          {selected && (
                            <CheckCircle2
                              size={15}
                              className="shrink-0 text-amber-600"
                            />
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs font-medium text-slate-500">
                          {cleanText(connection?.note) ||
                            "Connected legal case"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-slate-400">
                          {(client?.city || client?.state) && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={10} />

                              {[client?.city, client?.state]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}

                          {connection?.connectedAt && (
                            <>
                              <span>•</span>

                              <span>
                                {formatDate(connection.connectedAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full min-h-[430px] flex-col items-center justify-center px-5 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <MessageSquare size={21} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-slate-950">
                    {search
                      ? "No matching client"
                      : "No connected clients yet"}
                  </h3>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                    {search
                      ? "Try another name, location or case keyword."
                      : "When an admin approves and connects a client request, it will appear here."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =============================================================
      CONNECTION DETAILS
  ============================================================= */}

          <section className="h-full min-h-[620px] rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] xl:col-span-8">
            {selectedConnection ? (
              <ConnectionDetails
                connection={selectedConnection}
              />
            ) : (
              <div className="flex h-full min-h-[620px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                  <BriefcaseBusiness size={24} />
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-slate-950">
                  Select a connected client
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Select a client from the left to review their
                  connected case and communication information.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   CONNECTION DETAILS
============================================================================ */

function ConnectionDetails({ connection }) {
  const client = getClient(connection);
  const clientName = getClientName(connection);
  const attachments = getAttachments(connection);

  const email = cleanText(client?.email);
  const phone = cleanText(client?.phone);

  return (
    <div className="p-5 sm:p-6 lg:p-7">
      {/* ===============================================================
          CLIENT HEADER
      =============================================================== */}

      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <ClientAvatar
            connection={connection}
            size="lg"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-950">
                {getClientName(connection)}
              </h2>

              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                CONNECTED
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {(client?.city || client?.state) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />

                  {[client?.city, client?.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}

              {connection?.connectedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} />

                  Connected{" "}
                  {formatDateTime(
                    connection.connectedAt,
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Standardized Client Contact Controls matching Dashboard and My Bookings */}

        <div className="flex flex-wrap items-center gap-3">
          {phone && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 shadow-2xs">
              <CallPhoneButton
                phone={phone}
                clientName={clientName}
                size="md"
              />
              <a
                href={`tel:${phone}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Call ${clientName} at ${phone}`}
                title={`Call ${phone}`}
                className="font-mono text-xs sm:text-sm font-bold text-slate-800 hover:text-amber-600 hover:underline transition-colors"
              >
                {phone}
              </a>
            </div>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Email ${clientName} at ${email}`}
              title={`Email ${email}`}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            >
              <Mail size={15} className="shrink-0 text-amber-600" />
              <span className="truncate max-w-[220px]">{email}</span>
            </a>
          )}
        </div>
      </div>

      {/* ===============================================================
          CASE NOTE
      =============================================================== */}

      <section className="mt-6 rounded-[22px] border border-amber-100 bg-amber-50/50 p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness
            size={17}
            className="text-amber-600"
          />

          <h3 className="text-sm font-extrabold text-slate-950">
            Client Note
          </h3>
        </div>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {cleanText(connection?.note) ||
            "No short case note was provided."}
        </p>
      </section>

      {/* ===============================================================
          DESCRIPTION
      =============================================================== */}

      <section className="mt-4 rounded-[22px] border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <FileText
            size={17}
            className="text-slate-500"
          />

          <h3 className="text-sm font-extrabold text-slate-950">
            Case Description
          </h3>
        </div>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {cleanText(connection?.description) ||
            "No detailed case description was provided."}
        </p>
      </section>

      {/* ===============================================================
          ATTACHMENTS
      =============================================================== */}

      <section className="mt-4 rounded-[22px] border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Paperclip
              size={17}
              className="text-slate-500"
            />

            <h3 className="text-sm font-extrabold text-slate-950">
              Case Attachments
            </h3>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
            {attachments.length}
          </span>
        </div>

        {attachments.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {attachments.map(
              (attachment, index) => (
                <div
                  key={
                    attachment?.id ||
                    attachment?._id ||
                    index
                  }
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700">
                      {getAttachmentName(
                        attachment,
                        index,
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Secure case attachment
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-5 text-center">
            <p className="text-xs font-medium text-slate-500">
              No attachments were submitted with this case.
            </p>
          </div>
        )}
      </section>

      {/* ===============================================================
          CURRENT BACKEND CAPABILITY
      =============================================================== */}

      <section className="mt-5 flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 p-4">
        <MessageSquare
          size={18}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <h3 className="text-xs font-extrabold text-blue-900">
            Secure messaging
          </h3>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            This client is officially connected to your account.
            Direct in-app chat will appear here once the backend
            message-thread APIs are available. You can currently use
            the verified phone and email details above.
          </p>
        </div>
      </section>
    </div>
  );
}