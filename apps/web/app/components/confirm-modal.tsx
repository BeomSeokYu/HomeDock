type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <div className="settings-panel" role="dialog" aria-modal="true">
      <div className="settings-card confirm-card">
        <div className="settings-header">
          <div>
            <h2>{title}</h2>
            <p className="helper-text">{description}</p>
          </div>
        </div>
        <div className="settings-footer">
          <div />
          <div className="settings-actions">
            <button type="button" className="button secondary" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className="button" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
