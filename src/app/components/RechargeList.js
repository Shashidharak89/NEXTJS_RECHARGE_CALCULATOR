"use client";
import { useUser } from "context/UserContext";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  FaPlus, 
  FaEdit, 
  FaUser, 
  FaPhone, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaTimes,
  FaEye,
  FaCheck,
  FaExclamationTriangle,
  FaTrashAlt,
  FaCoins,
  FaSearch,
  FaFilter,
  FaBolt,
  FaCopy
} from "react-icons/fa";
import axios from "axios";
import "./styles/RechargeList.css";

const PAGE_SIZE = 10;

export default function EnhancedRechargeList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL-driven values
  const urlSearch = searchParams.get("rq") || "";
  const urlPage   = Math.max(parseInt(searchParams.get("rpage") || "1", 10), 1);

  // Server data state
  const [records, setRecords]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loadedPage, setLoadedPage] = useState(urlPage);

  // Search input (unsubmitted — only fires on click/Enter)
  const [inputQuery, setInputQuery] = useState(urlSearch);

  // Form / UI state
  const [showForm, setShowForm]                   = useState(false);
  const [editId, setEditId]                       = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId]                   = useState(null);
  const [searchFocused, setSearchFocused]         = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    reason: "",
    lastrecharge: "",
    amount: "",
    validity: "",
  });
  const [token, setToken] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const { loading, setLoading } = useUser();

  // Keep latest token available in callbacks without stale closure issues
  const tokenRef = useRef("");
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ── Notification helper ─────────────────────────────────────────────────────
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 4000);
  };

  // ── Scroll lock when modals open ────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = showForm || showDeleteConfirm ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showForm, showDeleteConfirm]);

  // ── Token init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  // ── Core fetch ──────────────────────────────────────────────────────────────
  //   mode: "init"     → restore all pages seen (urlPage * PAGE_SIZE)
  //         "viewmore" → append next page
  //         "refresh"  → reload current visible set
  //         "search"   → reset to page 1 with new query
  const doFetch = useCallback(
    async (mode, overrides = {}) => {
      const tk = tokenRef.current;
      if (!tk) return;

      const currentSearch =
        overrides.search !== undefined ? overrides.search : urlSearch;

      let page, limit, appendMode;

      if (mode === "init") {
        page = 1;
        limit = urlPage * PAGE_SIZE;
        appendMode = false;
      } else if (mode === "viewmore") {
        page = loadedPage + 1;
        limit = PAGE_SIZE;
        appendMode = true;
      } else if (mode === "search") {
        page = 1;
        limit = PAGE_SIZE;
        appendMode = false;
      } else {
        // refresh — reload all currently-visible pages
        page = 1;
        limit = loadedPage * PAGE_SIZE;
        appendMode = false;
      }

      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);
        if (currentSearch) params.set("search", currentSearch);

        const res = await axios.get(`/api/recharge/all?${params.toString()}`, {
          headers: { Authorization: `Bearer ${tk}` },
        });

        const { recharges: fetched, total: serverTotal } = res.data;

        if (appendMode) {
          setRecords((prev) => [...prev, ...fetched]);
          const newLoaded = loadedPage + 1;
          setLoadedPage(newLoaded);
          const p = new URLSearchParams(searchParams.toString());
          p.set("rpage", newLoaded);
          router.replace(`?${p.toString()}`, { scroll: false });
        } else {
          setRecords(fetched);
          if (mode === "search") {
            setLoadedPage(1);
            const p = new URLSearchParams(searchParams.toString());
            if (currentSearch) p.set("rq", currentSearch); else p.delete("rq");
            p.set("rpage", 1);
            router.replace(`?${p.toString()}`, { scroll: false });
          }
        }

        setTotal(serverTotal);
      } catch (err) {
        showNotification(
          "error",
          "Error fetching data: " + (err.response?.data?.error || err.message)
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadedPage, urlPage, urlSearch, searchParams]
  );

  // ── Initial load (once token ready) ────────────────────────────────────────
  useEffect(() => {
    if (token) doFetch("init");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Search handlers (click / Enter only) ───────────────────────────────────
  const handleSearchSubmit = () => doFetch("search", { search: inputQuery.trim() });
  const handleSearchKeyDown = (e) => { if (e.key === "Enter") handleSearchSubmit(); };
  const clearSearch = () => { setInputQuery(""); doFetch("search", { search: "" }); };

  // ── View More ───────────────────────────────────────────────────────────────
  const handleViewMore = () => doFetch("viewmore");

  // ── Refresh after mutations ─────────────────────────────────────────────────
  const refreshData = () => doFetch("refresh");

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(
          "/api/recharge/update",
          { id: editId, ...form },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("success", "Recharge updated successfully!");
      } else {
        await axios.post("/api/recharge/create", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("success", "Recharge created successfully!");
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: "", phone: "", reason: "", lastrecharge: "", amount: "", validity: "" });
      refreshData();
    } catch (err) {
      showNotification("error", "Error saving: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle handlers ─────────────────────────────────────────────────────────
  const handleClosedToggle = async (id, closed) => {
    try {
      await axios.put("/api/recharge/update", { id, closed }, { headers: { Authorization: `Bearer ${token}` } });
      refreshData();
    } catch (err) {
      showNotification("error", "Error updating status: " + (err.response?.data?.error || err.message));
    }
  };

  const handlePaidToggle = async (id, paid) => {
    try {
      await axios.put("/api/recharge/update", { id, paid }, { headers: { Authorization: `Bearer ${token}` } });
      refreshData();
      showNotification("success", `Payment status updated to ${paid ? "Paid" : "Unpaid"}`);
    } catch (err) {
      showNotification("error", "Error updating payment: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCopyPhone = async (phone) => {
    if (!phone) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(phone);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = phone;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      showNotification("success", "Phone number copied");
    } catch {
      showNotification("error", "Unable to copy phone number");
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteClick = (id) => { setDeleteId(id); setShowDeleteConfirm(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await axios.delete("/api/recharge/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: deleteId },
      });
      showNotification("success", "Record deleted successfully!");
      setShowDeleteConfirm(false);
      setDeleteId(null);
      refreshData();
    } catch (err) {
      showNotification("error", "Error deleting record: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => { setShowDeleteConfirm(false); setDeleteId(null); };

  // ── Edit / Reset form ───────────────────────────────────────────────────────
  const startEdit = (record) => {
    setEditId(record._id);
    setForm({
      name: record.name,
      phone: record.phone,
      reason: record.reason,
      lastrecharge: record.lastrecharge ? record.lastrecharge.split("T")[0] : "",
      amount: record.amount,
      validity: record.validity,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", phone: "", reason: "", lastrecharge: "", amount: "", validity: "" });
    setShowForm(false);
  };

  // ── RTD (Recharge Today) ────────────────────────────────────────────────────
  const handleRTD = async (record) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await axios.put(
        "/api/recharge/update",
        { id: record._id, lastrecharge: today, paid: false, rtd: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification("success", `RTD updated for ${record.name}!`);
      refreshData();
    } catch (err) {
      showNotification("error", "RTD failed: " + (err.response?.data?.error || err.message));
    }
  };

  const remaining = total - records.length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="enhanced-recharge-container">

      {/* Notification Popup */}
      {notification.show && (
        <div className={`enhanced-notification-popup ${notification.type}`}>
          <div className="enhanced-notification-content">
            <div className="enhanced-notification-icon">
              {notification.type === "success" ? <FaCheck /> : <FaExclamationTriangle />}
            </div>
            <span className="enhanced-notification-message">{notification.message}</span>
            <button
              className="enhanced-notification-close"
              onClick={() => setNotification({ show: false, type: "", message: "" })}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="enhanced-form-overlay">
          <div className="enhanced-delete-modal">
            <div className="enhanced-delete-header">
              <h2 className="enhanced-delete-title">
                <FaTrashAlt className="enhanced-delete-icon" /> Confirm Delete
              </h2>
              <button className="enhanced-close-button" onClick={handleDeleteCancel}>
                <FaTimes />
              </button>
            </div>
            <div className="enhanced-delete-content">
              <div className="enhanced-delete-warning">
                <FaExclamationTriangle className="enhanced-warning-icon" />
                <p>Are you sure you want to delete this recharge record?</p>
                <p className="enhanced-delete-subtext">This action cannot be undone.</p>
              </div>
              <div className="enhanced-delete-actions">
                <button type="button" onClick={handleDeleteCancel} className="enhanced-cancel-button">
                  <FaTimes /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="enhanced-delete-confirm-button"
                >
                  <FaTrashAlt /> {loading ? "Deleting..." : "Delete Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="enhanced-recharge-header">
        <div className="enhanced-header-content">
          <h1 className="enhanced-page-title">
            <FaMoneyBillWave className="enhanced-title-icon" />
            Recharge Records
          </h1>
          <p className="enhanced-page-subtitle">Manage and track all recharge transactions</p>
        </div>
        <button
          className="enhanced-add-button"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          <FaPlus /> Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="enhanced-search-section">
        <div className={`enhanced-search-container ${searchFocused ? "enhanced-search-focused" : ""}`}>
          <div className="enhanced-search-input-wrapper">
            <div className={`enhanced-search-input-zone${inputQuery ? " enhanced-search-input-zone--typing" : ""}`}>
              <button
                type="button"
                className="enhanced-search-submit-btn"
                onClick={handleSearchSubmit}
                disabled={!inputQuery.trim()}
                title="Click to search"
              >
                <FaSearch />
              </button>
              <input
                type="text"
                placeholder="Type to search… then hit Enter or →"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="enhanced-search-input"
              />
            </div>
            {urlSearch && (
              <button onClick={clearSearch} className="enhanced-search-clear" type="button">
                <FaTimes />
              </button>
            )}
          </div>
          <div className="enhanced-search-filter-icon">
            <FaFilter />
          </div>
        </div>

        {urlSearch && (
          <div className="enhanced-search-results-info">
            <span className="enhanced-results-count">
              {total} result{total !== 1 ? "s" : ""} found
            </span>
            <span className="enhanced-search-query">for &ldquo;{urlSearch}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="enhanced-form-overlay">
          <div className="enhanced-form-modal">
            <div className="enhanced-form-header">
              <h2 className="enhanced-form-title">
                {editId ? "Edit Recharge Record" : "Add New Recharge Record"}
              </h2>
              <button className="enhanced-close-button" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="enhanced-recharge-form">
              <div className="enhanced-form-grid">
                <div className="enhanced-form-group">
                  <label className="enhanced-form-label">
                    <FaUser className="enhanced-label-icon" /> Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="enhanced-form-input"
                  />
                </div>
                <div className="enhanced-form-group">
                  <label className="enhanced-form-label">
                    <FaPhone className="enhanced-label-icon" /> Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="enhanced-form-input"
                  />
                </div>
                <div className="enhanced-form-group">
                  <label className="enhanced-form-label">Reason</label>
                  <input
                    type="text"
                    placeholder="Enter reason"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="enhanced-form-input"
                  />
                </div>
                <div className="enhanced-form-group">
                  <label className="enhanced-form-label">
                    <FaCalendarAlt className="enhanced-label-icon" /> Last Recharge Date
                  </label>
                  <input
                    type="date"
                    value={form.lastrecharge}
                    onChange={(e) => setForm({ ...form, lastrecharge: e.target.value })}
                    className="enhanced-form-input"
                  />
                </div>
                <div className="enhanced-form-group">
                  <label className="enhanced-form-label">
                    <FaMoneyBillWave className="enhanced-label-icon" /> Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="enhanced-form-input"
                  />
                </div>
                <div className="enhanced-form-group">
                  <label className="enhanced-form-label">
                    <FaClock className="enhanced-label-icon" /> Validity (days)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter validity in days"
                    value={form.validity}
                    onChange={(e) => setForm({ ...form, validity: e.target.value })}
                    className="enhanced-form-input"
                  />
                </div>
              </div>
              <div className="enhanced-form-actions">
                <button type="button" onClick={resetForm} className="enhanced-cancel-button">
                  <FaTimes /> Cancel
                </button>
                <button type="submit" disabled={loading} className="enhanced-submit-button">
                  <FaSave /> {loading ? "Saving..." : editId ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Section */}
      <div className="enhanced-records-section">
        <div className="enhanced-records-header">
          <h2 className="enhanced-section-title">
            {urlSearch ? "Search Results" : "All Records"} ({total})
          </h2>
          <div className="enhanced-records-info">
            Showing {records.length} of {total} records
          </div>
        </div>

        <div className="enhanced-records-grid">
          {records.map((record) => (
            <div
              key={record._id}
              className={`enhanced-record-card ${record.closed ? "enhanced-closed" : "enhanced-open"}`}
            >
              <div className="enhanced-record-header">
                <div className="enhanced-record-name">
                  <FaUser className="enhanced-record-icon" />
                  <span>{record.name}</span>
                </div>
                <div className="enhanced-record-actions">
                  <div className={`enhanced-status-badge ${record.closed ? "enhanced-closed" : "enhanced-open"}`}>
                    {record.closed ? <FaTimesCircle /> : <FaCheckCircle />}
                    {record.closed ? "Closed" : "Active"}
                  </div>
                  <div className={`enhanced-status-badge enhanced-paid-badge ${record.paid ? "enhanced-paid" : "enhanced-unpaid"}`}>
                    <FaCoins />
                    {record.paid ? "Paid" : "Unpaid"}
                  </div>
                  {!record.closed && (
                    <button
                      className="enhanced-rtd-button"
                      onClick={() => handleRTD(record)}
                      title="Recharge Today — sets last recharge to today & marks unpaid"
                    >
                      <FaBolt /> RTD
                    </button>
                  )}
                  <button className="enhanced-edit-button" onClick={() => startEdit(record)}>
                    <FaEdit />
                  </button>
                  {record.closed && (
                    <button
                      className="enhanced-delete-button"
                      onClick={() => handleDeleteClick(record._id)}
                      title="Delete Record"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>

              <div className="enhanced-record-details">
                <div className="enhanced-detail-item">
                  <FaPhone className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Phone:</span>
                  <div className="enhanced-phone-value-wrap">
                    <span className="enhanced-detail-value">{record.phone || "N/A"}</span>
                    {record.phone && (
                      <button
                        type="button"
                        className="enhanced-copy-button"
                        onClick={() => handleCopyPhone(record.phone)}
                        title="Copy phone number"
                        aria-label="Copy phone number"
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                </div>
                <div className="enhanced-detail-item">
                  <span className="enhanced-detail-label">Reason:</span>
                  <span className="enhanced-detail-value">{record.reason || "N/A"}</span>
                </div>
                <div className="enhanced-detail-item">
                  <FaMoneyBillWave className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Amount:</span>
                  <span className="enhanced-detail-value enhanced-amount">₹{record.amount || "0"}</span>
                </div>
                <div className="enhanced-detail-item">
                  <FaClock className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Validity:</span>
                  <span className="enhanced-detail-value">{record.validity || "0"} days</span>
                </div>
                <div className="enhanced-detail-item">
                  <FaCalendarAlt className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Last Recharge:</span>
                  <span className="enhanced-detail-value">
                    {new Date(record.lastrecharge).toLocaleDateString()}
                  </span>
                </div>
                <div className="enhanced-detail-item">
                  <FaCalendarAlt className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Deadline:</span>
                  <span className="enhanced-detail-value enhanced-deadline">
                    {new Date(record.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="enhanced-record-footer">
                <div className="enhanced-checkbox-group">
                  <label className="enhanced-checkbox-container">
                    <input
                      type="checkbox"
                      checked={record.closed}
                      onChange={(e) => handleClosedToggle(record._id, e.target.checked)}
                      className="enhanced-status-checkbox"
                    />
                    <span className="enhanced-checkmark"></span>
                    Mark as {record.closed ? "Open" : "Closed"}
                  </label>
                  <label className="enhanced-checkbox-container">
                    <input
                      type="checkbox"
                      checked={record.paid || false}
                      onChange={(e) => handlePaidToggle(record._id, e.target.checked)}
                      className="enhanced-status-checkbox enhanced-paid-checkbox"
                    />
                    <span className="enhanced-checkmark"></span>
                    Mark as {record.paid ? "Unpaid" : "Paid"}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        {remaining > 0 && (
          <div className="enhanced-view-more-section">
            <button
              className="enhanced-view-more-button"
              onClick={handleViewMore}
              disabled={loading}
            >
              <FaEye /> View More Records ({remaining} remaining)
            </button>
          </div>
        )}

        {/* Empty states */}
        {records.length === 0 && !urlSearch && (
          <div className="enhanced-empty-state">
            <FaMoneyBillWave className="enhanced-empty-icon" />
            <h3>No Records Found</h3>
            <p>Start by adding your first recharge record</p>
          </div>
        )}

        {records.length === 0 && urlSearch && (
          <div className="enhanced-empty-state">
            <FaSearch className="enhanced-empty-icon" />
            <h3>No Results Found</h3>
            <p>No records match your search criteria</p>
            <button onClick={clearSearch} className="enhanced-clear-search-button">
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
