"use client";

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [username, setUsername] = useState();
  const [userid, setUserid] = useState();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(null);
  const [avatar, setAvatar] = useState("https://res.cloudinary.com/dwiwvw2tq/image/upload/v1753696443/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector_uue8fa.jpg");

  const [coins, setCoins] = useState(0);
  const [checkin, setCheckin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [referalcount, setReferalcount] = useState(0);



  const [token, setToken] = useState();


  // 🔁 Function to update coins
  const updateCoins = async (message, coinval) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userid) throw new Error("Unauthorized");

      const res = await axios.post("/api/user/update-coin", {
        userId: userid,
        message,
        coinval,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.updatedCoins !== undefined) {
        setCoins(res.data.updatedCoins); // update context
        console.log("✅ Coins updated:", res.data.updatedCoins);
      } else {
        console.warn("⚠ Unexpected coin update response");
      }

    } catch (err) {
      console.error("❌ Failed to update coins:", err.response?.data?.error || err.message);
    }
  };




  return (
    <UserContext.Provider value={{
      username, setUsername,
      userid, setUserid,
      isLogin, setIsLogin,
      loading, setLoading,
      email, setEmail,
      coins, setCoins,
      checkin, setCheckin,
      updateCoins,
      token, setToken,
      isLoading, setIsLoading,
      avatar, setAvatar,
      referalcount, setReferalcount

    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
