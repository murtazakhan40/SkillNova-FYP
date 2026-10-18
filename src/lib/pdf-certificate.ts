import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificatePdfPayload {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date | string;
  certificateCode: string;
  grade?: number | null;
  verificationBaseUrl?: string;
}

/**
 * Generate a production-grade, print-ready PDF certificate.
 * Consistent with SkillNova navy & vibrant orange branding.
 * Includes dynamic embedded QR code for live instant verification.
 * Adheres strictly to academic integrity: no fake signatures, accreditation claims, or fake grades.
 */
export async function generateCertificatePdf(payload: CertificatePdfPayload): Promise<Uint8Array> {
  const {
    studentName,
    courseTitle,
    instructorName,
    issuedAt,
    certificateCode,
    grade,
    verificationBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  } = payload;

  const formattedDate =
    typeof issuedAt === "string"
      ? issuedAt
      : issuedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

  const verificationUrl = `${verificationBaseUrl.replace(/\/$/, "")}/verify?code=${encodeURIComponent(
    certificateCode
  )}`;

  // Create A4 Landscape PDF Document (841.89 x 595.28 pt)
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`SkillNova Certificate - ${courseTitle}`);
  pdfDoc.setAuthor("SkillNova Academy");
  pdfDoc.setSubject(`Course Completion Certificate for ${studentName}`);
  pdfDoc.setCreator("SkillNova Academic Registry Engine");

  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Load Standard Fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Palette definition
  const navyDark = rgb(11 / 255, 27 / 255, 61 / 255);       // #0B1B3D
  const orangeVibrant = rgb(255 / 255, 107 / 255, 0 / 255);  // #FF6B00
  const orangeSoft = rgb(255 / 255, 133 / 255, 51 / 255);    // #FF8533
  const slateText = rgb(51 / 255, 65 / 255, 85 / 255);       // #334155
  const slateMuted = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748B
  const slateBorder = rgb(226 / 255, 232 / 255, 240 / 255);  // #E2E8F0
  const bgIvory = rgb(253 / 255, 253 / 255, 254 / 255);

  // 1. Canvas Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgIvory,
  });

  // 2. Decorative Double Outer Border
  const outerMargin = 22;
  page.drawRectangle({
    x: outerMargin,
    y: outerMargin,
    width: width - outerMargin * 2,
    height: height - outerMargin * 2,
    borderColor: navyDark,
    borderWidth: 4,
  });

  const innerMargin = 28;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: width - innerMargin * 2,
    height: height - innerMargin * 2,
    borderColor: orangeVibrant,
    borderWidth: 1.5,
  });

  // 3. Corner Ornamental Brackets
  const cornerSize = 18;
  const drawCorner = (cx: number, cy: number, dx: number, dy: number) => {
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx + dx * cornerSize, y: cy },
      thickness: 2,
      color: orangeVibrant,
    });
    page.drawLine({
      start: { x: cx, y: cy },
      end: { x: cx, y: cy + dy * cornerSize },
      thickness: 2,
      color: orangeVibrant,
    });
  };
  drawCorner(innerMargin + 6, innerMargin + 6, 1, 1);
  drawCorner(width - innerMargin - 6, innerMargin + 6, -1, 1);
  drawCorner(innerMargin + 6, height - innerMargin - 6, 1, -1);
  drawCorner(width - innerMargin - 6, height - innerMargin - 6, -1, -1);

  // Helper for centering text
  const drawCenteredText = (
    text: string,
    y: number,
    size: number,
    font: any,
    color: any
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

  // 4. Header: SkillNova Academy
  drawCenteredText("SKILLNOVA ACADEMY", height - 72, 17, helveticaBold, navyDark);
  drawCenteredText(
    "OFFICIAL CERTIFICATE OF COURSE COMPLETION",
    height - 92,
    11,
    helveticaBold,
    orangeVibrant
  );

  // Decorative Accent Separator
  page.drawLine({
    start: { x: width / 2 - 80, y: height - 104 },
    end: { x: width / 2 + 80, y: height - 104 },
    thickness: 1.2,
    color: slateBorder,
  });

  // 5. Presentation Statement
  drawCenteredText(
    "This is to certify that",
    height - 138,
    13,
    timesRomanItalic,
    slateMuted
  );

  // 6. Recipient Name
  const studentFontSize = 28;
  drawCenteredText(
    studentName,
    height - 178,
    studentFontSize,
    helveticaBold,
    navyDark
  );

  // Underline for Student Name
  const nameWidth = Math.min(helveticaBold.widthOfTextAtSize(studentName, studentFontSize) + 40, 500);
  page.drawLine({
    start: { x: (width - nameWidth) / 2, y: height - 188 },
    end: { x: (width + nameWidth) / 2, y: height - 188 },
    thickness: 1.5,
    color: orangeSoft,
  });

  // 7. Completion Clause
  drawCenteredText(
    "has successfully completed all required coursework, curriculum modules, and assessments for",
    height - 222,
    11.5,
    timesRoman,
    slateText
  );

  // 8. Course Title
  const courseFontSize = courseTitle.length > 40 ? 19 : 22;
  drawCenteredText(
    courseTitle,
    height - 262,
    courseFontSize,
    helveticaBold,
    navyDark
  );

  // 9. Verified Grade (Rendered ONLY when verified and available)
  let footerBaseY = height - 370;
  if (grade !== null && grade !== undefined && !isNaN(grade)) {
    const gradeText = `Verified Assessment Grade: ${Math.round(grade)}% (Passed)`;
    drawCenteredText(gradeText, height - 296, 11, helveticaBold, orangeVibrant);
    footerBaseY = height - 380;
  }

  // 10. Horizontal Divider Above Footer
  page.drawLine({
    start: { x: 60, y: footerBaseY + 70 },
    end: { x: width - 60, y: footerBaseY + 70 },
    thickness: 1,
    color: slateBorder,
  });

  // 11. Footer Columns (Instructor | Verification Summary | QR Code)
  const leftX = 70;
  const centerX = width / 2 - 80;
  const rightX = width - 170;

  // A. Instructor Column (NO fake signatures - clean typography)
  page.drawText(instructorName, {
    x: leftX,
    y: footerBaseY + 36,
    size: 13,
    font: helveticaBold,
    color: navyDark,
  });
  page.drawLine({
    start: { x: leftX, y: footerBaseY + 30 },
    end: { x: leftX + 180, y: footerBaseY + 30 },
    thickness: 1,
    color: navyDark,
  });
  page.drawText("Lead Faculty Instructor", {
    x: leftX,
    y: footerBaseY + 16,
    size: 9.5,
    font: helvetica,
    color: slateMuted,
  });
  page.drawText("SkillNova Academic Faculty", {
    x: leftX,
    y: footerBaseY + 4,
    size: 8.5,
    font: helvetica,
    color: slateMuted,
  });

  // B. Credential Identification Column
  page.drawText("CREDENTIAL IDENTIFIER", {
    x: centerX,
    y: footerBaseY + 36,
    size: 8.5,
    font: helveticaBold,
    color: slateMuted,
  });
  page.drawText(certificateCode, {
    x: centerX,
    y: footerBaseY + 22,
    size: 11,
    font: helveticaBold,
    color: orangeVibrant,
  });
  page.drawText(`Issue Date: ${formattedDate}`, {
    x: centerX,
    y: footerBaseY + 8,
    size: 9,
    font: helvetica,
    color: slateText,
  });
  page.drawText("Status: Officially Authenticated", {
    x: centerX,
    y: footerBaseY - 4,
    size: 8.5,
    font: helvetica,
    color: rgb(16 / 255, 149 / 255, 80 / 255), // Emerald green
  });

  // C. Dynamic Embedded QR Code
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
    const qrSize = 64;

    page.drawImage(qrImage, {
      x: rightX,
      y: footerBaseY - 6,
      width: qrSize,
      height: qrSize,
    });

    page.drawText("Scan to Verify", {
      x: rightX + 4,
      y: footerBaseY - 18,
      size: 7.5,
      font: helveticaBold,
      color: navyDark,
    });
  } catch (err) {
    console.error("Failed to embed QR code into certificate PDF:", err);
  }

  // 12. Bottom Verification URL Notice
  drawCenteredText(
    `Verify credential authenticity at: ${verificationUrl}`,
    36,
    8,
    helvetica,
    slateMuted
  );

  return await pdfDoc.save();
}
