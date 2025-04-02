// Define a simplified standalone version of the app
const SimpleApp = () => {
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [selectedEffect, setSelectedEffect] = React.useState(null);
  const [processedImage, setProcessedImage] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [gallery, setGallery] = React.useState([]);
  
  // Effects list
  const effects = [
    { id: 'grayscale', name: 'Grayscale', description: 'Convert image to black and white' },
    { id: 'sepia', name: 'Sepia', description: 'Apply a vintage sepia tone' },
    { id: 'blur', name: 'Blur', description: 'Apply a gaussian blur effect' },
    { id: 'negative', name: 'Negative', description: 'Invert image colors' },
    { id: 'sketch', name: 'Sketch', description: 'Convert image to pencil sketch' }
  ];
  
  // Fetch gallery images on mount
  React.useEffect(() => {
    fetchGallery();
  }, []);

  // Fetch images from API
  const fetchGallery = async () => {
    try {
      const response = await axios.get('/api/images');
      setGallery(response.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery images');
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setProcessing(true);
    
    axios.post('/api/upload', formData)
      .then(response => {
        setUploadedImage(response.data);
        setProcessing(false);
      })
      .catch(err => {
        console.error('Error uploading image:', err);
        setError('Failed to upload image');
        setProcessing(false);
      });
  };

  // Handle effect selection
  const handleEffectSelect = (effectId) => {
    setSelectedEffect(effectId);
  };

  // Process image with selected effect
  const processImage = () => {
    if (!uploadedImage || !selectedEffect) {
      setError('Please upload an image and select an effect');
      return;
    }
    
    setProcessing(true);
    
    axios.post('/api/process', {
      filename: uploadedImage.filename,
      effect: selectedEffect
    })
      .then(response => {
        setProcessedImage(response.data);
        fetchGallery();
        setProcessing(false);
      })
      .catch(err => {
        console.error('Error processing image:', err);
        setError('Failed to process image');
        setProcessing(false);
      });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <header className="mb-5 text-center">
        <h1 className="display-5 fw-bold mb-3">
          <i className="fas fa-magic me-3"></i>
          AI Image Processor
        </h1>
        <p className="lead mb-4">
          Upload an image and apply various transformations to create stunning effects
        </p>
        <hr className="my-4" />
      </header>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="row g-4">
        <div className="col-md-8">
          {/* Image uploader */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="h5 mb-0">Upload an Image</h3>
            </div>
            <div className="card-body">
              <div className="upload-area p-4 text-center">
                <input 
                  type="file" 
                  id="image-upload" 
                  className="d-none" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={handleFileUpload}
                />
                <label htmlFor="image-upload" className="mb-0 w-100">
                  <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <h4 className="h5">Drop your image here or click to browse</h4>
                  <p className="text-muted">Supports JPG, JPEG, PNG up to 16MB</p>
                </label>
              </div>
              
              {uploadedImage && (
                <div className="mt-3 text-center">
                  <h4 className="h6 mb-2">Original Image</h4>
                  <img 
                    src={uploadedImage.url} 
                    alt="Original" 
                    className="img-fluid rounded mb-3" 
                    style={{maxHeight: '300px'}} 
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Effects selection */}
          {uploadedImage && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="h5 mb-0">Choose an Effect</h3>
              </div>
              <div className="card-body">
                <div className="row row-cols-2 row-cols-md-3 g-3">
                  {effects.map(effect => (
                    <div className="col" key={effect.id}>
                      <div 
                        className={`card h-100 option-card ${selectedEffect === effect.id ? 'selected' : ''}`}
                        onClick={() => handleEffectSelect(effect.id)}
                      >
                        <div className="card-body text-center">
                          <h5 className="card-title h6">{effect.name}</h5>
                          <p className="card-text small">{effect.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedEffect && (
                  <div className="mt-4 d-grid gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={processImage}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Process Image'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Processed image */}
          {processedImage && (
            <div className="card mb-4">
              <div className="card-header bg-success bg-opacity-25">
                <h3 className="h5 mb-0">Processing Complete</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h4 className="h6 mb-2">Original Image</h4>
                    <img 
                      src={uploadedImage.url} 
                      alt="Original" 
                      className="img-fluid rounded mb-3" 
                    />
                  </div>
                  <div className="col-md-6">
                    <h4 className="h6 mb-2">Processed Image</h4>
                    <img 
                      src={processedImage.url} 
                      alt="Processed" 
                      className="img-fluid rounded mb-3" 
                    />
                    <a 
                      href={processedImage.url} 
                      download 
                      className="btn btn-outline-success btn-sm mt-2"
                    >
                      <i className="fas fa-download me-2"></i>
                      Download Image
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Gallery */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="h5 mb-0">Recently Processed Images</h3>
            </div>
            <div className="card-body gallery-container">
              {gallery.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-images fa-2x mb-3"></i>
                  <p>No processed images yet</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {gallery.map(image => (
                    <div key={image.id} className="card image-card">
                      <div className="row g-0">
                        <div className="col-4">
                          <img 
                            src={image.original_url} 
                            className="img-fluid rounded-start" 
                            alt="Original"
                          />
                        </div>
                        <div className="col-8">
                          <div className="card-body py-2 px-3">
                            <h6 className="card-title small mb-1">
                              Effect: {image.effect}
                            </h6>
                            <a 
                              href={image.processed_url} 
                              target="_blank" 
                              className="btn btn-sm btn-outline-primary mt-2"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the simplified app
ReactDOM.render(
  <SimpleApp />,
  document.getElementById('root')
);
