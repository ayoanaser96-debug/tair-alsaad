import axios from "axios";

import { env } from "@/config/env";

export type UploadProgress = (percent: number) => void;

/**
 * Multipart upload with progress. Uses standalone axios to avoid JSON content-type from apiClient.
 */
export async function uploadMultipart(
  path: string,
  formData: FormData,
  accessToken: string,
  onProgress?: UploadProgress,
): Promise<unknown> {
  const url = `${env.VITE_API_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const { data } = await axios.post(url, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (ev) => {
      if (ev.total && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    },
  });
  return data;
}

/** Convert canvas to PNG Blob for proof-of-delivery / signature */
export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to encode canvas"));
      },
      "image/png",
      0.92,
    );
  });
}
