"use client";
import { useUser } from "context/UserContext";
import React, { useEffect, useState, useMemo } from "react";
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
  FaFilter
} from "react-icons/fa";
import axios from "axios";
import "./styles/RechargeList.css";

export default function EnhancedRechargeList() {
  const [recharges, setRecharges] = useState([]);
  const [displayedRecharges, setDisplayedRecharges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    reason: "",
    lastrecharge: "",
    amount: "",
    validity: "",
  });
  const [token, setToken] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const { loading, setLoading } = useUser();

  // Show notification popup
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const recordsPerPage = 20;

  // Hide/Show body scrollbar
  useEffect(() => {
    if (showForm || showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, showDeleteConfirm]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Search functionality
  const filteredRecharges = useMemo(() => {
    if (!searchQuery.trim()) {
      return recharges;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return recharges.filter((record) => {
      // Search in name
      if (record.name?.toLowerCase().includes(query)) return true;
      
      // Search in phone
      if (record.phone?.toLowerCase().includes(query)) return true;
      
      // Search in reason
      if (record.reason?.toLowerCase().includes(query)) return true;
      
      // Search in amount (convert to string)
      if (record.amount?.toString().includes(query)) return true;
      
      // Search in validity
      if (record.validity?.toString().includes(query)) return true;
      
      // Search in formatted dates
      if (record.lastrecharge) {
        const lastRechargeFormatted = new Date(record.lastrecharge).toLocaleDateString().toLowerCase();
        if (lastRechargeFormatted.includes(query)) return true;
      }
      
      if (record.deadline) {
        const deadlineFormatted = new Date(record.deadline).toLocaleDateString().toLowerCase();
        if (deadlineFormatted.includes(query)) return true;
      }
      
      // Search in status
      const status = record.closed ? 'closed' : 'active';
      if (status.includes(query)) return true;
      
      // Search in payment status
      const paymentStatus = record.paid ? 'paid' : 'unpaid';
      if (paymentStatus.includes(query)) return true;
      
      return false;
    });
  }, [recharges, searchQuery]);

  // Update displayed recharges when filtered results change
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * recordsPerPage;
    setDisplayedRecharges(filteredRecharges.slice(startIndex, endIndex));
  }, [filteredRecharges, currentPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchRecharges = async () => {
    try {
      const res = await axios.get("/api/recharge/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = [...res.data.recharges].sort((a, b) => {
        return a.closed === b.closed ? 0 : a.closed ? 1 : -1;
      });

      setRecharges(sorted);
    } catch (err) {
      alert("Error fetching data: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecharges();
    }
  }, [token]);

  const handleViewMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
  };

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
        showNotification('success', 'Recharge updated successfully!');
      } else {
        await axios.post("/api/recharge/create", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification('success', 'Recharge created successfully!');
      }

      setShowForm(false);
      setEditId(null);
      setForm({
        name: "",
        phone: "",
        reason: "",
        lastrecharge: "",
        amount: "",
        validity: "",
      });
      fetchRecharges();
    } catch (err) {
      showNotification('error', 'Error saving: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClosedToggle = async (id, closed) => {
    try {
      await axios.put(
        "/api/recharge/update",
        { id, closed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRecharges();
    } catch (err) {
      showNotification('error', 'Error updating status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePaidToggle = async (id, paid) => {
    try {
      await axios.put(
        "/api/recharge/update",
        { id, paid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRecharges();
      showNotification('success', `Payment status updated to ${paid ? 'Paid' : 'Unpaid'}`);
    } catch (err) {
      showNotification('error', 'Error updating payment status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    try {
      await axios.delete("/api/recharge/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: deleteId }
      });
      
      showNotification('success', 'Record deleted successfully!');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchRecharges();
    } catch (err) {
      showNotification('error', 'Error deleting record: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

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
    setForm({
      name: "",
      phone: "",
      reason: "",
      lastrecharge: "",
      amount: "",
      validity: "",
    });
    setShowForm(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="enhanced-recharge-container">
      {/* Notification Popup */}
      {notification.show && (
        <div className={`enhanced-notification-popup ${notification.type}`}>
          <div className="enhanced-notification-content">
            <div className="enhanced-notification-icon">
              {notification.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
            </div>
            <span className="enhanced-notification-message">{notification.message}</span>
            <button 
              className="enhanced-notification-close"
              onClick={() => setNotification({ show: false, type: '', message: '' })}
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
                <FaTrashAlt className="enhanced-delete-icon" />
                Confirm Delete
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
                <button 
                  type="button" 
                  onClick={handleDeleteCancel} 
                  className="enhanced-cancel-button"
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="enhanced-delete-confirm-button"
                >
                  <FaTrashAlt />
                  {loading ? "Deleting..." : "Delete Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          <FaPlus />
          Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="enhanced-search-section">
        <div className={`enhanced-search-container ${searchFocused ? 'enhanced-search-focused' : ''}`}>
          <div className="enhanced-search-input-wrapper">
            <FaSearch className="enhanced-search-icon" />
            <input
              type="text"
              placeholder="Search by name, phone, amount, date, reason, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="enhanced-search-input"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="enhanced-search-clear"
                type="button"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="enhanced-search-filter-icon">
            <FaFilter />
          </div>
        </div>
        
        {searchQuery && (
          <div className="enhanced-search-results-info">
            <span className="enhanced-results-count">
              {filteredRecharges.length} result{filteredRecharges.length !== 1 ? 's' : ''} found
            </span>
            {searchQuery && (
              <span className="enhanced-search-query">
                for {searchQuery}
              </span>
            )}
          </div>
        )}
      </div>

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
                    <FaUser className="enhanced-label-icon" />
                    Full Name
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
                    <FaPhone className="enhanced-label-icon" />
                    Phone Number
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
                  <label className="enhanced-form-label">
                    Reason
                  </label>
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
                    <FaCalendarAlt className="enhanced-label-icon" />
                    Last Recharge Date
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
                    <FaMoneyBillWave className="enhanced-label-icon" />
                    Amount
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
                    <FaClock className="enhanced-label-icon" />
                    Validity (days)
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
                  <FaTimes />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="enhanced-submit-button"
                >
                  <FaSave />
                  {loading ? "Saving..." : editId ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="enhanced-records-section">
        <div className="enhanced-records-header">
          <h2 className="enhanced-section-title">
            {searchQuery ? 'Search Results' : 'All Records'} ({filteredRecharges.length})
          </h2>
          <div className="enhanced-records-info">
            Showing {displayedRecharges.length} of {filteredRecharges.length} records
          </div>
        </div>

        <div className="enhanced-records-grid">
          {displayedRecharges.map((record) => (
            <div key={record._id} className={`enhanced-record-card ${record.closed ? 'enhanced-closed' : 'enhanced-open'}`}>
              <div className="enhanced-record-header">
                <div className="enhanced-record-name">
                  <FaUser className="enhanced-record-icon" />
                  <span>{record.name}</span>
                </div>
                <div className="enhanced-record-actions">
                  <div className={`enhanced-status-badge ${record.closed ? 'enhanced-closed' : 'enhanced-open'}`}>
                    {record.closed ? <FaTimesCircle /> : <FaCheckCircle />}
                    {record.closed ? 'Closed' : 'Active'}
                  </div>
                  <div className={`enhanced-status-badge enhanced-paid-badge ${record.paid ? 'enhanced-paid' : 'enhanced-unpaid'}`}>
                    <FaCoins />
                    {record.paid ? 'Paid' : 'Unpaid'}
                  </div>
                  <button
                    className="enhanced-edit-button"
                    onClick={() => startEdit(record)}
                  >
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
                  <span className="enhanced-detail-value">{record.phone || 'N/A'}</span>
                </div>

                <div className="enhanced-detail-item">
                  <span className="enhanced-detail-label">Reason:</span>
                  <span className="enhanced-detail-value">{record.reason || 'N/A'}</span>
                </div>

                <div className="enhanced-detail-item">
                  <FaMoneyBillWave className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Amount:</span>
                  <span className="enhanced-detail-value enhanced-amount">₹{record.amount || '0'}</span>
                </div>

                <div className="enhanced-detail-item">
                  <FaClock className="enhanced-detail-icon" />
                  <span className="enhanced-detail-label">Validity:</span>
                  <span className="enhanced-detail-value">{record.validity || '0'} days</span>
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
                    Mark as {record.closed ? 'Open' : 'Closed'}
                  </label>
                  
                  <label className="enhanced-checkbox-container">
                    <input
                      type="checkbox"
                      checked={record.paid || false}
                      onChange={(e) => handlePaidToggle(record._id, e.target.checked)}
                      className="enhanced-status-checkbox enhanced-paid-checkbox"
                    />
                    <span className="enhanced-checkmark"></span>
                    Mark as {record.paid ? 'Unpaid' : 'Paid'}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayedRecharges.length < filteredRecharges.length && (
          <div className="enhanced-view-more-section">
            <button className="enhanced-view-more-button" onClick={handleViewMore}>
              <FaEye />
              View More Records
            </button>
          </div>
        )}

        {filteredRecharges.length === 0 && !searchQuery && (
          <div className="enhanced-empty-state">
            <FaMoneyBillWave className="enhanced-empty-icon" />
            <h3>No Records Found</h3>
            <p>Start by adding your first recharge record</p>
          </div>
        )}

        {filteredRecharges.length === 0 && searchQuery && (
          <div className="enhanced-empty-state">
            <FaSearch className="enhanced-empty-icon" />
            <h3>No Results Found</h3>
            <p>No records match your search criteria</p>
            <button 
              onClick={clearSearch}
              className="enhanced-clear-search-button"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}