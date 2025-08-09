"use client";
import { useUser } from "context/UserContext";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";

export default function RechargeList() {
  const [recharges, setRecharges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    reason: "",
    lastrecharge: "",
    amount: "",
    validity: "",
  });
  const [token, setToken] = useState("");

  const { loading, setLoading } = useUser();

  // ✅ Only run in browser
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
      setRecharges(res.data.recharges.reverse() || []);
    } catch (err) {
      alert("Error fetching data: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecharges();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/recharge/create", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Recharge created!");
      setShowForm(false);
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
      alert("Error creating: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", background: "black", color: "white" }}>
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Recharge Records
        <FaPlus
          onClick={() => setShowForm(!showForm)}
          style={{ cursor: "pointer", color: "green" }}
        />
      </h2>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ margin: "10px 0", padding: "10px", background: "#222", borderRadius: "5px" }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ display: "block", margin: "5px 0", padding: "8px", width: "100%" }}
          />
          <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ display: "block", margin: "5px 0", padding: "8px", width: "100%" }} />
          <input type="text" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ display: "block", margin: "5px 0", padding: "8px", width: "100%" }} />
          <input type="date" placeholder="Last Recharge Date" value={form.lastrecharge} onChange={(e) => setForm({ ...form, lastrecharge: e.target.value })} style={{ display: "block", margin: "5px 0", padding: "8px", width: "100%" }} />
          <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ display: "block", margin: "5px 0", padding: "8px", width: "100%" }} />
          <input type="number" placeholder="Validity (days)" value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} style={{ display: "block", margin: "5px 0", padding: "8px", width: "100%" }} />
          <button type="submit" disabled={loading} style={{ background: "green", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", fontSize: "14px", background: "#111", color: "white" }}>
        <thead>
          <tr style={{ background: "#222" }}>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Name</th>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Phone</th>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Reason</th>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Amount</th>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Validity</th>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Last Recharge</th>
            <th style={{ padding: "8px", border: "1px solid #444" }}>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {recharges.map((r) => (
            <tr key={r._id}>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{r.name}</td>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{r.phone}</td>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{r.reason}</td>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{r.amount}</td>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{r.validity}</td>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{new Date(r.lastrecharge).toLocaleDateString()}</td>
              <td style={{ padding: "8px", border: "1px solid #444" }}>{new Date(r.deadline).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
