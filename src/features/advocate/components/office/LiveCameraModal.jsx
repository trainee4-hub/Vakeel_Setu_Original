import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiCamera,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiUploadCloud,
} from "react-icons/fi";
import { uploadAdvocateOfficePhoto } from "../../services/advocateApi";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function LiveCameraModal({
  isOpen,
  onClose,
  onPhotoUploaded,
  onPhotoCaptured,
  allowFallback = false,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [streamReady, setStreamReady] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Stop camera tracks helper
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamReady(false);
  }, []);

  // Check if multiple cameras available
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Start camera stream
  const startCamera = useCallback(async (mode = facingMode) => {
    setCameraError("");
    setUploadError("");
    setCapturedDataUrl(null);
    setCapturedBlob(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera is not supported on this device/browser. Allow camera access to add your live office photo.",
      );
      return;
    }

    stopStream();

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setStreamReady(true);
    } catch (err) {
      console.warn("Live camera access failed:", err);
      const isDenied =
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError";
      const isNotFound =
        err?.name === "NotFoundError" ||
        err?.name === "DevicesNotFoundError";

      if (isDenied) {
        setCameraError(
          "Allow camera access to add your live office photo. A live camera photo is compulsory — please enable camera permissions in your browser or complete registration on a device with a camera.",
        );
      } else if (isNotFound) {
        setCameraError(
          "No camera detected on this device. A live office photo is compulsory — please use a device with a camera (such as a mobile phone or laptop) to take your office photo.",
        );
      } else {
        setCameraError(
          "Allow camera access to add your live office photo. A live camera photo is compulsory (" +
            (err?.message || "Camera unavailable") +
            ").",
        );
      }
    }
  }, [facingMode, stopStream]);

  // Auto-start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setCapturedBlob(null);
      setCameraError("");
      setUploadError("");
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Switch camera front/back
  const handleToggleCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture still
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setUploadError("Failed to capture still from camera. Please try again.");
          return;
        }
        setCapturedBlob(blob);
      },
      "image/jpeg",
      0.92,
    );

    // Pause stream while previewing
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    setUploadError("");
    startCamera(facingMode);
  };

  // Fallback file upload (allowed per user policy when camera fails/denied)
  const handleFallbackFileSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setUploadError("Please choose a valid image file (JPEG, PNG, or WEBP).");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setUploadError("Photo size must be under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedDataUrl(reader.result);
      setCapturedBlob(file);
      setUploadError("");
    };
    reader.readAsDataURL(file);
  };

  // Confirm and upload / capture
  const handleConfirmAndUpload = async () => {
    if (!capturedBlob) {
      setUploadError("Please capture an office photo first.");
      return;
    }

    if (capturedBlob.size > MAX_PHOTO_BYTES) {
      setUploadError("Captured photo exceeds the 5 MB size limit.");
      return;
    }

    if (onPhotoCaptured) {
      onPhotoCaptured(capturedBlob, capturedDataUrl);
      stopStream();
      onClose();
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const result = await uploadAdvocateOfficePhoto(capturedBlob);

      if (onPhotoUploaded) {
        onPhotoUploaded(result.officePhotoUrl, result);
      }
      stopStream();
      onClose();
    } catch (err) {
      console.error("Office photo upload error:", err);
      const serverMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to upload office photo. Please retake and try again.";
      setUploadError(serverMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FiCamera className="text-lg" />
            </div>
            <div>
              <h3 id="camera-modal-title" className="text-base font-bold text-slate-900">
                Live Office Photo Capture
              </h3>
              <p className="text-xs text-slate-500">
                Compulsory • Capture a clear photo of your office/chamber
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            disabled={isUploading}
            className="size-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Close camera"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* MODAL BODY / VIEWFINDER */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {cameraError ? (
            /* CAMERA ERROR / PERMISSION DENIED */
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-amber-950 text-center space-y-4">
              <div className="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <FiAlertCircle className="text-2xl" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-amber-900">
                  Allow camera access to add your live office photo
                </p>
                <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                  {cameraError}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
                >
                  <FiRefreshCw className="text-sm" />
                  Try camera again
                </button>

                {allowFallback && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
                    >
                      <FiUploadCloud className="text-sm text-amber-600" />
                      Upload office photo from device
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFallbackFileSelect}
                    />
                  </>
                )}
              </div>
            </div>
          ) : capturedDataUrl ? (
            /* CAPTURED STILL PREVIEW */
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                <img
                  src={capturedDataUrl}
                  alt="Captured office still"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
                  <FiCheck className="text-xs" /> Still captured
                </span>
              </div>
              <p className="text-center text-xs text-slate-500">
                Review your photo. Make sure your office/chamber is clearly recognizable.
              </p>
            </div>
          ) : (
            /* LIVE CAMERA STREAM */
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-4 sm:inset-8 border border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-white/90 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                  {hasMultipleCameras && (
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className="pointer-events-auto size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                      title="Switch camera"
                    >
                      <FiRefreshCw className="text-sm" />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-white/80 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    Center your office or chamber
                  </span>
                </div>
              </div>

              {!streamReady && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white gap-2">
                  <span className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span className="text-xs text-slate-300">Starting device camera...</span>
                </div>
              )}
            </div>
          )}

          {/* Upload / Validation Error */}
          {uploadError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2"
            >
              <FiAlertCircle className="text-base text-red-500 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            disabled={isUploading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <FiRefreshCw className="text-sm" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndUpload}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiCheck className="text-base" />
                      Use this photo
                    </>
                  )}
                </button>
              </>
            ) : streamReady ? (
              <button
                type="button"
                onClick={handleCapture}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition"
              >
                <FiCamera className="text-base" />
                Capture photo
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
