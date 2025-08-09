"use client";
import { useUser } from "context/UserContext";
import React, { useEffect, useState, useRef } from "react";
import { 
  FaUser, 
  FaPhone, 
  FaCalendarAlt, 
  FaClock,
  FaExclamationTriangle,
  FaFire,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import axios from "axios";
import "./styles/Suggestion.css";

export default function Suggestion() {
  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [token, setToken] = useState("");
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const { loading, setLoading } = useUser();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/recharge/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Handle both possible response structures
      const rechargesData = res.data.recharges || res.data || [];

      // Filter recharges that are not closed and have deadlines within the next 3 days
      const upcomingRecharges = rechargesData
        .filter(recharge => !recharge.closed)
        .map(recharge => {
          const deadlineDate = new Date(recharge.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          
          const diffTime = deadlineDate - currentDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            ...recharge,
            daysRemaining: diffDays,
            isToday: diffDays === 0,
            isUrgent: diffDays <= 1,
            isPriority: diffDays <= 3 && diffDays >= 0
          };
        })
        .filter(recharge => recharge.isPriority)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

      setSuggestions(upcomingRecharges);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching suggestions:", err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSuggestions();
    }
  }, [token]);

  // Auto-sliding functionality with smooth transitions
  useEffect(() => {
    if (suggestions.length > 1 && isAutoSliding && !isTransitioning) {
      intervalRef.current = setInterval(() => {
        handleSlideTransition((prev) => (prev + 1) % suggestions.length);
      }, 4000); // Increased to 4 seconds for better UX
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [suggestions.length, isAutoSliding, isTransitioning]);

  const handleSlideTransition = (indexUpdater) => {
    setIsTransitioning(true);
    setCurrentIndex(indexUpdater);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsAutoSliding(false);
    handleSlideTransition(prev => prev === 0 ? suggestions.length - 1 : prev - 1);
    
    // Resume auto-sliding after manual interaction
    setTimeout(() => setIsAutoSliding(true), 6000);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsAutoSliding(false);
    handleSlideTransition(prev => (prev + 1) % suggestions.length);
    
    // Resume auto-sliding after manual interaction
    setTimeout(() => setIsAutoSliding(true), 6000);
  };

  const handleDotClick = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsAutoSliding(false);
    handleSlideTransition(() => index);
    
    setTimeout(() => setIsAutoSliding(true), 6000);
  };

  const getDaysText = (days) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 0) return "Overdue";
    return `${days} days`;
  };

  const getPreviousIndex = () => {
    return currentIndex === 0 ? suggestions.length - 1 : currentIndex - 1;
  };

  const getNextIndex = () => {
    return (currentIndex + 1) % suggestions.length;
  };

  // Don't render if no suggestions or still loading
  if (loading || suggestions.length === 0) return null;

  const currentSuggestion = suggestions[currentIndex];
  const previousSuggestion = suggestions.length > 1 ? suggestions[getPreviousIndex()] : null;
  const nextSuggestion = suggestions.length > 1 ? suggestions[getNextIndex()] : null;

  return (
    <div className="suggestion-container" ref={containerRef}>
      <div className="suggestion-header">
        <div className="suggestion-title">
          <FaClock className="suggestion-title-icon" />
          <span>Upcoming Recharges</span>
          {suggestions.length > 0 && (
            <span className="suggestion-count">{suggestions.length}</span>
          )}
        </div>
      </div>

      <div className="suggestion-slider">
        {/* Previous suggestion (small preview) */}
        {previousSuggestion && suggestions.length > 1 && (
          <div 
            className={`suggestion-card suggestion-preview suggestion-prev ${isTransitioning ? 'transitioning' : ''}`}
            onClick={handlePrevious}
          >
            <div className="suggestion-card-content">
              <div className="suggestion-name">{previousSuggestion.name}</div>
              <div className="suggestion-phone">{previousSuggestion.phone}</div>
            </div>
          </div>
        )}

        {/* Navigation button - Previous */}
        {suggestions.length > 1 && (
          <button 
            className="suggestion-nav suggestion-nav-prev" 
            onClick={handlePrevious}
            disabled={isTransitioning}
            aria-label="Previous suggestion"
          >
            <FaChevronLeft />
          </button>
        )}

        {/* Current suggestion (main display) */}
        <div 
          className={`suggestion-card suggestion-main ${
            currentSuggestion.isToday ? 'suggestion-today' : ''
          } ${
            currentSuggestion.isUrgent ? 'suggestion-urgent' : ''
          } ${
            isTransitioning ? 'transitioning' : ''
          }`}
        >
          <div className="suggestion-priority-indicator">
            {currentSuggestion.isToday && <FaFire className="suggestion-fire" />}
            {currentSuggestion.isUrgent && !currentSuggestion.isToday && <FaExclamationTriangle className="suggestion-warning" />}
          </div>

          <div className="suggestion-card-content">
            <div className="suggestion-info">
              <div className="suggestion-name-section">
                <FaUser className="suggestion-icon" />
                <span className="suggestion-name">{currentSuggestion.name}</span>
              </div>
              
              <div className="suggestion-phone-section">
                <FaPhone className="suggestion-icon" />
                <span className="suggestion-phone">{currentSuggestion.phone}</span>
              </div>
            </div>

            <div className="suggestion-deadline">
              <div className="suggestion-deadline-info">
                <FaCalendarAlt className="suggestion-deadline-icon" />
                <div className="suggestion-deadline-text">
                  <span className={`suggestion-days ${currentSuggestion.daysRemaining < 0 ? 'overdue' : ''}`}>
                    {getDaysText(currentSuggestion.daysRemaining)}
                  </span>
                  <span className="suggestion-date">
                    {new Date(currentSuggestion.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="suggestion-amount">
                ₹{currentSuggestion.amount}
              </div>
            </div>

            {/* Additional info if reason exists */}
            {currentSuggestion.reason && (
              <div className="suggestion-reason">
                <span className="suggestion-reason-text">{currentSuggestion.reason}</span>
              </div>
            )}

            {/* Validity info */}
            {currentSuggestion.validity && (
              <div className="suggestion-validity">
                <span className="suggestion-validity-text">Validity: {currentSuggestion.validity} days</span>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          {suggestions.length > 1 && (
            <div className="suggestion-progress">
              {suggestions.length <= 20 ? (
                // Show dots for 20 or fewer suggestions
                suggestions.map((_, index) => (
                  <div
                    key={index}
                    className={`suggestion-progress-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to suggestion ${index + 1}`}
                  />
                ))
              ) : (
                // Show numerical counter for more than 20 suggestions
                <div className="suggestion-counter">
                  <span className="suggestion-counter-text">
                    {currentIndex + 1} of {suggestions.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation button - Next */}
        {suggestions.length > 1 && (
          <button 
            className="suggestion-nav suggestion-nav-next" 
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next suggestion"
          >
            <FaChevronRight />
          </button>
        )}

        {/* Next suggestion (small preview) */}
        {nextSuggestion && suggestions.length > 1 && (
          <div 
            className={`suggestion-card suggestion-preview suggestion-next ${isTransitioning ? 'transitioning' : ''}`}
            onClick={handleNext}
          >
            <div className="suggestion-card-content">
              <div className="suggestion-name">{nextSuggestion.name}</div>
              <div className="suggestion-phone">{nextSuggestion.phone}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}