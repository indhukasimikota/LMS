import React from 'react';

const StatCard = ({ icon, label, value, color = 'blue', sub }) => (
  <div className={`stat-card stat-card-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value ?? '—'}</h2>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

export default StatCard;
