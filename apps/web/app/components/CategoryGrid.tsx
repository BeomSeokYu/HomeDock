import type { CSSProperties } from 'react';
import type { Category, Service } from '@homedock/types';
import { ServiceIcon } from './ServiceIcon';

type CategoryTone = {
  accent: string;
  glow: string;
};

type CategoryWithTone = Category & {
  services: Service[];
  tone: CategoryTone;
};

type CategoryGridProps = {
  categories: ReadonlyArray<CategoryWithTone>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export function CategoryGrid({ categories, t }: CategoryGridProps) {
  return (
    <section className="category-grid">
      {categories.map((category) => (
        <div
          key={category.id}
          className="category-card"
          style={
            {
              '--category-accent': category.tone.accent
            } as CSSProperties
          }
        >
          <div className="category-header">
            <div className="category-title">
              <span className="category-dot" />
              <span>{category.name}</span>
            </div>
            <div className="category-meta">
              {t('serviceCount', { count: category.services.length })}
            </div>
          </div>
          <div className="service-grid">
            {category.services.map((service, index) => {
              const tooltip = [
                service.name,
                service.url,
                service.description
              ]
                .filter(Boolean)
                .join('\n');
              return (
                <a
                  key={service.id}
                  className="service-card"
                  data-tooltip={tooltip}
                  href={service.url}
                  target={service.target === '_self' ? '_self' : '_blank'}
                  rel={service.target === '_self' ? undefined : 'noreferrer'}
                  style={{
                    animationDelay: `${index * 0.08}s`
                  }}
                >
                  <div className="service-icon">
                    <ServiceIcon service={service} size={28} />
                  </div>
                  <div className="service-name">{service.name}</div>
                  <div className="service-url">{service.url}</div>
                  {service.description ? (
                    <div className="service-desc">
                      {service.description}
                    </div>
                  ) : null}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
