"use client";
import { useUser } from "context/UserContext";
import React, { useEffect, useState, useMemo } from "react";
import {
  FaHistory,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaInfoCircle,
  FaSyncAlt,
  FaArrowRight,
} from "react-icons/fa";
import axios from "axios";
import "./styles/History.css";

const ACTION_CONFIG = {
  CREATE: {
    label: "Created",
    icon: <FaPlus />,
    className: "history-badge-create",
  },
  UPDATE: {
    label: "Updated",
    icon: <FaEdit />,
    className: "history-badge-update",
  },
  DELETE: {
    label: "Deleted",
    icon: <FaTrashAlt />,
    className: "history-badge-delete",
  },
};

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterAction, setFilterAction] = useState("ALL");
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  const fetchHistory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/api/history?limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const filteredHistory = useMemo(() => {
    let result = history;

    if (filterAction !== "ALL") {
      result = result.filter((h) => h.action === filterAction);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.logMessage?.toLowerCase().includes(q) ||
          h.userName?.toLowerCase().includes(q) ||
          h.action?.toLowerCase().includes(q) ||
          h.changedFields?.some((f) => f.toLowerCase().includes(q))
      );
    }

    return result;
  }, [history, filterAction, searchQuery]);

  const displayed = filteredHistory.slice(0, displayCount);

  const clearSearch = () => setSearchQuery("");

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-loading">
          <div className="history-spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
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
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          title="Refresh history"
        >
          <FaSyncAlt />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="history-controls">
        <div
          className={`history-search-container ${
            searchFocused ? "history-search-focused" : ""
          }`}
        >
          <div className="history-search-input-wrapper">
            <FaSearch className="history-search-icon" />
            <input
              type="text"
              className="history-search-input"
              placeholder="Search by name, action, field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <button className="history-search-clear" onClick={clearSearch}>
                <FaTimes />
              </button>
            )}
          </div>
          <FaFilter className="history-filter-icon" />
        </div>

        {/* Action Filter Pills */}
        <div className="history-filter-pills">
          {["ALL", "CREATE", "UPDATE", "DELETE"].map((action) => (
            <button
              key={action}
              className={`history-pill ${
                filterAction === action ? "history-pill-active" : ""
              } ${action !== "ALL" ? `history-pill-${action.toLowerCase()}` : ""}`}
              onClick={() => setFilterAction(action)}
            >
              {action === "ALL" ? (
                "All Actions"
              ) : (
                <>
                  {ACTION_CONFIG[action].icon}
                  {ACTION_CONFIG[action].label}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      {searchQuery && (
        <div className="history-results-info">
          <span className="history-results-count">{filteredHistory.length}</span>
          <span className="history-results-text">
            results for &quot;<em>{searchQuery}</em>&quot;
          </span>
        </div>
      )}

      {/* History Records */}
      <div className="history-records-section">
        <div className="history-records-header">
          <h2 className="history-section-title">
            {filterAction === "ALL" ? "All Activity" : `${ACTION_CONFIG[filterAction].label} Events`} ({filteredHistory.length})
          </h2>
          <div className="history-records-info">
            Showing {displayed.length} of {filteredHistory.length}
          </div>
        </div>

        {displayed.length === 0 ? (
          <div className="history-empty-state">
            <FaHistory className="history-empty-icon" />
            <h3>No History Found</h3>
            <p>
              {searchQuery || filterAction !== "ALL"
                ? "No records match your filters"
                : "Actions you perform will appear here"}
            </p>
            {(searchQuery || filterAction !== "ALL") && (
              <button
                className="history-clear-filters-button"
                onClick={() => {
                  clearSearch();
                  setFilterAction("ALL");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="history-timeline">
            {displayed.map((entry, index) => {
              const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
              const hasChanges =
                entry.changedFields && entry.changedFields.length > 0;

              return (
                <div key={entry._id} className={`history-card history-card-${entry.action?.toLowerCase()}`}>
                  {/* Card Header */}
                  <div className="history-card-header">
                    <div className="history-card-left">
                      <span className={`history-action-badge ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      <span className="history-record-type">{entry.recordType}</span>
                    </div>
                    <div className="history-card-right">
                      <span className="history-time-ago" title={formatDateTime(entry.createdAt)}>
                        <FaClock className="history-time-icon" />
                        {timeAgo(entry.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Log Message */}
                  <div className="history-log-message">
                    <FaInfoCircle className="history-log-icon" />
                    <p>{entry.logMessage}</p>
                  </div>

                  {/* Changed Fields — only for UPDATE */}
                  {entry.action === "UPDATE" && hasChanges && (
                    <div className="history-changes-section">
                      <div className="history-changes-title">Changes:</div>
                      <div className="history-changes-grid">
                        {entry.changedFields.map((field) => {
                          const oldVal = entry.oldValues?.[field];
                          const newVal = entry.newValues?.[field];
                          return (
                            <div key={field} className="history-change-item">
                              <span className="history-change-field">{field}</span>
                              <span className="history-change-old">
                                {oldVal instanceof Object
                                  ? new Date(oldVal).toLocaleDateString()
                                  : String(oldVal ?? "—")}
                              </span>
                              <FaArrowRight className="history-change-arrow" />
                              <span className="history-change-new">
                                {newVal instanceof Object
                                  ? new Date(newVal).toLocaleDateString()
                                  : String(newVal ?? "—")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="history-card-footer">
                    <div className="history-card-user">
                      <FaUser className="history-user-icon" />
                      <span>{entry.userName || "Unknown User"}</span>
                    </div>
                    <div className="history-card-date">
                      <FaCalendarAlt className="history-date-icon" />
                      <span>{formatDateTime(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View More */}
        {displayed.length < filteredHistory.length && (
          <div className="history-view-more-section">
            <button
              className="history-view-more-button"
              onClick={() => setDisplayCount((c) => c + 20)}
            >
              View More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
