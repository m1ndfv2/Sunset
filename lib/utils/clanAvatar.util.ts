const CLAN_AVATAR_MAX_LENGTH = 2048;
const CLAN_AVATAR_SIDES = [64, 56, 48, 40, 32, 24, 16] as const;
const CLAN_AVATAR_QUALITIES = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3] as const;

export async function fileToClanAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let smallestCandidate = "";

  try {
    for (const maxSide of CLAN_AVATAR_SIDES) {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSide / bitmap.width, maxSide / bitmap.height, 1);

      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));

      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("Failed to process image");

      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of CLAN_AVATAR_QUALITIES) {
        const dataUrl = canvas.toDataURL("image/webp", quality);

        if (!smallestCandidate || dataUrl.length < smallestCandidate.length) {
          smallestCandidate = dataUrl;
        }

        if (dataUrl.length <= CLAN_AVATAR_MAX_LENGTH) {
          return dataUrl;
        }
      }
    }
  }
  finally {
    bitmap.close();
  }

  if (smallestCandidate && smallestCandidate.length <= CLAN_AVATAR_MAX_LENGTH) {
    return smallestCandidate;
  }

  throw new Error("avatarTooLarge");
}

export { CLAN_AVATAR_MAX_LENGTH };
