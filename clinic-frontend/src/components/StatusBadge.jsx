const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

export default function StatusBadge({ status }) {
  const known = Object.prototype.hasOwnProperty.call(STATUS_LABELS, status);
  const className = known ? `badge ${status}` : "badge";
  const label = known ? STATUS_LABELS[status] : "Unknown";

  return <span className={className}>{label.toUpperCase()}</span>;
}
