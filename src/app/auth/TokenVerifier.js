// src/components/TokenVerifier.jsx
"use client";

import { useEffect } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";


export default function TokenVerifier({ children }) {
  const {
    userid,
    setUserid,
    username,
    setUsername,
    isLogin,
    setIsLogin,
    loading,
    setLoading,
    email,setEmail,
    coins,setCoins,
    checkin,setCheckin,
    setAvatar
  } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLogin(false);
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`/api/user/verifyuser?token=${token}`);
        const { id, name } = res.data.user;
        console.log(res.data);
        setEmail(res.data.user.email);
        setCheckin(res.data.user.checkin);
        setCoins(res.data.user.coins);
        setAvatar(res.data.user.avatar);
        setUserid(id);
        setUsername(name);
        setIsLogin(true);
      } catch {
        localStorage.removeItem("token");
        setUserid(null);
        setUsername(null);
        setIsLogin(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [setUserid, setUsername, setIsLogin, setLoading]);

  // ---------- RETURN VALUE ----------
  const auth = { isLogin, userid, username, loading };

  // 1) If a render‑prop child is supplied, call it
  if (typeof children === "function") {
    return children(auth);
  }

  // 2) Otherwise display a simple status panel
  return (
    <div style={{ fontSize: ".9rem", color: "#666",height:"63px" }}>
      
    </div>
  );
}
