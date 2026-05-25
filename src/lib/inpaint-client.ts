// Cliente para a API de inpaint externa (api.eletroferragens.com/inpaint)
// Roda 100% no navegador: baixa imagem, gera máscara via canvas, faz POST.

const INPAINT_ENDPOINT = "https://api.eletroferragens.com/inpaint";

async function loadImage(url: string): Promise<HTMLImageElement> {
  // Buscar como blob evita problemas de CORS no canvas (tainted canvas)
  // para imagens externas sem cabeçalhos CORS apropriados.
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Falha ao carregar imagem (${resp.status}): ${url}`);
  const blob = await resp.blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Falha ao decodificar imagem: ${url}`));
    };
    img.src = objectUrl;
  });
}

function canvasToBase64(canvas: HTMLCanvasElement, mime = "image/png"): string {
  const dataUrl = canvas.toDataURL(mime);
  return dataUrl.replace(/^data:[^;]+;base64,/, "");
}

/**
 * Gera máscara: fundo preto, retângulo branco no canto inferior direito
 * (a partir de 56% da largura e 80% da altura).
 */
function buildMask(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  const x = Math.floor(width * 0.56);
  const y = Math.floor(height * 0.8);
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, width - x, height - y);
  return c;
}

export interface InpaintResult {
  /** data URL (data:image/png;base64,...) pronta para <img src> e download */
  dataUrl: string;
  /** base64 puro, sem prefixo */
  base64: string;
  mimeType: string;
}

export async function inpaintImage(imageUrl: string): Promise<InpaintResult> {
  const img = await loadImage(imageUrl);
  const W = img.naturalWidth;
  const H = img.naturalHeight;

  // Canvas com a imagem
  const imgCanvas = document.createElement("canvas");
  imgCanvas.width = W;
  imgCanvas.height = H;
  imgCanvas.getContext("2d")!.drawImage(img, 0, 0, W, H);
  const maskCanvas = buildMask(W, H);

  // lama-cleaner (servidor Flask) espera multipart/form-data com os campos
  // "image" e "mask" como arquivos, não JSON base64.
  const imageBlob: Blob = await new Promise((resolve) =>
    imgCanvas.toBlob((b) => resolve(b!), "image/png"),
  );
  const maskBlob: Blob = await new Promise((resolve) =>
    maskCanvas.toBlob((b) => resolve(b!), "image/png"),
  );

  const form = new FormData();
  form.append("image", imageBlob, "image.png");
  form.append("mask", maskBlob, "mask.png");
  form.append("prompt", "");
  form.append("ldmSteps", "25");
  form.append("ldmSampler", "plms");
  form.append("hdStrategy", "Crop");
  form.append("hdStrategyCropMargin", "196");
  form.append("hdStrategyCropTrigerSize", "1280");
  form.append("hdStrategyResizeLimit", "2048");
  form.append("zitsWireframe", "false");
  form.append("croperX", "0");
  form.append("croperY", "0");
  form.append("croperHeight", String(H));
  form.append("croperWidth", String(W));
  form.append("useCroper", "false");
  form.append("sdMaskBlur", "5");
  form.append("sdStrength", "0.75");
  form.append("sdSteps", "50");
  form.append("sdGuidanceScale", "7.5");
  form.append("sdSampler", "uni_pc");
  form.append("sdSeed", "-1");
  form.append("sdMatchHistograms", "false");
  form.append("sdScale", "1");
  form.append("cv2Radius", "5");
  form.append("cv2Flag", "INPAINT_NS");
  form.append("paintByExampleSteps", "50");
  form.append("paintByExampleGuidanceScale", "7.5");
  form.append("paintByExampleSeed", "-1");
  form.append("paintByExampleMaskBlur", "5");
  form.append("paintByExampleMatchHistograms", "false");
  form.append("p2pSteps", "50");
  form.append("p2pImageGuidanceScale", "1.5");
  form.append("p2pGuidanceScale", "7.5");
  form.append("controlnet_conditioning_scale", "0.4");
  form.append("controlnet_method", "control_v11p_sd15_canny");

  const res = await fetch(INPAINT_ENDPOINT, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Inpaint API ${res.status}: ${text.slice(0, 300)}`);
  }

  const ctype = res.headers.get("content-type") || "";
  let base64: string;
  let mimeType = "image/png";

  if (ctype.startsWith("image/")) {
    // Resposta binária
    const buf = await res.arrayBuffer();
    mimeType = ctype.split(";")[0].trim();
    base64 = arrayBufferToBase64(buf);
  } else {
    // Resposta JSON com base64
    const json: any = await res.json();
    const raw = json.image || json.result || json.output || json.data || "";
    if (typeof raw !== "string" || !raw) {
      throw new Error("Resposta da API sem imagem");
    }
    const m = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (m) {
      mimeType = m[1];
      base64 = m[2];
    } else {
      base64 = raw;
    }
  }

  return {
    base64,
    mimeType,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(bin);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
