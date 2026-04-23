import React, { useState, useRef } from "react";
import {
  Upload,
  FileImage,
  Loader,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useOCR } from "../hooks/useOCR";

const OCRUpload = ({ onExtracted, documentType }) => {
  const { extractFromImages, ocrLoading, ocrProgress, ocrError } = useOCR();
  const [previews, setPreviews] = useState([]);
  const [extracted, setExtracted] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = async (file) => {
    if (!file) return;

    // Reset states before processing new file
    setExtracted(null);
    setConfidence(null);

    // Preview
    const preview = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    setPreviews([preview]);

    // OCR via OCR.space
    const result = await extractFromImages(file, documentType);
    setExtracted(result.extracted);
    setConfidence(result.confidence);

    if (Object.keys(result.extracted).length > 0 || result.imageUrl) {
      // Pass both extracted fields and the single uploaded image url
      onExtracted({
        ...result.extracted,
        documentFrontImage: result.imageUrl || null,
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/"),
    );
    if (file) handleFiles(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFiles(file);
  };

  const handleReset = () => {
    setPreviews([]);
    setExtracted(null);
    setConfidence(null);
  };

  const extractedCount = extracted
    ? Object.keys(extracted).filter((k) => extracted[k]).length
    : 0;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !ocrLoading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${ocrLoading ? "border-teal-300 bg-teal-50" : "border-slate-300 hover:border-teal-400 hover:bg-teal-50"}
          ${previews.length > 0 ? "py-3" : "py-8"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {previews.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center mb-4">
              {previews.map((preview, i) => (
                <img
                  key={i}
                  src={preview}
                  alt="Document"
                  className="h-48 w-auto object-contain rounded-xl border border-slate-200/60 shadow-sm"
                />
              ))}
            </div>
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-left flex-1">
                {ocrLoading ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-teal-700 font-medium">
                      <Loader size={14} className="animate-spin" />
                      {ocrProgress < 25
                        ? `Compressing image... ${ocrProgress}%`
                        : ocrProgress < 60
                          ? `Uploading to cloud... ${ocrProgress}%`
                          : `Reading document... ${ocrProgress}%`}
                    </div>
                    <div className="w-full bg-teal-100 rounded-full h-1.5">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                ) : extracted ? (
                  <div>
                    <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <CheckCircle size={14} /> {extractedCount} field
                      {extractedCount !== 1 ? "s" : ""} auto-filled
                    </p>
                    {confidence !== null && (
                      <p className="text-xs text-slate-400">
                        OCR confidence: {Math.round(confidence)}%
                        {confidence < 60 &&
                          " — low quality, please verify fields"}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors"
                title="Upload different images"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto">
              <Upload size={22} className="text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Upload your documents
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Citizenship, Passport, or Driving License · PNG, JPG
              </p>
              <p className="text-xs text-teal-600 font-medium mt-1">
                ✨ Auto-fills form fields using OCR
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {ocrError && (
        <div className="flex items-center justify-between gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={13} />
            {ocrError}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Extracted fields preview */}
      {extracted && extractedCount > 0 && !ocrLoading && (
        <div className="bg-green-50/50 border border-green-200/60 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle size={16} /> Auto-filled Data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(extracted).map(([k, v]) =>
              v ? (
                <div
                  key={k}
                  className="flex justify-between items-center text-xs border-b border-green-100/50 pb-1"
                >
                  <span className="text-green-700/70 capitalize">
                    {k.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span className="text-green-900 font-bold ml-2 text-right">
                    {v}
                  </span>
                </div>
              ) : null,
            )}
          </div>
          <p className="text-xs text-green-700/60 mt-3 flex items-center gap-1.5 font-medium">
            <AlertCircle size={12} /> Please review and correct any errors on
            the next screens.
          </p>
        </div>
      )}
    </div>
  );
};

export default OCRUpload;
