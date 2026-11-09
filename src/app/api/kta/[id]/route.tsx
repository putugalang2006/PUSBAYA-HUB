import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { DEFAULT_AVATAR_DATA_URL, LOGO_STT_DATA_URL } from "@/lib/logoData";
import { fetchMemberById } from "@/lib/supabaseData";
import { formatDateShort } from "@/lib/utils";

/**
 * Server-Side KTA image generation.
 *
 * The PNG is rendered on the server with `next/og` (Satori + Resvg) instead of
 * being screenshotted in the browser. That removes every mobile Safari/Chrome
 * canvas quirk that used to drop the logo or the profile photo, because the
 * photo and the emblem are fetched and inlined as Base64 *before* rendering.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 1050;
const HEIGHT = 630;
const MASA_BERLAKU = "31 Desember 2026";

/** Fetches a remote image and returns it as a Base64 data URL. */
async function fetchAsDataUrl(
  url: string | null | undefined,
  fallback: string,
): Promise<string> {
  if (!url) return fallback;
  if (url.startsWith("data:")) return url;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return fallback;
    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength) return fallback;
    const mime =
      (response.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim() ||
      "image/jpeg";
    return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return fallback;
  }
}

async function buildQrDataUrl(member: {
  id: string;
  nama: string;
  tempekan: string;
}): Promise<string> {
  const payload = [
    "PUSBAYA HUB",
    `ID:${member.id}`,
    `NAMA:${member.nama}`,
    `TEMPEKAN:${member.tempekan}`,
    "ST PUTRA SETTU BHAKTI JAYA",
  ].join("|");

  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#0b0b0b", light: "#ffffff" },
    });
  } catch {
    return "";
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const member = await fetchMemberById(id);
    if (!member) {
      return Response.json(
        { error: "Anggota tidak ditemukan." },
        { status: 404 },
      );
    }

    const [photo, qr] = await Promise.all([
      fetchAsDataUrl(member.profilePicture, DEFAULT_AVATAR_DATA_URL),
      buildQrDataUrl(member),
    ]);

    const joined = formatDateShort(member.createdAt.slice(0, 10));
    const safeId = member.id.replace(/[^a-zA-Z0-9-_]/g, "_");

    return new ImageResponse(
      (
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            backgroundColor: "#07080b",
            padding: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
              padding: 36,
              borderRadius: 30,
              border: "2px solid #6b5a24",
              background:
                "linear-gradient(135deg, #12100b 0%, #0b0c10 52%, #14120c 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -90,
                right: -70,
                width: 280,
                height: 280,
                borderRadius: 140,
                border: "1px solid rgba(250,204,21,0.10)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -20,
                width: 190,
                height: 190,
                borderRadius: 95,
                border: "1px solid rgba(250,204,21,0.10)",
                display: "flex",
              }}
            />

            {/* Header: logo + "PUSBAYA HUB" */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={LOGO_STT_DATA_URL}
                  alt="Logo STT"
                  style={{ width: 62, height: 62, objectFit: "contain" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      letterSpacing: "2px",
                      color: "#facd15",
                      lineHeight: 1,
                    }}
                  >
                    PUSBAYA HUB
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: "3px",
                      color: "#98989f",
                      marginTop: 8,
                    }}
                  >
                    ST PUTRA SETTU BHAKTI JAYA · BANJAR CAMPUAN
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "4px",
                    color: "#a16207",
                  }}
                >
                  KARTU TANDA
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "4px",
                    color: "#a16207",
                    marginTop: 4,
                  }}
                >
                  ANGGOTA
                </div>
              </div>
            </div>

            {/* Body: photo + identity + QR */}
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  width: 188,
                  height: 188,
                  borderRadius: 26,
                  border: "3px solid rgba(212,175,55,0.5)",
                  overflow: "hidden",
                  backgroundColor: "#1a1408",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={photo}
                  alt="Foto anggota"
                  style={{ width: 182, height: 182, objectFit: "cover" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  marginLeft: 32,
                  marginRight: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#f8fafc",
                    lineHeight: 1.1,
                  }}
                >
                  {member.nama}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: "3px",
                    color: "#facc15",
                    marginTop: 10,
                  }}
                >
                  {member.id}
                </div>
                <div style={{ display: "flex", marginTop: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 999,
                      border: "1px solid rgba(212,175,55,0.35)",
                      backgroundColor: "rgba(212,175,55,0.12)",
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: "#fde68a",
                      marginRight: 10,
                    }}
                  >
                    {member.tempekan}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: "#cbd5e1",
                    }}
                  >
                    {member.status}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 168,
                    height: 168,
                    padding: 10,
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {qr ? (
                    <img
                      src={qr}
                      alt="QR verifikasi"
                      style={{ width: 148, height: 148 }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        width: 148,
                        height: 148,
                        backgroundColor: "#e2e8f0",
                        borderRadius: 8,
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "2px",
                    color: "rgba(250,204,21,0.6)",
                    marginTop: 8,
                  }}
                >
                  SCAN VERIFIKASI
                </div>
              </div>
            </div>

            {/* Footer: dates */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                width: "100%",
                borderTop: "1px solid rgba(212,175,55,0.25)",
                paddingTop: 18,
              }}
            >
              <div style={{ display: "flex" }}>
                <div
                  style={{ display: "flex", flexDirection: "column", marginRight: 56 }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "2px",
                      color: "rgba(250,204,21,0.45)",
                    }}
                  >
                    BERGABUNG
                  </div>
                  <div style={{ fontSize: 15, color: "#e2e8f0", marginTop: 6 }}>
                    {joined}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "2px",
                      color: "rgba(250,204,21,0.45)",
                    }}
                  >
                    MASA BERLAKU
                  </div>
                  <div style={{ fontSize: 15, color: "#e2e8f0", marginTop: 6 }}>
                    {MASA_BERLAKU}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "2px",
                  color: "rgba(252,211,77,0.5)",
                }}
              >
                BANJAR CAMPUAN · KEROBOKAN
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="KTA-PUSBAYA-${safeId}.png"`,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat gambar KTA.";
    return Response.json({ error: message }, { status: 500 });
  }
}
