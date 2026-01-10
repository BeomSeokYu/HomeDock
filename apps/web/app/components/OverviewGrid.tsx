type SummaryOption = {
  key: string;
  labelKey: string;
};

type MetaOption = {
  key: string;
  labelKey: string;
};

type WeatherData = {
  icon: string;
  temperature: number;
  minTemp: number;
  maxTemp: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  location: string;
};

type OverviewGridProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  systemSummaryOrder: ReadonlyArray<string>;
  systemSummaryOptions: ReadonlyArray<SummaryOption>;
  systemSummaryValues: Record<string, string>;
  weather: WeatherData;
  weatherSummary: string;
  weatherMetaOrder: ReadonlyArray<string>;
  weatherMetaOptions: ReadonlyArray<MetaOption>;
  weatherMetaValues: Record<string, string>;
};

export function OverviewGrid({
  t,
  systemSummaryOrder,
  systemSummaryOptions,
  systemSummaryValues,
  weather,
  weatherSummary,
  weatherMetaOrder,
  weatherMetaOptions,
  weatherMetaValues
}: OverviewGridProps) {
  return (
    <section className="overview-grid">
      <div className="glass-card">
        <h3>{t('systemSummaryCard')}</h3>
        {systemSummaryOrder.map((key) => {
          const labelKey = systemSummaryOptions.find(
            (option) => option.key === key
          )?.labelKey;
          const label = labelKey ? t(labelKey) : key;
          const value = systemSummaryValues[key] ?? '-';
          return (
            <div key={key} className="metric-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          );
        })}
      </div>
      <div className="glass-card weather-card">
        <h3>{t('weatherCard')}</h3>
        <div className="weather-header">
          <div className="weather-icon">{weather.icon}</div>
          <div>
            <div className="weather-temp">
              {Math.round(weather.temperature)}{'\u00b0'}C
            </div>
            <div className="weather-summary">
              {weatherSummary} {'\u00b7'} {weather.location}
            </div>
            <div className="weather-range">
              <span>
                {t('labelMinTemp')} {Math.round(weather.minTemp)}
                {'\u00b0'}
              </span>
              <span>
                {t('labelMaxTemp')} {Math.round(weather.maxTemp)}
                {'\u00b0'}
              </span>
              <span className="weather-feels">
                {t('labelFeelsLike')} {Math.round(weather.feelsLike)}
                {'\u00b0'}C
              </span>
            </div>
            <div className="weather-sun">
              <span>
                {t('labelSunrise')} {weather.sunrise}
              </span>
              <span>
                {t('labelSunset')} {weather.sunset}
              </span>
            </div>
          </div>
        </div>
        <div className="weather-meta">
          {weatherMetaOrder.map((key) => {
            const labelKey = weatherMetaOptions.find(
              (option) => option.key === key
            )?.labelKey;
            const label = labelKey ? t(labelKey) : key;
            const value = weatherMetaValues[key] ?? '-';
            return (
              <span key={key}>
                {label} {value}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
