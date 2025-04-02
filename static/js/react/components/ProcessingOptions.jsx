// ProcessingOptions.jsx
const ProcessingOptions = ({ effects, selectedEffect, onEffectSelect }) => {
  return (
    <div className="row row-cols-2 row-cols-md-3 g-3">
      {effects.map((effect) => (
        <div className="col" key={effect.id}>
          <div 
            className={`card h-100 option-card ${selectedEffect === effect.id ? 'selected' : ''}`}
            onClick={() => onEffectSelect(effect.id)}
          >
            <div className="card-body text-center">
              <i className={`fas ${effect.icon} fa-2x mb-3 text-primary`}></i>
              <h5 className="card-title h6">{effect.name}</h5>
              <p className="card-text small text-muted">{effect.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
