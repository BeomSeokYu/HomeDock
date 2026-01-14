import type { Dispatch, SetStateAction } from 'react';
import type { DashboardConfig } from '@homedock/types';

type SettingsMainSectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  draftConfig: DashboardConfig;
  defaultConfig: DashboardConfig;
  setDraftConfig: Dispatch<SetStateAction<DashboardConfig | null>>;
};

export function SettingsMainSection({
  t,
  draftConfig,
  defaultConfig,
  setDraftConfig
}: SettingsMainSectionProps) {
  return (
    <section className="settings-section">
      <h3>{t('mainInfo')}</h3>
      <div className="settings-grid">
        <div className="auth-field">
          <label>{t('brandLabel')}</label>
          <input
            type="text"
            value={draftConfig.brandName}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev ? { ...prev, brandName: event.target.value } : prev
              )
            }
          />
        </div>
        <div className="auth-field">
          <label>{t('tabTitleLabel')}</label>
          <input
            type="text"
            value={draftConfig.tabTitle ?? defaultConfig.tabTitle}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev ? { ...prev, tabTitle: event.target.value } : prev
              )
            }
          />
          <span className="helper-text">{t('tabTitleHelp')}</span>
        </div>
        <div className="auth-field">
          <label>{t('dashboardTitleLabel')}</label>
          <input
            type="text"
            value={draftConfig.title}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev ? { ...prev, title: event.target.value } : prev
              )
            }
          />
        </div>
        <div className="auth-field">
          <label>{t('dashboardDescLabel')}</label>
          <input
            type="text"
            value={draftConfig.description}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev ? { ...prev, description: event.target.value } : prev
              )
            }
          />
        </div>
      </div>
      <div className="settings-row">
        <label className="checkbox-pill">
          <input
            type="checkbox"
            checked={draftConfig.showBrand ?? defaultConfig.showBrand}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev ? { ...prev, showBrand: event.target.checked } : prev
              )
            }
          />
          {t('showBrandLabel')}
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            checked={draftConfig.showTitle ?? defaultConfig.showTitle}
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev ? { ...prev, showTitle: event.target.checked } : prev
              )
            }
          />
          {t('showTitleLabel')}
        </label>
        <label className="checkbox-pill">
          <input
            type="checkbox"
            checked={
              draftConfig.showDescription ?? defaultConfig.showDescription
            }
            onChange={(event) =>
              setDraftConfig((prev) =>
                prev
                  ? { ...prev, showDescription: event.target.checked }
                  : prev
              )
            }
          />
          {t('showDescriptionLabel')}
        </label>
      </div>
    </section>
  );
}
