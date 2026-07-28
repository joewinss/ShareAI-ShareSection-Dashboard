const StepNavBar = ({ steps = [], activeStep, onStepClick }) => (
  <nav className="vg-step-nav" aria-label="Workflow steps">
    {steps.map((step, idx) => {
      const stepNum = idx + 1;
      const isDone = stepNum < activeStep;
      const isAct = stepNum === activeStep;
      const isLast = idx === steps.length - 1;

      return (
        <div
          key={step.id || step.label}
          style={{
            display: "flex",
            alignItems: "center",
            flex: isLast ? "0 0 auto" : 1,
          }}
        >
          <button
            type="button"
            className="vg-step-btn"
            onClick={() => onStepClick?.(stepNum)}
          >
            <span
              className={`vg-step-dot${isDone ? " done" : isAct ? " act" : ""}`}
            />
            <span
              className={`vg-step-label${isDone ? " done" : isAct ? " act" : ""}`}
            >
              {step.label}
            </span>
          </button>
          {!isLast && (
            <div className={`vg-step-line${isDone ? " filled" : ""}`} />
          )}
        </div>
      );
    })}
  </nav>
);

export default StepNavBar;
