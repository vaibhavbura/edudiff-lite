from flask import Flask, render_template, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
import os
import sys
import shutil
import logging
import uuid
import subprocess
from datetime import datetime
import random
from dotenv import load_dotenv
from manim import config

# Import the new service
from edudiff.services.manim_service import ManimService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, 
    static_url_path='/static',
    static_folder='static')
CORS(app)

app.logger.setLevel(logging.INFO)

# Configure Manim
config.media_dir = "media"
config.video_dir = "videos"
config.images_dir = "images"
config.text_dir = "texts"
config.tex_dir = "tex"
config.log_dir = "log"
config.renderer = "cairo"
config.text_renderer = "cairo"
config.use_opengl_renderer = False

# Set up required directories
def setup_directories():
    """Create all required directories for the application"""
    directories = [
        os.path.join(app.root_path, 'static'),
        os.path.join(app.root_path, 'static', 'videos'),
        os.path.join(app.root_path, 'tmp'),
        os.path.join(app.root_path, 'media'),
        os.path.join(app.root_path, 'media', 'videos'),
        os.path.join(app.root_path, 'media', 'videos', 'scene'),
        os.path.join(app.root_path, 'media', 'videos', 'scene', '720p30'),
        os.path.join(app.root_path, 'media', 'videos', 'scene', '1080p60')
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        app.logger.info(f'Created directory: {directory}')

# Set up directories at startup
setup_directories()

# Ensure static directory exists
os.makedirs(os.path.join(app.root_path, 'static', 'videos'), exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- GenAI / rendering defaults ---------------------------------------------
RENDER_QUALITY_DEFAULT = os.getenv('RENDER_QUALITY', 'low').lower()

# Set media and temporary directories with fallback to local paths
if os.environ.get('DOCKER_ENV'):
    app.config['MEDIA_DIR'] = os.getenv('MEDIA_DIR', '/app/media')
    app.config['TEMP_DIR'] = os.getenv('TEMP_DIR', '/app/tmp')
else:
    app.config['MEDIA_DIR'] = os.path.join(os.path.dirname(__file__), 'media')
    app.config['TEMP_DIR'] = os.path.join(os.path.dirname(__file__), 'tmp')

# Ensure directories exist
os.makedirs(app.config['MEDIA_DIR'], exist_ok=True)
os.makedirs(app.config['TEMP_DIR'], exist_ok=True)
os.makedirs(os.path.join(app.config['MEDIA_DIR'], 'videos', 'scene', '720p30'), exist_ok=True)
os.makedirs(os.path.join(app.static_folder, 'videos'), exist_ok=True)


def sanitize_input(text):
    """Sanitize input text by removing extra whitespace and newlines"""
    return ' '.join(text.strip().split())

@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        concept = request.json.get('concept', '')
        if not concept:
            return jsonify({'error': 'No concept provided'}), 400
            
        concept = sanitize_input(concept)
        
        # Determine render quality
        quality_requested = request.json.get('quality', RENDER_QUALITY_DEFAULT).lower()
        if quality_requested not in {'low', 'medium', 'high'}:
            quality_requested = RENDER_QUALITY_DEFAULT
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        random_str = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=6))
        filename = f'scene_{timestamp}_{random_str}'
        
        # Create temporary directory for this generation
        temp_dir = os.path.join(app.config['TEMP_DIR'], filename)
        os.makedirs(temp_dir, exist_ok=True)
        
        try:
            # Generate Manim code using the service
            try:
                result = ManimService.generate_code(concept)
                
                # Unpack result based on length (backward compatibility)
                if isinstance(result, tuple):
                    if len(result) == 3:
                        manim_code, used_ai, viz_type = result
                    else:
                        manim_code, used_ai = result
                        viz_type = "unknown"
                else:
                    manim_code = result
                    # Default values if tuple not returned
                    used_ai = True 
                    viz_type = "legacy"
                
                # Update loop or other logic if needed based on viz_type
                logger.info(f"Generated code type: {viz_type}, used_ai: {used_ai}")
                
            except ValueError as ve:
                logger.error(f'Manim code validation failed: {ve}')
                return jsonify({
                    'error': 'Failed to generate valid Manim code',
                    'details': str(ve)
                }), 500
            except Exception as gen_err:
                logger.error(f'Error generating Manim code: {gen_err}', exc_info=True)
                return jsonify({
                    'error': 'Failed to generate Manim code',
                    'details': str(gen_err)
                }), 500
            
            if not manim_code:
                # No verification template found -> Return explanation only (Safety Policy)
                logger.info("No visualization generated (strict safety). Returning explanation only.")
                explanation = ManimService.generate_explanation(concept)
                return jsonify({
                    'success': True,
                    'visualization_generated': False,
                    'visualization_type': 'none',
                    'explanation': explanation,
                    'video_url': None,
                    'code': None
                })
            
            # Write code to temporary file
            code_file = os.path.join(temp_dir, 'scene.py')
            with open(code_file, 'w', encoding='utf-8') as f:
                f.write(manim_code)
            
            # Create media directory
            media_dir = os.path.join(temp_dir, 'media')
            os.makedirs(media_dir, exist_ok=True)
            
            # Determine manim quality flag
            quality_flag = {'low': '-ql', 'medium': '-qm', 'high': '-qh'}[quality_requested]
            
            # Run manim command with error handling
            output_file = os.path.join(app.static_folder, 'videos', f'{filename}.mp4')
            command = [
                sys.executable,  # Use current Python interpreter
                '-m', 'manim',
                'render',
                quality_flag,
                '--format', 'mp4',
                '--media_dir', media_dir,
                code_file,
                'MainScene'
            ]
            
            try:
                result = subprocess.run(
                    command,
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    timeout=300  # 5 minute timeout
                )
                
                if result.returncode != 0:
                    # Capture both stderr and stdout for better error reporting
                    error_msg = result.stderr if result.stderr else result.stdout if result.stdout else 'Unknown error during animation generation'
                    logger.error(f'Manim execution failed (returncode={result.returncode})')
                    logger.error(f'Manim stderr: {result.stderr}')
                    logger.error(f'Manim stdout: {result.stdout}')
                    # Raise RuntimeError as requested, but we'll catch it in the outer handler
                    raise RuntimeError(f'Manim render failed: {error_msg}')
                
                # Look for the video file in multiple possible locations
                possible_paths = [
                    os.path.join(media_dir, 'videos', 'scene', '1080p60', 'MainScene.mp4'),
                    os.path.join(media_dir, 'videos', 'scene', '720p30', 'MainScene.mp4'),
                    os.path.join(media_dir, 'videos', 'scene', '480p15', 'MainScene.mp4'),  # low-quality default in manim 0.17
                    os.path.join(media_dir, 'videos', 'MainScene.mp4'),
                    os.path.join(temp_dir, 'MainScene.mp4')
                ]
                
                video_found = False
                for source_path in possible_paths:
                    if os.path.exists(source_path):
                        shutil.move(source_path, output_file)
                        video_found = True
                        break
                
                # Fallback: walk media_dir recursively to locate the file
                if not video_found:
                    for root, _dirs, files in os.walk(media_dir):
                        if 'MainScene.mp4' in files:
                            try:
                                shutil.move(os.path.join(root, 'MainScene.mp4'), output_file)
                                video_found = True
                                break
                            except Exception as move_err:
                                logger.error(f'Error moving located video: {move_err}')
                                # if move fails, continue searching
                                continue
                
                if not video_found:
                    logger.error(f'Video not found in any of these locations or recursively under media_dir: {possible_paths}')
                    return jsonify({'error': 'Generated video file not found'}), 500
                
                # Generate explanation using service
                explanation = ManimService.generate_explanation(concept)

                # Return success response
                return jsonify({
                    'success': True,
                    'video_url': url_for('static', filename=f'videos/{filename}.mp4'),
                    'code': manim_code,
                    'used_ai': used_ai,
                    'visualization_type': viz_type,
                    'visualization_generated': True,
                    'render_quality': quality_requested,
                    'explanation': explanation
                })
                
            except subprocess.TimeoutExpired:
                return jsonify({
                    'error': 'Animation generation timed out',
                    'details': 'The animation took too long to generate. Please try a simpler concept.'
                }), 500
            except RuntimeError as re:
                # Manim execution failed
                logger.error(f'Manim execution RuntimeError: {re}')
                return jsonify({
                    'error': 'Failed to generate animation',
                    'details': str(re)
                }), 500
                
        finally:
            # Cleanup temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)
            
    except Exception as e:
        logger.error(f'Error generating animation: {str(e)}', exc_info=True)
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f'Full traceback: {error_trace}')
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/static/videos/<path:filename>')
def serve_video(filename):
    """Serve video files from static/videos directory."""
    try:
        return send_from_directory(
            os.path.join(app.root_path, 'static', 'videos'),
            filename,
            mimetype='video/mp4'
        )
    except Exception as e:
        app.logger.error(f"Error serving video {filename}: {str(e)}")
        return jsonify({'error': 'Video not found'}), 404

@app.route('/demos', methods=['GET'])
def get_demos():
    """Return the 4 specific demo GIFs for the landing page."""
    # Define the 4 specific demos in order with exact GIF filenames
    demos = [
        {
            'filename': 'differential_equations.gif',
            'title': 'Trigonometry',
            'description': 'Visualization of sine and cosine functions on the unit circle with animated angle.'
        },
        {
            'filename': '3d_calculus.gif',
            'title': '3D Surface Plot',
            'description': '3D visualization of the surface area of a cube with animations.'
        },
        {
            'filename': 'ComplexNumbersAnimation_ManimCE_v0.17.3.gif',
            'title': 'Complex Numbers',
            'description': 'Geometric interpretation of complex number operations with rotation and scaling.'
        },
        {
            'filename': 'TrigonometryAnimation_ManimCE_v0.17.3.gif',
            'title': 'Linear Algebra',
            'description': 'Differential equations to life by visualizing solution curves and phase spaces.'
        }
    ]
    
    videos = []
    for demo in demos:
        filepath = os.path.join(app.static_folder, 'gifs', demo['filename'])
        if os.path.exists(filepath):
            videos.append({
                'filename': demo['filename'],
                'title': demo['title'],
                'description': demo['description'],
                'url': url_for('static', filename=f'gifs/{demo["filename"]}')
            })
    
    return jsonify({'videos': videos})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
