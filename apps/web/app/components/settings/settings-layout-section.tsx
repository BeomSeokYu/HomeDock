import type { Dispatch, SetStateAction } from 'react';
import type { DashboardConfig } from '@homedock/types';

type SettingsLayoutSectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  draftConfig: DashboardConfig;
  defaultConfig: DashboardConfig;
  languageOptions: ReadonlyArray<{ code: string; label: string }>;
  gridColumnOptions: ReadonlyArray<number>;
  setDraftConfig: Dispatch<SetStateAction<DashboardConfig | null>>;
};

export function SettingsLayoutSection({
  t,
  draftConfig,
  defaultConfig,
  languageOptions,
  gridColumnOptions,
  setDraftConfig
}: SettingsLayoutSectionProps) {
  return (
    <section className="settings-section">
      <h3>{t('layoutTitle')}</h3>
      <div className="settings-grid">
        <div className="auth-field">
          <label>{t('languageLabel')}</label>
          <select
            value={draftConfig.language}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev
                  ? {
                      ...prev,
                      language: event.target.value as DashboardConfig['language']
                    }
                  : prev
              )
            }
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="helper-text">{t('languageHelp')}</span>
        </div>
        <div className="auth-field">
          <label>{t('layoutColumnsLabel')}</label>
          <select
            value={draftConfig.serviceGridColumnsLg}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev
                  ? {
                      ...prev,
                      serviceGridColumnsLg: Number(event.target.value)
                    }
                  : prev
              )
            }
          >
            {gridColumnOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="helper-text">{t('layoutColumnsHelp')}</span>
        </div>
      </div>
      <div className="settings-row">
        <label className="checkbox-pill">
          <input
            type="checkbox"
            checked={
              draftConfig.dockSeparatorEnabled ??
              defaultConfig.dockSeparatorEnabled
            }
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev
                  ? {
                      ...prev,
                      dockSeparatorEnabled: event.target.checked
                    }
                  : prev
              )
            }
          />
          {t('dockSeparatorLabel')}
          <span className="helper-text">{t('dockSeparatorHelp')}</span>
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            checked={
              draftConfig.showLockScreen ?? defaultConfig.showLockScreen
            }
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev
                  ? { ...prev, showLockScreen: event.target.checked }
                  : prev
              )
            }
          />
          {t('lockScreenLabel')}
          <span className="helper-text">{t('lockScreenHelp')}</span>
        </label>
      </div>
    </section>
  );
}
