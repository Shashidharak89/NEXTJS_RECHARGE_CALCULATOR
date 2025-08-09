'use client';

import React, { useState, useEffect } from 'react';
import './styles/About.css';

const About = () => {
  const [isVisible, setIsVisible] = useState({});
  const [activeTab, setActiveTab] = useState('mission');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.gamenex-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const teamMembers = [
    {
      name: 'Alex Rodriguez',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150',
      bio: 'Gaming industry veteran with 15+ years of experience',
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      bio: 'Lead architect of our cutting-edge gaming platform',
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Community',
      image: '/api/placeholder/150/150',
      bio: 'Building bridges between gamers worldwide',
    },
    {
      name: 'Elena Vasquez',
      role: 'Game Designer',
      image: '/api/placeholder/150/150',
      bio: 'Creative mind behind our immersive gaming experiences',
    },
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Platform Launch',
      description: 'GameNexPlay goes live with 10,000 initial users',
    },
    {
      year: '2021',
      title: 'Mobile Expansion',
      description: 'Launched mobile app with cross-platform gameplay',
    },
    {
      year: '2022',
      title: 'Esports Integration',
      description: 'Introduced competitive gaming tournaments',
    },
    {
      year: '2023',
      title: 'Global Reach',
      description: 'Expanded to serve 2 million gamers worldwide',
    },
    {
      year: '2024',
      title: 'Innovation Award',
      description: 'Recognized as &apos;Best Gaming Platform&apos; by TechGaming',
    },
  ];

  const values = [
    {
      icon: '🎮',
      title: 'Gaming Excellence',
      description: 'Delivering premium gaming experiences with cutting-edge technology',
    },
    {
      icon: '🌐',
      title: 'Global Community',
      description: 'Connecting gamers from every corner of the world',
    },
    {
      icon: '⚡',
      title: 'Innovation',
      description: 'Constantly pushing boundaries in gaming technology',
    },
    {
      icon: '🤝',
      title: 'Fair Play',
      description: 'Ensuring safe, fair, and inclusive gaming environment',
    },
  ];

  return (
    <div className="gamenex-about-container">
      {/* Hero Section */}
      <section className="gamenex-hero-section">
        <div className="gamenex-hero-content">
          <h1 className="gamenex-hero-title">About GameNexPlay</h1>
          <p className="gamenex-hero-subtitle">
            Where Gaming Meets Innovation - Connecting Players Worldwide
          </p>
          <div className="gamenex-hero-stats">
            <div className="gamenex-stat">
              <span className="gamenex-stat-number">2M+</span>
              <span className="gamenex-stat-label">Active Players</span>
            </div>
            <div className="gamenex-stat">
              <span className="gamenex-stat-number">500+</span>
              <span className="gamenex-stat-label">Games</span>
            </div>
            <div className="gamenex-stat">
              <span className="gamenex-stat-number">24/7</span>
              <span className="gamenex-stat-label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Tabs */}
      <section
        id="mission-section"
        className={`gamenex-section gamenex-mission-section ${
          isVisible['mission-section'] ? 'gamenex-visible' : ''
        }`}
      >
        <div className="gamenex-container">
          <div className="gamenex-tabs">
            <button
              className={`gamenex-tab ${activeTab === 'mission' ? 'gamenex-tab-active' : ''}`}
              onClick={() => setActiveTab('mission')}
            >
              Our Mission
            </button>
            <button
              className={`gamenex-tab ${activeTab === 'vision' ? 'gamenex-tab-active' : ''}`}
              onClick={() => setActiveTab('vision')}
            >
              Our Vision
            </button>
            <button
              className={`gamenex-tab ${activeTab === 'values' ? 'gamenex-tab-active' : ''}`}
              onClick={() => setActiveTab('values')}
            >
              Our Values
            </button>
          </div>

          <div className="gamenex-tab-content">
            {activeTab === 'mission' && (
              <div className="gamenex-tab-panel">
                <h2>Our Mission</h2>
                <p>
                  To revolutionize the gaming industry by creating an immersive, accessible, and
                  innovative platform that brings gamers together from around the world. We strive
                  to deliver exceptional gaming experiences while fostering a positive and inclusive
                  community for all players.
                </p>
              </div>
            )}
            {activeTab === 'vision' && (
              <div className="gamenex-tab-panel">
                <h2>Our Vision</h2>
                <p>
                  To become the world&apos;s leading gaming platform that transcends boundaries,
                  creating meaningful connections through the power of gaming. We envision a
                  future where every gamer can discover, play, and excel in their favorite
                  games while building lasting friendships and communities.
                </p>
              </div>
            )}
            {activeTab === 'values' && (
              <div className="gamenex-tab-panel">
                <h2>Our Core Values</h2>
                <div className="gamenex-values-grid">
                  {values.map((value, index) => (
                    <div key={index} className="gamenex-value-card">
                      <div className="gamenex-value-icon">{value.icon}</div>
                      <h3>{value.title}</h3>
                      <p>{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section
        id="story-section"
        className={`gamenex-section gamenex-story-section ${
          isVisible['story-section'] ? 'gamenex-visible' : ''
        }`}
      >
        <div className="gamenex-container">
          <div className="gamenex-story-content">
            <div className="gamenex-story-text">
              <h2>Our Story</h2>
              <p>
                Founded in 2020 by a group of passionate gamers and tech enthusiasts,
                GameNexPlay was born from a simple yet powerful vision: to create the
                ultimate gaming platform that brings people together through shared
                experiences and competitive spirit.
              </p>
              <p>
                What started as a small project in a garage has evolved into a
                global platform serving millions of gamers worldwide. Our journey
                has been marked by continuous innovation, community building, and
                an unwavering commitment to excellence.
              </p>
            </div>
            <div className="gamenex-story-image">
              <div className="gamenex-image-placeholder">
                <span>🎮</span>
                <p>Gaming Innovation Since 2020</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section
        id="timeline-section"
        className={`gamenex-section gamenex-timeline-section ${
          isVisible['timeline-section'] ? 'gamenex-visible' : ''
        }`}
      >
        <div className="gamenex-container">
          <h2 className="gamenex-section-title">Our Journey</h2>
          <div className="gamenex-timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className="gamenex-timeline-item">
                <div className="gamenex-timeline-year">{milestone.year}</div>
                <div className="gamenex-timeline-content">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team-section"
        className={`gamenex-section gamenex-team-section ${
          isVisible['team-section'] ? 'gamenex-visible' : ''
        }`}
      >
        <div className="gamenex-container">
          <h2 className="gamenex-section-title">Meet Our Team</h2>
          <div className="gamenex-team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="gamenex-team-card">
                <div className="gamenex-team-image">
                  <div className="gamenex-avatar-placeholder">
                    <span>👤</span>
                  </div>
                </div>
                <div className="gamenex-team-info">
                  <h3>{member.name}</h3>
                  <p className="gamenex-team-role">{member.role}</p>
                  <p className="gamenex-team-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact-section"
        className={`gamenex-section gamenex-contact-section ${
          isVisible['contact-section'] ? 'gamenex-visible' : ''
        }`}
      >
        <div className="gamenex-container">
          <h2 className="gamenex-section-title">Get In Touch</h2>
          <div className="gamenex-contact-content">
            <div className="gamenex-contact-info">
              <div className="gamenex-contact-item">
                <div className="gamenex-contact-icon">📧</div>
                <div>
                  <h3>Email</h3>
                  <p>contact@gamenexplay.live</p>
                </div>
              </div>
              <div className="gamenex-contact-item">
                <div className="gamenex-contact-icon">🌐</div>
                <div>
                  <h3>Website</h3>
                  <p>www.gamenexplay.live</p>
                </div>
              </div>
              <div className="gamenex-contact-item">
                <div className="gamenex-contact-icon">💬</div>
                <div>
                  <h3>Support</h3>
                  <p>24/7 Live Chat Available</p>
                </div>
              </div>
            </div>
            <div className="gamenex-contact-form">
              <h3>Send us a message</h3>
              <form className="gamenex-form">
                <input type="text" placeholder="Your Name" className="gamenex-input" />
                <input type="email" placeholder="Your Email" className="gamenex-input" />
                <textarea
                  placeholder="Your Message"
                  className="gamenex-textarea"
                  rows="5"
                ></textarea>
                <button type="submit" className="gamenex-submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;