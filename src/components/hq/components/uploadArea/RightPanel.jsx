import { useState } from "react";

const RightPanel = ({
  imagePreview,
  modelPreviewUrl,
  stylePreviewUrl,
  fields = [],
  onNavigate,
  onClearAll,
  onGenerate,
  isGenerating,
  isMerging,
  onBackToEdit,
  canGenerate,
}) => {
  const [imgOrientation, setImgOrientation] = useState("landscape");

  const handleImgLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgOrientation(naturalWidth >= naturalHeight ? "landscape" : "portrait");
  };

  const hasModelPreview = !!modelPreviewUrl;
  const hasPreviews = !!(hasModelPreview || stylePreviewUrl);
  const referenceImageHeight = hasModelPreview && !isMerging ? "160px" : "200px";
  const cardClassName = [
    "vg-canvas-card",
    hasPreviews ? "vg-canvas-card--has-preview" : "",
    hasModelPreview ? "vg-canvas-card--has-model-preview" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const imageFrameClassName = [
    "vg-img-frame",
    isMerging ? `vg-img-frame--merging-${imgOrientation}` : "",
    hasModelPreview && !isMerging ? "vg-img-frame--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className="vg-right-panel">
      <div className={cardClassName}>
        <div className="vg-canvas-head">
          <div className="vg-canvas-title">
            <span className="vg-live-dot" />
            Visual Preview
          </div>
          <div className="vg-live-badge">Live</div>
        </div>

        <div className={imageFrameClassName}>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Reference"
              onLoad={handleImgLoad}
              style={
                isMerging
                  ? imgOrientation === "portrait"
                    ? { height: "100%", width: "auto", objectFit: "cover" }
                    : { width: "100%", height: "100%", objectFit: "cover" }
                  : { width: "100%", height: referenceImageHeight, objectFit: "cover" }
              }
            />
          ) : (
            <div className="vg-img-placeholder">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>No Reference Image</span>
            </div>
          )}
        </div>

        {!isMerging && modelPreviewUrl && (
          <div className="vg-preview-panel vg-preview-panel--model">
            <div className="vg-preview-panel-head">
              <span className="vg-live-dot" />
              Model Preview
            </div>
            <div className="vg-preview-img-body">
              <img
                src={modelPreviewUrl}
                alt="Model preview"
                className="vg-preview-img"
              />
            </div>
          </div>
        )}

        {!isMerging && stylePreviewUrl && (
          <div className="vg-preview-panel">
            <div className="vg-preview-panel-head">
              <span className="vg-live-dot" />
              Style Preview
            </div>
            <div className="vg-preview-img-body">
              <img
                src={stylePreviewUrl}
                alt="Style preview"
                className="vg-preview-img"
              />
            </div>
          </div>
        )}

        <div className="vg-values-head">
          <div className="vg-values-title">Current Selected Values</div>
          <button
            type="button"
            className="vg-clear-values-btn"
            onClick={onClearAll}
          >
            Clear All
          </button>
        </div>
        <div className="vg-values-grid">
          {fields.map((field) => (
            <button
              key={field.key}
              type="button"
              className="vg-val-item"
              onClick={() => onNavigate?.(field.key, field.step)}
            >
              <span className="vg-val-key">{field.label}</span>
              <span className={`vg-val-val${field.value ? "" : " empty"}`}>
                {field.value || "-"}
              </span>
            </button>
          ))}
        </div>

        {isMerging && (
          <>
            {isGenerating && <div className="vg-gen-bar" />}
            <button
              type="button"
              className="vg-btn-generate"
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isGenerating ? "Add to Queue" : "Generate AI Image"}
            </button>
          </>
        )}

        {isMerging && (
          <button type="button" className="vg-btn-back-edit" onClick={onBackToEdit}>
            Back to Edit
          </button>
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
