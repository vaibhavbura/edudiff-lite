# EduDiff Lite
**ChatGPT-Style Learning with Verified Mathematical Visualizations**

EduDiff Lite integrates AI chat with verified mathematical animations to provide students with instant, correct visual intuition alongside text explanations.

## 🎯 Problem Statement
Students use AI tools like ChatGPT or Gemini to read explanations, but text alone fails to build geometric intuition. 

## 💡 Solution
**EduDiff = ChatGPT + Manim**

1.  **Student asks a question** (e.g., "Derivative is slope of tangent")
2.  **AI understands intent** (Calculus -> Geometric concept)
3.  **Strict Verification**: 
    -   If a **verified template** exists: Generate a 4-6s Manim animation.
    -   If **no safe visualization** exists: Return text explanation only.
4.  **Dual Output**: Text + Embedded Video (if safe).

## 🧩 Key Features
-   **Visual Honesty**: No wrong diagrams. We never generate unverified visuals.
-   **Deterministic Visuals**: Uses manually verified Manim templates, not diffusion models.
-   **Chat-Native Interface**: Next.js frontend with streaming responses and inline video.

## 🏛️ Architecture
-   **Frontend**: Next.js, Tailwind CSS, Framer Motion.
-   **Backend**: Flask, Manim Community (v0.19.1), Google Gemini (for text/classification).
-   **Safety**: Strict template registry preventing arbitrary code execution and incorrect math.

## ✅ Supported Visualizations
| Topic | Visualization Type |
| :--- | :--- |
| **Derivative** | Tangent slope moving along $f(x)=x^2$ |
| **Derivative (alt)** | Graph of $f(x)$ vs $f'(x)$ |
| **Pythagorean Theorem** | Geometric proof |
| **Integral** | Area under curve |
| **Trigonometry** | Unit circle (sin/cos) |
| **3D Surface** | Surface plot |
| **Linear Algebra** | Matrix multiplication, Eigenvalues |
| **Complex Numbers** | Complex plane vector |

## 🚀 Getting Started

### Backend
```bash
cd backend
python -m venv myvenv
.\myvenv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
