import type { RefObject } from 'react';
import type { Service } from '@homedock/types';
import { AppIcon } from './AppIcon';
import { ServiceIcon } from './ServiceIcon';

type DockEntry =
  | { type: 'item'; service: Service }
  | { type: 'separator'; id: string };

type DockProps = {
  dockEntries: ReadonlyArray<DockEntry>;
  dockHiddenFavorites: ReadonlyArray<Service>;
  dockMenuOpen: boolean;
  dockSeparatorEnabled: boolean;
  isAuthenticated: boolean;
  dockRef: RefObject<HTMLDivElement>;
  dockMenuRef: RefObject<HTMLDivElement>;
  dockMoreRef: RefObject<HTMLButtonElement>;
  onAuthClick: () => void;
  onToggleMenu: () => void;
  onOpenSettings: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export function Dock({
  dockEntries,
  dockHiddenFavorites,
  dockMenuOpen,
  dockSeparatorEnabled,
  isAuthenticated,
  dockRef,
  dockMenuRef,
  dockMoreRef,
  onAuthClick,
  onToggleMenu,
  onOpenSettings,
  t
}: DockProps) {
  const hasHidden = dockHiddenFavorites.length > 0;
  const authLabel = isAuthenticated ? t('dockLogout') : t('dockLogin');
  const settingsLabel = t('dockSettings');
  const showGroupSeparator =
    dockSeparatorEnabled && (dockEntries.length > 0 || hasHidden);

  return (
    <div className="dock" ref={dockRef}>
      {dockEntries.map((entry) =>
        entry.type === 'separator' ? (
          <span key={entry.id} className="dock-separator" aria-hidden="true" />
        ) : (
          <a
            key={entry.service.id}
            className="dock-item"
            href={entry.service.url}
            target={entry.service.target === '_self' ? '_self' : '_blank'}
            rel={entry.service.target === '_self' ? undefined : 'noreferrer'}
          >
            <ServiceIcon service={entry.service} size={22} />
          </a>
        )
      )}
      {hasHidden ? (
        <button
          ref={dockMoreRef}
          type="button"
          className="dock-item dock-more"
          onClick={onToggleMenu}
          aria-label={t('dockMore')}
          title={t('dockMore')}
        >
          {'\u22ef'}
        </button>
      ) : null}
      {showGroupSeparator ? (
        <span className="dock-separator" aria-hidden="true" />
      ) : null}
      <button
        type="button"
        className="dock-item"
        onClick={onAuthClick}
        aria-label={authLabel}
        title={authLabel}
      >
        <AppIcon name={isAuthenticated ? 'shield' : 'user'} size={22} />
      </button>
      <button
        type="button"
        className="dock-item"
        onClick={onOpenSettings}
        aria-label={settingsLabel}
        title={settingsLabel}
      >
        <AppIcon name="settings" size={22} />
      </button>
      {hasHidden && dockMenuOpen ? (
        <div className="dock-menu" ref={dockMenuRef}>
          {dockHiddenFavorites.map((service) => (
            <a
              key={service.id}
              className="dock-menu-item"
              href={service.url}
              target={service.target === '_self' ? '_self' : '_blank'}
              rel={service.target === '_self' ? undefined : 'noreferrer'}
            >
              <ServiceIcon service={service} size={20} />
              <span>{service.name}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
