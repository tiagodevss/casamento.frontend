export const INVITE_SAVE_THE_DATE_SRC = "/photos/save-the-date.jpeg";

let cachedPngBlob = null;
let pngLoadPromise = null;

async function jpegUrlToPngBlob(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar imagem (${response.status})`);
  }
  const jpegBlob = await response.blob();
  const bitmap = await createImageBitmap(jpegBlob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas indisponível para converter a imagem");
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const pngBlob = await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Não foi possível converter a imagem para PNG"));
    }, "image/png");
  });

  return pngBlob;
}

function getInviteImagePngBlob() {
  if (cachedPngBlob) return Promise.resolve(cachedPngBlob);
  if (!pngLoadPromise) {
    pngLoadPromise = jpegUrlToPngBlob(INVITE_SAVE_THE_DATE_SRC)
      .then((blob) => {
        cachedPngBlob = blob;
        return blob;
      })
      .catch((err) => {
        pngLoadPromise = null;
        throw err;
      });
  }
  return pngLoadPromise;
}

/** Prefetch so the first copy is faster (call on admin guests mount). */
export function prefetchInviteImage() {
  getInviteImagePngBlob().catch(() => {});
}

/**
 * Copies invite text + save-the-date image for WhatsApp Web paste (Ctrl+V).
 * Uses Promise-valued ClipboardItem so write() stays in the user-gesture turn.
 */
export async function copyInviteMessageWithImage(text) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    await navigator.clipboard.writeText(text);
    return { withImage: false };
  }

  const textBlob = new Blob([text], { type: "text/plain" });
  const imagePromise = getInviteImagePngBlob();

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": Promise.resolve(textBlob),
        "image/png": imagePromise,
      }),
    ]);
    return { withImage: true };
  } catch {
    await navigator.clipboard.writeText(text);
    return { withImage: false };
  }
}
