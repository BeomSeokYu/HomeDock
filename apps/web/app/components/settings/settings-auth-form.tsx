import type { FormEvent } from 'react';

type SettingsAuthFormProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  loginEmail: string;
  loginPassword: string;
  loginError: string | null;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoginEmailChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
};

export function SettingsAuthForm({
  t,
  loginEmail,
  loginPassword,
  loginError,
  onLoginSubmit,
  onLoginEmailChange,
  onLoginPasswordChange
}: SettingsAuthFormProps) {
  const passwordPlaceholder = '\u2022'.repeat(8);

  return (
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
      {loginError ? <div className="settings-error">{loginError}</div> : null}
      <div className="auth-actions">
        <button className="button" type="submit">
          {t('loginButton')}
        </button>
      </div>
    </form>
  );
}
