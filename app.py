import os
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.utils import secure_filename
import uuid
import os

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Setup the base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy with the Base class
db = SQLAlchemy(model_class=Base)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Configure the SQLAlchemy database with PostgreSQL
database_url = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.logger.debug(f"Using database URL: {database_url}")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Ensure upload directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Initialize the app with the extension
db.init_app(app)

# Import image processor
from image_processor import process_image

# Import the models
with app.app_context():
    import models
    db.create_all()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/processed/<filename>')
def processed_file(filename):
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Generate a unique filename to avoid collisions
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    
    # Save the original file
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    return jsonify({
        'message': 'File uploaded successfully',
        'filename': unique_filename,
        'original_name': original_filename,
        'url': f'/uploads/{unique_filename}'
    })

@app.route('/api/process', methods=['POST'])
def process_image_route():
    data = request.json
    
    if not data or 'filename' not in data or 'effect' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    filename = data['filename']
    effect = data['effect']
    
    try:
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Generate a unique filename for the processed image
        file_extension = filename.rsplit('.', 1)[1].lower()
        processed_filename = f"{uuid.uuid4().hex}.{file_extension}"
        processed_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
        
        # Process the image with the specified effect
        success = process_image(original_path, processed_path, effect)
        
        if not success:
            return jsonify({'error': 'Failed to process image'}), 500
        
        # Save the image to database
        with app.app_context():
            new_image = models.Image(
                original_filename=filename,
                processed_filename=processed_filename,
                effect=effect
            )
            db.session.add(new_image)
            db.session.commit()
        
        return jsonify({
            'message': 'Image processed successfully',
            'processed_filename': processed_filename,
            'url': f'/processed/{processed_filename}',
            'effect': effect
        })
    
    except Exception as e:
        app.logger.error(f"Error processing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/images', methods=['GET'])
def get_images():
    try:
        with app.app_context():
            images = models.Image.query.order_by(models.Image.created_at.desc()).all()
            image_list = []
            
            for image in images:
                image_list.append({
                    'id': image.id,
                    'original_url': f'/uploads/{image.original_filename}',
                    'processed_url': f'/processed/{image.processed_filename}',
                    'effect': image.effect,
                    'created_at': image.created_at.isoformat()
                })
            
            return jsonify(image_list)
    
    except Exception as e:
        app.logger.error(f"Error retrieving images: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
