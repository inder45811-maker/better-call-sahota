import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type PDFImage,
} from 'pdf-lib';
import QRCode from 'qrcode';
import { formatMoney, type IhtResult } from './iht.ts';
import { site } from './site.ts';

// Color palette matching Better Call Sim editorial branding and supplied PDF design
const cBlack = rgb(0.06, 0.06, 0.06); // Header & dark container background #0f0f0f
const cGold = rgb(0.77, 0.63, 0.35); // Signature gold accent #c5a059
const cGoldDark = rgb(0.65, 0.49, 0.2); // Warm eyebrow gold #a67c33
const cBlackText = rgb(0.09, 0.1, 0.12); // Primary dark charcoal #18181b
const cMutedDark = rgb(0.2, 0.22, 0.25); // Dark grey body #374151
const cMutedText = rgb(0.35, 0.38, 0.42); // Secondary text #4b5563
const cGreyText = rgb(0.45, 0.48, 0.52); // Muted subtext #6b7280
const cLightGrey = rgb(0.85, 0.85, 0.85); // Rules & borders #dcdcdc
const cCardBg = rgb(0.976, 0.973, 0.961); // Light warm card background #f9f8f5
const cCardBorder = rgb(0.9, 0.89, 0.85); // Light card border #e5e2da
const cZebraBg = rgb(0.985, 0.982, 0.975); // Alternating table row background
const cWhite = rgb(1, 1, 1);

const clean = (s: string) =>
  s
    .replace(/[→]/g, '>')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7e\xA0-\xFF]/g, '');

/** Exposed for tests: the exact text transformation applied to every PDF string. */
export const pdfText = clean;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = clean(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

async function loadLogoBytes(): Promise<Uint8Array | null> {
  const candidateNames = [
    'better-call-sim-logo-2026.png',
    'better-call-sim-logo.png',
  ];
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    for (const name of candidateNames) {
      try {
        const res = await fetch(`/brand/${name}`);
        if (res.ok) {
          return new Uint8Array(await res.arrayBuffer());
        }
      } catch {
        // continue
      }
    }
  }
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      // oxlint-disable-next-line typescript/no-implied-eval
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const fs = await dynamicImport('node:fs/promises');
      const path = await dynamicImport('node:path');
      for (const name of candidateNames) {
        try {
          const file = await fs.readFile(
            path.join(process.cwd(), 'public', 'brand', name),
          );
          return new Uint8Array(file);
        } catch {
          // continue
        }
      }
    } catch {
      // Node fallback
    }
  }
  return null;
}

export async function makeReport(name: string, result: IhtResult, createdAt: number) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Your illustrative inheritance-tax report');
  pdf.setAuthor('Better Call Sim');
  pdf.setCreationDate(new Date(createdAt));
  pdf.setModificationDate(new Date(createdAt));

  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const timesRoman = await pdf.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  let logoImage: PDFImage | null = null;
  try {
    const bytes = await loadLogoBytes();
    if (bytes) {
      logoImage = await pdf.embedPng(bytes);
    }
  } catch {
    logoImage = null;
  }

  const createdDate = new Date(createdAt);
  const formattedDateLong = createdDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const inputDateParts = (result.input.date || '').split('-');
  const formattedDateSlash =
    inputDateParts.length === 3
      ? `${inputDateParts[2]}/${inputDateParts[1]}/${inputDateParts[0]}`
      : createdDate.toLocaleDateString('en-GB');

  const clientName = clean(name.trim() || 'Simran');
  const nationalPhone = '07711 902299';
  const bookingUrl =
    (site.bookingUrl ||
      (site.origin.includes('localhost') ? 'https://bettercallsim.co.uk' : site.origin)) +
    '/book-review';

  function drawFooter(page: PDFPage, pageNum: number, totalPages: number) {
    page.drawLine({
      start: { x: 40, y: 52 },
      end: { x: 555, y: 52 },
      thickness: 0.5,
      color: cLightGrey,
    });
    page.drawText('BETTER CALL SIM', {
      x: 40,
      y: 38,
      size: 7.5,
      font: helveticaBold,
      color: cGreyText,
    });
    const centerText = 'Illustration only | Not personal advice';
    const cw = helvetica.widthOfTextAtSize(centerText, 7.5);
    page.drawText(centerText, {
      x: 297.5 - cw / 2,
      y: 38,
      size: 7.5,
      font: helvetica,
      color: cGreyText,
    });
    const rightText = `${pageNum} / ${totalPages}`;
    const rw = helvetica.widthOfTextAtSize(rightText, 7.5);
    page.drawText(rightText, {
      x: 555 - rw,
      y: 38,
      size: 7.5,
      font: helvetica,
      color: cGreyText,
    });
  }

  function drawHeaderFallback(page: PDFPage, x: number, y: number, isPage1: boolean) {
    if (isPage1) {
      const text = 'Better Call Sim';
      const tw = timesBold.widthOfTextAtSize(text, 26);
      page.drawText(text, {
        x: 297.5 - tw / 2,
        y: y + 22,
        size: 26,
        font: timesBold,
        color: cGold,
      });
      const sub = 'ESTATE PLANNING | FINANCIAL PLANNING | PROTECTION';
      const sw = helvetica.widthOfTextAtSize(sub, 7.5);
      page.drawText(sub, {
        x: 297.5 - sw / 2,
        y: y + 6,
        size: 7.5,
        font: helvetica,
        color: cGold,
      });
    } else {
      page.drawText('Better Call Sim', {
        x,
        y: y + 14,
        size: 16,
        font: timesBold,
        color: cGold,
      });
      page.drawText('ESTATE & FINANCIAL PLANNING', {
        x,
        y: y + 2,
        size: 6.5,
        font: helvetica,
        color: cGold,
      });
    }
  }

  // ==========================================
  // PAGE 1: Overview, Summary Cards & Callout
  // ==========================================
  const page1 = pdf.addPage([595, 842]);

  // Page 1 Header Banner
  page1.drawRectangle({
    x: 0,
    y: 717,
    width: 595,
    height: 125,
    color: cBlack,
  });
  if (logoImage) {
    page1.drawImage(logoImage, {
      x: 192.5,
      y: 727,
      width: 210,
      height: 105,
    });
  } else {
    drawHeaderFallback(page1, 192.5, 747, true);
  }
  // Gold dividing line
  page1.drawRectangle({
    x: 0,
    y: 715,
    width: 595,
    height: 2,
    color: cGold,
  });

  // Page 1 Title section
  page1.drawText('YOUR FAMILY. YOUR WEALTH. YOUR LEGACY.', {
    x: 40,
    y: 686,
    size: 8,
    font: helveticaBold,
    color: cGoldDark,
  });
  const page1Title = clean(result.heading ?? 'Your inheritance tax review');
  let page1TitleSize = 27;
  while (page1TitleSize > 18 && timesRoman.widthOfTextAtSize(page1Title, page1TitleSize) > 515)
    page1TitleSize -= 0.5;
  page1.drawText(page1Title, {
    x: 40,
    y: 652,
    size: page1TitleSize,
    font: timesRoman,
    color: cBlackText,
  });
  page1.drawText(`Prepared for ${clientName} | ${formattedDateLong}`, {
    x: 40,
    y: 632,
    size: 9.5,
    font: helvetica,
    color: cGreyText,
  });

  // Summary Cards (Two cards side by side)
  const cardW = 250;
  const cardH = 92;
  const hasExpl = Boolean(result.explanation);
  const cardY = hasExpl ? 498 : 518;

  if (result.explanation) {
    const explLines = wrapText(result.explanation, helvetica, 7.8, 515);
    explLines.slice(0, 3).forEach((line, idx) => {
      page1.drawText(line, {
        x: 40,
        y: 622 - idx * 10,
        size: 7.8,
        font: helvetica,
        color: cMutedText,
      });
    });
  }

  // Left Card: NET ESTATE ENTERED
  page1.drawRectangle({
    x: 40,
    y: cardY,
    width: cardW,
    height: cardH,
    color: cCardBg,
    borderColor: cCardBorder,
    borderWidth: 0.75,
  });
  // Vertical gold accent bar on left edge
  page1.drawRectangle({
    x: 40,
    y: cardY,
    width: 3.5,
    height: cardH,
    color: cGold,
  });
  page1.drawText('NET ESTATE ENTERED', {
    x: 54,
    y: cardY + 72,
    size: 8,
    font: helveticaBold,
    color: cMutedText,
  });
  page1.drawText(clean(formatMoney(result.estate)), {
    x: 54,
    y: cardY + 38,
    size: 23,
    font: helveticaBold,
    color: cBlackText,
  });
  const breakdownText = `Assets ${clean(formatMoney(result.totalAssets))} | Liabilities ${clean(formatMoney(result.liabilities))}`;
  page1.drawText(breakdownText, {
    x: 54,
    y: cardY + 16,
    size: 7.8,
    font: helvetica,
    color: cGreyText,
  });

  // Right Card: YOUR RESULT
  page1.drawRectangle({
    x: 305,
    y: cardY,
    width: cardW,
    height: cardH,
    color: cCardBg,
    borderColor: cCardBorder,
    borderWidth: 0.75,
  });
  page1.drawText('YOUR RESULT', {
    x: 319,
    y: cardY + 72,
    size: 8,
    font: helveticaBold,
    color: cMutedText,
  });
  if (result.needsReview) {
    page1.drawText('Review', {
      x: 319,
      y: cardY + 48,
      size: 20,
      font: helveticaBold,
      color: cBlackText,
    });
    page1.drawText('required', {
      x: 319,
      y: cardY + 28,
      size: 20,
      font: helveticaBold,
      color: cBlackText,
    });
    page1.drawText('A tax estimate is not yet available.', {
      x: 319,
      y: cardY + 12,
      size: 7.8,
      font: helvetica,
      color: cGreyText,
    });
  } else {
    page1.drawText(clean(formatMoney(result.tax!)), {
      x: 319,
      y: cardY + 38,
      size: 23,
      font: helveticaBold,
      color: cBlackText,
    });
    const sub =
      result.tax === 0
        ? 'No inheritance tax indicated'
        : `Taxable estate: ${clean(formatMoney(result.taxable!))}`;
    page1.drawText(sub, {
      x: 319,
      y: cardY + 16,
      size: 7.8,
      font: helvetica,
      color: cGreyText,
    });
  }

  // Section: What needs checking? / Allowances & calculation
  const sectionTitleY = cardY - 24;
  const sectionTitle = result.needsReview
    ? 'Matters requiring adviser review'
    : 'Summary of allowances and calculation';
  page1.drawText(sectionTitle, {
    x: 40,
    y: sectionTitleY,
    size: 17,
    font: timesRoman,
    color: cBlackText,
  });

  const checkItems = result.needsReview
    ? (result.reasons.length > 0
        ? result.reasons.slice(0, 3)
        : [
            'UK residence, overseas assets and cross-border details.',
            'Beneficiaries, exemptions and eligibility for the home allowance.',
            'Gifts, trusts, business/agricultural assets, charity and downsizing.',
          ]
      ).map((reason, idx) => ({
        num: String(idx + 1).padStart(2, '0'),
        title: idx === 0 ? 'Review priority' : `Adviser item ${idx + 1}`,
        desc: reason,
      }))
    : [
        {
          num: '01',
          title: 'Basic nil-rate band applied',
          desc: `Applied at ${clean(formatMoney(result.nilRateBand!))}${result.input.scenario === 'individual' ? ' (individual allowance).' : ' (includes transferred allowance).'}`
        },
        {
          num: '02',
          title: 'Residence nil-rate band applied',
          desc:
            result.residenceBand && result.residenceBand > 0
              ? `Applied at ${clean(formatMoney(result.residenceBand))}${(result.residenceTaperLoss ?? 0) > 0 ? `; ${clean(formatMoney(result.residenceTaperLoss!))} lost through tapering.` : ' for qualifying home.'}`
              : (result.residenceTaperLoss ?? 0) > 0
                ? `£0 applied (${clean(formatMoney(result.residenceTaperLoss!))} lost through tapering).`
                : 'Residence nil-rate band not claimed or not applicable for this scenario.'
        },
        {
          num: '03',
          title: 'Total allowances applied',
          desc: `Total allowances: ${clean(formatMoney(result.totalAllowances!))} | Taxable estate: ${clean(formatMoney(result.taxable!))}`
        },
        {
          num: '04',
          title: result.heading ? 'Estimated IHT after both deaths' : 'Estimated inheritance tax',
          desc: `${clean(formatMoney(result.tax!))} charged at the standard 40% rate on taxable estate.`
        }
      ];

  const itemStep = result.needsReview ? 38 : 31;
  let itemY = sectionTitleY - 24;
  for (const item of checkItems) {
    page1.drawText(item.num, {
      x: 40,
      y: itemY,
      size: 10,
      font: helveticaBold,
      color: cGold,
    });
    page1.drawText(item.title, {
      x: 62,
      y: itemY,
      size: 9.5,
      font: helveticaBold,
      color: cBlackText,
    });
    const descLines = wrapText(item.desc, helvetica, 8, 480);
    page1.drawText(descLines[0] ?? '', {
      x: 62,
      y: itemY - 11,
      size: 8,
      font: helvetica,
      color: cMutedText,
    });
    if (descLines[1] && result.needsReview) {
      page1.drawText(descLines[1], {
        x: 62,
        y: itemY - 20,
        size: 8,
        font: helvetica,
        color: cMutedText,
      });
    }
    itemY -= itemStep;
  }

  // Page 1 Dark Callout Box
  const ctaBoxY = 175;
  const ctaBoxH = 145;
  page1.drawRectangle({
    x: 40,
    y: ctaBoxY,
    width: 515,
    height: ctaBoxH,
    color: cBlack,
  });
  // Heading lines (Serif)
  page1.drawText('Could your family pay the tax bill', {
    x: 58,
    y: ctaBoxY + 112,
    size: 16.5,
    font: timesRoman,
    color: cWhite,
  });
  page1.drawText('without selling the assets you', {
    x: 58,
    y: ctaBoxY + 92,
    size: 16.5,
    font: timesRoman,
    color: cWhite,
  });
  page1.drawText('want them to keep?', {
    x: 58,
    y: ctaBoxY + 72,
    size: 16.5,
    font: timesRoman,
    color: cWhite,
  });
  // Subtitle
  page1.drawText('Start with a complimentary Financial & Estate Review.', {
    x: 58,
    y: ctaBoxY + 50,
    size: 9.5,
    font: helvetica,
    color: rgb(0.85, 0.85, 0.85),
  });
  // Gold CTA Button
  page1.drawRectangle({
    x: 58,
    y: ctaBoxY + 14,
    width: 236,
    height: 25,
    color: cGold,
  });
  page1.drawText('Request my Financial & Estate Review', {
    x: 72,
    y: ctaBoxY + 22,
    size: 9.5,
    font: helveticaBold,
    color: rgb(0.08, 0.08, 0.08),
  });
  // Phone number next to button
  page1.drawText(nationalPhone, {
    x: 316,
    y: ctaBoxY + 21,
    size: 12,
    font: helveticaBold,
    color: cGold,
  });

  drawFooter(page1, 1, 3);

  // ==========================================
  // PAGE 2: Planning for the Bill & Consequences
  // ==========================================
  const page2 = pdf.addPage([595, 842]);

  // Page 2 Header Banner
  page2.drawRectangle({
    x: 0,
    y: 777,
    width: 595,
    height: 65,
    color: cBlack,
  });
  if (logoImage) {
    page2.drawImage(logoImage, {
      x: 40,
      y: 784.5,
      width: 100,
      height: 50,
    });
  } else {
    drawHeaderFallback(page2, 40, 788, false);
  }
  const p2HeaderTitle = 'PLANNING FOR THE BILL';
  const p2TitleW = helveticaBold.widthOfTextAtSize(p2HeaderTitle, 8.5);
  page2.drawText(p2HeaderTitle, {
    x: 555 - p2TitleW,
    y: 804,
    size: 8.5,
    font: helveticaBold,
    color: cGold,
  });
  // Gold line
  page2.drawRectangle({
    x: 0,
    y: 775.5,
    width: 595,
    height: 1.5,
    color: cGold,
  });

  // Page 2 Heading & Intro
  page2.drawText('An inheritance is more', {
    x: 40,
    y: 732,
    size: 25,
    font: timesRoman,
    color: cBlackText,
  });
  page2.drawText('than its cash value.', {
    x: 40,
    y: 704,
    size: 25,
    font: timesRoman,
    color: cBlackText,
  });
  page2.drawText(
    'If there is not enough accessible money in your estate or other suitable funding, your executors',
    {
      x: 40,
      y: 672,
      size: 9.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page2.drawText(
    'may need to sell assets to pay Inheritance Tax. Your children could then inherit fewer of the assets',
    {
      x: 40,
      y: 658,
      size: 9.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page2.drawText('you hoped they would keep.', {
    x: 40,
    y: 644,
    size: 9.5,
    font: helvetica,
    color: cMutedDark,
  });

  // 3 Consequence Cards
  const consequenceCards = [
    {
      num: '01',
      title: 'The family home',
      desc: 'A sale could remove the option to keep the property and benefit from any future increase in its value.',
      y: 582,
    },
    {
      num: '02',
      title: 'Buy-to-let property',
      desc: 'Selling a rental property can end the rent from that property and give up any future capital growth on it.',
      y: 526,
    },
    {
      num: '03',
      title: 'Shares and investment funds',
      desc: 'Selling holdings can mean giving up future dividends and potential investment growth on the investments sold.',
      y: 470,
    },
  ];

  for (const c of consequenceCards) {
    page2.drawRectangle({
      x: 40,
      y: c.y,
      width: 515,
      height: 46,
      color: cCardBg,
      borderColor: cCardBorder,
      borderWidth: 0.5,
    });
    page2.drawText(c.num, {
      x: 52,
      y: c.y + 18,
      size: 13,
      font: helveticaBold,
      color: cGold,
    });
    page2.drawText(c.title, {
      x: 80,
      y: c.y + 26,
      size: 10,
      font: helveticaBold,
      color: cBlackText,
    });
    page2.drawText(c.desc, {
      x: 80,
      y: c.y + 12,
      size: 8.5,
      font: helvetica,
      color: cMutedText,
    });
  }

  // Consequences Disclaimer
  page2.drawText(
    'These are possible consequences, not a prediction for your estate. Values and income can fall as well as rise; future growth,',
    {
      x: 40,
      y: 442,
      size: 7.5,
      font: helveticaOblique,
      color: cGreyText,
    },
  );
  page2.drawText('dividends and rental income are not guaranteed.', {
    x: 40,
    y: 431,
    size: 7.5,
    font: helveticaOblique,
    color: cGreyText,
  });

  // Section: "A sale is not inevitable."
  page2.drawRectangle({
    x: 40,
    y: 336,
    width: 3,
    height: 72,
    color: cGold,
  });
  page2.drawText('A sale is not inevitable.', {
    x: 52,
    y: 398,
    size: 11,
    font: helveticaBold,
    color: cBlackText,
  });
  page2.drawText(
    'Inheritance Tax is normally paid from the estate. Children do not automatically have to fund it personally.',
    {
      x: 52,
      y: 384,
      size: 8.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page2.drawText(
    'Some tax usually needs paying before probate, and payment is generally due by the end of the sixth month',
    {
      x: 52,
      y: 372.5,
      size: 8.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page2.drawText('after death. [1]', {
    x: 52,
    y: 361,
    size: 8.5,
    font: helvetica,
    color: cMutedDark,
  });

  page2.drawText(
    'Eligible accounts can pay HMRC directly. Tax on qualifying assets, including property, may be paid over 10',
    {
      x: 52,
      y: 346,
      size: 8.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page2.drawText(
    'annual instalments; interest may apply. A sale can bring the outstanding tax on that asset due. [2, 3]',
    {
      x: 52,
      y: 334.5,
      size: 8.5,
      font: helvetica,
      color: cMutedDark,
    },
  );

  // Bottom Callout Box with QR Code
  const p2BoxY = 175;
  const p2BoxH = 135;
  page2.drawRectangle({
    x: 40,
    y: p2BoxY,
    width: 515,
    height: p2BoxH,
    color: cBlack,
  });
  page2.drawText('Give your family more options.', {
    x: 58,
    y: p2BoxY + 102,
    size: 16,
    font: timesRoman,
    color: cWhite,
  });
  page2.drawText(
    'Explore your potential tax exposure, the assets you want to keep, and funding',
    {
      x: 58,
      y: p2BoxY + 80,
      size: 8.5,
      font: helvetica,
      color: rgb(0.85, 0.85, 0.85),
    },
  );
  page2.drawText(
    'options such as cash reserves or suitable life cover. Any advice follows a full',
    {
      x: 58,
      y: p2BoxY + 68,
      size: 8.5,
      font: helvetica,
      color: rgb(0.85, 0.85, 0.85),
    },
  );
  page2.drawText('assessment.', {
    x: 58,
    y: p2BoxY + 56,
    size: 8.5,
    font: helvetica,
    color: rgb(0.85, 0.85, 0.85),
  });

  // Button
  page2.drawRectangle({
    x: 58,
    y: p2BoxY + 18,
    width: 236,
    height: 26,
    color: cGold,
  });
  page2.drawText('Request my Financial & Estate Review', {
    x: 72,
    y: p2BoxY + 27,
    size: 9.5,
    font: helveticaBold,
    color: rgb(0.08, 0.08, 0.08),
  });

  // QR Code Rendering (Vector squares)
  const qrCardW = 74;
  const qrCardH = 74;
  const qrCardX = 442;
  const qrCardY = p2BoxY + 31;
  page2.drawRectangle({
    x: qrCardX,
    y: qrCardY,
    width: qrCardW,
    height: qrCardH,
    color: cWhite,
  });

  try {
    const qr = QRCode.create(bookingUrl, { errorCorrectionLevel: 'M' });
    const qrSize = 62;
    const mSize = qrSize / qr.modules.size;
    const qrInnerX = qrCardX + (qrCardW - qrSize) / 2;
    const qrInnerY = qrCardY + (qrCardH - qrSize) / 2;
    for (let r = 0; r < qr.modules.size; r++) {
      for (let c = 0; c < qr.modules.size; c++) {
        if (qr.modules.get(r, c)) {
          page2.drawRectangle({
            x: qrInnerX + c * mSize,
            y: qrInnerY + (qr.modules.size - 1 - r) * mSize,
            width: mSize,
            height: mSize,
            color: rgb(0, 0, 0),
          });
        }
      }
    }
  } catch {
    // If QR code fails to render, white container remains clean
  }

  const scanText = 'Scan to request';
  const scanTw = helvetica.widthOfTextAtSize(scanText, 7.5);
  page2.drawText(scanText, {
    x: qrCardX + (qrCardW - scanTw) / 2,
    y: p2BoxY + 18,
    size: 7.5,
    font: helvetica,
    color: rgb(0.85, 0.85, 0.85),
  });

  drawFooter(page2, 2, 3);

  // ==========================================
  // PAGE 3: Detailed Inputs, Tables & Notes
  // ==========================================
  const page3 = pdf.addPage([595, 842]);

  // Page 3 Header Banner
  page3.drawRectangle({
    x: 0,
    y: 777,
    width: 595,
    height: 65,
    color: cBlack,
  });
  if (logoImage) {
    page3.drawImage(logoImage, {
      x: 40,
      y: 784.5,
      width: 100,
      height: 50,
    });
  } else {
    drawHeaderFallback(page3, 40, 788, false);
  }
  const p3HeaderTitle = 'YOUR INPUTS & REPORT NOTES';
  const p3TitleW = helveticaBold.widthOfTextAtSize(p3HeaderTitle, 8.5);
  page3.drawText(p3HeaderTitle, {
    x: 555 - p3TitleW,
    y: 804,
    size: 8.5,
    font: helveticaBold,
    color: cGold,
  });
  // Gold line
  page3.drawRectangle({
    x: 0,
    y: 775.5,
    width: 595,
    height: 1.5,
    color: cGold,
  });

  // Page 3 Heading & Subtitle
  page3.drawText('The detail behind your report', {
    x: 40,
    y: 732,
    size: 25,
    font: timesRoman,
    color: cBlackText,
  });
  page3.drawText(
    `Calculation date: ${formattedDateSlash} | Tax year: ${result.taxYear} | Rules: ${result.rulesVersion}`,
    {
      x: 40,
      y: 712,
      size: 8.5,
      font: helvetica,
      color: cGreyText,
    },
  );

  // Two Tables Side-by-Side
  const tblW = 248;
  const tblHdrH = 22;
  const tblHdrY = 676;
  const rowH = 18;

  // Left Table: ASSETS & DEBTS ENTERED
  page3.drawRectangle({
    x: 40,
    y: tblHdrY,
    width: tblW,
    height: tblHdrH,
    color: cBlack,
  });
  page3.drawText('ASSETS & DEBTS ENTERED', {
    x: 48,
    y: tblHdrY + 7,
    size: 8,
    font: helveticaBold,
    color: cWhite,
  });

  const isCouple = result.input.scenario === 'couple';
  const assetRows = [
    {
      label: isCouple ? 'Home value (combined)' : 'Your share of home value',
      val: clean(formatMoney(result.input.home)),
    },
    {
      label: isCouple ? 'Mortgage on the home' : 'Mortgage on that share',
      val: clean(formatMoney(result.input.homeMortgage)),
    },
    { label: 'Savings', val: clean(formatMoney(result.input.savings)) },
    { label: 'Investments', val: clean(formatMoney(result.input.investments)) },
    { label: 'Other assets', val: clean(formatMoney(result.input.otherAssets)) },
    { label: 'Other debts', val: clean(formatMoney(result.input.debts)) },
    { label: 'Pensions (not included)', val: clean(formatMoney(result.input.pensions)) },
    { label: 'Net estate entered', val: clean(formatMoney(result.estate)), isTotal: true },
  ];

  assetRows.forEach((r, idx) => {
    const ry = tblHdrY - (idx + 1) * rowH;
    page3.drawRectangle({
      x: 40,
      y: ry,
      width: tblW,
      height: rowH,
      color: r.isTotal ? rgb(0.95, 0.94, 0.91) : idx % 2 === 1 ? cZebraBg : cWhite,
    });
    page3.drawLine({
      start: { x: 40, y: ry },
      end: { x: 40 + tblW, y: ry },
      thickness: 0.5,
      color: rgb(0.92, 0.92, 0.9),
    });
    page3.drawText(r.label, {
      x: 48,
      y: ry + 5.5,
      size: 7.8,
      font: r.isTotal ? helveticaBold : helvetica,
      color: r.isTotal ? cBlackText : cMutedDark,
    });
    const vw = (r.isTotal ? helveticaBold : helvetica).widthOfTextAtSize(r.val, 7.8);
    page3.drawText(r.val, {
      x: 40 + tblW - 8 - vw,
      y: ry + 5.5,
      size: 7.8,
      font: r.isTotal ? helveticaBold : helvetica,
      color: cBlackText,
    });
  });

  // Right Table: YOUR SELECTIONS & ALLOWANCES
  page3.drawRectangle({
    x: 307,
    y: tblHdrY,
    width: tblW,
    height: tblHdrH,
    color: cBlack,
  });
  page3.drawText('YOUR SELECTIONS & ALLOWANCES', {
    x: 315,
    y: tblHdrY + 7,
    size: 8,
    font: helveticaBold,
    color: cWhite,
  });

  const scenarioLabels: Record<string, string> = {
    individual: 'Individual',
    couple: 'Couple - after both deaths',
    survivor: 'Surviving spouse',
  };
  const residenceLabels: Record<string, string> = {
    'straightforward-uk': 'Straightforward UK',
    other: 'Other residence',
    unsure: 'Not sure',
  };
  const beneficiaryLabels: Record<string, string> = {
    descendants: 'Direct descendants',
    spouse: 'Spouse or partner',
    others: 'Other beneficiaries',
    mixed: 'Mixed beneficiaries',
    unsure: 'Not sure',
  };
  const qualifyingLabels: Record<string, string> = {
    yes: 'Yes',
    no: 'No',
    unsure: 'Not sure',
  };

  const selectionRows = [
    {
      label: 'Estate scenario',
      val: scenarioLabels[result.input.scenario] ?? result.input.scenario,
    },
    {
      label: 'Residence screen',
      val: residenceLabels[result.input.residence] ?? result.input.residence,
    },
    {
      label: 'Beneficiaries',
      val: beneficiaryLabels[result.input.beneficiaries] ?? result.input.beneficiaries,
    },
    {
      label: 'Qualifying home',
      val: qualifyingLabels[result.input.qualifyingHome] ?? result.input.qualifyingHome,
    },
    ...(isCouple
      ? [
          {
            label: 'All to survivor on 1st death',
            val:
              { 'all-to-spouse': 'Yes', other: 'No', unsure: 'Not sure', na: '-' }[
                result.input.firstDeathPassing
              ] ?? result.input.firstDeathPassing,
          },
          {
            label: 'Either estate over £2m',
            val:
              result.input.largerEstateOver2m === 'yes'
                ? `Yes - ${clean(formatMoney(result.input.largerEstate))}`
                : ({ no: 'No', unsure: 'Not sure', na: '-' }[result.input.largerEstateOver2m] ??
                  result.input.largerEstateOver2m),
          },
        ]
      : [
          {
            label: 'Unused basic allowance',
            val:
              result.input.transferNrb === 'unsure' ? 'Not sure' : `${result.input.transferNrb}%`,
          },
          {
            label: 'Unused residence allowance',
            val:
              result.input.transferRnrb === 'unsure' ? 'Not sure' : `${result.input.transferRnrb}%`,
          },
        ]),
    {
      label: 'Total allowances applied',
      val: result.totalAllowances !== null ? clean(formatMoney(result.totalAllowances)) : 'Review',
    },
    {
      label: 'Estimated inheritance tax',
      val: result.tax !== null ? clean(formatMoney(result.tax)) : 'Review',
    },
  ];

  selectionRows.forEach((r, idx) => {
    const ry = tblHdrY - (idx + 1) * rowH;
    page3.drawRectangle({
      x: 307,
      y: ry,
      width: tblW,
      height: rowH,
      color: idx % 2 === 1 ? cZebraBg : cWhite,
    });
    page3.drawLine({
      start: { x: 307, y: ry },
      end: { x: 307 + tblW, y: ry },
      thickness: 0.5,
      color: rgb(0.92, 0.92, 0.9),
    });
    page3.drawText(r.label, {
      x: 315,
      y: ry + 5.5,
      size: 7.8,
      font: helvetica,
      color: cMutedDark,
    });
    const vw = helveticaBold.widthOfTextAtSize(r.val, 7.8);
    page3.drawText(r.val, {
      x: 307 + tblW - 8 - vw,
      y: ry + 5.5,
      size: 7.8,
      font: helveticaBold,
      color: cBlackText,
    });
  });

  // Section: "How to read this illustration"
  page3.drawText('How to read this illustration', {
    x: 40,
    y: 510,
    size: 14,
    font: timesRoman,
    color: cBlackText,
  });

  // Paragraph 1: Headline result state (bold lead)
  if (result.needsReview) {
    page3.drawText(
      'Your result is incomplete. The unanswered questions may materially change the tax position. No headline tax',
      {
        x: 40,
        y: 494,
        size: 8,
        font: helveticaBold,
        color: cBlackText,
      },
    );
    page3.drawText('estimate or confirmed funding shortfall is shown.', {
      x: 40,
      y: 483,
      size: 8,
      font: helveticaBold,
      color: cBlackText,
    });
  } else {
    page3.drawText(
      'Your result is an illustration. The figures reflect the answers supplied and the stated rules. No headline tax',
      {
        x: 40,
        y: 494,
        size: 8,
        font: helveticaBold,
        color: cBlackText,
      },
    );
    page3.drawText('guarantee or formal valuation is shown.', {
      x: 40,
      y: 483,
      size: 8,
      font: helveticaBold,
      color: cBlackText,
    });
  }

  // Paragraph 2: Ownership and allowances (scenario-specific)
  const ownershipText = isCouple
    ? 'Ownership and allowances. Both partners\' combined assets and debts are included once, without double counting. Allowances transfer from the first death only where your answers confirm that everything passes outright to the survivor; the residence allowance is limited to the net qualifying home passing to direct descendants and tapered on each death where an estate exceeds £2 million.'
    : result.input.scenario === 'survivor'
      ? 'Ownership and allowances. Only the survivor\'s assets and debts are included, without double counting. The basic and residence allowances are increased only by the separately confirmed unused percentages entered. Where applicable, the residence allowance is limited to the qualifying home interest passing outright to direct descendants and tapered using net estate value before exemptions and reliefs.'
      : 'Ownership and allowances. Only the ownership shares and debts entered are included, without double counting. No unused allowance from another estate is included. Where applicable, the residence allowance is limited to the qualifying home interest passing outright to direct descendants and tapered using net estate value before exemptions and reliefs.';
  wrapText(ownershipText, helvetica, 7.5, 515)
    .slice(0, 4)
    .forEach((line, i) =>
      page3.drawText(line, {
        x: 40,
        y: 468 - i * 10,
        size: 7.5,
        font: helvetica,
        color: cMutedDark,
      }),
    );

  // Paragraph 3: Supported scope
  page3.drawText(
    'Supported scope. The calculator assumes straightforward UK long-term residence, including a recipient spouse or',
    {
      x: 40,
      y: 422,
      size: 7.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page3.drawText(
    'civil partner where relevant, and outright inheritance by the selected non-exempt beneficiaries. Those conditions are',
    {
      x: 40,
      y: 412,
      size: 7.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page3.drawText(
    result.needsReview
      ? 'not confirmed by your answers.'
      : 'reflected in your answers.',
    {
      x: 40,
      y: 402,
      size: 7.5,
      font: helvetica,
      color: cMutedDark,
    },
  );

  // Paragraph 4: Not modelled
  page3.drawText(
    'Not modelled. Relevant lifetime gifts, trusts, business or agricultural relief, charitable gifts, downsizing claims,',
    {
      x: 40,
      y: 386,
      size: 7.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page3.drawText(
    'overseas assets and other specialist factors require review. No future asset growth, tax saving, product',
    {
      x: 40,
      y: 376,
      size: 7.5,
      font: helvetica,
      color: cMutedDark,
    },
  );
  page3.drawText('recommendation or guarantee is included.', {
    x: 40,
    y: 366,
    size: 7.5,
    font: helvetica,
    color: cMutedDark,
  });

  // Section: Official guidance
  page3.drawText('Official guidance', {
    x: 40,
    y: 344,
    size: 9.5,
    font: helveticaBold,
    color: cBlackText,
  });
  page3.drawText('[1] Paying Inheritance Tax', {
    x: 40,
    y: 328,
    size: 7.5,
    font: helvetica,
    color: cMutedText,
  });
  page3.drawText('[2] Direct Payment Scheme', {
    x: 40,
    y: 316,
    size: 7.5,
    font: helvetica,
    color: cMutedText,
  });
  page3.drawText('[3] Paying by instalments', {
    x: 40,
    y: 304,
    size: 7.5,
    font: helvetica,
    color: cMutedText,
  });

  page3.drawText('[4] IHT overview and allowances', {
    x: 307,
    y: 328,
    size: 7.5,
    font: helvetica,
    color: cMutedText,
  });
  page3.drawText('[5] Residence nil-rate band', {
    x: 307,
    y: 316,
    size: 7.5,
    font: helvetica,
    color: cMutedText,
  });

  // Legal / Regulatory Disclaimers
  page3.drawText(
    'This report reflects the answers supplied. It is not a valuation, tax return, recommendation or individual legal or financial advice. Tax',
    {
      x: 40,
      y: 268,
      size: 7,
      font: helvetica,
      color: cGreyText,
    },
  );
  page3.drawText(
    'rules and personal circumstances can change. The initial review is complimentary and exploratory; any further advice,',
    {
      x: 40,
      y: 258.5,
      size: 7,
      font: helvetica,
      color: cGreyText,
    },
  );
  page3.drawText('implementation and fees are agreed separately.', {
    x: 40,
    y: 249,
    size: 7,
    font: helvetica,
    color: cGreyText,
  });

  page3.drawText(
    'Better Call Sim is a trading style of Anand Wills & Trusts Ltd. Regulated financial advice is provided by Anand Financial Architecture',
    {
      x: 40,
      y: 233,
      size: 7,
      font: helvetica,
      color: cGreyText,
    },
  );
  page3.drawText(
    'Ltd. Estate-planning and will-writing services are outside FCA regulation. Service providers, scope and protections are confirmed',
    {
      x: 40,
      y: 223.5,
      size: 7,
      font: helvetica,
      color: cGreyText,
    },
  );
  page3.drawText('before engagement.', {
    x: 40,
    y: 214,
    size: 7,
    font: helvetica,
    color: cGreyText,
  });

  drawFooter(page3, 3, 3);

  return pdf.save();
}

export function pdfBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
