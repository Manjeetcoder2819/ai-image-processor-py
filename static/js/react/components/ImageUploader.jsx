// ImageUploader.jsx
const ImageUploader = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const fileInputRef = React.useRef(null);
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  // Process the selected file
  const handleFile = async (file) => {
    // Check file type
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFileTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, JPG, or PNG)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Upload file to server
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      setError(null);
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onImageUpload(response.data);
      setUploading(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
      setUploading(false);
    }
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="h4 mb-0">Upload an Image</h2>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close float-end" 
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}
        
        <div 
          className={`upload-area ${dragActive ? 'border-primary' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="d-none"
            onChange={handleChange}
            accept="image/jpeg, image/jpg, image/png"
          />
          
          {uploading ? (
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Uploading...</span>
              </div>
              <p className="mb-0">Uploading your image...</p>
            </div>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt upload-icon text-primary"></i>
              <h3 className="h5 mb-3">Drag & Drop an Image</h3>
              <p className="text-secondary mb-3">or click to browse from your device</p>
              <button className="btn btn-outline-primary">
                <i className="fas fa-image me-2"></i>
                Select Image
              </button>
              <p className="text-muted mt-3 mb-0 small">
                Supported formats: JPEG, JPG, PNG (Max size: 5MB)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
