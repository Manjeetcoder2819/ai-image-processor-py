// ErrorAlert.jsx
const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <i className="fas fa-exclamation-circle me-2"></i>
      {message}
      <button 
        type="button" 
        className="btn-close" 
        onClick={onClose}
        aria-label="Close"
      ></button>
    </div>
  );
};
