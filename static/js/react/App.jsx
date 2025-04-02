// App.jsx
const App = () => {
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [selectedEffect, setSelectedEffect] = React.useState(null);
  const [processedImage, setProcessedImage] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [gallery, setGallery] = React.useState([]);
  const [loadingGallery, setLoadingGallery] = React.useState(true);

  // Effects object with names and descriptions
  const effects = [
    { id: 'grayscale', name: 'Grayscale', icon: 'fa-adjust', description: 'Convert image to black and white' },
    { id: 'sepia', name: 'Sepia', icon: 'fa-image', description: 'Apply a vintage sepia tone' },
    { id: 'blur', name: 'Blur', icon: 'fa-brush', description: 'Apply a gaussian blur effect' },
    { id: 'contour', name: 'Contour', icon: 'fa-draw-polygon', description: 'Highlight contours in the image' },
    { id: 'edge_enhance', name: 'Edge Enhance', icon: 'fa-border-style', description: 'Enhance edges in the image' },
    { id: 'emboss', name: 'Emboss', icon: 'fa-mountain', description: 'Create an embossed effect' },
    { id: 'sharpen', name: 'Sharpen', icon: 'fa-tachometer-alt', description: 'Increase image sharpness' },
    { id: 'brightness', name: 'Brightness', icon: 'fa-sun', description: 'Increase image brightness' },
    { id: 'contrast', name: 'Contrast', icon: 'fa-adjust', description: 'Enhance image contrast' },
    { id: 'negative', name: 'Negative', icon: 'fa-exchange-alt', description: 'Invert image colors' },
    { id: 'sketch', name: 'Sketch', icon: 'fa-pencil-alt', description: 'Convert image to pencil sketch' },
    { id: 'oil_painting', name: 'Oil Painting', icon: 'fa-palette', description: 'Create an oil painting effect' },
    { id: 'vintage', name: 'Vintage', icon: 'fa-camera-retro', description: 'Add a vintage film look' }
  ];

  // Fetch gallery images when component mounts
  React.useEffect(() => {
    fetchGallery();
  }, []);

  // Fetch all processed images
  const fetchGallery = async () => {
    try {
      setLoadingGallery(true);
      const response = await axios.get('/api/images');
      setGallery(response.data);
      setLoadingGallery(false);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery images');
      setLoadingGallery(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (uploadedImageData) => {
    setUploadedImage(uploadedImageData);
    setProcessedImage(null);
    setSelectedEffect(null);
    setError(null);
  };

  // Handle effect selection
  const handleEffectSelect = (effect) => {
    setSelectedEffect(effect);
    setProcessedImage(null);
    setError(null);
  };

  // Process the image with selected effect
  const processImage = async () => {
    if (!uploadedImage || !selectedEffect) {
      setError("Please upload an image and select an effect");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await axios.post('/api/process', {
        filename: uploadedImage.filename,
        effect: selectedEffect
      });

      setProcessedImage(response.data);
      await fetchGallery(); // Refresh the gallery after processing
      setProcessing(false);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.response?.data?.error || 'Failed to process image');
      setProcessing(false);
    }
  };

  // Get effect name from effect ID
  const getEffectName = (effectId) => {
    const effect = effects.find(effect => effect.id === effectId);
    return effect ? effect.name : effectId;
  };

  return (
    <div className="container py-4">
      <Header />
      
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="row g-4">
        <div className="col-md-8">
          <ImageUploader onImageUpload={handleImageUpload} />
          
          {uploadedImage && (
            <div className="mt-4">
              <h2 className="h4 mb-3">Choose an Effect</h2>
              <ProcessingOptions 
                effects={effects}
                selectedEffect={selectedEffect}
                onEffectSelect={handleEffectSelect}
              />
              
              {selectedEffect && (
                <div className="mt-4 d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={processImage}
                    disabled={processing}
                  >
                    {processing ? (
                      <><LoadingSpinner size="sm" /> Processing...</>
                    ) : (
                      <>Process Image with {getEffectName(selectedEffect)}</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {processedImage && (
            <div className="mt-4">
              <div className="card">
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
                      <h4 className="h6 mb-2">Processed with {getEffectName(processedImage.effect)}</h4>
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
            </div>
          )}
        </div>
        
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="h5 mb-0">Recently Processed Images</h3>
            </div>
            <div className="card-body">
              <Gallery 
                images={gallery}
                loading={loadingGallery}
                effects={effects}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
