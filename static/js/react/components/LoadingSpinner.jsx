// LoadingSpinner.jsx
const LoadingSpinner = ({ size = "md" }) => {
  const spinnerSize = size === "sm" ? "spinner-border-sm" : "";
  
  return (
    <div className={`spinner-border ${spinnerSize} text-primary me-2`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};
