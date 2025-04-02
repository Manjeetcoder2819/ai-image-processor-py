// ImageCard.jsx
const ImageCard = ({ image, effectName }) => {
  return (
    <div className="card image-card mb-3">
      <div className="row g-0">
        <div className="col-5">
          <img 
            src={image.original_url} 
            className="img-fluid rounded-start" 
            alt="Original" 
          />
        </div>
        <div className="col-7">
          <div className="card-body p-2">
            <h6 className="card-title h6 mb-1">
              {effectName} <span className="badge bg-primary ms-1">AI</span>
            </h6>
            <img 
              src={image.processed_url} 
              className="img-fluid rounded mb-2" 
              alt="Processed" 
            />
            <div className="d-flex justify-content-end">
              <a 
                href={image.processed_url} 
                download 
                className="btn btn-sm btn-outline-primary"
              >
                <i className="fas fa-download"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
