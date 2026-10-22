#!/usr/bin/env python
"""
Generate both resume PDFs from the private master markdown file.

Source of truth: Michael_Nault_Resume.md (repo root, private/gitignored).
Outputs:
  - static/resume/Michael_Nault_Resume.pdf       (site-safe: phone number dropped)
  - Michael_Nault_Resume_private.pdf              (repo root, gitignored: keeps the phone)

Usage: python tools/generate_resume_pdf.py
"""
import re
import sys
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Michael_Nault_Resume.md"
SITE_PDF = ROOT / "static" / "resume" / "Michael_Nault_Resume.pdf"
PRIVATE_PDF = ROOT / "Michael_Nault_Resume_private.pdf"

# Brand colors, matching src/css/tokens.css's light-theme values --
# the PDF should look like the same design system as the site, not a
# generic default ReportLab document.
NAVY = "#1F3A5F"
TEXT = "#1A1A1A"
MUTED = "#4A4F57"
BORDER = "#D9DEE5"


def esc(s: str) -> str:
    """Escape for ReportLab's mini-XML paragraph markup."""
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return s


def inline_md(s: str) -> str:
    """Convert **bold** to <b>, keep the rest as literal escaped text."""
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    return s


def parse_resume(text: str, keep_phone: bool):
    """Parse the specific, consistent structure this resume's markdown
    file uses. Not a general markdown parser -- tailored to this file."""
    text = text.replace("\r\n", "\n")
    # Strip the HTML comment header block.
    text = re.sub(r"^<!--.*?-->\s*", "", text, flags=re.S)

    lines = text.split("\n")
    i = 0
    name = ""
    contact_lines = []
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("# "):
            name = line[2:].strip()
            i += 1
            continue
        if name and line and not line.startswith("#"):
            contact_lines.append(line)
            i += 1
            if len(contact_lines) == 2:
                i += 1
                break
            continue
        i += 1

    if not keep_phone:
        contact_lines[0] = re.sub(r"\s*\|\s*\(\d{3}\)\s*\d{3}-\d{4}", "", contact_lines[0])

    body = "\n".join(lines[i:])
    sections = {}
    for m in re.finditer(r"^## (.+)$", body, flags=re.M):
        pass
    parts = re.split(r"^## (.+)$", body, flags=re.M)
    # parts[0] is anything before the first ##; then alternating heading/body
    for j in range(1, len(parts), 2):
        heading = parts[j].strip()
        content = parts[j + 1] if j + 1 < len(parts) else ""
        sections[heading] = content.strip("\n")

    return name, contact_lines, sections


def build_styles():
    return {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=20,
                                leading=24, textColor=NAVY, spaceAfter=3),
        "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9.5,
                                   leading=13, textColor=MUTED, spaceAfter=1),
        "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=11.5,
                                   leading=14, textColor=NAVY, spaceBefore=13, spaceAfter=2,
                                   letterSpacing=0.3),
        "summary": ParagraphStyle("summary", fontName="Helvetica", fontSize=9.75,
                                   leading=13.5, textColor=TEXT, spaceAfter=6),
        "skill": ParagraphStyle("skill", fontName="Helvetica", fontSize=9.5,
                                 leading=13, textColor=TEXT, spaceAfter=4,
                                 leftIndent=14, firstLineIndent=-10),
        "job_role": ParagraphStyle("job_role", fontName="Helvetica-Bold", fontSize=10,
                                    leading=12.5, textColor=TEXT),
        "job_date": ParagraphStyle("job_date", fontName="Helvetica-Oblique", fontSize=9,
                                    leading=12.5, textColor=MUTED, alignment=TA_RIGHT),
        "company": ParagraphStyle("company", fontName="Helvetica-Bold", fontSize=10.25,
                                   leading=13, textColor=TEXT, spaceBefore=8),
        "company_date": ParagraphStyle("company_date", fontName="Helvetica-Oblique", fontSize=9,
                                        leading=13, textColor=MUTED, alignment=TA_RIGHT),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.5,
                                  leading=12.5, textColor=TEXT, spaceAfter=3,
                                  leftIndent=14, firstLineIndent=-10),
        "italic_note": ParagraphStyle("italic_note", fontName="Helvetica-Oblique", fontSize=8.75,
                                       leading=11.5, textColor=MUTED, spaceAfter=5),
    }


def rule():
    return HRFlowable(width="100%", thickness=0.75, color=BORDER, spaceBefore=1, spaceAfter=7)


def parse_job_entries(block: str):
    """Parse one '### Company' block's job sub-entries:
    **Role** | dates
    - bullet
    - bullet
    """
    lines = block.split("\n")
    entries = []
    current = None
    for line in lines:
        line = line.rstrip()
        if not line.strip():
            continue
        m = re.match(r"^\*\*(.+?)\*\*(?:\s*\|\s*(.+))?$", line.strip())
        if m:
            if current:
                entries.append(current)
            current = {"role": m.group(1).strip(), "dates": (m.group(2) or "").strip(), "bullets": []}
            continue
        m = re.match(r"^-\s+(.+)$", line.strip())
        if m and current:
            current["bullets"].append(m.group(1).strip())
    if current:
        entries.append(current)
    return entries


def render_company_section(content: str, styles, story):
    lines = content.split("\n")
    header_line = None
    rest_start = 0
    for idx, line in enumerate(lines):
        if line.strip():
            header_line = line.strip()
            rest_start = idx + 1
            break
    m = re.match(r"^###\s+(.+)$", header_line) if header_line else None
    company = m.group(1).strip() if m else header_line

    date_line = ""
    body_start = rest_start
    for idx in range(rest_start, len(lines)):
        if lines[idx].strip():
            if lines[idx].strip().startswith("*") and lines[idx].strip().endswith("*"):
                date_line = lines[idx].strip().strip("*")
                body_start = idx + 1
            break

    header_tbl = Table(
        [[Paragraph(inline_md(company), styles["company"]),
          Paragraph(esc(date_line), styles["company_date"])]],
        colWidths=[5.46 * inch, 1.8 * inch], hAlign="LEFT",
    )
    header_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    rest = "\n".join(lines[body_start:])
    entries = parse_job_entries(rest)
    for i, entry in enumerate(entries):
        job_block = []
        if i == 0:
            # Glue the company header to its first role + bullet too, so
            # a company name never gets orphaned alone at a page break
            # (happened with Massey's single-role entries).
            job_block.append(header_tbl)
        role_tbl = Table(
            [[Paragraph(inline_md(entry["role"]), styles["job_role"]),
              Paragraph(esc(entry["dates"]), styles["job_date"])]],
            colWidths=[5.46 * inch, 1.8 * inch], hAlign="LEFT",
        )
        role_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]))
        job_block.append(role_tbl)
        for b in entry["bullets"]:
            job_block.append(Paragraph("•&nbsp;&nbsp;" + inline_md(b), styles["bullet"]))
        # Keep the glued prefix (header, if present) + role heading + its
        # first bullet together; let any remaining bullets flow normally.
        glue_count = 3 if i == 0 else 2
        story.append(KeepTogether(job_block[:glue_count] if len(job_block) > 1 else job_block))
        for extra in job_block[glue_count:]:
            story.append(extra)


def render_project_entries(content: str, styles, story):
    note_m = re.match(r"^\*(.+?)\*\s*\n", content)
    body = content
    if note_m:
        story.append(Paragraph(inline_md(note_m.group(1)), styles["italic_note"]))
        body = content[note_m.end():]

    blocks = re.split(r"^###\s+", body, flags=re.M)
    for block in blocks:
        block = block.strip("\n")
        if not block.strip():
            continue
        lines = block.split("\n")
        title = lines[0].strip()
        date_line = ""
        bullets = []
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            if line.startswith("*") and line.endswith("*") and not date_line:
                date_line = line.strip("*")
                continue
            m = re.match(r"^-\s+(.+)$", line)
            if m:
                bullets.append(m.group(1))

        title_tbl = Table(
            [[Paragraph(inline_md(title), styles["company"]),
              Paragraph(esc(date_line), styles["company_date"])]],
            colWidths=[5.46 * inch, 1.8 * inch], hAlign="LEFT",
        )
        title_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]))
        block_flow = [title_tbl]
        if bullets:
            block_flow.append(Paragraph("•&nbsp;&nbsp;" + inline_md(bullets[0]), styles["bullet"]))
        story.append(KeepTogether(block_flow))
        for b in bullets[1:]:
            story.append(Paragraph("•&nbsp;&nbsp;" + inline_md(b), styles["bullet"]))


def generate(keep_phone: bool, out_path: Path):
    text = SOURCE.read_text(encoding="utf-8")
    name, contact_lines, sections = parse_resume(text, keep_phone)
    styles = build_styles()

    doc = SimpleDocTemplate(
        str(out_path), pagesize=letter,
        leftMargin=0.62 * inch, rightMargin=0.62 * inch,
        topMargin=0.55 * inch, bottomMargin=0.55 * inch,
        title=f"{name} - Resume",
    )

    story = [
        Paragraph(esc(name), styles["name"]),
        Paragraph(esc(contact_lines[0]), styles["contact"]),
        Paragraph(esc(contact_lines[1]), styles["contact"]),
        Spacer(1, 4),
    ]

    story.append(Paragraph("SUMMARY", styles["section"]))
    story.append(rule())
    for para in sections["Summary"].split("\n\n"):
        if para.strip():
            story.append(Paragraph(inline_md(para.strip()), styles["summary"]))

    story.append(Paragraph("SKILLS", styles["section"]))
    story.append(rule())
    for line in sections["Skills"].split("\n"):
        m = re.match(r"^-\s+(.+)$", line.strip())
        if m:
            story.append(Paragraph("•&nbsp;&nbsp;" + inline_md(m.group(1)), styles["skill"]))

    story.append(Paragraph("PROFESSIONAL EXPERIENCE", styles["section"]))
    story.append(rule())
    exp_blocks = re.split(r"^### ", sections["Professional Experience"], flags=re.M)
    for block in exp_blocks:
        block = block.strip("\n")
        if block.strip():
            render_company_section("### " + block, styles, story)

    story.append(Paragraph("PROJECTS", styles["section"]))
    story.append(rule())
    render_project_entries(sections["Projects"], styles, story)

    story.append(Paragraph("EDUCATION AND CERTIFICATIONS", styles["section"]))
    story.append(rule())
    for line in sections["Education and Certifications"].split("\n"):
        m = re.match(r"^-\s+(.+)$", line.strip())
        if m:
            story.append(Paragraph("•&nbsp;&nbsp;" + inline_md(m.group(1)), styles["skill"]))

    doc.build(story)
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    SITE_PDF.parent.mkdir(parents=True, exist_ok=True)
    generate(keep_phone=False, out_path=SITE_PDF)
    generate(keep_phone=True, out_path=PRIVATE_PDF)
