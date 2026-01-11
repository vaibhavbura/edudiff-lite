import os
import logging
import re
import google.generativeai as genai
from ..prompts.manim_prompts import generate_manim_prompt

logger = logging.getLogger(__name__)

# --- GenAI Configuration -----------------------------------------------------
GENAI_MODEL = os.getenv('GENAI_MODEL', 'gemini-2.5-flash')
genai_model = None

def init_genai():
    global genai_model
    try:
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Configure safety settings to block nothing
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            genai_model = genai.GenerativeModel(GENAI_MODEL, safety_settings=safety_settings)
            logger.info(f"GenAI initialized with model: {GENAI_MODEL} and safety settings: BLOCK_NONE")
        else:
            logger.warning("No GOOGLE_API_KEY or GEMINI_API_KEY found. AI features will be disabled.")
    except Exception as e:
        logger.error(f"Failed to initialize GenAI: {e}")

# Call init on module import (or we can call it explicitly from app.py, but module level is easier for now)
# However, env vars might not be loaded yet if this is imported before load_dotenv() is called in app.py
# Better to have a explicit init or a lazy loader. I'll make sure to call init_genai() or handle it.
# For now, let's keep it lazy or let app.py initialize it via an init function called after dotenv.
# But original code had it at top level. I will keep `init_genai` function and call it.

def extract_text(response) -> str:
    """
    Extract text from LLM response, handling both string content and structured content blocks.
    
    Args:
        response: LLM response object (Gemini API response)
        
    Returns:
        str: Extracted text content, or empty string if none found
    """
    if not response:
        logger.warning("extract_text: response is None or empty")
        return ""
    
    # Log raw response for debugging (once) - use INFO level so it's visible
    try:
        logger.info(f"Raw LLM response type: {type(response)}")
        logger.info(f"Raw LLM response has attributes: {[attr for attr in dir(response) if not attr.startswith('_')]}")
        
        # Try to log the actual structure
        if hasattr(response, 'candidates'):
            logger.info(f"Response has candidates: {response.candidates is not None}")
            if response.candidates:
                logger.info(f"Number of candidates: {len(response.candidates)}")
                if len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    logger.info(f"First candidate type: {type(candidate)}")
                    logger.info(f"First candidate attributes: {[attr for attr in dir(candidate) if not attr.startswith('_')]}")
                    if hasattr(candidate, 'content'):
                        logger.info(f"Candidate content type: {type(candidate.content)}")
                        if hasattr(candidate.content, 'parts'):
                            logger.info(f"Content parts type: {type(candidate.content.parts)}, length: {len(candidate.content.parts) if candidate.content.parts else 0}")
                            if candidate.content.parts:
                                logger.info(f"First part type: {type(candidate.content.parts[0])}")
                                logger.info(f"First part: {candidate.content.parts[0]}")
    except Exception as e:
        logger.error(f"Error logging raw response: {e}", exc_info=True)
    
    # Try direct text attribute first (Gemini API simple case)
    # Also try calling it as a method if it's callable
    if hasattr(response, 'text'):
        try:
            text_attr = response.text
            # If text is a property/method, try calling it
            if callable(text_attr):
                text_attr = text_attr()
            if text_attr and isinstance(text_attr, str) and text_attr.strip():
                logger.info("Extracted text from response.text attribute")
                return text_attr.strip()
        except Exception as e:
            logger.error(f"Error accessing response.text: {e}")
            # Also log prompt feedback if available
            if hasattr(response, 'prompt_feedback'):
                logger.error(f"Prompt feedback: {response.prompt_feedback}")
    
    # Try response.text as a method call (new Gemini SDK)
    try:
        if hasattr(response, 'text') and callable(getattr(response, 'text', None)):
            text_result = response.text()
            if text_result and isinstance(text_result, str) and text_result.strip():
                logger.info("Extracted text from response.text() method")
                return text_result.strip()
    except Exception as e:
        logger.debug(f"Error calling response.text(): {e}")
    
    # Try Gemini API structured format: candidates[0].content.parts (most common for Gemini)
    if hasattr(response, 'candidates'):
        try:
            candidates = response.candidates
            if candidates and len(candidates) > 0:
                candidate = candidates[0]
                if hasattr(candidate, 'content'):
                    content = candidate.content
                    if content:
                        # Try to get parts
                        parts = None
                        if hasattr(content, 'parts'):
                            parts = content.parts
                        elif hasattr(content, 'get') and callable(content.get):
                            # If content is dict-like
                            parts = content.get('parts')
                        
                        if parts:
                            text_parts = []
                            for part in parts:
                                # Handle different part types
                                part_text = None
                                
                                # Try as object with text attribute
                                if hasattr(part, 'text'):
                                    part_text = part.text
                                # Try as dict
                                elif isinstance(part, dict):
                                    part_text = part.get('text') or part.get('output_text')
                                # Try as string
                                elif isinstance(part, str):
                                    part_text = part
                                
                                if part_text:
                                    text_parts.append(str(part_text))
                            
                            if text_parts:
                                result = '\n'.join(text_parts).strip()
                                logger.info(f"Extracted text from candidates[0].content.parts ({len(text_parts)} parts, {len(result)} chars)")
                                return result
        except (AttributeError, IndexError, KeyError, TypeError) as e:
            logger.error(f"Error accessing candidates[0].content.parts: {e}", exc_info=True)
    
    # Try message.content if it exists (OpenAI-style format)
    if hasattr(response, 'choices') and response.choices:
        try:
            message = response.choices[0].message
            if hasattr(message, 'content'):
                content = message.content
                # If content is a non-empty string, return it
                if isinstance(content, str) and content.strip():
                    logger.info("Extracted text from choices[0].message.content (string)")
                    return content.strip()
                # If content is a list, extract text from blocks
                if isinstance(content, list):
                    text_parts = []
                    for block in content:
                        if isinstance(block, dict):
                            # Check for OpenAI-style blocks
                            if block.get('type') == 'text' and 'text' in block:
                                text_parts.append(str(block['text']))
                            # Check for output_text type
                            elif block.get('type') == 'output_text' and 'text' in block:
                                text_parts.append(str(block['text']))
                        elif hasattr(block, 'text'):
                            text_parts.append(str(block.text))
                    if text_parts:
                        result = '\n'.join(text_parts).strip()
                        logger.info(f"Extracted text from choices[0].message.content (list, {len(text_parts)} blocks)")
                        return result
        except (AttributeError, IndexError, KeyError, TypeError) as e:
            logger.debug(f"Error accessing choices[0].message.content: {e}")
    
    # Last resort: try to convert response to string or use __str__
    try:
        if hasattr(response, '__str__'):
            str_repr = str(response)
            if str_repr and str_repr.strip() and str_repr != str(type(response)):
                logger.warning("Extracted text using __str__ fallback (may not be accurate)")
                return str_repr.strip()
    except Exception as e:
        logger.debug(f"Error in __str__ fallback: {e}")
    
    # Log warning if no text found
    logger.error("extract_text: No text found in response using any extraction method")
    logger.error(f"Response type: {type(response)}, Response repr: {repr(response)[:500]}")
    return ""

def extract_code_from_response(text: str) -> str:
    if not text:
        return ""
    # Try fenced code blocks with language
    m = re.search(r"```(?:python)?\n([\s\S]*?)```", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return text.strip()


def sanitize_manim_code(code: str) -> str:
    """
    Sanitize Gemini-generated Manim code:
    - Remove markdown code fences
    - Strip leading explanation text
    - Start from 'from manim import' line
    """
    if not code:
        return ""
    
    # Remove markdown code fences if present
    code = re.sub(r'^```(?:python)?\s*\n', '', code, flags=re.MULTILINE)
    code = re.sub(r'\n```\s*$', '', code, flags=re.MULTILINE)
    
    # Find the line containing "from manim import"
    lines = code.split('\n')
    start_idx = 0
    for i, line in enumerate(lines):
        if 'from manim import' in line.lower():
            start_idx = i
            break
    
    # Extract code starting from 'from manim import'
    sanitized = '\n'.join(lines[start_idx:]).strip()
    
    return sanitized

def generate_ai_manim_code(concept: str) -> str:
    if genai_model is None:
        init_genai() # Try initializing if not already
        if genai_model is None:
             return ""
    try:
        # Backend guard: Detect equation-based questions
        concept_lower = concept.lower()
        equation_keywords = ["solve", "=", "equation", "find x", "find y"]
        is_equation = any(keyword in concept_lower for keyword in equation_keywords)
        
        # Use the strict prompt (it already handles equation detection, but we log it)
        full_prompt = generate_manim_prompt(concept)
        
        if is_equation:
            logger.info(f"Detected equation-solving question: {concept}")
        
        resp = genai_model.generate_content(
            contents=full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,  # Lower temperature for more deterministic output
            ),
        )
        
        # Extract text using helper function (logging happens inside extract_text)
        content = extract_text(resp)
        
        # Validate extracted content is not empty
        if not content or not content.strip():
            logger.error("LLM returned empty output")
            raise ValueError("LLM returned empty output")
        
        code = extract_code_from_response(content)
        
        # Sanitize the code: remove markdown, extract from 'from manim import'
        code = sanitize_manim_code(code)
        
        # Validate sanitized code is not empty
        if not code or not code.strip():
            logger.error("Extracted code is empty after sanitization")
            raise ValueError("LLM returned empty output")
        
        return code
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        return ""

def generate_explanation(concept):
    """Generate a short text explanation of the concept."""
    if genai_model is None:
        init_genai()
        if genai_model is None:
            return f"Here is a visual explanation of {concept}."
    try:
        prompt = (
            "You are a helpful math tutor. Provide a concise, 2-sentence explanation "
            "of the requested concept. Do not use LaTeX formatting, just plain text.\n\n"
            f"Concept: {concept}"
        )
        resp = genai_model.generate_content(
            contents=prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
            ),
        )
        
        # Extract text using helper function
        text = extract_text(resp)
        return text if text else f"Explanation of {concept}."
    except Exception as e:
        logger.error(f"Explanation generation failed: {e}")
        return f"Here is a visual explanation of {concept}."
