import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { getProfileChangeRequests } from "../../../services/platform/adminAdvocatesApi";
import { ADMIN_PATHS, formatDateTime } from "../../../utils/adminUtils";

const FIELD_LABELS = {
  experienceYears: "Experience",
  about: "Bio / About",
  voiceCallPricePer15Min: "Voice Call Price (15 min)",
  videoCallPricePer15Min: "Video Call Price (15 min)",
  officeVisitDurationMinutes: "Office Visit Duration",
  offlineVisitingFee: "Office Visit Fee",
  profilePhoto: "Profile Photo",
  officeAddress: "Office Address",
  pincode: "Pincode",
  city: "City",
  state: "State",
  officeLatitude: "Office GPS Pin",
  officeLongitude: "Office GPS Pin",
  officePhoto: "Office Photo",
};

function formatFieldName(key) {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "SUBMITTED" || s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20">
        <Icon name="schedule" className="text-[13px]" />
        Pending Review
      </span>
    );
  }
  if (s === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <Icon name="check_circle" className="text-[13px]" />
        Approved
      </span>
    );
  }
  if (s === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
        <Icon name="cancel" className="text-[13px]" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
      {status || "—"}
    </span>
  );
}

export default function ProfileChangeRequestsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "SUBMITTED";
  const currentPage = Math.max(1, Number(searchParams.get("page") || 1));
  const searchTerm = searchParams.get("search") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], counts: {}, pagination: {} });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [searchInput, setSearchInput] = useState(searchTerm);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfileChangeRequests({
        status: currentTab,
        page: currentPage,
        limit: 20,
        search: searchTerm,
      });
      setData(result);
    } catch (err) {
      console.error("Failed to load profile change requests:", err);
      setError(err?.message || "Failed to load profile change requests.");
    } finally {
      setLoading(false);
    }
  }, [currentTab, currentPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleTabChange = (status) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", status);
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleSearchChange = (event) => {
    const val = event.target.value;
    setSearchInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (val.trim()) {
        next.set("search", val.trim());
      } else {
        next.delete("search");
      }
      next.set("page", "1");
      setSearchParams(next);
    }, 350);
  };

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

function getRowAdvocateInfo(row) {
  const advocate = row?.advocate || {};
  const advocateId = row?.advocateId || advocate.id || row?.id;
  const fullName = advocate.fullName || row?.fullName || advocate.name || row?.name || "Advocate";
  const email = advocate.email || row?.email || "";
  const phone = advocate.phone || row?.phone || "";
  const barCouncilId = advocate.barCouncilId || advocate.barId || row?.barCouncilId || row?.barId || "";
  const profileImage = advocate.profileImage || advocate.profilePhotoUrl || row?.profilePhotoUrl || "";
  const changedFields =
    (Array.isArray(row?.changedFields) && row.changedFields) ||
    (Array.isArray(row?.requestedFields) && row.requestedFields) ||
    (typeof row?.requestedFields === "object" && row?.requestedFields !== null && Object.keys(row.requestedFields)) ||
    (Array.isArray(row?.fields) && row.fields) ||
    [];
  const status = row?.profileChangeStatus || row?.status || "SUBMITTED";
  const submittedAt =
    row?.profileChangeSubmittedAt ||
    row?.submittedAt ||
    row?.profileChangeUpdatedAt ||
    row?.updatedAt ||
    null;

  return {
    advocateId,
    fullName,
    email,
    phone,
    barCouncilId,
    profileImage,
    changedFields,
    status,
    submittedAt,
  };
}

  const counts = data.counts || {};
  const pendingCount = counts.submitted ?? counts.SUBMITTED ?? counts.pending ?? counts.PENDING ?? 0;
  const approvedCount = counts.approved ?? counts.APPROVED ?? 0;
  const rejectedCount = counts.rejected ?? counts.REJECTED ?? 0;
  const totalCount =
    counts.all ?? counts.ALL ?? counts.total ?? counts.TOTAL ??
    (Number(pendingCount) + Number(approvedCount) + Number(rejectedCount));

  const tabs = [
    { key: "SUBMITTED", label: "Pending Review", count: pendingCount },
    { key: "APPROVED", label: "Approved", count: approvedCount },
    { key: "REJECTED", label: "Rejected", count: rejectedCount },
    { key: "ALL", label: "All Requests", count: totalCount },
  ];

  const columns = useMemo(
    () => [
      {
        key: "advocate",
        header: "Advocate",
        primary: true,
        render: (row) => {
          const { advocateId, fullName, email, profileImage } = getRowAdvocateInfo(row);
          return (
            <div className="flex items-center gap-3 min-w-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-2xs">
                  {fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <Link
                  to={ADMIN_PATHS.profileChanges.detail(advocateId)}
                  className="font-bold text-slate-900 hover:text-amber-600 truncate transition"
                >
                  {fullName}
                </Link>
                <span className="text-xs text-slate-500 truncate">
                  {email || "—"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "phone",
        header: "Phone",
        className: "whitespace-nowrap",
        render: (row) => {
          const { phone } = getRowAdvocateInfo(row);
          return (
            <span className="text-xs text-slate-700 whitespace-nowrap">
              {phone || "—"}
            </span>
          );
        },
      },
      {
        key: "barCouncilId",
        header: "Bar Council ID",
        className: "whitespace-nowrap",
        render: (row) => {
          const { barCouncilId } = getRowAdvocateInfo(row);
          return (
            <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
              {barCouncilId || "—"}
            </span>
          );
        },
      },
      {
        key: "requestedFields",
        header: "Changed Fields",
        render: (row) => {
          const { changedFields } = getRowAdvocateInfo(row);

          // Deduplicate officeLatitude and officeLongitude into a single "Office GPS Pin"
          const displayFields = [];
          let hasGps = false;
          changedFields.forEach((f) => {
            if (f === "officeLatitude" || f === "officeLongitude") {
              if (!hasGps) {
                displayFields.push("Office GPS Pin");
                hasGps = true;
              }
            } else {
              displayFields.push(formatFieldName(f));
            }
          });

          if (displayFields.length === 0) {
            return <span className="text-xs text-slate-400">None specified</span>;
          }

          return (
            <div className="flex flex-wrap gap-1.5 max-w-sm">
              {displayFields.slice(0, 4).map((f, idx) => (
                <span
                  key={`${f}-${idx}`}
                  className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/20"
                >
                  {f}
                </span>
              ))}
              {displayFields.length > 4 && (
                <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  +{displayFields.length - 4} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        className: "whitespace-nowrap",
        render: (row) => {
          const { status } = getRowAdvocateInfo(row);
          return <StatusBadge status={status} />;
        },
      },
      {
        key: "submittedAt",
        header: "Submitted At",
        className: "whitespace-nowrap",
        render: (row) => {
          const { submittedAt } = getRowAdvocateInfo(row);
          return (
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {submittedAt ? formatDateTime(submittedAt) : "—"}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "",
        className: "text-right whitespace-nowrap",
        render: (row) => {
          const { advocateId } = getRowAdvocateInfo(row);
          return (
            <Link
              to={ADMIN_PATHS.profileChanges.detail(advocateId)}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
            >
              <span>Review</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Change Requests"
        description="Review and approve sensitive advocate profile updates (experience, bio, consultation fees, and office chamber location)."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReloadTrigger((k) => k + 1)}
            disabled={loading}
          >
            <Icon
              name="refresh"
              className={`text-[16px] mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {tabs.map((tab) => {
          const active = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition whitespace-nowrap ${
                active
                  ? "border-amber-500 text-slate-950"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  active
                    ? "bg-amber-100 text-amber-900"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by advocate name, phone, or Bar Council ID..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : error ? (
        <ErrorState
          title="Could not load profile change requests"
          message={error}
          actionLabel="Try again"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="assignment_turned_in"
          title={
            currentTab === "SUBMITTED"
              ? "No pending profile changes"
              : "No requests found"
          }
          message={
            searchTerm
              ? "No profile change requests matched your search criteria."
              : currentTab === "SUBMITTED"
                ? "The profile change review queue is completely clear! All submissions have been processed."
                : `There are currently no profile changes in the "${currentTab}" status.`
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <ResourceTable
              data={data.items}
              keyField="advocateId"
              getKey={(row) => row.advocateId || row.advocate?.id || row.id || row.barCouncilId || row.advocate?.barCouncilId}
              columns={columns}
            />
          </div>

          <Pagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
