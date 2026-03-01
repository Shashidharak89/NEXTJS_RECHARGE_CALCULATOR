"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaHistory,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaExclamationTriangle,
  FaCheck,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaSyncAlt,
  FaArrowRight,
  FaChevronDown,
  FaBolt,
} from "react-icons/fa";
import axios from "axios";
import "./styles/History.css";

const PAGE_SIZE = 10;

const ACTION_CONFIG = {
  CREATE: { label: "Created",        icon: <FaPlus />,    className: "history-badge-create" },
  UPDATE: { label: "Updated",        icon: <FaEdit />,    className: "history-badge-update" },
  RTD:    { label: "Recharge Today", icon: <FaBolt />,    className: "history-badge-rtd"    },
  DELETE: { label: "Deleted",        icon: <FaTrashAlt />,className: "history-badge-delete" },
};

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
  const day  = date.toLocaleDateString(undefined,  { day: "2-digit", month: "short", year: "numeric" });
  return `${time}, ${day}`;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return `${diff}s ago`;
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function History() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // URL-persisted state (namespaced with "h" to avoid clash with RechargeList)
  const urlSearch = searchParams.get("hq")   || "";
  const urlAction = searchParams.get("hact") || "ALL";
  const urlPage   = Math.max(1, parseInt(searchParams.get("hpage") || "1", 10));

  // Local UI state
  const [inputQuery,      setInputQuery]      = useState(urlSearch);
  const [records,         setRecords]         = useState([]);
  const [total,           setTotal]           = useState(0);
  const [loadedPage,      setLoadedPage]      = useState(urlPage);
  const [initialLoading,  setInitialLoading]  = useState(true);
  const [loadingMore,     setLoadingMore]     = useState(false);
  const [refreshing,      setRefreshing]      = useState(false);
  const [expandedIds,     setExpandedIds]     = useState(new Set());
  const [token,           setToken]           = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification,    setNotification]    = useState({ show: false, type: "", message: "" });

  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3500);
  }, []);

  // ─── URL helpers ─────────────────────────────────────────────────────────
  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === "" || v === "ALL") params.delete(k);
      else params.set(k, String(v));
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // ─── Token ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  // ─── Fetch ───────────────────────────────────────────────────────────────
  const doFetch = useCallback(async (mode, overrides = {}) => {
    if (!token) return;

    const search = overrides.search !== undefined ? overrides.search : urlSearch;
    const action = overrides.action !== undefined ? overrides.action : urlAction;
    const curLoadedPage = overrides.loadedPage !== undefined ? overrides.loadedPage : loadedPage;

    let page  = 1;
    let limit = PAGE_SIZE;

    if (mode === "init") {
      // Restore all previously-loaded pages in one request
      page  = 1;
      limit = urlPage * PAGE_SIZE;
      setInitialLoading(true);
    } else if (mode === "viewmore") {
      page  = curLoadedPage + 1;
      limit = PAGE_SIZE;
      setLoadingMore(true);
    } else if (mode === "refresh") {
      page  = 1;
      limit = Math.max(curLoadedPage * PAGE_SIZE, PAGE_SIZE);
      setRefreshing(true);
    } else {
      // "search" / action-change / clear
      page  = 1;
      limit = PAGE_SIZE;
      setInitialLoading(true);
    }

    try {
      const qs = new URLSearchParams({ page, limit });
      if (search.trim()) qs.set("search", search.trim());
      if (action && action !== "ALL") qs.set("action", action);

      const res = await axios.get(`/api/history?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const incoming = res.data.history || [];
      const newTotal = res.data.total   || 0;

      setTotal(newTotal);

      if (mode === "viewmore") {
        setRecords((prev) => [...prev, ...incoming]);
        const nextPage = curLoadedPage + 1;
        setLoadedPage(nextPage);
        updateParams({ hpage: nextPage });
      } else {
        setRecords(incoming);
        const pagesLoaded = mode === "init" ? urlPage : 1;
        setLoadedPage(pagesLoaded);
        if (mode !== "init") updateParams({ hpage: 1 });
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      showNotification("error", "Failed to load history");
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [token, urlSearch, urlAction, urlPage, loadedPage, updateParams, showNotification]);

  // Initial load
  const didInit = useRef(false);
  useEffect(() => {
    if (token && !didInit.current) {
      didInit.current = true;
      doFetch("init");
    }
  }, [token, doFetch]);

  // ─── Search ──────────────────────────────────────────────────────────────
  const submitSearch = useCallback(() => {
    updateParams({ hq: inputQuery.trim() || null, hpage: 1, hact: urlAction !== "ALL" ? urlAction : null });
    doFetch("search", { search: inputQuery.trim(), action: urlAction, loadedPage: 0 });
  }, [inputQuery, urlAction, updateParams, doFetch]);

  const clearSearch = useCallback(() => {
    setInputQuery("");
    updateParams({ hq: null, hpage: 1 });
    doFetch("search", { search: "", action: urlAction, loadedPage: 0 });
  }, [urlAction, updateParams, doFetch]);

  // ─── Action filter ───────────────────────────────────────────────────────
  const setAction = useCallback((action) => {
    updateParams({ hact: action !== "ALL" ? action : null, hpage: 1 });
    doFetch("search", { search: urlSearch, action, loadedPage: 0 });
  }, [urlSearch, updateParams, doFetch]);

  // ─── View More ───────────────────────────────────────────────────────────
  const viewMore = () => doFetch("viewmore");

  // ─── Refresh ─────────────────────────────────────────────────────────────
  const refresh = () => doFetch("refresh");

  // ─── Expand / Collapse ───────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ─── Delete flow ─────────────────────────────────────────────────────────
  const openDeleteConfirm  = (id, e) => { if (e) e.stopPropagation(); setPendingDeleteId(id); setShowDeleteConfirm(true); };
  const cancelDelete       = ()      => { setPendingDeleteId(null); setShowDeleteConfirm(false); };

  const confirmDelete = async () => {
    const id = pendingDeleteId;
    if (!id) return;
    try {
      await axios.delete("/api/history", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });
      setRecords((prev) => prev.filter((h) => h._id !== id));
      setTotal((prev) => prev - 1);
      setExpandedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      showNotification("success", "History log deleted");
    } catch (err) {
      console.error("Failed to delete history:", err);
      showNotification("error", "Failed to delete history entry");
    } finally {
      setPendingDeleteId(null);
      setShowDeleteConfirm(false);
    }
  };

  const hasMore = records.length < total;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="history-container">

      {/* Toast */}
      {notification.show && (
        <div className={`history-notification-popup ${notification.type}`}>
          <div className="history-notification-content">
            <div className="history-notification-icon">
              {notification.type === "success" ? <FaCheck /> : <FaExclamationTriangle />}
            </div>
            <div className="history-notification-message">{notification.message}</div>
            <button className="history-notification-close"
              onClick={() => setNotification({ show: false, type: "", message: "" })}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="history-header">
        <div className="history-header-content">
          <h1 className="history-title">
            <FaHistory className="history-title-icon" />
            Activity History
          </h1>
          <p className="history-subtitle">
            All create, update and delete actions across your recharge records
          </p>
        </div>
        <button
          className={`history-refresh-button ${refreshing ? "spinning" : ""}`}
          onClick={refresh}
          disabled={refreshing}
          title="Refresh"
        >
          <FaSyncAlt />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="history-controls">
        <div className="history-search-container">
          <div className={`history-search-input-wrapper${inputQuery ? " history-search-input-wrapper--typing" : ""}`}>
            <FaSearch className="history-search-icon-left" />
            <input
              type="text"
              className="history-search-input"
              placeholder="Search and hit Enter or → icon"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            />
            {urlSearch && (
              <button className="history-search-clear" onClick={clearSearch} title="Clear">
                <FaTimes />
              </button>
            )}
            <button
              className="history-search-icon-btn"
              onClick={submitSearch}
              title="Click to search"
              aria-label="Submit search"
            >
              <FaSearch />
              <span className="history-search-btn-label">Search</span>
            </button>
          </div>
          <FaFilter className="history-filter-icon" />
        </div>

        {urlSearch && (
          <div className="history-active-search-badge">
            Searching: <em>&quot;{urlSearch}&quot;</em>
            <button onClick={clearSearch}><FaTimes /></button>
          </div>
        )}

        <div className="history-filter-pills">
          {["ALL", "CREATE", "UPDATE", "DELETE"].map((action) => (
            <button
              key={action}
              className={`history-pill ${urlAction === action ? "history-pill-active" : ""} ${action !== "ALL" ? `history-pill-${action.toLowerCase()}` : ""}`}
              onClick={() => setAction(action)}
            >
              {action === "ALL"
                ? "All Actions"
                : <>{ACTION_CONFIG[action].icon} {ACTION_CONFIG[action].label}</>}
            </button>
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="enhanced-form-overlay">
          <div className="enhanced-delete-modal">
            <div className="enhanced-delete-header">
              <h2 className="enhanced-delete-title">
                <FaTrashAlt className="enhanced-delete-icon" />
                Confirm Delete
              </h2>
              <button className="enhanced-close-button" onClick={cancelDelete}><FaTimes /></button>
            </div>
            <div className="enhanced-delete-content">
              <div className="enhanced-delete-warning">
                <FaExclamationTriangle className="enhanced-warning-icon" />
                <p>Are you sure you want to delete this history log?</p>
                <p className="enhanced-delete-subtext">This action cannot be undone.</p>
              </div>
              <div className="enhanced-delete-actions">
                <button type="button" onClick={cancelDelete} className="enhanced-cancel-button">
                  <FaTimes /> Cancel
                </button>
                <button type="button" onClick={confirmDelete} className="enhanced-delete-confirm-button">
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records */}
      <div className="history-records-section">
        <div className="history-records-header">
          <h2 className="history-section-title">
            {urlAction === "ALL"
              ? "All Activity"
              : `${ACTION_CONFIG[urlAction]?.label ?? urlAction} Events`}{" "}
            ({total})
          </h2>
          <div className="history-records-info">Showing {records.length} of {total}</div>
        </div>

        {initialLoading ? (
          <div className="history-loading">
            <div className="history-spinner" />
            <p>Loading history…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="history-empty-state">
            <FaHistory className="history-empty-icon" />
            <h3>No History Found</h3>
            <p>{urlSearch || urlAction !== "ALL"
              ? "No records match your filters"
              : "Actions you perform will appear here"}</p>
            {(urlSearch || urlAction !== "ALL") && (
              <button className="history-clear-filters-button"
                onClick={() => { clearSearch(); setAction("ALL"); }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="history-timeline">
            {records.map((entry) => {
              const isRTD         = entry.action === "UPDATE" && entry.logMessage?.includes(" has done ");
              const displayAction = isRTD ? "RTD" : entry.action;
              const cfg           = ACTION_CONFIG[displayAction] || ACTION_CONFIG.UPDATE;
              const hasChanges    = entry.changedFields?.length > 0;
              const isExpanded    = expandedIds.has(entry._id);

              return (
                <div key={entry._id}
                  className={`history-card history-card-${isRTD ? "rtd" : entry.action?.toLowerCase()}`}>

                  {/* Summary row */}
                  <div
                    className="history-card-summary"
                    onClick={() => toggleExpand(entry._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleExpand(entry._id)}
                  >
                    <div className="history-card-summary-left">
                      <span className={`history-action-badge ${cfg.className}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <p className={`history-summary-log${isExpanded ? " history-summary-log--expanded" : ""}`}>
                        {entry.logMessage}
                      </p>
                    </div>
                    <div className="history-card-summary-right">
                      <span className="history-time-ago" title={formatDateTime(entry.createdAt)}>
                        <FaClock className="history-time-icon" />
                        {timeAgo(entry.createdAt)}
                      </span>
                      <FaChevronDown className={`history-chevron ${isExpanded ? "history-chevron-open" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="history-card-detail">
                      <div className="history-detail-row">
                        <span className="history-record-type">{entry.recordType}</span>
                      </div>

                      {entry.action === "UPDATE" && hasChanges && (
                        <div className="history-changes-section">
                          <div className="history-changes-title">Changes:</div>
                          <div className="history-changes-grid">
                            {entry.changedFields.map((field) => {
                              const oldVal = entry.oldValues?.[field];
                              const newVal = entry.newValues?.[field];
                              const fmt = (v) => {
                                if (v == null) return "—";
                                const d = new Date(v);
                                if (typeof v === "string" && v.includes("T") && !isNaN(d.getTime())) {
                                  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                                }
                                return String(v);
                              };
                              return (
                                <div key={field} className="history-change-item">
                                  <span className="history-change-field">{field}</span>
                                  <span className="history-change-old">{fmt(oldVal)}</span>
                                  <FaArrowRight className="history-change-arrow" />
                                  <span className="history-change-new">{fmt(newVal)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="history-card-footer">
                        <div className="history-footer-left">
                          <div className="history-card-user">
                            <FaUser className="history-user-icon" />
                            <span>{entry.userName || "Unknown User"}</span>
                          </div>
                          <div className="history-card-date">
                            <FaCalendarAlt className="history-date-icon" />
                            <span>{formatDateTime(entry.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          className="history-delete-entry-btn"
                          onClick={(e) => openDeleteConfirm(entry._id, e)}
                          title="Delete log"
                        >
                          <FaTrashAlt /> Delete Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* View More */}
        {!initialLoading && hasMore && (
          <div className="history-view-more-section">
            <button className="history-view-more-button" onClick={viewMore} disabled={loadingMore}>
              {loadingMore ? (
                <><div className="history-btn-spinner" /> Loading…</>
              ) : (
                <>View More <span className="history-view-more-count">({total - records.length} remaining)</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
