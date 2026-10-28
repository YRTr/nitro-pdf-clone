# 📄 NitroPDF Pro Clone

A powerful, browser-based PDF and document editor built with vanilla JavaScript, mimicking the classic Microsoft Office / Nitro ribbon interface. This application allows users to open real PDF files, annotate them, apply digital signatures, and export compiled native PDFs—all client-side without a backend.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-Vanilla_JS-orange.svg)

---

## ✨ Features

- **Ribbon-Style UI:** Familiar tabbed navigation (Home, Edit, Review, Protect, Convert) with contextual controls for font size and color.
- **Native PDF Rendering:** Utilizes Mozilla's `pdf.js` to parse and render real, multi-page `.pdf` files onto HTML5 canvases.
- **Rich Interactive Annotations:** 
  - 📝 **Text:** Add, drag, and edit custom text boxes.
  - 🖍️ **Markup:** Highlight, Strikethrough, and Freehand drawing.
  - 🏷️ **Notes:** Draggable Sticky Notes for document review.
  - 🛑 **Stamps & Redactions:** Apply permanent redaction blocks and official rubber stamps (e.g., APPROVED, CONFIDENTIAL).
- **QuickSign™ Signature Pad:** Draw your signature on an interactive canvas pad or type it in a cursive font, then stamp it onto the document.
- **Client-Side Exporting:** Uses `pdf-lib` and `html2canvas` to compile your annotations, signatures, and base document layers into a new, downloadable `.pdf` file.
- **Data Extraction:** Export tabular data to Excel (`.csv`), layout to Word (`.doc`), or individual pages to `.png`.

---

## 🛠️ Tech Stack

This project is entirely client-side and relies on the following core libraries:

*   **[PDF.js (pdfjs-dist)](https://mozilla.github.io/pdf.js/)** – Renders existing PDF files to the viewport.
*   **[PDF-lib](https://pdf-lib.js.org/)** – Creates, modifies, and compiles the final downloadable native PDF.
*   **[html2canvas](https://html2canvas.hertzen.com/)** – Captures the DOM annotation layers and rasterizes them for PDF injection.
*   **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework for styling the Ribbon UI and workspace.
*   **[Lucide Icons](https://lucide.dev/)** – Crisp, modern vector icons for the toolbars.

---

## 🚀 Getting Started

You can run this project in two ways: as a quick standalone HTML file or as a modular local development environment.

### Option A: Quick Run (No Build Tools)
If you are using the single-file `app.js` version:
1. Clone this repository.
2. Open `index.html` in your web browser. 
*(Note: Some features like canvas exporting may require running through a local web server due to strict browser CORS policies on `file://` protocols).*

### Option B: Local Development (Recommended)
If you are using the modular ES6 architecture (`src/` folder):

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/nitro-pdf-clone.git](https://github.com/yourusername/nitro-pdf-clone.git)
   cd nitro-pdf-clone
