import type { Dispatch, SetStateAction } from 'react';
import type { DashboardConfig } from '@homedock/types';

type LocationOption = {
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
};

type SettingsWeatherSectionProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  draftConfig: DashboardConfig;
  setDraftConfig: Dispatch<SetStateAction<DashboardConfig | null>>;
  locationQuery: string;
  locationOptions: LocationOption[];
  onLocationQueryChange: (value: string) => void;
  onLocationSelect: (option: LocationOption) => void;
};

export function SettingsWeatherSection({
  t,
  draftConfig,
  setDraftConfig,
  locationQuery,
  locationOptions,
  onLocationQueryChange,
  onLocationSelect
}: SettingsWeatherSectionProps) {
  return (
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
            onChange={(event) => onLocationQueryChange(event.target.value)}
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
  );
}
