import { ArrowLeft } from "lucide-react";

const ModeTitleBar = ({ currentMode, onBack }) => (
  <div className="vg-mode-title-bar">
    <button
      type="button"
      className="vg-page-back-btn"
      onClick={onBack}
      aria-label="Back"
      title="Back"
    >
      <ArrowLeft size={18} strokeWidth={2.4} />
    </button>
    <div>
      <div className="vg-mode-overline">Generation Mode</div>
      <div className="vg-mode-name">{currentMode}</div>
    </div>
  </div>
);

export default ModeTitleBar;
