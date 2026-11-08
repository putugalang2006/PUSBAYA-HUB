import type { Member } from "@/lib/types";
import { formatDateShort, formatNumber } from "@/lib/utils";
import { LOGO_STT_DATA_URL } from "@/lib/logoData";

const BG = [8, 9, 12] as const;
const SURFACE = [15, 16, 21] as const;
const SURFACE_ALT = [12, 13, 17] as const;
const HEADER = [21, 19, 15] as const;
const BORDER = [38, 38, 45] as const;
const GOLD = [212, 175, 55] as const;
const GOLD_LIGHT = [250, 204, 21] as const;
const GOLD_DIM = [116, 92, 34] as const;
const WHITE = [245, 244, 240] as const;
const MUTED = [151, 156, 168] as const;
const SOFT = [112, 117, 130] as const;

const COLUMNS = [
  { label: "NO", x: 10, width: 9, center: true },
  { label: "ID", x: 19, width: 24 },
  { label: "NAMA LENGKAP", x: 43, width: 47 },
  { label: "WHATSAPP", x: 90, width: 26 },
  { label: "TEMPEKAN", x: 116, width: 36 },
  { label: "STATUS", x: 152, width: 21 },
  { label: "USIA", x: 173, width: 17 },
  { label: "ALAMAT", x: 190, width: 75 },
  { label: "DAFTAR", x: 265, width: 22 },
] as const;

async function loadLogo(): Promise<string | null> {
  // Use the inlined base64 logo directly; no file/network request needed.
  return LOGO_STT_DATA_URL;
}

export async function downloadMembersPdf(members: Member[]): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const logo = await loadLogo();
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

  const addLogo = (x: number, y: number, size: number) => {
    if (logo) {
      pdf.addImage(logo, "PNG", x, y, size, size, "stt-logo", "FAST");
      return;
    }
    pdf.setFillColor(29, 24, 13);
    pdf.circle(x + size / 2, y + size / 2, size / 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(size * 1.9);
    pdf.setTextColor(...GOLD_LIGHT);
    pdf.text("STT", x + size / 2, y + size * 0.64, { align: "center" });
  };

  // ---------------------------------------------------------------- cover
  pdf.setFillColor(...BG);
  pdf.rect(0, 0, pageW, pageH, "F");

  pdf.setDrawColor(...GOLD_DIM);
  pdf.setLineWidth(0.35);
  pdf.rect(7, 7, pageW - 14, pageH - 14);

  pdf.setDrawColor(42, 36, 20);
  pdf.setLineWidth(0.45);
  pdf.circle(pageW + 4, pageH / 2, 40, "S");
  pdf.circle(pageW + 4, pageH / 2, 53, "S");
  pdf.circle(pageW + 4, pageH / 2, 66, "S");
  pdf.circle(pageW + 4, pageH / 2, 79, "S");

  addLogo(21, 19, 26);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...GOLD_LIGHT);
  pdf.text("PUSBAYA HUB", 52, 28);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MUTED);
  pdf.text("SISTEM PENDATAAN ORGANISASI", 52, 34);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(...GOLD);
  pdf.text("DOKUMEN RESMI", pageW - 20, 24, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.6);
  pdf.setTextColor(...MUTED);
  pdf.text("DIREKTORI ANGGOTA", pageW - 20, 29, { align: "right" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...GOLD);
  pdf.text("DIREKTORI RESMI", 21, 83);
  pdf.setFontSize(34);
  pdf.setTextColor(...WHITE);
  pdf.text("DIREKTORI", 21, 100);
  pdf.setTextColor(...GOLD_LIGHT);
  pdf.text("ANGGOTA", 21, 117);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...WHITE);
  pdf.text("Sekaa Teruna Putra Settu Bhakti Jaya", 21, 130);
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text("Banjar Campuan - Desa Adat Kerobokan", 21, 136);

  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(21, 143, 151, 143);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.line(151, 143, 274, 143);

  const stats = [
    { label: "TOTAL ANGGOTA", value: formatNumber(sortedMembers.length) },
    { label: "TEMPEKAN", value: formatNumber(tempekanCount) },
    { label: "PENGURUS & KETUA", value: formatNumber(pengurusCount) },
  ];

  stats.forEach((stat, index) => {
    const x = 21 + index * 66;
    pdf.setFillColor(...SURFACE_ALT);
    pdf.roundedRect(x, 151, 60, 23, 2, 2, "F");
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(x, 151, 60, 23, 2, 2, "S");
    pdf.setFillColor(...GOLD);
    pdf.rect(x, 151, 1.2, 23, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.3);
    pdf.setTextColor(...MUTED);
    pdf.text(stat.label, x + 5, 158);
    pdf.setFontSize(16);
    pdf.setTextColor(...GOLD_LIGHT);
    pdf.text(stat.value, x + 5, 168);
  });

  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.25);
  pdf.line(21, 186, 274, 186);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(...SOFT);
  pdf.text("Dihasilkan otomatis oleh PUSBAYA HUB", 21, 192);
  pdf.text(`Dibuat ${generatedAt}`, 274, 192, { align: "right" });

  // ----------------------------------------------------------- data pages
  const dataPages: number[] = [];
  let pageNumber = 1;

  const drawDataHeader = () => {
    pdf.setFillColor(...BG);
    pdf.rect(0, 0, pageW, pageH, "F");

    pdf.setFillColor(...HEADER);
    pdf.rect(0, 0, pageW, 28, "F");

    addLogo(10, 6.5, 15);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...GOLD_LIGHT);
    pdf.text("PUSBAYA HUB", 29, 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.6);
    pdf.setTextColor(...MUTED);
    pdf.text(
      "DIREKTORI ANGGOTA  |  ST PUTRA SETTU BHAKTI JAYA",
      29,
      18,
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.4);
    pdf.setTextColor(...GOLD);
    pdf.text("DATA ANGGOTA TERDAFTAR", pageW - marginX, 13, {
      align: "right",
    });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...SOFT);
    pdf.text(`Dibuat ${generatedAt}`, pageW - marginX, 18, {
      align: "right",
    });

    pdf.setDrawColor(...GOLD_DIM);
    pdf.setLineWidth(0.4);
    pdf.line(marginX, 28, pageW - marginX, 28);
  };

  const drawTableHeader = (top: number) => {
    pdf.setFillColor(...HEADER);
    pdf.rect(marginX, top, contentW, 8, "F");
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, top + 8, pageW - marginX, top + 8);

    COLUMNS.forEach((column) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(5.9);
      pdf.setTextColor(...GOLD);
      pdf.text(column.label, column.x + 2, top + 5.2);
    });
    return top + 8;
  };

  const startDataPage = () => {
    pdf.addPage("a4", "landscape");
    pageNumber += 1;
    dataPages.push(pageNumber);
    drawDataHeader();
    return drawTableHeader(35);
  };

  const drawLines = (
    lines: string[],
    x: number,
    y: number,
    lineHeight = 3.2,
  ) => {
    lines.forEach((line, index) => {
      pdf.text(line, x, y + index * lineHeight);
    });
  };

  if (sortedMembers.length > 0) {
    let y = startDataPage();
    const maxY = pageH - 15;

    sortedMembers.forEach((member, index) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.2);
      const idLines = pdf.splitTextToSize(
        member.id,
        COLUMNS[1].width - 4,
      ) as string[];
      pdf.setFontSize(6.8);
      const nameLines = pdf.splitTextToSize(
        member.nama,
        COLUMNS[2].width - 4,
      ) as string[];
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.3);
      const whatsappLines = pdf.splitTextToSize(
        member.whatsapp,
        COLUMNS[3].width - 4,
      ) as string[];
      pdf.setFontSize(6.2);
      const tempekanLines = pdf.splitTextToSize(
        member.tempekan,
        COLUMNS[4].width - 4,
      ) as string[];
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.1);
      const statusLines = pdf.splitTextToSize(
        member.status,
        COLUMNS[5].width - 4,
      ) as string[];
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.2);
      const usiaLines = pdf.splitTextToSize(
        member.usia,
        COLUMNS[6].width - 4,
      ) as string[];
      pdf.setFontSize(6.1);
      const alamatLines = pdf.splitTextToSize(
        member.alamat,
        COLUMNS[7].width - 4,
      ) as string[];
      const dateLines = pdf.splitTextToSize(
        formatDateShort(member.createdAt.slice(0, 10)),
        COLUMNS[8].width - 4,
      ) as string[];
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
      const rowHeight = Math.max(8.4, 4.2 + (maxLines - 1) * 3.2 + 2.2);

      if (y + rowHeight > maxY) {
        y = startDataPage();
      }

      const rowFill = index % 2 === 0 ? SURFACE : SURFACE_ALT;
      pdf.setFillColor(rowFill[0], rowFill[1], rowFill[2]);
      pdf.rect(marginX, y, contentW, rowHeight, "F");
      pdf.setFillColor(...GOLD_DIM);
      pdf.rect(marginX, y, 0.55, rowHeight, "F");

      const baseline = y + 4.3;
      const setCellFont = (size: number, bold = false) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
      };

      setCellFont(6.3);
      pdf.setTextColor(...SOFT);
      pdf.text(String(index + 1).padStart(2, "0"), 14.5, baseline, {
        align: "center",
      });

      setCellFont(6.2, true);
      pdf.setTextColor(...GOLD);
      drawLines(idLines, COLUMNS[1].x + 2, baseline);

      setCellFont(6.8, true);
      pdf.setTextColor(...WHITE);
      drawLines(nameLines, COLUMNS[2].x + 2, baseline);

      setCellFont(6.3);
      pdf.setTextColor(...MUTED);
      drawLines(whatsappLines, COLUMNS[3].x + 2, baseline);

      setCellFont(6.2);
      pdf.setTextColor(...MUTED);
      drawLines(tempekanLines, COLUMNS[4].x + 2, baseline);

      setCellFont(6.1, true);
      const statusColor =
        member.status === "Ketua"
          ? GOLD_LIGHT
          : member.status === "Pengurus"
            ? GOLD
            : MUTED;
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      drawLines(statusLines, COLUMNS[5].x + 2, baseline);

      setCellFont(6.2);
      pdf.setTextColor(...MUTED);
      drawLines(usiaLines, COLUMNS[6].x + 2, baseline);

      setCellFont(6.1);
      pdf.setTextColor(...MUTED);
      drawLines(alamatLines, COLUMNS[7].x + 2, baseline);

      setCellFont(6.1);
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
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pageH - 11, pageW - marginX, pageH - 11);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(...SOFT);
    pdf.text(
      "PUSBAYA HUB  |  ST Putra Settu Bhakti Jaya  |  Banjar Campuan, Kerobokan",
      marginX,
      pageH - 6,
    );
    pdf.text(
      `HALAMAN ${String(index + 1).padStart(2, "0")} / ${String(
        dataPages.length,
      ).padStart(2, "0")}`,
      pageW - marginX,
      pageH - 6,
      { align: "right" },
    );
  });

  pdf.save(`PUSBAYA-HUB-Direktori-Anggota-${dateStamp}.pdf`);
}
