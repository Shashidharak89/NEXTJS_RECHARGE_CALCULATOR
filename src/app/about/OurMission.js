'use client';

import React, { useState } from 'react';
import './styles/OurMission.css';

const OurMission = () => {
  const [activeTab, setActiveTab] = useState('mission');

  const content = {
    mission: {
      title: 'Our Mission',
      description: 'To create an inclusive gaming ecosystem that brings together players from all backgrounds, fostering connections through innovative gameplay experiences and cutting-edge technology.',
      icon: '🎯'
    },
    vision: {
      title: 'Our Vision',
      description: 'To be the world\'s leading gaming platform where creativity meets community, empowering millions of players to discover, play, and connect in ways never imagined before.',
      icon: '🔮'
    },
    values: {
      title: 'Our Values',
      description: 'Innovation, Integrity, Inclusivity, and Excellence drive everything we do. We believe in fair play, respect for all players, and continuously pushing the boundaries of what gaming can achieve.',
      icon: '⭐'
    }
  };

  return (
    <section className="gamenex-mission-section">
      <div className="gamenex-mission-container">
        {/* Tab Navigation */}
        <div className="gamenex-mission-tabs">
          <button
            className={`gamenex-tab-button ${activeTab === 'mission' ? 'gamenex-tab-active' : ''}`}
            onClick={() => setActiveTab('mission')}
          >
            Our Mission
          </button>
          <button
            className={`gamenex-tab-button ${activeTab === 'vision' ? 'gamenex-tab-active' : ''}`}
            onClick={() => setActiveTab('vision')}
          >
            Our Vision
          </button>
          <button
            className={`gamenex-tab-button ${activeTab === 'values' ? 'gamenex-tab-active' : ''}`}
            onClick={() => setActiveTab('values')}
          >
            Our Values
          </button>
        </div>

        {/* Content Area */}
        <div className="gamenex-mission-content">
          <div className="gamenex-content-card">
            <div className="gamenex-content-icon">
              {content[activeTab].icon}
            </div>
            <h2 className="gamenex-content-title">
              {content[activeTab].title}
            </h2>
            <p className="gamenex-content-description">
              {content[activeTab].description}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="gamenex-mission-decoration">
          <div className="gamenex-decoration-line gamenex-line-purple"></div>
          <div className="gamenex-decoration-line gamenex-line-blue"></div>
          <div className="gamenex-decoration-line gamenex-line-yellow"></div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;