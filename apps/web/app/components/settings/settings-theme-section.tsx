import type { Dispatch, SetStateAction } from 'react';
import type { DashboardConfig } from '@homedock/types';

type ThemeOption = {
  key: string;
  name: string;
  colors: Record<string, string>;
};

type SettingsThemeSectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  draftConfig: DashboardConfig;
  defaultConfig: DashboardConfig;
  themeOptions: ReadonlyArray<ThemeOption>;
  setDraftConfig: Dispatch<SetStateAction<DashboardConfig | null>>;
};

export function SettingsThemeSection({
  t,
  draftConfig,
  defaultConfig,
  themeOptions,
  setDraftConfig
}: SettingsThemeSectionProps) {
  return (
    <section className="settings-section">
      <div className="section-header">
        <h3>{t('themeTitle')}</h3>
        <span className="helper-text">{t('themeHelp')}</span>
      </div>
      <div className="theme-grid">
        {themeOptions.map((themeOption) => {
          const isActive =
            (draftConfig.themeKey ?? defaultConfig.themeKey) === themeOption.key;
          return (
            <button
              key={themeOption.key}
              type="button"
              className={`theme-card ${isActive ? 'active' : ''}`}
              style={{
                background: `linear-gradient(135deg, ${themeOption.colors.bgDeep}, ${themeOption.colors.bgSoft})`
              }}
              onClick={() =>
                setDraftConfig((prev) =>
                  prev ? { ...prev, themeKey: themeOption.key } : prev
                )
              }
            >
              <div className="theme-swatches">
                <span
                  className="theme-dot"
                  style={{ background: themeOption.colors.bgDeep }}
                />
                <span
                  className="theme-dot"
                  style={{ background: themeOption.colors.bgMid }}
                />
                <span
                  className="theme-dot"
                  style={{ background: themeOption.colors.accent }}
                />
                <span
                  className="theme-dot"
                  style={{ background: themeOption.colors.accent2 }}
                />
              </div>
              <div className="theme-name">{themeOption.name}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
