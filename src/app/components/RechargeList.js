"use client";
import { useUser } from "context/UserContext";
import React, { useEffect, useState } from "react";
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
  FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import "./styles/RechargeList.css";

export default function RechargeList() {
  const [recharges, setRecharges] = useState([]);
  const [displayedRecharges, setDisplayedRecharges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const fetchRecharges = async () => {
    try {
      const res = await axios.get("/api/recharge/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Put open records first, closed ones last
      const sorted = [...res.data.recharges].sort((a, b) => {
        return a.closed === b.closed ? 0 : a.closed ? 1 : -1;
      });

      setRecharges(sorted);
  const recordsPerPage = 20;
      setDisplayedRecharges(sorted.slice(0, recordsPerPage));
      setCurrentPage(1);
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
    const startIndex = 0;
    const endIndex = nextPage * recordsPerPage;
    setDisplayedRecharges(recharges.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        // Update existing
        await axios.put(
          "/api/recharge/update",
          { id: editId, ...form },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('success', 'Recharge updated successfully!');
      } else {
        // Create new
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

  return (
    <div className="recharge-container">
      {/* Notification Popup */}
      {notification.show && (
        <div className={`notification-popup ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
            </div>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, type: '', message: '' })}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="recharge-header">
        <div className="header-content">
          <h1 className="page-title">
            <FaMoneyBillWave className="title-icon" />
            Recharge Records
          </h1>
          <p className="page-subtitle">Manage and track all recharge transactions</p>
        </div>
        <button
          className="add-button"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          <FaPlus />
          Add New
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <div className="form-header">
              <h2 className="form-title">
                {editId ? "Edit Recharge Record" : "Add New Recharge Record"}
              </h2>
              <button className="close-button" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="recharge-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaUser className="label-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <FaPhone className="label-icon" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reason"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <FaCalendarAlt className="label-icon" />
                    Last Recharge Date
                  </label>
                  <input
                    type="date"
                    value={form.lastrecharge}
                    onChange={(e) => setForm({ ...form, lastrecharge: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <FaMoneyBillWave className="label-icon" />
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <FaClock className="label-icon" />
                    Validity (days)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter validity in days"
                    value={form.validity}
                    onChange={(e) => setForm({ ...form, validity: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-button">
                  <FaTimes />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  <FaSave />
                  {loading ? "Saving..." : editId ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="records-section">
        <div className="records-header">
          <h2 className="section-title">All Records ({recharges.length})</h2>
          <div className="records-info">
            Showing {displayedRecharges.length} of {recharges.length} records
          </div>
        </div>

        <div className="records-grid">
          {displayedRecharges.map((record) => (
            <div key={record._id} className={`record-card ${record.closed ? 'closed' : 'open'}`}>
              <div className="record-header">
                <div className="record-name">
                  <FaUser className="record-icon" />
                  <span>{record.name}</span>
                </div>
                <div className="record-actions">
                  <div className={`status-badge ${record.closed ? 'closed' : 'open'}`}>
                    {record.closed ? <FaTimesCircle /> : <FaCheckCircle />}
                    {record.closed ? 'Closed' : 'Active'}
                  </div>
                  <button
                    className="edit-button"
                    onClick={() => startEdit(record)}
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>

              <div className="record-details">
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{record.phone || 'N/A'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value">{record.reason || 'N/A'}</span>
                </div>

                <div className="detail-item">
                  <FaMoneyBillWave className="detail-icon" />
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value amount">₹{record.amount || '0'}</span>
                </div>

                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span className="detail-label">Validity:</span>
                  <span className="detail-value">{record.validity || '0'} days</span>
                </div>

                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span className="detail-label">Last Recharge:</span>
                  <span className="detail-value">
                    {new Date(record.lastrecharge).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span className="detail-label">Deadline:</span>
                  <span className="detail-value deadline">
                    {new Date(record.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="record-footer">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={record.closed}
                    onChange={(e) => handleClosedToggle(record._id, e.target.checked)}
                    className="status-checkbox"
                  />
                  <span className="checkmark"></span>
                  Mark as {record.closed ? 'Open' : 'Closed'}
                </label>
              </div>
            </div>
          ))}
        </div>

        {displayedRecharges.length < recharges.length && (
          <div className="view-more-section">
            <button className="view-more-button" onClick={handleViewMore}>
              <FaEye />
              View More Records
            </button>
          </div>
        )}

        {recharges.length === 0 && (
          <div className="empty-state">
            <FaMoneyBillWave className="empty-icon" />
            <h3>No Records Found</h3>
            <p>Start by adding your first recharge record</p>
          </div>
        )}
      </div>
    </div>
  );
}