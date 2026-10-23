
import { useCallback, useEffect, useRef, useState } from "react";

export type WebcamStatus =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "error";

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");

  const start = useCallback(async () => {
    if (streamRef.current?.active) return;

    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      // Wait briefly for React to attach the video element.
      let video = videoRef.current;
      for (let attempt = 0; !video && attempt < 20; attempt++) {
        await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
        video = videoRef.current;
      }

      if (!video) {
        throw new Error("Video element is not attached.");
      }

      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        if (video!.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          resolve();
          return;
        }

        const cleanup = () => {
          video!.removeEventListener("loadeddata", onReady);
          video!.removeEventListener("error", onError);
        };

        const onReady = () => {
          cleanup();
          resolve();
        };

        const onError = () => {
          cleanup();
          reject(new Error("Could not start the camera preview."));
        };

        video!.addEventListener("loadeddata", onReady, { once: true });
        video!.addEventListener("error", onError, { once: true });
      });

      await video.play();
      setStatus("active");
    } catch (err) {
      console.error("Webcam startup failed:", err);

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      setStatus(
        err instanceof DOMException &&
          (err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError")
          ? "denied"
          : "error",
      );
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
  }, []);


  const captureFrame = useCallback(async (): Promise<Blob> => {
    const video = videoRef.current;

    if (!video) {
      throw new Error("Video element is not attached.");
    }

    // Wait up to 3 seconds for the camera to provide a frame.
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          cleanup();
          reject(new Error("Camera is still warming up. Try again."));
        }, 3000);

        const onReady = () => {
          cleanup();
          resolve();
        };

        const cleanup = () => {
          window.clearTimeout(timeout);
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("canplay", onReady);
        };

        video.addEventListener("loadeddata", onReady, { once: true });
        video.addEventListener("canplay", onReady, { once: true });

        // Recheck in case the frame arrived while listeners were being added.
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          cleanup();
          resolve();
        }
      });
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("No camera frame available. Turn on the camera again.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not capture the camera frame.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Could not encode the camera image."));
        },
        "image/jpeg",
        0.9,
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, status, start, stop, captureFrame };
}