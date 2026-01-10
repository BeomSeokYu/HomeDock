import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Category, DashboardConfig, Service } from '@homedock/types';
import { IconPicker } from './IconPicker';
import { ServiceIcon } from './ServiceIcon';

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
  token: string | null;
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
  splitUrl: (raw: string) => { protocol: string; rest: string };
  buildUrl: (protocol: string, rest: string) => string;
};

export function SettingsModal({
  t,
  token,
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
  removeService,
  splitUrl,
  buildUrl
}: SettingsModalProps) {
  const passwordPlaceholder = '\u2022'.repeat(8);

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

        {!token ? (
          <form className="settings-auth" onSubmit={onLoginSubmit}>
            <div className="auth-field">
              <label>{t('loginEmail')}</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => onLoginEmailChange(event.target.value)}
                placeholder="admin@homedock.local"
                required
              />
            </div>
            <div className="auth-field">
              <label>{t('loginPassword')}</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => onLoginPasswordChange(event.target.value)}
                placeholder={passwordPlaceholder}
                required
              />
            </div>
            {loginError ? (
              <div className="settings-error">{loginError}</div>
            ) : null}
            <div className="auth-actions">
              <button className="button" type="submit">
                {t('loginButton')}
              </button>
            </div>
          </form>
        ) : draftConfig ? (
          <>
            <div className="settings-body">
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
                          prev
                            ? { ...prev, brandName: event.target.value }
                            : prev
                        )
                      }
                    />
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
                          prev
                            ? { ...prev, description: event.target.value }
                            : prev
                        )
                      }
                    />
                  </div>
                </div>
                <div className="settings-row">
                  <label className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={
                        draftConfig.showBrand ?? defaultConfig.showBrand
                      }
                      onChange={(event) =>
                        setDraftConfig((prev) =>
                          prev
                            ? { ...prev, showBrand: event.target.checked }
                            : prev
                        )
                      }
                    />
                    {t('showBrandLabel')}
                  </label>
                  <label className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={
                        draftConfig.showTitle ?? defaultConfig.showTitle
                      }
                      onChange={(event) =>
                        setDraftConfig((prev) =>
                          prev
                            ? { ...prev, showTitle: event.target.checked }
                            : prev
                        )
                      }
                    />
                    {t('showTitleLabel')}
                  </label>
                  <label className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={
                        draftConfig.showDescription ??
                        defaultConfig.showDescription
                      }
                      onChange={(event) =>
                        setDraftConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                showDescription: event.target.checked
                              }
                            : prev
                        )
                      }
                    />
                    {t('showDescriptionLabel')}
                  </label>
                </div>
              </section>

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
                </div>
              </section>

              <section className="settings-section">
                <div className="section-header">
                  <h3>{t('themeTitle')}</h3>
                  <span className="helper-text">{t('themeHelp')}</span>
                </div>
                <div className="theme-grid">
                  {themeOptions.map((themeOption) => {
                    const isActive =
                      (draftConfig.themeKey ?? defaultConfig.themeKey) ===
                      themeOption.key;
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
                            prev
                              ? { ...prev, themeKey: themeOption.key }
                              : prev
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
              <section className="settings-section">
                <div className="section-header">
                  <h3>{t('systemSummaryTitle')}</h3>
                  <span className="helper-text">
                    {t('systemSummaryHelp', { count: systemSummaryMax })}
                  </span>
                </div>
                <div className="option-list">
                  {selectedSystemSummary.length === 0 ? (
                    <div className="option-empty">
                      {t('systemSummaryEmpty')}
                    </div>
                  ) : (
                    selectedSystemSummary.map((key, index) => {
                      const option = systemSummaryOptions.find(
                        (item) => item.key === key
                      );
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
                    const disabled =
                      selectedSystemSummary.length >= systemSummaryMax;
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

              <section className="settings-section">
                <h3>{t('weatherLocationTitle')}</h3>
                <div className="settings-row">
                  <label className="radio-pill">
                    <input
                      type="radio"
                      checked={draftConfig.weatherMode === 'auto'}
                      onChange={() =>
                        setDraftConfig((prev) =>
                          prev ? { ...prev, weatherMode: 'auto' } : prev
                        )
                      }
                    />
                    {t('weatherAuto')}
                  </label>
                  <label className="radio-pill">
                    <input
                      type="radio"
                      checked={draftConfig.weatherMode === 'manual'}
                      onChange={() =>
                        setDraftConfig((prev) =>
                          prev ? { ...prev, weatherMode: 'manual' } : prev
                        )
                      }
                    />
                    {t('weatherManual')}
                  </label>
                </div>
                {draftConfig.weatherMode === 'manual' ? (
                  <div className="location-picker">
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(event) =>
                        onLocationQueryChange(event.target.value)
                      }
                      placeholder={t('weatherSearchPlaceholder')}
                    />
                    {locationOptions.length > 0 ? (
                      <div className="location-list">
                        {locationOptions.map((option) => (
                          <button
                            key={`${option.name}-${option.latitude}-${option.longitude}`}
                            type="button"
                            onClick={() => onLocationSelect(option)}
                          >
                            <span>{option.name}</span>
                            <span className="helper-text">
                              {option.region ?? ''}
                              {option.country ? ` \u00b7 ${option.country}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="helper-text">{t('weatherAutoHint')}</p>
                )}
              </section>
              <section className="settings-section">
                <div className="section-header">
                  <h3>{t('weatherMetaTitle')}</h3>
                  <span className="helper-text">
                    {t('weatherMetaHelp', { count: weatherMetaMax })}
                  </span>
                </div>
                <div className="option-list">
                  {selectedWeatherMeta.length === 0 ? (
                    <div className="option-empty">
                      {t('weatherMetaEmpty')}
                    </div>
                  ) : (
                    selectedWeatherMeta.map((key, index) => {
                      const option = weatherMetaOptions.find(
                        (item) => item.key === key
                      );
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
              <section className="settings-section">
                <div className="section-header">
                  <h3>{t('categoryTitle')}</h3>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={addCategory}
                  >
                    {t('categoryAdd')}
                  </button>
                </div>

                <div className="category-editor-list">
                  {draftCategories.map((category, categoryIndex) => (
                    <div key={category.id} className="category-editor">
                      <div className="category-editor-head">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(event) =>
                            updateCategory(category.id, {
                              name: event.target.value
                            })
                          }
                        />
                        <input
                          type="color"
                          value={category.color ?? '#7ef5d2'}
                          onChange={(event) =>
                            updateCategory(category.id, {
                              color: event.target.value
                            })
                          }
                        />
                        <div className="editor-actions">
                          <button
                            type="button"
                            onClick={() => moveCategory(categoryIndex, -1)}
                          >
                            {'\u2191'}
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCategory(categoryIndex, 1)}
                          >
                            {'\u2193'}
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => removeCategory(category.id)}
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>

                      <div className="service-editor-list">
                        {(category.services ?? []).map((service, serviceIndex) => {
                          const { protocol, rest } = splitUrl(service.url ?? '');

                          return (
                            <div key={service.id} className="service-editor">
                              <div className="service-editor-head">
                                <div className="service-preview">
                                  <ServiceIcon service={service} size={22} />
                                </div>
                                <input
                                  type="text"
                                  value={service.name}
                                  onChange={(event) =>
                                    updateService(category.id, service.id, {
                                      name: event.target.value
                                    })
                                  }
                                />
                                <div className="editor-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      moveService(category.id, serviceIndex, -1)
                                    }
                                  >
                                    {'\u2191'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      moveService(category.id, serviceIndex, 1)
                                    }
                                  >
                                    {'\u2193'}
                                  </button>
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() =>
                                      removeService(category.id, service.id)
                                    }
                                  >
                                    {t('delete')}
                                  </button>
                                </div>
                              </div>

                              <div className="service-editor-hint">
                                {t('iconPriorityHint')}
                              </div>
                              <div className="service-editor-grid">
                                <div className="field">
                                  <label>{t('iconName')}</label>
                                  <IconPicker
                                    value={service.icon ?? ''}
                                    onChange={(value) =>
                                      updateService(category.id, service.id, {
                                        icon: value
                                      })
                                    }
                                    placeholder={t('iconNamePlaceholder')}
                                  />
                                </div>
                                <div className="field">
                                  <label>{t('iconUrl')}</label>
                                  <input
                                    type="text"
                                    value={service.iconUrl ?? ''}
                                    onChange={(event) =>
                                      updateService(category.id, service.id, {
                                        iconUrl: event.target.value
                                      })
                                    }
                                    placeholder="https://.../icon.png"
                                  />
                                </div>
                                <div className="field url-field">
                                  <label>{t('urlLabel')}</label>
                                  <div className="url-input">
                                    <select
                                      value={protocol}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          url: buildUrl(event.target.value, rest)
                                        })
                                      }
                                    >
                                      <option value="http">http://</option>
                                      <option value="https">https://</option>
                                    </select>
                                    <input
                                      type="text"
                                      value={rest}
                                      onChange={(event) =>
                                        updateService(category.id, service.id, {
                                          url: buildUrl(
                                            protocol,
                                            event.target.value
                                          )
                                        })
                                      }
                                      placeholder="host:port/path"
                                    />
                                  </div>
                                </div>
                                <div className="field">
                                  <label>{t('descriptionLabel')}</label>
                                  <input
                                    type="text"
                                    value={service.description ?? ''}
                                    onChange={(event) =>
                                      updateService(category.id, service.id, {
                                        description: event.target.value
                                      })
                                    }
                                    placeholder={t('serviceDescPlaceholder')}
                                  />
                                </div>
                              </div>

                              <div className="service-editor-options">
                                <label className="checkbox-pill">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(service.isFavorite)}
                                    onChange={(event) =>
                                      updateService(category.id, service.id, {
                                        isFavorite: event.target.checked
                                      })
                                    }
                                  />
                                  {t('favoriteLabel')}
                                </label>
                                <label className="checkbox-pill">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(service.requiresAuth)}
                                    onChange={(event) =>
                                      updateService(category.id, service.id, {
                                        requiresAuth: event.target.checked
                                      })
                                    }
                                  />
                                  {t('authRequiredLabel')}
                                </label>
                                <div className="field inline">
                                  <label>{t('targetLabel')}</label>
                                  <select
                                    value={service.target ?? '_blank'}
                                    onChange={(event) =>
                                      updateService(category.id, service.id, {
                                        target: event.target.value
                                      })
                                    }
                                  >
                                    <option value="_self">{t('targetSelf')}</option>
                                    <option value="_blank">{t('targetBlank')}</option>
                                    <option value="window">{t('targetWindow')}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          className="button ghost"
                          onClick={() => addService(category.id)}
                        >
                          {t('serviceAdd')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

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
