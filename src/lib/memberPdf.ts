import type { Member } from "@/lib/types";
import { formatDateShort, formatNumber } from "@/lib/utils";
import { LOGO_STT_DATA_URL } from "@/lib/logoData";

const BG = [8, 9, 12] as const;
const SURFACE = [16, 17, 22] as const;
const SURFACE_ALT = [12, 13, 17] as const;
const HEADER = [20, 18, 13] as const;
const BORDER = [38, 38, 45] as const;
const GOLD = [212, 175, 55] as const;
const GOLD_LIGHT = [250, 204, 21] as const;
const GOLD_DIM = [116, 92, 34] as const;
const WHITE = [245, 244, 240] as const;
const MUTED = [151, 156, 168] as const;
const SOFT = [112, 117, 130] as const;

/**
 * Column layout for the member table. The x/width values are tuned so the
 * table is perfectly symmetric inside the 10mm page margins:
 * left edge = 10, right edge = pageWidth - 10.
 */
const COLUMNS = [
  { label: "NO", x: 10, width: 9, align: "center" },
  { label: "ID ANGGOTA", x: 19, width: 25, align: "left" },
  { label: "NAMA LENGKAP", x: 44, width: 50, align: "left" },
  { label: "WHATSAPP", x: 94, width: 27, align: "left" },
  { label: "TEMPEKAN", x: 121, width: 38, align: "left" },
  { label: "STATUS", x: 159, width: 22, align: "left" },
  { label: "USIA", x: 181, width: 18, align: "left" },
  { label: "ALAMAT LENGKAP", x: 199, width: 66, align: "left" },
  { label: "TGL DAFTAR", x: 265, width: 22, align: "left" },
] as const;

const pad2 = (value: number) => String(value).padStart(2, "0");

export async function downloadMembersPdf(members: Member[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const marginX = 10;
  const contentW = pageW - marginX * 2;
  const centerX = pageW / 2;

  const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));
  const now = new Date();
  const generatedAt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const dateStamp = now.toISOString().slice(0, 10);
  const tempekanCount = new Set(
    sortedMembers.map((member) => member.tempekan),
  ).size;
  const pengurusCount = sortedMembers.filter(
    (member) => member.status !== "Anggota",
  ).length;

  /** Draws the emblem at an exact position; falls back to a text badge. */
  const addLogo = (x: number, y: number, size: number) => {
    pdf.addImage(LOGO_STT_DATA_URL, "PNG", x, y, size, size, "stt-logo", "FAST");
  };

  /** Always horizontally centred on the page — the "precise centre" logo. */
  const addCenteredLogo = (size: number, y: number) => {
    addLogo((pageW - size) / 2, y, size);
  };

  const centerText = (
    text: string,
    y: number,
    size: number,
    color: readonly [number, number, number],
    style: "normal" | "bold" = "normal",
  ) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(text, centerX, y, { align: "center" });
  };

  const hairline = (
    y: number,
    color: readonly [number, number, number] = BORDER,
    width = 0.25,
  ) => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(width);
    pdf.line(marginX, y, pageW - marginX, y);
  };

  // ============================================================== COVER
  pdf.setFillColor(...BG);
  pdf.rect(0, 0, pageW, pageH, "F");

  pdf.setDrawColor(...GOLD_DIM);
  pdf.setLineWidth(0.4);
  pdf.rect(8, 8, pageW - 16, pageH - 16);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.2);
  pdf.rect(10.5, 10.5, pageW - 21, pageH - 21);

  pdf.setDrawColor(40, 34, 19);
  pdf.setLineWidth(0.5);
  for (const radius of [40, 53, 66, 79]) {
    pdf.circle(pageW + 2, pageH / 2, radius, "S");
  }

  addCenteredLogo(30, 24);

  centerText("PUSBAYA HUB", 66, 21, GOLD_LIGHT, "bold");
  centerText("SISTEM PENDATAAN ORGANISASI", 73.5, 7.6, MUTED);

  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - 46, 82, centerX - 5, 82);
  pdf.line(centerX + 5, 82, centerX + 46, 82);
  pdf.setFillColor(...GOLD_LIGHT);
  pdf.circle(centerX, 82, 1.1, "F");

  centerText("DIREKTORI", 101, 30, WHITE, "bold");
  centerText("ANGGOTA", 115, 30, GOLD_LIGHT, "bold");

  centerText("Sekaa Teruna Putra Settu Bhakti Jaya", 127, 11, WHITE);
  centerText("Banjar Campuan · Desa Adat Kerobokan", 133, 8, MUTED);

  const stats = [
    { label: "TOTAL ANGGOTA", value: formatNumber(sortedMembers.length) },
    { label: "TEMPEKAN", value: formatNumber(tempekanCount) },
    { label: "PENGURUS & KETUA", value: formatNumber(pengurusCount) },
  ];
  const cardW = 62;
  const cardH = 26;
  const cardGap = 6;
  const statsW = cardW * stats.length + cardGap * (stats.length - 1);
  const statsX = (pageW - statsW) / 2;
  const cardY = 146;

  stats.forEach((stat, index) => {
    const x = statsX + index * (cardW + cardGap);
    pdf.setFillColor(...SURFACE_ALT);
    pdf.roundedRect(x, cardY, cardW, cardH, 2.5, 2.5, "F");
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(x, cardY, cardW, cardH, 2.5, 2.5, "S");
    pdf.setFillColor(...GOLD);
    pdf.rect(x, cardY + 3.5, 1.4, cardH - 7, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.4);
    pdf.setTextColor(...MUTED);
    pdf.text(stat.label, x + cardW / 2, cardY + 9.5, { align: "center" });

    pdf.setFontSize(17);
    pdf.setTextColor(...GOLD_LIGHT);
    pdf.text(stat.value, x + cardW / 2, cardY + 19.5, { align: "center" });
  });

  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.25);
  pdf.line(centerX - 62, 184, centerX + 62, 184);
  centerText("Dihasilkan otomatis oleh PUSBAYA HUB", 191, 6.6, SOFT);
  centerText(`Dibuat ${generatedAt}`, 196.5, 6.6, SOFT);

  // ========================================================= DATA PAGES
  const dataPages: number[] = [];
  let pageNumber = 1;

  const drawDataHeader = () => {
    pdf.setFillColor(...BG);
    pdf.rect(0, 0, pageW, pageH, "F");

    pdf.setFillColor(...HEADER);
    pdf.rect(0, 0, pageW, 32, "F");

    addCenteredLogo(11, 4);
    centerText("PUSBAYA HUB", 23, 10.5, GOLD_LIGHT, "bold");
    centerText("DIREKTORI ANGGOTA · ST PUTRA SETTU BHAKTI JAYA", 28, 6.4, MUTED);

    pdf.setDrawColor(...GOLD_DIM);
    pdf.setLineWidth(0.4);
    pdf.line(0, 32, pageW, 32);
  };

  const drawTableHeader = (top: number) => {
    pdf.setFillColor(...HEADER);
    pdf.rect(marginX, top, contentW, 8.5, "F");
    pdf.setDrawColor(...GOLD_DIM);
    pdf.setLineWidth(0.35);
    pdf.line(marginX, top, pageW - marginX, top);
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, top + 8.5, pageW - marginX, top + 8.5);

    COLUMNS.forEach((column) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(5.9);
      pdf.setTextColor(...GOLD);
      if (column.align === "center") {
        pdf.text(column.label, column.x + column.width / 2, top + 5.4, {
          align: "center",
        });
      } else {
        pdf.text(column.label, column.x + 2, top + 5.4);
      }
    });

    return top + 8.5;
  };

  const startDataPage = () => {
    pdf.addPage("a4", "landscape");
    pageNumber += 1;
    dataPages.push(pageNumber);
    drawDataHeader();
    return drawTableHeader(36);
  };

  const drawLines = (
    lines: string[],
    x: number,
    y: number,
    lineHeight = 3.3,
  ) => {
    lines.forEach((line, index) => {
      pdf.text(line, x, y + index * lineHeight);
    });
  };

  if (sortedMembers.length === 0) {
    pdf.addPage("a4", "landscape");
    pageNumber += 1;
    dataPages.push(pageNumber);
    drawDataHeader();
    centerText("Belum ada data anggota untuk ditampilkan.", pageH / 2 - 3, 13, MUTED);
    centerText(
      "Tambahkan anggota melalui dashboard PUSBAYA HUB.",
      pageH / 2 + 6,
      8,
      SOFT,
    );
  } else {
    let y = startDataPage();
    const maxY = pageH - 15;

    sortedMembers.forEach((member, index) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.2);
      const idLines = pdf.splitTextToSize(member.id, COLUMNS[1].width - 4);
      pdf.setFontSize(6.9);
      const nameLines = pdf.splitTextToSize(member.nama, COLUMNS[2].width - 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.4);
      const whatsappLines = pdf.splitTextToSize(
        member.whatsapp,
        COLUMNS[3].width - 4,
      );
      pdf.setFontSize(6.2);
      const tempekanLines = pdf.splitTextToSize(
        member.tempekan,
        COLUMNS[4].width - 4,
      );
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.2);
      const statusLines = pdf.splitTextToSize(
        member.status,
        COLUMNS[5].width - 4,
      );
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.3);
      const usiaLines = pdf.splitTextToSize(member.usia, COLUMNS[6].width - 4);
      pdf.setFontSize(6.2);
      const alamatLines = pdf.splitTextToSize(member.alamat, COLUMNS[7].width - 4);
      const dateLines = pdf.splitTextToSize(
        formatDateShort(member.createdAt.slice(0, 10)),
        COLUMNS[8].width - 4,
      );

      const maxLines = Math.max(
        idLines.length,
        nameLines.length,
        whatsappLines.length,
        tempekanLines.length,
        statusLines.length,
        usiaLines.length,
        alamatLines.length,
        dateLines.length,
        1,
      );
      const rowHeight = Math.max(8.6, 4.5 + (maxLines - 1) * 3.3 + 2.4);

      if (y + rowHeight > maxY) {
        y = startDataPage();
      }

      const rowFill = index % 2 === 0 ? SURFACE : SURFACE_ALT;
      pdf.setFillColor(rowFill[0], rowFill[1], rowFill[2]);
      pdf.rect(marginX, y, contentW, rowHeight, "F");
      pdf.setFillColor(...GOLD_DIM);
      pdf.rect(marginX, y, 0.6, rowHeight, "F");

      const baseline = y + 4.6;
      const setCellFont = (size: number, bold = false) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
      };

      setCellFont(6.3);
      pdf.setTextColor(...SOFT);
      pdf.text(pad2(index + 1), COLUMNS[0].x + COLUMNS[0].width / 2, baseline, {
        align: "center",
      });

      setCellFont(6.2, true);
      pdf.setTextColor(...GOLD);
      drawLines(idLines, COLUMNS[1].x + 2, baseline);

      setCellFont(6.9, true);
      pdf.setTextColor(...WHITE);
      drawLines(nameLines, COLUMNS[2].x + 2, baseline);

      setCellFont(6.4);
      pdf.setTextColor(...MUTED);
      drawLines(whatsappLines, COLUMNS[3].x + 2, baseline);

      setCellFont(6.2);
      pdf.setTextColor(...MUTED);
      drawLines(tempekanLines, COLUMNS[4].x + 2, baseline);

      setCellFont(6.2, true);
      const statusColor =
        member.status === "Ketua"
          ? GOLD_LIGHT
          : member.status === "Pengurus"
            ? GOLD
            : MUTED;
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      drawLines(statusLines, COLUMNS[5].x + 2, baseline);

      setCellFont(6.3);
      pdf.setTextColor(...MUTED);
      drawLines(usiaLines, COLUMNS[6].x + 2, baseline);

      setCellFont(6.2);
      pdf.setTextColor(...MUTED);
      drawLines(alamatLines, COLUMNS[7].x + 2, baseline);

      setCellFont(6.2);
      pdf.setTextColor(...MUTED);
      drawLines(dateLines, COLUMNS[8].x + 2, baseline);

      pdf.setDrawColor(...BORDER);
      pdf.setLineWidth(0.15);
      pdf.line(marginX, y + rowHeight, pageW - marginX, y + rowHeight);

      y += rowHeight + 0.7;
    });
  }

  dataPages.forEach((dataPage, index) => {
    pdf.setPage(dataPage);
    hairline(pageH - 11, BORDER, 0.3);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(...SOFT);
    pdf.text(
      "PUSBAYA HUB  |  ST Putra Settu Bhakti Jaya  |  Banjar Campuan, Kerobokan",
      marginX,
      pageH - 6,
    );
    pdf.text(
      `HALAMAN ${pad2(index + 1)} / ${pad2(dataPages.length)}`,
      pageW - marginX,
      pageH - 6,
      { align: "right" },
    );
  });

  pdf.save(`PUSBAYA-HUB-Direktori-Anggota-${dateStamp}.pdf`);
}
