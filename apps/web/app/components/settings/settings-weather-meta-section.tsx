type MetaOption = {
  key: string;
  labelKey: string;
};

type SettingsWeatherMetaSectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  weatherMetaMax: number;
  weatherMetaOptions: ReadonlyArray<MetaOption>;
  selectedWeatherMeta: ReadonlyArray<string>;
  availableWeatherMeta: ReadonlyArray<MetaOption>;
  addWeatherMetaKey: (key: string) => void;
  moveWeatherMetaKey: (index: number, direction: number) => void;
  removeWeatherMetaKey: (key: string) => void;
};

export function SettingsWeatherMetaSection({
  t,
  weatherMetaMax,
  weatherMetaOptions,
  selectedWeatherMeta,
  availableWeatherMeta,
  addWeatherMetaKey,
  moveWeatherMetaKey,
  removeWeatherMetaKey
}: SettingsWeatherMetaSectionProps) {
  return (
    <section className="settings-section">
      <div className="section-header">
        <h3>{t('weatherMetaTitle')}</h3>
        <span className="helper-text">
          {t('weatherMetaHelp', { count: weatherMetaMax })}
        </span>
      </div>
      <div className="option-list">
        {selectedWeatherMeta.length === 0 ? (
          <div className="option-empty">{t('weatherMetaEmpty')}</div>
        ) : (
          selectedWeatherMeta.map((key, index) => {
            const option = weatherMetaOptions.find((item) => item.key === key);
            return (
              <div key={key} className="option-row">
                <span className="option-title">
                  {option ? t(option.labelKey) : key}
                </span>
                <div className="option-actions">
                  <button
                    type="button"
                    onClick={() => moveWeatherMetaKey(index, -1)}
                    disabled={index === 0}
                  >
                    {'\u2191'}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWeatherMetaKey(index, 1)}
                    disabled={index === selectedWeatherMeta.length - 1}
                  >
                    {'\u2193'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeWeatherMetaKey(key)}
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
        {availableWeatherMeta.map((option) => {
          const disabled = selectedWeatherMeta.length >= weatherMetaMax;
          return (
            <button
              key={option.key}
              type="button"
              className={`option-add ${disabled ? 'disabled' : ''}`}
              onClick={() => addWeatherMetaKey(option.key)}
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
