import { forwardRef } from "react";

const FieldRow = forwardRef(function FieldRow({ label, fieldKey, children }, ref) {
  return (
    <div className="vg-field-row" data-key={fieldKey} ref={ref}>
      <div className="vg-field-label">{label}</div>
      <div className="vg-field-controls">{children}</div>
    </div>
  );
});

export default FieldRow;
