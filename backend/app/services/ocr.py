import io
import os
import re
import shutil
from typing import Dict, Any, List, Optional
from PIL import Image
import pytesseract
import pymupdf
import docx

# Configure Tesseract binary path dynamically
def configure_tesseract() -> str:
    possible_paths = [
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
        "/usr/bin/tesseract",
        shutil.which("tesseract")
    ]
    for path in possible_paths:
        if path and os.path.exists(path) and os.access(path, os.X_OK):
            pytesseract.pytesseract.tesseract_cmd = path
            return path
    return "tesseract"

TESSERACT_BIN = configure_tesseract()

class OCRService:
    def __init__(self):
        configure_tesseract()

    def extract_from_image(self, image_bytes: bytes) -> str:
        """
        Extract text from an image (PNG, JPG, TIFF, etc.) using Tesseract OCR.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if necessary
            if image.mode not in ("L", "RGB"):
                image = image.convert("RGB")
            
            # OCR with pytesseract
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            raise RuntimeError(f"OCR image extraction failed: {str(e)}")

    def extract_from_pdf(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract text from PDF.
        Supports:
        1. Native vector text extraction.
        2. Automatic fallback to OCR for scanned PDFs or low-text pages.
        3. Invisible/White text fraud detection (0xFFFFFF or font size <= 1.0pt).
        """
        doc = None
        try:
            doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
            page_count = len(doc)
            extracted_pages_text: List[str] = []
            hidden_text_snippets: List[str] = []
            used_ocr = False

            for page_idx in range(page_count):
                page = doc[page_idx]
                
                # Check for hidden/white text (anti-fraud detection)
                try:
                    page_dict = page.get_text("dict")
                    for block in page_dict.get("blocks", []):
                        if "lines" in block:
                            for line in block["lines"]:
                                for span in line.get("spans", []):
                                    text_span = span.get("text", "").strip()
                                    if not text_span:
                                        continue
                                    color = span.get("color")
                                    size = span.get("size", 10)
                                    # White in RGB is 0xFFFFFF (16777215)
                                    # Or font size <= 1.2pt (micro text stuffing)
                                    is_white = color in (16777215, 0xFFFFFF)
                                    is_micro = size <= 1.2
                                    if is_white or is_micro:
                                        hidden_text_snippets.append(text_span)
                except Exception:
                    pass

                # Extract standard native text
                page_text = page.get_text("text").strip()

                # If page has very little or no native text, run OCR on the rendered page
                if len(page_text) < 50:
                    try:
                        # Render page to high-res image
                        pix = page.get_pixmap(dpi=200)
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        ocr_page_text = pytesseract.image_to_string(img).strip()
                        if len(ocr_page_text) > len(page_text):
                            page_text = ocr_page_text
                            used_ocr = True
                    except Exception:
                        pass

                extracted_pages_text.append(page_text)

            full_text = "\n\n".join(extracted_pages_text).strip()
            
            method = "ocr_pdf" if used_ocr else "native_pdf"
            if not full_text and page_count > 0:
                # If still empty, force OCR on all pages
                ocr_texts = []
                for page in doc:
                    pix = page.get_pixmap(dpi=200)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    ocr_texts.append(pytesseract.image_to_string(img).strip())
                full_text = "\n\n".join(ocr_texts).strip()
                method = "ocr_pdf"

            return {
                "raw_text": full_text,
                "page_count": page_count,
                "extraction_method": method,
                "is_scanned": used_ocr or method == "ocr_pdf",
                "has_hidden_text": len(hidden_text_snippets) > 0,
                "hidden_text_snippets": hidden_text_snippets[:10]  # sample top 10
            }
        except Exception as e:
            raise RuntimeError(f"PDF extraction failed: {str(e)}")
        finally:
            if doc is not None:
                try:
                    doc.close()
                except Exception:
                    pass

    def extract_from_docx(self, docx_bytes: bytes) -> Dict[str, Any]:
        """
        Extract text from DOCX document including paragraphs and tables.
        """
        try:
            doc = docx.Document(io.BytesIO(docx_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            
            # Also extract text from tables
            table_texts = []
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_text:
                        table_texts.append(row_text)

            full_text = "\n".join(paragraphs + table_texts).strip()
            return {
                "raw_text": full_text,
                "page_count": max(1, len(paragraphs) // 25),
                "extraction_method": "docx",
                "is_scanned": False,
                "has_hidden_text": False,
                "hidden_text_snippets": []
            }
        except Exception as e:
            raise RuntimeError(f"DOCX extraction failed: {str(e)}")

    def process_file(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Universal file dispatcher: handles PDF, DOCX, TXT, and Images (PNG, JPG, TIFF, etc.).
        """
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            return self.extract_from_pdf(file_bytes)
        elif ext in (".docx", ".doc"):
            return self.extract_from_docx(file_bytes)
        elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
            text = self.extract_from_image(file_bytes)
            return {
                "raw_text": text,
                "page_count": 1,
                "extraction_method": "ocr_image",
                "is_scanned": True,
                "has_hidden_text": False,
                "hidden_text_snippets": []
            }
        elif ext in (".txt", ".md"):
            try:
                text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                text = file_bytes.decode("latin-1", errors="ignore")
            return {
                "raw_text": text.strip(),
                "page_count": 1,
                "extraction_method": "plain_text",
                "is_scanned": False,
                "has_hidden_text": False,
                "hidden_text_snippets": []
            }
        else:
            # Try PDF first as fallback, then image
            try:
                return self.extract_from_pdf(file_bytes)
            except Exception:
                try:
                    text = self.extract_from_image(file_bytes)
                    return {
                        "raw_text": text,
                        "page_count": 1,
                        "extraction_method": "ocr_fallback",
                        "is_scanned": True,
                        "has_hidden_text": False,
                        "hidden_text_snippets": []
                    }
                except Exception:
                    raise ValueError(f"Unsupported file format: {ext}")

ocr_service = OCRService()
