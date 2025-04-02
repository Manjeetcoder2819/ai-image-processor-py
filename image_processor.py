import os
import logging
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define the image processing effects
def apply_grayscale(img):
    return ImageOps.grayscale(img)

def apply_sepia(img):
    # Convert to numpy array
    img_array = np.array(img)
    
    # Apply sepia matrix
    sepia_matrix = np.array([
        [ 0.393, 0.769, 0.189],
        [ 0.349, 0.686, 0.168],
        [ 0.272, 0.534, 0.131]
    ])
    
    # Reshape for matrix multiplication
    r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
    
    # Apply the transformation
    sepia_r = np.clip(r * sepia_matrix[0,0] + g * sepia_matrix[0,1] + b * sepia_matrix[0,2], 0, 255).astype(np.uint8)
    sepia_g = np.clip(r * sepia_matrix[1,0] + g * sepia_matrix[1,1] + b * sepia_matrix[1,2], 0, 255).astype(np.uint8)
    sepia_b = np.clip(r * sepia_matrix[2,0] + g * sepia_matrix[2,1] + b * sepia_matrix[2,2], 0, 255).astype(np.uint8)
    
    # Combine channels
    sepia_img = np.stack((sepia_r, sepia_g, sepia_b), axis=2)
    
    return Image.fromarray(sepia_img)

def apply_blur(img, radius=2):
    return img.filter(ImageFilter.GaussianBlur(radius=radius))

def apply_contour(img):
    return img.filter(ImageFilter.CONTOUR)

def apply_edge_enhance(img):
    return img.filter(ImageFilter.EDGE_ENHANCE_MORE)

def apply_emboss(img):
    return img.filter(ImageFilter.EMBOSS)

def apply_sharpen(img):
    return img.filter(ImageFilter.SHARPEN)

def apply_brightness(img, factor=1.5):
    enhancer = ImageEnhance.Brightness(img)
    return enhancer.enhance(factor)

def apply_contrast(img, factor=1.5):
    enhancer = ImageEnhance.Contrast(img)
    return enhancer.enhance(factor)

def apply_cartoon(img):
    """Simplified cartoon effect using PIL's filters and NumPy"""
    # Apply edge detection
    edges = img.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.invert(edges)
    
    # Posterize the original image to reduce colors
    img_array = np.array(img)
    posterized = np.floor(img_array / 32) * 32
    posterized = np.clip(posterized, 0, 255).astype(np.uint8)
    color_img = Image.fromarray(posterized)
    
    # Smooth the colors
    color_img = color_img.filter(ImageFilter.SMOOTH_MORE)
    
    # Combine edges with posterized image
    alpha = 0.7  # Adjust for more/less edge visibility
    result = Image.blend(color_img, edges.convert('RGB'), alpha)
    
    return result

# Other processing functions will be defined below

def apply_sketch(img):
    # Convert to grayscale
    gray_img = ImageOps.grayscale(img)
    gray = np.array(gray_img)
    
    # Invert the grayscale image
    inverted = 255 - gray
    
    # Apply Gaussian blur
    blurred = np.array(Image.fromarray(inverted).filter(ImageFilter.GaussianBlur(radius=10)))
    
    # Blend the blurred and inverted image using dodge blend mode
    def dodge(front, back):
        result = back * 255.0 / (255.0 - front + 1e-6)
        result[result > 255] = 255
        result[front == 255] = 255
        return result.astype('uint8')
    
    sketch = dodge(blurred, gray)
    
    return Image.fromarray(sketch)

def apply_oil_painting(img):
    # Simplified oil painting effect using a combination of filters
    smoothed = img.filter(ImageFilter.SMOOTH_MORE)
    enhanced = ImageEnhance.Sharpness(smoothed).enhance(2.0)
    
    # Apply a slight posterization to reduce colors
    img_array = np.array(enhanced)
    posterized = np.floor(img_array / 32) * 32
    posterized[posterized > 255] = 255
    
    return Image.fromarray(posterized.astype(np.uint8))

def apply_negative(img):
    return ImageOps.invert(img)

def apply_vintage(img):
    # Add sepia tone
    sepia = apply_sepia(img)
    
    # Adjust contrast
    contrast = ImageEnhance.Contrast(sepia).enhance(0.8)
    
    # Add vignette effect (darkened edges)
    width, height = contrast.size
    mask = Image.new('L', (width, height), 255)
    
    # Create radial gradient for vignette
    for y in range(height):
        for x in range(width):
            # Distance from center (normalized to [0, 1])
            distance = ((x - width/2)**2 + (y - height/2)**2) ** 0.5
            distance = distance / (max(width, height) / 2)
            
            # Apply vignette based on distance
            intensity = int(255 * (1 - min(distance * 1.5, 1)**2))
            mask.putpixel((x, y), intensity)
    
    # Apply vignette
    return Image.composite(contrast, Image.new('RGB', contrast.size, (0, 0, 0)), mask)

def process_image(input_path, output_path, effect):
    """Process an image with the specified effect"""
    try:
        # Open the image file
        with Image.open(input_path) as img:
            # Convert image to RGB mode (in case it's in pallete mode)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Apply the selected effect
            if effect == 'grayscale':
                processed_img = apply_grayscale(img)
            elif effect == 'sepia':
                processed_img = apply_sepia(img)
            elif effect == 'blur':
                processed_img = apply_blur(img)
            elif effect == 'contour':
                processed_img = apply_contour(img)
            elif effect == 'edge_enhance':
                processed_img = apply_edge_enhance(img)
            elif effect == 'emboss':
                processed_img = apply_emboss(img)
            elif effect == 'sharpen':
                processed_img = apply_sharpen(img)
            elif effect == 'brightness':
                processed_img = apply_brightness(img)
            elif effect == 'contrast':
                processed_img = apply_contrast(img)
            elif effect == 'negative':
                processed_img = apply_negative(img)
            elif effect == 'sketch':
                processed_img = apply_sketch(img)
            elif effect == 'oil_painting':
                processed_img = apply_oil_painting(img)
            elif effect == 'vintage':
                processed_img = apply_vintage(img)
            else:
                logger.error(f"Unknown effect: {effect}")
                return False
            
            # Save the processed image
            if processed_img.mode != 'RGB':
                processed_img = processed_img.convert('RGB')
            processed_img.save(output_path)
            logger.info(f"Image processed with {effect} effect and saved to {output_path}")
            return True
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return False
