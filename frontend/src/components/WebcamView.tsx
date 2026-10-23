
import { useEffect } from "react";
import { Camera, CameraOff, VideoOff } from "lucide-react";
import { useWebcam } from "../hooks/useWebcam";

interface WebcamViewProps {
  active: boolean;
  onReady?: () => void;
  onCaptureReady?: (captureFrame: () => Promise<Blob>) => void;
}

export default function WebcamView({
  active,
  onReady,
  onCaptureReady,
}: WebcamViewProps) {
  const { videoRef, status, start, stop, captureFrame } = useWebcam();

  useEffect(() => {
    onCaptureReady?.(captureFrame);
  }, [captureFrame, onCaptureReady]);

  useEffect(() => {
    if (active) {
      void start();
    } else {
      stop();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (status === "active") {
      onReady?.();
    }
  }, [status, onReady]);

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-line bg-ink">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={[
          "h-full w-full scale-x-[-1] object-cover transition-opacity",
          status === "active" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {status !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-paper">
          {status === "idle" && (
            <>
              <Camera size={28} aria-hidden="true" />
              <p className="text-sm text-line">Camera is off</p>
            </>
          )}

          {status === "requesting" && (
            <>
              <Camera
                size={28}
                aria-hidden="true"
                className="animate-pulse"
              />
              <p className="text-sm text-line">
                Requesting camera access...
              </p>
            </>
          )}

          {status === "denied" && (
            <>
              <CameraOff size={28} aria-hidden="true" />
              <p className="max-w-xs text-sm text-line">
                Camera access was denied. Allow camera permission in your
                browser settings to practice with video.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <VideoOff size={28} aria-hidden="true" />
              <p className="max-w-xs text-sm text-line">
                We couldn't access a camera on this device.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}