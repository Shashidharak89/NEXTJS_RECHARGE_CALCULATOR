"use client";

import { useUser } from "context/UserContext";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import "./styles/Data.css";
import RechargeList from "./RechargeList";
import Suggestion from "./Suggestion";
import History from "./History";
import { FaList, FaHistory } from "react-icons/fa";

const Data = () => {
    const { isLogin } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") === "history" ? "history" : "records"
    );

    useEffect(() => {
        // Simulate checking authentication status
        const checkAuthStatus = () => {
            // Add a small delay to show loading state
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        };

        checkAuthStatus();
    }, [isLogin]);

    if (isLoading) {
        return (
            <div className="data-container">
                <div className="loading-wrapper">
                    <div className="spinner"></div>
                    <p className="loading-text">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isLogin) {
        return (
            <div className="data-container">
                <div className="auth-prompt-wrapper">
                    <div className="auth-card">
                        <div className="icon-wrapper">
                            <svg className="lock-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1c1.71,0,3.1,1.39,3.1,3.1V8z"/>
                            </svg>
                        </div>
                        <h1 className="auth-title">Authentication Required</h1>
                        <p className="auth-description">
                            Please log in to access this content and enjoy all features.
                        </p>
                        <Link href="/auth/login" className="login-button">
                            Login to Continue
                            <svg className="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,4l-1.41,1.41L16.17,11H4v2h12.17l-5.58,5.59L12,20l8-8L12,4z"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="data-container">
            <div className="homepage-wrapper">
                <header className="homepage-header">
                    <div className="welcome-badge">Welcome back!</div>
                    <h1 className="homepage-title">Dashboard</h1>
                    <p className="homepage-subtitle">
                        You are successfully logged in. Here is your personalized homepage.
                    </p>
                </header>

                {/* Tab Navigation */}
                <div className="data-tab-nav">
                    <button
                        className={`data-tab-btn ${activeTab === "records" ? "data-tab-active" : ""}`}
                        onClick={() => {
                            setActiveTab("records");
                            const p = new URLSearchParams(searchParams.toString());
                            p.set("tab", "records");
                            router.replace(`?${p.toString()}`, { scroll: false });
                        }}
                    >
                        <FaList className="data-tab-icon" />
                        Records
                    </button>
                    <button
                        className={`data-tab-btn data-tab-history ${activeTab === "history" ? "data-tab-active data-tab-history-active" : ""}`}
                        onClick={() => {
                            setActiveTab("history");
                            const p = new URLSearchParams(searchParams.toString());
                            p.set("tab", "history");
                            router.replace(`?${p.toString()}`, { scroll: false });
                        }}
                    >
                        <FaHistory className="data-tab-icon" />
                        History
                    </button>
                </div>

                {activeTab === "records" ? (
                    <>
                        <Suggestion />
                        <RechargeList />
                    </>
                ) : (
                    <History />
                )}
            </div>
        </div>
    );
};

export default Data;