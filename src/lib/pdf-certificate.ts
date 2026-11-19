import { PDFDocument, rgb, StandardFonts, PDFFont, RGB } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificatePdfPayload {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date | string;
  certificateCode: string;
  grade?: number | null;
  verificationBaseUrl?: string;
  certificateType?: string; // Default: "APPRECIATION"
  academyName?: string;
  tagline?: string;
  signerTitle?: string;
  signerName?: string;
}

/**
 * Generate a luxury, high-resolution, print-ready PDF certificate.
 * Mirrors the uploaded SkillNova Academy gold & deep-navy ribbon wave aesthetic.
 * Includes:
 * - Fluid navy and gold corner wave ribbons
 * - Official SkillNova Academy branding & tagline
 * - Top-right gold medallion seal ("LEARN IMPLEMENT GROW")
 * - Cursive "Certificate OF APPRECIATION" heading
 * - Student name in regal gold serif with diamond divider
 * - Formal curriculum completion clause
 * - Verified assessment score (when applicable)
 * - Date line with "DATE" label & official SkillNova certified seal
 * - Founder & CEO digital signature with "FOUNDER & CEO" label
 * - Live dynamic QR code linking to cryptographic verification registry
 */
export async function generateCertificatePdf(payload: CertificatePdfPayload): Promise<Uint8Array> {
  const {
    studentName,
    courseTitle,
    issuedAt,
    certificateCode,
    grade,
    verificationBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    certificateType = "APPRECIATION",
    academyName = "SKILLNOVA ACADEMY",
    tagline = "THE DIGITAL LEARNING PLATFORM",
    signerTitle = "FOUNDER & CEO",
    signerName = "Murtaza Wazir",
  } = payload;

  const formattedDate =
    typeof issuedAt === "string"
      ? issuedAt
      : issuedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });

  const verificationUrl = `${verificationBaseUrl.replace(/\/$/, "")}/verify?code=${encodeURIComponent(
    certificateCode
  )}`;

  // Create A4 Landscape PDF Document (841.89 x 595.28 pt)
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`SkillNova Certificate of ${certificateType} - ${studentName}`);
  pdfDoc.setAuthor("SkillNova Academy");
  pdfDoc.setSubject(`Official Course Completion Certificate for ${studentName}`);
  pdfDoc.setCreator("SkillNova Academic Registry Engine");

  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Load Standard Fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Signature SkillNova Website Color Palette (Midnight Navy & Vibrant Energy Orange)
  const navyDark = rgb(11 / 255, 27 / 255, 61 / 255);       // #0B1B3D (SkillNova Primary Navy)
  const navyDeep = rgb(6 / 255, 14 / 255, 30 / 255);        // #060E1E (Midnight Navy Shadow)
  const orangeBrand = rgb(255 / 255, 107 / 255, 0 / 255);   // #FF6B00 (Signature Brand Orange)
  const orangeLight = rgb(255 / 255, 165 / 255, 102 / 255); // #FFA566 (Highlight Soft Orange)
  const slateText = rgb(15 / 255, 23 / 255, 42 / 255);      // #0F172A
  const slateMuted = rgb(100 / 255, 116 / 255, 139 / 255);  // #64748B

  // 1. Base Canvas Background (Crisp Ivory)
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(253 / 255, 250 / 255, 245 / 255),
  });

  // Double Regal Security Borders
  // Outer Deep Navy Border
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: navyDark,
    borderWidth: 1.8,
  });

  // Inner Brand Orange Hairline Border
  page.drawRectangle({
    x: 23,
    y: 23,
    width: width - 46,
    height: height - 46,
    borderColor: orangeBrand,
    borderWidth: 0.8,
  });

  // 2. Corner Ribbon Graphic: TOP-LEFT Wave Ribbons
  // In PDF coordinates: top-left is (0, height).
  // Draw primary dark navy wave
  page.drawSvgPath(
    "M 0 0 L 320 0 C 240 30 190 90 140 150 C 95 190 50 220 0 220 Z",
    {
      x: 0,
      y: height,
      color: navyDark,
    }
  );

  // Draw inner deep shadow accent
  page.drawSvgPath(
    "M 0 0 L 220 0 C 160 25 120 65 90 100 C 60 135 30 150 0 155 Z",
    {
      x: 0,
      y: height,
      color: navyDeep,
    }
  );

  // Draw vibrant orange sweeping ribbon accent
  page.drawSvgPath(
    "M 0 170 C 60 165 110 140 150 110 C 200 70 250 30 350 8 L 360 16 C 265 40 210 80 160 122 C 115 155 60 180 0 185 Z",
    {
      x: 0,
      y: height,
      color: orangeBrand,
    }
  );

  // 3. Corner Ribbon Graphic: BOTTOM-RIGHT Wave Ribbons (Mirror)
  // Bottom-right is (width, 0).
  page.drawSvgPath(
    "M 0 0 L -320 0 C -240 -30 -190 -90 -140 -150 C -95 -190 -50 -220 0 -220 Z",
    {
      x: width,
      y: 0,
      color: navyDark,
      scale: 0.6,
    }
  );

  page.drawSvgPath(
    "M 0 0 L -220 0 C -160 -25 -120 -65 -90 -100 C -60 -135 -30 -150 0 -155 Z",
    {
      x: width,
      y: 0,
      color: navyDeep,
      scale: 0.6,
    }
  );

  page.drawSvgPath(
    "M 0 -170 C -60 -165 -110 -140 -150 -110 C -200 -70 -250 -30 -350 -8 L -360 -16 C -265 -40 -210 -80 -160 -122 C -115 -155 -60 -180 0 -185 Z",
    {
      x: width,
      y: 0,
      color: orangeBrand,
      scale: 0.6,
    }
  );

  // Helper for drawing centered text
  const drawCenteredText = (
    text: string,
    y: number,
    size: number,
    font: PDFFont,
    color: RGB
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // 4. TOP-LEFT BRANDING: SkillNova Academy & Tagline
  const brandX = 40;
  const brandY = height - 48;

  // Mini Brand Hexagon Shield in Navy & Brand Orange
  page.drawRectangle({
    x: brandX,
    y: brandY - 2,
    width: 26,
    height: 26,
    color: navyDark,
    borderColor: orangeBrand,
    borderWidth: 1.5,
  });
  page.drawText("SN", {
    x: brandX + 4.5,
    y: brandY + 6,
    size: 13,
    font: helveticaBold,
    color: orangeBrand,
  });

  page.drawText(academyName, {
    x: brandX + 36,
    y: brandY + 12,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(tagline, {
    x: brandX + 36,
    y: brandY + 1,
    size: 7.5,
    font: helveticaBold,
    color: orangeBrand,
  });

  // 5. TOP-RIGHT ORANGE ROSETTE MEDALLION: "LEARN IMPLEMENT GROW"
  const medalCenterX = width - 78;
  const medalCenterY = height - 68;

  // Outer Vibrant Orange Disc
  page.drawCircle({
    x: medalCenterX,
    y: medalCenterY,
    size: 38,
    color: orangeBrand,
  });

  // Inner Soft Orange Ring
  page.drawCircle({
    x: medalCenterX,
    y: medalCenterY,
    size: 34,
    color: orangeLight,
  });

  // Dark Midnight Navy Core Disc
  page.drawCircle({
    x: medalCenterX,
    y: medalCenterY,
    size: 30,
    color: navyDark,
  });

  // Medallion Motto Text
  const mottoWord1 = "LEARN";
  const mottoWord2 = "IMPLEMENT";
  const mottoWord3 = "GROW";

  const w1Width = helveticaBold.widthOfTextAtSize(mottoWord1, 6.8);
  const w2Width = helveticaBold.widthOfTextAtSize(mottoWord2, 6.2);
  const w3Width = helveticaBold.widthOfTextAtSize(mottoWord3, 6.8);

  page.drawText(mottoWord1, {
    x: medalCenterX - w1Width / 2,
    y: medalCenterY + 11,
    size: 6.8,
    font: helveticaBold,
    color: orangeLight,
  });

  page.drawText(mottoWord2, {
    x: medalCenterX - w2Width / 2,
    y: medalCenterY - 1,
    size: 6.2,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(mottoWord3, {
    x: medalCenterX - w3Width / 2,
    y: medalCenterY - 12,
    size: 6.8,
    font: helveticaBold,
    color: orangeLight,
  });

  // 6. CERTIFICATE TITLE: "Certificate OF APPRECIATION"
  drawCenteredText("Certificate", height - 148, 54, timesRomanBold, navyDark);
  drawCenteredText(`OF ${certificateType}`, height - 172, 13, helveticaBold, navyDark);

  // Crisp Underline below title
  page.drawLine({
    start: { x: width / 2 - 80, y: height - 180 },
    end: { x: width / 2 + 80, y: height - 180 },
    thickness: 1.5,
    color: navyDark,
  });

  // 7. PRESENTATION STATEMENT
  drawCenteredText(
    "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    height - 208,
    10.5,
    helveticaBold,
    slateText
  );

  // 8. RECIPIENT STUDENT NAME (High-Contrast Midnight Navy)
  const studentFontSize = studentName.length > 25 ? 28 : 34;
  drawCenteredText(
    studentName.toUpperCase(),
    height - 252,
    studentFontSize,
    timesRomanBold,
    navyDark
  );

  // Brand Orange Ornamental Divider with Center Diamond
  const dividerLineWidth = 140;
  const dividerY = height - 268;

  // Left Line
  page.drawLine({
    start: { x: width / 2 - dividerLineWidth, y: dividerY },
    end: { x: width / 2 - 10, y: dividerY },
    thickness: 1.5,
    color: orangeBrand,
  });

  // End points
  page.drawCircle({
    x: width / 2 - dividerLineWidth,
    y: dividerY,
    size: 2,
    color: orangeBrand,
  });
  page.drawCircle({
    x: width / 2 + dividerLineWidth,
    y: dividerY,
    size: 2,
    color: orangeBrand,
  });

  // Center Vector Diamond
  page.drawSvgPath("M 0 -5 L 5 0 L 0 5 L -5 0 Z", {
    x: width / 2,
    y: dividerY,
    color: orangeBrand,
  });

  // Right Line
  page.drawLine({
    start: { x: width / 2 + 10, y: dividerY },
    end: { x: width / 2 + dividerLineWidth, y: dividerY },
    thickness: 1.5,
    color: orangeBrand,
  });

  // 9. COURSE STATEMENT
  const statementLine1 = `ON COMPLETION OF THE COURSE - ${courseTitle.toUpperCase()} FROM ${academyName}.`;
  const statementLine2 = "WE WISH YOU ALL THE BEST.";

  drawCenteredText(
    statementLine1,
    height - 302,
    11,
    helveticaBold,
    slateText
  );
  drawCenteredText(
    statementLine2,
    height - 320,
    11,
    helveticaBold,
    slateText
  );

  // 10. VERIFIED GRADE (When Available)
  if (grade !== null && grade !== undefined && !isNaN(grade)) {
    const gradeText = `Verified Assessment Grade: ${Math.round(grade)}% (Passed)`;
    drawCenteredText(gradeText, height - 344, 10, helveticaBold, orangeBrand);
  }

  // 11. BOTTOM ROW: DUAL EXECUTIVE SIGNATURES & OFFICIAL REGISTRY SEAL
  const footerBaseY = 92;

  // A. Left: Faculty Director Signature
  const facultyName = payload.instructorName || "Lead Faculty Director";
  const leftSigCenterX = 150;
  const facultySigWidth = timesRomanItalic.widthOfTextAtSize(facultyName, 20);
  page.drawText(facultyName, {
    x: leftSigCenterX - facultySigWidth / 2,
    y: footerBaseY + 22,
    size: 20,
    font: timesRomanItalic,
    color: navyDark,
  });

  // Underline
  page.drawLine({
    start: { x: leftSigCenterX - 75, y: footerBaseY + 16 },
    end: { x: leftSigCenterX + 75, y: footerBaseY + 16 },
    thickness: 1.5,
    color: navyDark,
  });

  // "LEAD FACULTY DIRECTOR" Label
  const facultyLabel = "LEAD FACULTY DIRECTOR";
  const facultyLabelWidth = helveticaBold.widthOfTextAtSize(facultyLabel, 8.5);
  page.drawText(facultyLabel, {
    x: leftSigCenterX - facultyLabelWidth / 2,
    y: footerBaseY + 5,
    size: 8.5,
    font: helveticaBold,
    color: navyDark,
  });

  // Date beneath signature
  const dateSubText = `Conferred: ${formattedDate}`;
  const dateSubWidth = helvetica.widthOfTextAtSize(dateSubText, 8);
  page.drawText(dateSubText, {
    x: leftSigCenterX - dateSubWidth / 2,
    y: footerBaseY - 6,
    size: 8,
    font: helvetica,
    color: slateMuted,
  });

  // B. Center: Official Accreditation & Verification Stamp with embedded QR code
  const qrX = width / 2 - 60;
  try {
    const qrPngBuffer = await QRCode.toBuffer(verificationUrl, {
      type: "png",
      width: 140,
      margin: 1,
      color: {
        dark: "#0B1B3D",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    const qrImage = await pdfDoc.embedPng(qrPngBuffer);
    const qrSize = 52;

    page.drawImage(qrImage, {
      x: qrX,
      y: footerBaseY - 14,
      width: qrSize,
      height: qrSize,
    });

    page.drawText("SKILLNOVA CERTIFIED", {
      x: qrX + 60,
      y: footerBaseY + 22,
      size: 8.5,
      font: helveticaBold,
      color: navyDark,
    });
    page.drawText("ACADEMIC REGISTRY", {
      x: qrX + 60,
      y: footerBaseY + 10,
      size: 7.5,
      font: helveticaBold,
      color: orangeBrand,
    });
    page.drawText(certificateCode, {
      x: qrX + 60,
      y: footerBaseY - 2,
      size: 7.5,
      font: helvetica,
      color: slateMuted,
    });
  } catch (err) {
    console.error("Failed to embed QR code into certificate PDF:", err);
  }

  // C. Right: Digital Signature & Founder & CEO Column
  const sigCenterX = width - 150;

  // Cursive Executive Signature Text
  const sigText = signerName;
  const sigTextWidth = timesRomanItalic.widthOfTextAtSize(sigText, 22);
  page.drawText(sigText, {
    x: sigCenterX - sigTextWidth / 2,
    y: footerBaseY + 22,
    size: 22,
    font: timesRomanItalic,
    color: navyDark,
  });

  // Dynamic Underline Swash
  page.drawSvgPath(
    "M 0 5 Q 60 14 120 2",
    {
      x: sigCenterX - 60,
      y: footerBaseY + 18,
      color: navyDark,
    }
  );
  page.drawCircle({
    x: sigCenterX + 62,
    y: footerBaseY + 18,
    size: 1.8,
    color: navyDark,
  });

  // Solid Signature Underline in Midnight Navy
  page.drawLine({
    start: { x: sigCenterX - 75, y: footerBaseY + 16 },
    end: { x: sigCenterX + 75, y: footerBaseY + 16 },
    thickness: 1.5,
    color: navyDark,
  });

  // "FOUNDER & CEO" Label
  const sigLabel = signerTitle.toUpperCase();
  const sigLabelWidth = helveticaBold.widthOfTextAtSize(sigLabel, 8.5);
  page.drawText(sigLabel, {
    x: sigCenterX - sigLabelWidth / 2,
    y: footerBaseY + 5,
    size: 8.5,
    font: helveticaBold,
    color: navyDark,
  });

  const councilText = "SkillNova Academic Council";
  const councilWidth = helvetica.widthOfTextAtSize(councilText, 8);
  page.drawText(councilText, {
    x: sigCenterX - councilWidth / 2,
    y: footerBaseY - 6,
    size: 8,
    font: helvetica,
    color: slateMuted,
  });

  return await pdfDoc.save();
}
