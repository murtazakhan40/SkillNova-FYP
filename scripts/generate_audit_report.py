"""
SkillNova LMS - Comprehensive Codebase Audit & Professional Roadmap PDF Generator
Engineered for BS Computer Science Final Year Project (FYP) & Production Readiness
"""

import os
import sys
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and display total page count: 'Page X of Y'
    along with running executive headers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, total_pages):
        self.saveState()
        
        # Don't draw running header on cover page
        if self._pageNumber > 1:
            # Running Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0B1B3D"))
            self.drawString(54, 755, "SKILLNOVA ACADEMY")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(160, 755, "|  Comprehensive Architectural Audit & Production Roadmap")
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 748, 558, 748)
            
            # Running Footer
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 45, 558, 45)
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(54, 32, "Final Year Project (FYP) Engineering Report • Confidential & Proprietary")
            
            page_str = f"Page {self._pageNumber} of {total_pages}"
            self.drawRightString(558, 32, page_str)
            
        self.restoreState()


def build_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0B1B3D")    # Dark Navy
    SECONDARY = colors.HexColor("#132752")  # Deep Blue
    ACCENT = colors.HexColor("#FF6B00")     # SkillNova Signature Orange
    TEXT_DARK = colors.HexColor("#0F172A")  # Slate 900
    TEXT_MUTED = colors.HexColor("#475569") # Slate 600
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Slate 50
    BORDER_LIGHT = colors.HexColor("#E2E8F0")
    SUCCESS = colors.HexColor("#059669")
    DANGER = colors.HexColor("#DC2626")
    WARNING = colors.HexColor("#D97706")

    # Typography Styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        textColor=PRIMARY,
        spaceAfter=10,
    )

    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=ACCENT,
        spaceAfter=20,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=6,
    )

    body_bold = ParagraphStyle(
        "BodyDarkBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=PRIMARY,
    )

    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
    )

    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=colors.white,
    )

    story = []

    # ==========================================
    # COVER PAGE / HEADER HERO
    # ==========================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("SKILLNOVA ACADEMY", ParagraphStyle("BrandTag", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=ACCENT, spaceAfter=8)))
    story.append(Paragraph("Comprehensive Codebase Audit & Professional Roadmap", title_style))
    story.append(Paragraph("Architectural Blueprint for Transforming the BS CS Final Year Project into an Enterprise-Grade Commercial LMS", subtitle_style))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Project:</b> SkillNova Academy LMS (Full-Stack Next.js 16)", table_cell),
            Paragraph("<b>Target Stack:</b> Next.js 16 • PostgreSQL • Prisma • AWS S3 • Stripe", table_cell),
        ],
        [
            Paragraph("<b>Author / Lead:</b> Murtaza Wazir (BS CS FYP)", table_cell),
            Paragraph(f"<b>Audit Date:</b> {datetime.now().strftime('%B %d, %Y')}", table_cell),
        ],
        [
            Paragraph("<b>Evaluation Scope:</b> Security, DB, LMS Classroom, Real-time, DevOps", table_cell),
            Paragraph("<b>Target State:</b> Production-Ready Commercial Cloud Platform", table_cell),
        ]
    ]
    t_meta = Table(meta_data, colWidths=[250, 254])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 20))

    # ==========================================
    # EXECUTIVE SUMMARY & CURRENT HEALTH SCORECARD
    # ==========================================
    story.append(Paragraph("1. Executive Summary & Health Scorecard", h1_style))
    story.append(Paragraph(
        "A rigorous codebase analysis was conducted across all subsystems of the <b>SkillNova-FYP</b> platform. "
        "The project demonstrates impressive aesthetic quality, modern Next.js 16 Turbopack architecture, modular server actions, "
        "and clean role-based dashboards (Student, Trainer, Admin). However, to transition from an academic prototype into a "
        "<b>bulletproof, enterprise-ready commercial LMS</b>, critical technical debt must be addressed in authentication security, "
        "database concurrency, media delivery, financial transactional integrity, and automated test coverage.",
        body_style
    ))
    story.append(Spacer(1, 8))

    scorecard_data = [
        [Paragraph("Subsystem", table_header), Paragraph("Current State", table_header), Paragraph("Health", table_header), Paragraph("Critical Deficiencies & Production Risks", table_header)],
        [
            Paragraph("<b>Authentication & RBAC</b>", table_cell),
            Paragraph("Unsigned Base64 cookie, hardcoded backdoor passwords", table_cell),
            Paragraph("<font color='#DC2626'><b>HIGH RISK</b></font>", table_cell),
            Paragraph("Cookie tampering allows privilege escalation to ADMIN without secret validation. Backdoor credentials exist in production paths.", table_cell),
        ],
        [
            Paragraph("<b>Database & Persistence</b>", table_cell),
            Paragraph("Single-file SQLite (prisma/dev.db), no migrations", table_cell),
            Paragraph("<font color='#D97706'><b>MEDIUM</b></font>", table_cell),
            Paragraph("File-lock write contention under concurrent requests. Ephemeral cloud deployments (Vercel/Docker) lose database on container recycling.", table_cell),
        ],
        [
            Paragraph("<b>Media & Storage</b>", table_cell),
            Paragraph("Hardcoded YouTube iframes, Unsplash image URLs", table_cell),
            Paragraph("<font color='#D97706'><b>MEDIUM</b></font>", table_cell),
            Paragraph("No private video DRM, no student assignment file uploads, no S3/Cloudinary CDN integration for custom content hosting.", table_cell),
        ],
        [
            Paragraph("<b>Financial & E-Commerce</b>", table_cell),
            Paragraph("Zero-dollar immediate enrollment bypass", table_cell),
            Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", table_cell),
            Paragraph("Students can enroll in paid courses without checkout or payment verification. No Stripe/PayFast gateway, order ledger, or tax invoices.", table_cell),
        ],
        [
            Paragraph("<b>Route Protection</b>", table_cell),
            Paragraph("Ad-hoc page-level redirection, no middleware.ts", table_cell),
            Paragraph("<font color='#D97706'><b>MEDIUM</b></font>", table_cell),
            Paragraph("Missing centralized Next.js middleware. Static assets or future API endpoints lack uniform token inspection and security headers.", table_cell),
        ],
        [
            Paragraph("<b>Testing & DevOps</b>", table_cell),
            Paragraph("No unit tests, no E2E tests, no CI/CD pipeline", table_cell),
            Paragraph("<font color='#DC2626'><b>HIGH RISK</b></font>", table_cell),
            Paragraph("Zero automated test coverage. Regressions in quiz grading, progress calculation, or auth can go undetected before production deploys.", table_cell),
        ],
    ]
    t_score = Table(scorecard_data, colWidths=[100, 120, 60, 224])
    t_score.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_score)
    story.append(Spacer(1, 14))

    # ==========================================
    # STEP-BY-STEP TRANSFORMATION PLAN
    # ==========================================
    story.append(PageBreak())
    story.append(Paragraph("2. Step-by-Step Professional Transformation Roadmap", h1_style))
    story.append(Paragraph(
        "To achieve enterprise readiness and excel during FYP defense, execute the following 7-phase structured transformation plan:",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 1
    story.append(Paragraph("Phase 1: Enterprise Security & Cryptographic Session Hardening", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> <code>src/lib/auth.ts</code> uses <code>Buffer.from(sessionData).toString('base64')</code>. "
        "Any user can decode the cookie in DevTools, change <code>role: 'STUDENT'</code> to <code>'ADMIN'</code>, re-encode, and gain total platform control.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "1.1. Install <code>jose</code> or <code>jsonwebtoken</code> for cryptographically signed JWT sessions with HMAC SHA-256.<br/>"
        "1.2. Store a cryptographically secure <code>AUTH_SECRET</code> (32+ bytes) in <code>.env</code>.<br/>"
        "1.3. Sign session payloads with expiration (e.g. 7 days) and tamper detection (JWS).<br/>"
        "1.4. Permanently remove backdoor passwords (<code>Admin@123</code>, <code>Trainer@123</code>, <code>Student@123</code>) from production logic.<br/>"
        "1.5. Introduce password reset workflow with time-limited signed email tokens via Resend / SendGrid.<br/>"
        "1.6. Create <code>src/middleware.ts</code> for edge-level route guarding on <code>/dashboard/*</code>, <code>/learn/*</code>, and API routes.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 2
    story.append(Paragraph("Phase 2: Database Migration to Production PostgreSQL & Schema Refinement", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> SQLite stores data in a single local disk file (<code>prisma/dev.db</code>). "
        "Under concurrent student traffic, SQLite locks the entire database on writes. Modern serverless platforms (Vercel, AWS ECS, Railway) recreate containers on deployment, wiping local database files.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "2.1. Switch Prisma provider in <code>schema.prisma</code> from <code>provider = 'sqlite'</code> to <code>provider = 'postgresql'</code>.<br/>"
        "2.2. Provision a cloud PostgreSQL database instance (Neon Serverless Postgres, Supabase, or AWS RDS).<br/>"
        "2.3. Initialize version-controlled database migrations via <code>npx prisma migrate dev --name init_postgres</code>.<br/>"
        "2.4. Add composite database indexes: <code>@@index([courseId])</code>, <code>@@index([userId])</code>, <code>@@index([slug])</code> for sub-millisecond query resolution.<br/>"
        "2.5. Implement an <code>AuditLog</code> entity to track critical administrative mutations (role escalations, course takedowns, price modifications).",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 3
    story.append(Paragraph("Phase 3: Real-Time Classroom Experience & Media Pipeline", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> Lessons currently rely on static YouTube embeds. Students can mark lessons completed instantly without watching, and instructors cannot upload proprietary videos or course resources.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "3.1. Integrate cloud asset storage (AWS S3 or Cloudinary) with pre-signed upload URLs for trainer video modules, lesson slides, and resource zip files.<br/>"
        "3.2. Implement Video Heartbeat Tracking: dispatch lesson watch progress (e.g. every 10 seconds) to record exact timestamps and enforce an 80% watch threshold before completion toggle unlocks.<br/>"
        "3.3. Add a dedicated Course Q&A / Discussion Forum for each lesson where learners and faculty can engage in threaded discussions.<br/>"
        "3.4. Implement Student Assignment Submissions: allow learners to upload homework/project files with a trainer grading interface and feedback notes.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 4
    story.append(PageBreak())
    story.append(Paragraph("Phase 4: Financial Transactions, Checkout & E-Commerce", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> <code>enrollInCourseAction</code> in <code>src/app/actions/enrollment.ts</code> instantly grants full course access for free, completely ignoring the course tuition fee configured in the database.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "4.1. Introduce financial schema models: <code>Order</code>, <code>Transaction</code>, and <code>Invoice</code>.<br/>"
        "4.2. Integrate Stripe Checkout or PayFast SDK with server-side session generation.<br/>"
        "4.3. Implement an idempotent Stripe webhook listener (<code>/api/webhooks/stripe</code>) to verify cryptographic signatures before activating course enrollment.<br/>"
        "4.4. Build a Student Invoices & Purchase History page with downloadable tax-compliant PDF receipts.<br/>"
        "4.5. Build a Trainer Revenue & Earnings Ledger showing course sales, platform commission deduction, and net faculty payout balance.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 5
    story.append(Paragraph("Phase 5: Automated Certificate Engine with Vector PDF & QR Code Verification", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> Certificates currently exist only as a database code (e.g. <code>SN-2026-X89J21</code>). While the verification page works, students cannot download a professional, high-resolution certificate for LinkedIn or print.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "5.1. Implement a server-side dynamic PDF Certificate Generation API route (<code>/api/certificates/[code]/pdf</code>).<br/>"
        "5.2. Embed an authentic 2D QR Code on the certificate linking directly to <code>https://skillnovaacademy.com/verify?code=...</code>.<br/>"
        "5.3. Include academic metadata: Student Name, Course Title, Lead Instructor Signature, Issue Date, Final Grade / Score, and Official Academy Seal.<br/>"
        "5.4. Add a one-click 'Add to LinkedIn Profile' button with pre-filled certification credentials.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 6
    story.append(Paragraph("Phase 6: Quality Assurance, Automated Testing & CI/CD DevOps", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> The repository has zero automated tests. Regressions can silently break core revenue or learning paths.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "6.1. Configure <b>Vitest</b> for server action and utility testing (auth verification, quiz scoring math, enrollment triggers).<br/>"
        "6.2. Configure <b>Playwright</b> for End-to-End browser smoke testing (Student registration -> Course enrollment -> Lesson completion -> Certificate issue).<br/>"
        "6.3. Add a multi-stage production <code>Dockerfile</code> with standalone Next.js output and non-root execution.<br/>"
        "6.4. Setup GitHub Actions workflow (<code>.github/workflows/ci.yml</code>) running linting, TypeScript type-checking, Prisma schema validation, and test suites on every pull request.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # PHASE 7
    story.append(Paragraph("Phase 7: Performance Optimization, Real-Time Notifications & SEO", h2_style))
    story.append(Paragraph(
        "<b>Target Problem:</b> Notifications are currently static database records fetched on page load. Dynamic course discovery needs rich metadata for search engines.<br/>"
        "<b>Step-by-Step Implementation:</b><br/>"
        "7.1. Implement Server-Sent Events (SSE) or Pusher for real-time in-app notification toasts (e.g. trainer grades assignment -> student gets instant ping).<br/>"
        "7.2. Implement dynamic <code>src/app/sitemap.ts</code> indexing all published courses, instructors, and categories for Google indexing.<br/>"
        "7.3. Embed JSON-LD structured data (schema.org/Course, schema.org/EducationalOccupationalCredential) to generate Google Rich Course Snippets in search results.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # ==========================================
    # ARCHITECTURAL COMPARISON TABLE
    # ==========================================
    story.append(PageBreak())
    story.append(Paragraph("3. Architectural Comparison: Academic vs. Commercial Enterprise LMS", h1_style))
    story.append(Paragraph(
        "The following matrix outlines the direct technological upgrades required across each functional tier:",
        body_style
    ))
    story.append(Spacer(1, 8))

    comparison_data = [
        [Paragraph("Functional Tier", table_header), Paragraph("Current Academic State (FYP)", table_header), Paragraph("Target Commercial State", table_header), Paragraph("Engineering Effort", table_header)],
        [
            Paragraph("<b>Session Management</b>", table_cell),
            Paragraph("Plain Base64 encoded cookie", table_cell),
            Paragraph("Signed JWT with HMAC-SHA256 & rotating tokens", table_cell),
            Paragraph("1 - 2 Days", table_cell),
        ],
        [
            Paragraph("<b>Database Engine</b>", table_cell),
            Paragraph("Local SQLite (dev.db)", table_cell),
            Paragraph("Cloud PostgreSQL with pooling & automated backups", table_cell),
            Paragraph("2 - 3 Days", table_cell),
        ],
        [
            Paragraph("<b>Payment Processing</b>", table_cell),
            Paragraph("None (Free bypass on all courses)", table_cell),
            Paragraph("Stripe / PayFast webhooks + Invoicing ledger", table_cell),
            Paragraph("3 - 4 Days", table_cell),
        ],
        [
            Paragraph("<b>Video Hosting</b>", table_cell),
            Paragraph("Hardcoded YouTube iframes", table_cell),
            Paragraph("AWS S3 / Cloudflare Stream with watch-time sync", table_cell),
            Paragraph("3 - 4 Days", table_cell),
        ],
        [
            Paragraph("<b>Certificates</b>", table_cell),
            Paragraph("Database code verification only", table_cell),
            Paragraph("Downloadable Vector PDF with dynamic QR validation", table_cell),
            Paragraph("1 - 2 Days", table_cell),
        ],
        [
            Paragraph("<b>Automated Testing</b>", table_cell),
            Paragraph("Manual testing only", table_cell),
            Paragraph("Vitest unit tests + Playwright E2E pipeline", table_cell),
            Paragraph("3 - 4 Days", table_cell),
        ],
        [
            Paragraph("<b>Containerization</b>", table_cell),
            Paragraph("Local dev server (npm run dev)", table_cell),
            Paragraph("Multi-stage Dockerfile + Docker Compose", table_cell),
            Paragraph("1 Day", table_cell),
        ],
    ]
    t_comp = Table(comparison_data, colWidths=[95, 155, 175, 79])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 14))

    # ==========================================
    # PRIORITY IMPLEMENTATION TIMELINE (MILESTONES)
    # ==========================================
    story.append(Paragraph("4. Recommended Priority Milestones for FYP Defense", h1_style))
    story.append(Paragraph(
        "To maximize academic grading criteria and demonstrate commercial viability during evaluation:",
        body_style
    ))
    story.append(Spacer(1, 4))

    milestones = [
        "<b>Milestone 1 (Week 1 — Security & Integrity):</b> Replace Base64 session cookies with signed JWT tokens; add Next.js <code>middleware.ts</code>; purge fallback passwords.",
        "<b>Milestone 2 (Week 2 — Persistence & Scale):</b> Migrate Prisma from SQLite to PostgreSQL; establish versioned database migration scripts; add indexing.",
        "<b>Milestone 3 (Week 3 — Monetization & Receipts):</b> Add Stripe Checkout webhook integration; create Order and Invoice records; gate course content based on verified payment status.",
        "<b>Milestone 4 (Week 4 — Credentialing & Delivery):</b> Implement dynamic vector PDF certificate generation with live verification QR codes; enable student project file uploads.",
        "<b>Milestone 5 (Week 5 — DevOps & Defense Polish):</b> Add Vitest/Playwright test suites; multi-stage Docker build; deploy live staging on Vercel with Neon PostgreSQL.",
    ]
    for m in milestones:
        story.append(Paragraph(f"• {m}", body_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 16))

    # Signoff Block
    signoff_data = [
        [
            Paragraph("<b>Report Prepared By:</b><br/>Antigravity Senior Architecture Agent<br/>Google DeepMind Advanced Coding Team", table_cell),
            Paragraph("<b>Project Lead:</b><br/>Murtaza Wazir<br/>SkillNova Academy Lead Instructor", table_cell),
            Paragraph("<b>Target Defense:</b><br/>BS Computer Science<br/>Final Year Project (FYP)", table_cell),
        ]
    ]
    t_signoff = Table(signoff_data, colWidths=[170, 170, 164])
    t_signoff.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_signoff)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF report at: {output_path}")

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(out_dir, ".."))
    pdf_path = os.path.join(project_root, "SkillNova_LMS_Professional_Transformation_Roadmap.pdf")
    build_pdf(pdf_path)
