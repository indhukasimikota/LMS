// ── Date helpers ──────────────────────────────────────────────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toInputDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

// ── Status badge helpers ───────────────────────────────────────────────────────
export const getStatusClass = (status) => {
  switch (status) {
    case 'Issued':    return 'badge badge-issued';
    case 'Overdue':   return 'badge badge-overdue';
    case 'Returned':  return 'badge badge-returned';
    case 'Available': return 'badge badge-available';
    case 'Pending':   return 'badge badge-pending';
    case 'Paid':      return 'badge badge-paid';
    case 'On Time':   return 'badge badge-ontime';
    case 'Due Soon':  return 'badge badge-duesoon';
    default:          return 'badge';
  }
};

// ── Fine helpers ───────────────────────────────────────────────────────────────
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${Number(amount).toFixed(2)}`;
};

// ── Overdue days label ─────────────────────────────────────────────────────────
export const getDueDateStatus = (dueDate, status) => {
  if (status === 'Returned') return 'Returned';
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 3) return 'Due Soon';
  return 'On Time';
};

// ── Truncate text ──────────────────────────────────────────────────────────────
export const truncate = (str, max = 40) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};
