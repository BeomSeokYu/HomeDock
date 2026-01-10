import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Category, DashboardConfig, Service } from '@homedock/types';
import { SettingsAuthForm } from './settings/settings-auth-form';
import { SettingsCategoriesSection } from './settings/settings-categories-section';
import { SettingsLayoutSection } from './settings/settings-layout-section';
import { SettingsMainSection } from './settings/settings-main-section';
import { SettingsSystemSummarySection } from './settings/settings-system-summary-section';
import { SettingsThemeSection } from './settings/settings-theme-section';
import { SettingsWeatherMetaSection } from './settings/settings-weather-meta-section';
import { SettingsWeatherSection } from './settings/settings-weather-section';

type ThemeOption = {
  key: string;
  name: string;
  colors: Record<string, string>;
};

type SummaryOption = {
  key: string;
  labelKey: string;
};

type MetaOption = {
  key: string;
  labelKey: string;
};

type LocationOption = {
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
};

type SettingsModalProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  isAuthenticated: boolean;
  loginEmail: string;
  loginPassword: string;
  loginError: string | null;
  saving: boolean;
  draftConfig: DashboardConfig | null;
  draftCategories: Category[];
  defaultConfig: DashboardConfig;
  languageOptions: ReadonlyArray<{ code: string; label: string }>;
  gridColumnOptions: ReadonlyArray<number>;
  themeOptions: ReadonlyArray<ThemeOption>;
  systemSummaryOptions: ReadonlyArray<SummaryOption>;
  weatherMetaOptions: ReadonlyArray<MetaOption>;
  selectedSystemSummary: ReadonlyArray<string>;
  availableSystemSummary: ReadonlyArray<SummaryOption>;
  selectedWeatherMeta: ReadonlyArray<string>;
  availableWeatherMeta: ReadonlyArray<MetaOption>;
  systemSummaryMax: number;
  weatherMetaMax: number;
  locationQuery: string;
  locationOptions: LocationOption[];
  onClose: () => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoginEmailChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onLogout: () => void;
  onSave: () => void;
  setDraftConfig: Dispatch<SetStateAction<DashboardConfig | null>>;
  onLocationQueryChange: (value: string) => void;
  onLocationSelect: (option: LocationOption) => void;
  addSystemSummaryKey: (key: string) => void;
  moveSystemSummaryKey: (index: number, direction: number) => void;
  removeSystemSummaryKey: (key: string) => void;
  addWeatherMetaKey: (key: string) => void;
  moveWeatherMetaKey: (index: number, direction: number) => void;
  removeWeatherMetaKey: (key: string) => void;
  addCategory: () => void;
  updateCategory: (categoryId: string, patch: Partial<Category>) => void;
  moveCategory: (index: number, direction: number) => void;
  removeCategory: (categoryId: string) => void;
  addService: (categoryId: string) => void;
  updateService: (
    categoryId: string,
    serviceId: string,
    patch: Partial<Service>
  ) => void;
  moveService: (categoryId: string, serviceIndex: number, direction: number) => void;
  removeService: (categoryId: string, serviceId: string) => void;
};

export function SettingsModal({
  t,
  isAuthenticated,
  loginEmail,
  loginPassword,
  loginError,
  saving,
  draftConfig,
  draftCategories,
  defaultConfig,
  languageOptions,
  gridColumnOptions,
  themeOptions,
  systemSummaryOptions,
  weatherMetaOptions,
  selectedSystemSummary,
  availableSystemSummary,
  selectedWeatherMeta,
  availableWeatherMeta,
  systemSummaryMax,
  weatherMetaMax,
  locationQuery,
  locationOptions,
  onClose,
  onLoginSubmit,
  onLoginEmailChange,
  onLoginPasswordChange,
  onLogout,
  onSave,
  setDraftConfig,
  onLocationQueryChange,
  onLocationSelect,
  addSystemSummaryKey,
  moveSystemSummaryKey,
  removeSystemSummaryKey,
  addWeatherMetaKey,
  moveWeatherMetaKey,
  removeWeatherMetaKey,
  addCategory,
  updateCategory,
  moveCategory,
  removeCategory,
  addService,
  updateService,
  moveService,
  removeService
}: SettingsModalProps) {
  return (
    <div className="settings-panel" role="dialog" aria-modal="true">
      <div className="settings-card">
        <div className="settings-header">
          <div>
            <div className="settings-kicker">{t('settingsKicker')}</div>
            <h2>{t('settingsTitle')}</h2>
            <p className="helper-text">{t('settingsSubtitle')}</p>
          </div>
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
          >
            {t('close')}
          </button>
        </div>

        {!isAuthenticated ? (
          <SettingsAuthForm
            t={t}
            loginEmail={loginEmail}
            loginPassword={loginPassword}
            loginError={loginError}
            onLoginSubmit={onLoginSubmit}
            onLoginEmailChange={onLoginEmailChange}
            onLoginPasswordChange={onLoginPasswordChange}
          />
        ) : draftConfig ? (
          <>
            <div className="settings-body">
              <SettingsMainSection
                t={t}
                draftConfig={draftConfig}
                defaultConfig={defaultConfig}
                setDraftConfig={setDraftConfig}
              />

              <SettingsLayoutSection
                t={t}
                draftConfig={draftConfig}
                defaultConfig={defaultConfig}
                languageOptions={languageOptions}
                gridColumnOptions={gridColumnOptions}
                setDraftConfig={setDraftConfig}
              />

              <SettingsThemeSection
                t={t}
                draftConfig={draftConfig}
                defaultConfig={defaultConfig}
                themeOptions={themeOptions}
                setDraftConfig={setDraftConfig}
              />
              <SettingsSystemSummarySection
                t={t}
                systemSummaryMax={systemSummaryMax}
                systemSummaryOptions={systemSummaryOptions}
                selectedSystemSummary={selectedSystemSummary}
                availableSystemSummary={availableSystemSummary}
                addSystemSummaryKey={addSystemSummaryKey}
                moveSystemSummaryKey={moveSystemSummaryKey}
                removeSystemSummaryKey={removeSystemSummaryKey}
              />

              <SettingsWeatherSection
                t={t}
                draftConfig={draftConfig}
                setDraftConfig={setDraftConfig}
                locationQuery={locationQuery}
                locationOptions={locationOptions}
                onLocationQueryChange={onLocationQueryChange}
                onLocationSelect={onLocationSelect}
              />
              <SettingsWeatherMetaSection
                t={t}
                weatherMetaMax={weatherMetaMax}
                weatherMetaOptions={weatherMetaOptions}
                selectedWeatherMeta={selectedWeatherMeta}
                availableWeatherMeta={availableWeatherMeta}
                addWeatherMetaKey={addWeatherMetaKey}
                moveWeatherMetaKey={moveWeatherMetaKey}
                removeWeatherMetaKey={removeWeatherMetaKey}
              />
              <SettingsCategoriesSection
                t={t}
                draftCategories={draftCategories}
                addCategory={addCategory}
                updateCategory={updateCategory}
                moveCategory={moveCategory}
                removeCategory={removeCategory}
                addService={addService}
                updateService={updateService}
                moveService={moveService}
                removeService={removeService}
              />

            </div>
            <div className="settings-footer">
              {loginError ? (
                <div className="settings-error">{loginError}</div>
              ) : null}
              <div className="settings-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={onLogout}
                >
                  {t('logout')}
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={saving}
                  onClick={onSave}
                >
                  {saving ? t('saving') : t('saveChanges')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="settings-loading">{t('loadingSettings')}</div>
        )}
      </div>
    </div>
  );
}
