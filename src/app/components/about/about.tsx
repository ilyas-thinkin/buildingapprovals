"use client";

import React from 'react';
import './about.css';

const About: React.FC = () => {
  const stats = [
    { label: 'Projects Delivered', value: '500+' },
    { label: 'Authority Approvals', value: '25+' },
    { label: 'Avg. Approval Time', value: '7-14 days' },
    { label: 'Client Satisfaction', value: '4.9/5' },
  ];

  const differentiators = [
    'One-stop approval command center for 20+ Dubai authorities',
    'Single point of contact, no multiple consultant loops',
    'Centralized tracking across all approvals',
    'End-to-end management from submission to completion',
    'Guaranteed, committed timelines with real-time progress updates',
    'Authority relationship advantage for faster routing',
    'Direct working relationships with key authority stakeholders',
    'Deep understanding of latest regulations and requirements',
  ];

  const milestones = [
    {
      title: 'Founded in Dubai',
      description: 'Set out to simplify authority approvals for businesses across the UAE.'
    },
    {
      title: 'Scaled Expertise',
      description: 'A multidisciplinary team covering fire, utilities, community and zoning approvals.'
    },
    {
      title: 'Faster Turnarounds',
      description: 'Refined processes to deliver faster approvals with clearer client communication.'
    },
    {
      title: 'Future Ready',
      description: 'Expanding smart workflows and partnerships to keep clients ahead of regulation.'
    },
  ];

  return (
    <section className="about-shell" id="about">
      <div className="about-hero">
        <div className="about-badge">Dubai-based Approval Experts</div>
        <h1 className="about-title">We streamline every authority approval you need.</h1>
        <p className="about-subtitle">
          From Civil Defense to DEWA, municipality and community NOCs, we manage the process end-to-end so you can focus on delivery.
        </p>
      </div>

      <div className="about-panels">
        <div className="about-panel">
          <h2>What drives us</h2>
          <p>
            We believe approvals should be predictable, transparent, and fast. Our consultants translate complex requirements into a clear plan, coordinate with authorities, and keep you updated at every step.
          </p>
        </div>
        <div className="about-panel about-panel-accent">
          <h2>How we work</h2>
          <ul>
            <li><span>01</span> Precise requirement mapping and document prep</li>
            <li><span>02</span> Direct coordination with relevant authorities</li>
            <li><span>03</span> Proactive follow-ups to compress timelines</li>
            <li><span>04</span> Clear updates so you always know the status</li>
          </ul>
        </div>
      </div>

      <div className="about-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="about-stat-card">
            <div className="about-stat-value">{stat.value}</div>
            <div className="about-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="about-diff">
        <div className="about-diff-copy">
          <p className="about-diff-kicker">Why partners choose us</p>
          <h3 className="about-diff-title">What makes us stand out from the rest</h3>
          <ul className="about-diff-list">
            {differentiators.map((item) => (
              <li key={item}>
                <span className="about-diff-icon">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a href="/services" className="about-diff-cta">Check Our Services</a>
        </div>
        <div className="about-diff-visual" role="presentation" />
      </div>

      <div className="about-timeline">
        <h3 className="about-timeline-title">We are</h3>
        <div className="about-timeline-grid">
          {milestones.map((item) => (
            <div key={item.title} className="about-timeline-card">
              <div className="about-timeline-heading">{item.title}</div>
              <p className="about-timeline-copy">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
