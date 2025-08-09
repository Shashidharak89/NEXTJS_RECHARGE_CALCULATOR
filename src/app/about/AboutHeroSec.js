'use client';

import React from 'react';
import './styles/AboutHeroSec.css';

const AboutHeroSec = () => {
  return (
    <section className="gamenex-about-hero-section">
      <div className="gamenex-about-hero-container">
        {/* Main Content */}
        <div className="gamenex-about-hero-content">
          <div className="gamenex-about-hero-header">
            <h1 className="gamenex-about-hero-title">About GameNexPlay</h1>
            <p className="gamenex-about-hero-subtitle">
              Where Gaming Meets Innovation - Connecting Players Worldwide
            </p>
          </div>

          {/* Stats Section */}
          <div className="gamenex-about-hero-stats">
            <div className="gamenex-hero-stat-card gamenex-stat-purple">
              <div className="gamenex-stat-number">2M+</div>
              <div className="gamenex-stat-label">Active Players</div>
            </div>
            
            <div className="gamenex-hero-stat-card gamenex-stat-blue">
              <div className="gamenex-stat-number">500+</div>
              <div className="gamenex-stat-label">Games</div>
            </div>
            
            <div className="gamenex-hero-stat-card gamenex-stat-yellow">
              <div className="gamenex-stat-number">24/7</div>
              <div className="gamenex-stat-label">Support</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="gamenex-hero-decoration">
          <div className="gamenex-hero-circle gamenex-circle-purple"></div>
          <div className="gamenex-hero-circle gamenex-circle-blue"></div>
          <div className="gamenex-hero-circle gamenex-circle-yellow"></div>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSec;