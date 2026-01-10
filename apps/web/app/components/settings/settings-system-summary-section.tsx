type SummaryOption = {
  key: string;
  labelKey: string;
};

type SettingsSystemSummarySectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  systemSummaryMax: number;
  systemSummaryOptions: ReadonlyArray<SummaryOption>;
  selectedSystemSummary: ReadonlyArray<string>;
  availableSystemSummary: ReadonlyArray<SummaryOption>;
  addSystemSummaryKey: (key: string) => void;
  moveSystemSummaryKey: (index: number, direction: number) => void;
  removeSystemSummaryKey: (key: string) => void;
};

export function SettingsSystemSummarySection({
  t,
  systemSummaryMax,
  systemSummaryOptions,
  selectedSystemSummary,
  availableSystemSummary,
  addSystemSummaryKey,
  moveSystemSummaryKey,
  removeSystemSummaryKey
}: SettingsSystemSummarySectionProps) {
  return (
    <section className="settings-section">
      <div className="section-header">
        <h3>{t('systemSummaryTitle')}</h3>
        <span className="helper-text">
          {t('systemSummaryHelp', { count: systemSummaryMax })}
        </span>
      </div>
      <div className="option-list">
        {selectedSystemSummary.length === 0 ? (
          <div className="option-empty">{t('systemSummaryEmpty')}</div>
        ) : (
          selectedSystemSummary.map((key, index) => {
            const option = systemSummaryOptions.find((item) => item.key === key);
            return (
              <div key={key} className="option-row">
                <span className="option-title">
                  {option ? t(option.labelKey) : key}
                </span>
                <div className="option-actions">
                  <button
                    type="button"
                    onClick={() => moveSystemSummaryKey(index, -1)}
                    disabled={index === 0}
                  >
                    {'\u2191'}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSystemSummaryKey(index, 1)}
                    disabled={index === selectedSystemSummary.length - 1}
                  >
                    {'\u2193'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeSystemSummaryKey(key)}
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="option-add-grid">
        {availableSystemSummary.map((option) => {
          const disabled = selectedSystemSummary.length >= systemSummaryMax;
          return (
            <button
              key={option.key}
              type="button"
              className={`option-add ${disabled ? 'disabled' : ''}`}
              onClick={() => addSystemSummaryKey(option.key)}
              disabled={disabled}
            >
              + {t(option.labelKey)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
