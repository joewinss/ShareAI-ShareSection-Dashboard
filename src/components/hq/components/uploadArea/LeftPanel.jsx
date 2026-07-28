import FieldRow from "./FieldRow";
import FieldsWrap from "./FieldsWrap";

const ArrowIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

const renderWrappedField = (entry, renderField, fieldRowRefs) => (
  <FieldRow
    key={entry.key}
    label={entry.label || entry.key}
    fieldKey={entry.key}
    ref={(el) => {
      fieldRowRefs.current[entry.key] = el;
    }}
  >
    {renderField(entry, { hideLabel: true })}
  </FieldRow>
);

const LeftPanel = ({
  activeStep,
  activeStepId,
  imageFields = [],
  requiredFields = [],
  optionalFields = [],
  renderField,
  isStep2Complete,
  canGenerate,
  goStep,
  fieldRowRefs,
  totalSteps,
}) => (
  <main className="vg-left-panel">
    {activeStepId === "image" && (
      <div className="vg-studio-card">
        <span className="vg-card-watermark">01</span>
        <div className="vg-card-inner">
          <div className="vg-card-head">
            <div className="vg-card-head-row">
              <div className="vg-card-title">Attach an Image</div>
              <span className="vg-card-badge required">Required</span>
            </div>
            <div className="vg-card-sub">
              Upload an image to proceed with generation.
            </div>
          </div>

          {imageFields.map((entry) => (
            <div key={entry.key}>{renderField(entry)}</div>
          ))}

          <div className="vg-action-row">
            <span className="vg-step-hint">
              Step {activeStep} of {totalSteps}
            </span>
            <button
              type="button"
              className="vg-btn-next"
              onClick={() => goStep(activeStep + 1)}
            >
              Continue
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    )}

    {activeStepId === "settings" && (
      <div className="vg-studio-card">
        <span className="vg-card-watermark">02</span>
        <div className="vg-card-inner">
          <div className="vg-card-head">
            <div className="vg-card-head-row">
              <div className="vg-card-title">Settings</div>
              <span className="vg-card-badge required">Required</span>
            </div>
            <div className="vg-card-sub">
              Configure all required fields for this generation mode.
            </div>
          </div>

          <FieldsWrap>
            {requiredFields.map((entry) =>
              renderWrappedField(entry, renderField, fieldRowRefs)
            )}
          </FieldsWrap>

          <div className="vg-action-row">
            {activeStep > 1 && (
              <button
                type="button"
                className="vg-btn-prev"
                onClick={() => goStep(activeStep - 1)}
              >
                Previous
              </button>
            )}
            <button
              type="button"
              className="vg-btn-next"
              disabled={!isStep2Complete}
              onClick={() => goStep(activeStep + 1)}
            >
              Continue
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    )}

    {activeStepId === "optional" && (
      <div className="vg-studio-card">
        <span className="vg-card-watermark">03</span>
        <div className="vg-card-inner">
          <div className="vg-card-head">
            <div className="vg-card-head-row">
              <div className="vg-card-title">Optional Details</div>
              <span className="vg-card-badge optional">Optional</span>
            </div>
            <div className="vg-card-sub">
              Add extra context to refine your generation results.
            </div>
          </div>

          <FieldsWrap>
            {optionalFields.map((entry) =>
              renderWrappedField(entry, renderField, fieldRowRefs)
            )}
          </FieldsWrap>

          <div className="vg-action-row">
            <button
              type="button"
              className="vg-btn-prev"
              onClick={() => goStep(activeStep - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="vg-btn-next"
              disabled={!canGenerate}
              onClick={() => goStep(activeStep + 1)}
            >
              Review & Generate
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    )}
  </main>
);

export default LeftPanel;
