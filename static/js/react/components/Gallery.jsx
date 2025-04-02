// Gallery.jsx
const Gallery = ({ images, loading, effects }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner />
        <p className="mt-3">Loading gallery...</p>
      </div>
    );
  }
  
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-images fa-3x mb-3 text-secondary"></i>
        <p>No processed images yet.</p>
        <p className="text-muted small">Upload and process an image to see it here.</p>
      </div>
    );
  }
  
  // Get effect name from effect ID
  const getEffectName = (effectId) => {
    const effect = effects.find(effect => effect.id === effectId);
    return effect ? effect.name : effectId;
  };
  
  return (
    <div className="gallery-container">
      {images.slice(0, 10).map((image) => (
        <ImageCard 
          key={image.id}
          image={image}
          effectName={getEffectName(image.effect)}
        />
      ))}
    </div>
  );
};
