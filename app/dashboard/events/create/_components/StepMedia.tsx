"use client";

import { useState, useRef, useCallback } from "react";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import { useEventBuilderStore } from "@/lib/store/eventBuilderStore";
import { uploadImage } from "@/lib/api";
import {
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
import FormSection from "@/components/ui/FormSection";
import Modal from "@/components/ui/Modal";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

// ── Shared drop zone component ──────────────────────────────────────────────

interface DropZoneProps {
  label: string;
  hint: string;
  previewUrl: string | null;
  isUploading: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  aspect: "banner" | "portrait";
}

function DropZone({
  label,
  hint,
  previewUrl,
  isUploading,
  onFile,
  onClear,
  aspect,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only leave if we exit the zone itself, not a child
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFile(file);
      }
    },
    [onFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  const aspectClass =
    aspect === "banner" ? "aspect-video" : "aspect-[4/5] max-w-[200px] mx-auto";

  if (previewUrl) {
    return (
      <div className={`relative rounded-xl overflow-hidden group border border-white/10 ${aspectClass}`}>
        <img src={previewUrl} className="w-full h-full object-cover" alt={label} />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 rounded-lg text-[11px] font-bold text-white hover:bg-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDrag}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        flex flex-col items-center justify-center gap-3 py-12
        border-2 border-dashed
        ${isDragging
          ? "border-orange-500/70 bg-orange-500/[0.06] scale-[1.01]"
          : "border-white/10 hover:border-orange-500/40 bg-white/[0.02] hover:bg-white/[0.04]"
        }
      `}
    >
      {isUploading ? (
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
      ) : (
        <>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? "bg-orange-500/20" : "bg-white/5"
            }`}
          >
            {isDragging ? (
              <ImageIcon className="w-5 h-5 text-orange-400" />
            ) : (
              <Upload className="w-5 h-5 text-white/30" />
            )}
          </div>
          <div className="text-center px-4">
            <p className="font-bold text-xs text-white/70">
              {isDragging ? "Drop to upload" : label}
            </p>
            <p className="text-white/30 text-[10px] mt-1">{hint}</p>
            {!isDragging && (
              <p className="text-white/20 text-[10px] mt-0.5">
                or drag &amp; drop
              </p>
            )}
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

// ── Main StepMedia ───────────────────────────────────────────────────────────

export default function StepMedia() {
  const {
    bannerImageUrl,
    eventImageUrl,
    setBannerImage,
    setEventImage,
    setStep,
    eventId,
  } = useEventBuilderStore();

  // Crop state
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropType, setCropType] = useState<"banner" | "portrait">("banner");
  const [portraitAspect, setPortraitAspect] = useState<number>(4 / 5);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadingField, setUploadingField] = useState<"banner" | "portrait" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read a dropped/selected file into a data URL and open the crop modal
  const openCropFor = (file: File, type: "banner" | "portrait") => {
    setError(null);
    setCropType(type);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setShowCropModal(true);
    });
    reader.readAsDataURL(file);
  };

  // Set up the initial crop selection once the image renders inside ReactCrop
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const aspect = cropType === "banner" ? 16 / 9 : portraitAspect;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  // Crop → canvas → blob → upload
  const getCroppedImg = async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        setIsUploading(true);
        setUploadingField(cropType);
        setShowCropModal(false);
        try {
          if (!eventId) throw new Error("No event ID to upload to.");
          const fieldName =
            cropType === "banner" ? "banner_image" : "event_image";
          const data = await uploadImage(eventId, blob, fieldName);
          if (cropType === "banner") {
            setBannerImage(data.banner_image_url);
          } else {
            setEventImage(data.image_url);
          }
        } catch {
          setError("Upload failed. Please try again.");
        } finally {
          setIsUploading(false);
          setUploadingField(null);
        }
      },
      "image/jpeg",
      0.92,
    );
  };

  const clearImage = (type: "banner" | "portrait") => {
    if (type === "banner") setBannerImage("");
    else setEventImage("");
  };

  // Current aspect used in the crop modal
  const currentAspect = cropType === "banner" ? 16 / 9 : portraitAspect;

  return (
    <div className="mx-auto">
      <div className="p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-8">
          <FormSection title="Event Media">
            <p className="text-white/30 text-sm mb-6">
              Upload a banner (16:9) for the event page and a portrait image
              (4:5 or 9:16) for cards &amp; lists. Drag &amp; drop or click to
              select.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* BANNER */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                  Banner Image (16:9)
                </label>
                <DropZone
                  label="Upload Banner"
                  hint="16:9 — Recommended"
                  previewUrl={bannerImageUrl || null}
                  isUploading={uploadingField === "banner"}
                  onFile={(f) => openCropFor(f, "banner")}
                  onClear={() => clearImage("banner")}
                  aspect="banner"
                />
              </div>

              {/* PORTRAIT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                  Portrait Image (4:5 / 9:16)
                </label>
                <DropZone
                  label="Upload Portrait"
                  hint="For mobile & event cards"
                  previewUrl={eventImageUrl || null}
                  isUploading={uploadingField === "portrait"}
                  onFile={(f) => openCropFor(f, "portrait")}
                  onClear={() => clearImage("portrait")}
                  aspect="portrait"
                />
              </div>
            </div>

            {error && (
              <p className="text-orange-400 text-xs mt-4 font-medium">{error}</p>
            )}
          </FormSection>
        </div>

        <div className="flex justify-between mt-12">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={() => setStep(4)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] bg-orange-700"
          >
            Next: Preview <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── CROP MODAL ─────────────────────────────────────────────────── */}
      {showCropModal && (
        <Modal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          title={`Crop ${cropType === "banner" ? "Banner (16:9)" : "Portrait Image"}`}
        >
          <div className="flex flex-col gap-4 max-w-full">
            {/* Portrait ratio switcher */}
            {cropType === "portrait" && (
              <div className="flex gap-3">
                {([
                  { label: "4:5", value: 4 / 5 },
                  { label: "9:16", value: 9 / 16 },
                ] as const).map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setPortraitAspect(value);
                      // Re-centre crop for the new ratio when image is loaded
                      if (imgRef.current) {
                        const { width, height } = imgRef.current;
                        setCrop(centerAspectCrop(width, height, value));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      portraitAspect === value
                        ? "bg-orange-500 text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Hint */}
            <p className="text-white/30 text-[11px]">
              Drag the corners to resize — aspect ratio is locked.
            </p>

            {/* Crop area */}
            <div className="max-h-[60vh] overflow-auto rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={currentAspect}
                // No minWidth/minHeight — user can pick any size at the ratio
                className="w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-w-full block"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 text-white/50 font-bold hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={getCroppedImg}
                disabled={!completedCrop || isUploading}
                className="px-6 py-2 bg-orange-700 rounded-xl font-bold text-white flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Apply &amp; Upload
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
