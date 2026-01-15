import type { FormEvent } from 'react';
import { AppIcon } from './AppIcon';
import { SettingsAuthForm } from './settings/settings-auth-form';

type LoginModalProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  loginEmail: string;
  loginPassword: string;
  loginError: string | null;
  onClose: () => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoginEmailChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
};

export function LoginModal({
  t,
  loginEmail,
  loginPassword,
  loginError,
  onClose,
  onLoginSubmit,
  onLoginEmailChange,
  onLoginPasswordChange
}: LoginModalProps) {
  return (
    <div className="settings-panel" role="dialog" aria-modal="true">
      <div className="settings-card login-card">
        <div className="settings-header">
          <div>
            <div className="settings-kicker">{t('loginKicker')}</div>
            <h2>{t('loginTitle')}</h2>
            <p className="helper-text">{t('loginSubtitle')}</p>
          </div>
          <button
            type="button"
            className="button secondary icon"
            onClick={onClose}
            aria-label={t('close')}
            title={t('close')}
          >
            <AppIcon name="close" size={18} />
          </button>
        </div>
        <SettingsAuthForm
          t={t}
          loginEmail={loginEmail}
          loginPassword={loginPassword}
          loginError={loginError}
          onLoginSubmit={onLoginSubmit}
          onLoginEmailChange={onLoginEmailChange}
          onLoginPasswordChange={onLoginPasswordChange}
        />
      </div>
    </div>
  );
}
