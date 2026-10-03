import React from 'react';
import { getStatusClass } from '../utils/helpers';

const Badge = ({ status }) => {
  if (!status) return null;
  return <span className={getStatusClass(status)}>{status}</span>;
};

export default Badge;
