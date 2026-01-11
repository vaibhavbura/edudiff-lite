import logging
import re
from ..manim_engine import templates
from ..llm import generator

logger = logging.getLogger(__name__)

class ManimService:
    @staticmethod
    def generate_code(concept):
        """
        Generate Manim code based on the concept with validation.
        
        Returns:
            tuple: (code, used_ai, visualization_type)
        """
        try:
            # Check if this is a LaTeX expression
            if templates.is_likely_latex(concept):
                return templates.generate_latex_scene_code(concept), False, "latex_render"
            
            # Try to use a template first
            result = templates.select_template(concept)
            if result:
                code, viz_type = result
                logger.info(f"Using template '{viz_type}' for concept: {concept}")
                return code, False, viz_type

            # STRICT SAFETY POLICY: Do NOT use AI generation if no verification template exists
            logger.info("No verified template found. Strict safety policy enabled: Skipping visualization.")
            return None, False, "none"
                
        except Exception as e:
            logger.error(f"Error generating Manim code: {str(e)}")
            raise

    @staticmethod
    def generate_explanation(concept):
        return generator.generate_explanation(concept)
