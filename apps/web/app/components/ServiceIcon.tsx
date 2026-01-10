import { useEffect, useState } from 'react';
import { AppIcon } from './AppIcon';
import type { Service } from '@homedock/types';

function buildAutoIconUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}/favicon.ico`;
  } catch {
    return null;
  }
}

export function ServiceIcon({
  service,
  size = 28
}: {
  service: Service;
  size?: number;
}) {
  const explicitUrl = service.iconUrl?.trim();
  const namedIcon = service.icon?.trim();
  const autoUrl =
    !explicitUrl && !namedIcon ? buildAutoIconUrl(service.url) : null;
  const [explicitError, setExplicitError] = useState(false);
  const [autoError, setAutoError] = useState(false);

  useEffect(() => {
    setExplicitError(false);
  }, [explicitUrl]);

  useEffect(() => {
    setAutoError(false);
  }, [autoUrl]);

  if (explicitUrl && !explicitError) {
    return (
      <img
        src={explicitUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setExplicitError(true)}
      />
    );
  }

  if (namedIcon) {
    return <AppIcon name={namedIcon} size={size} />;
  }

  if (autoUrl && !autoError) {
    return (
      <img
        src={autoUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setAutoError(true)}
      />
    );
  }

  return <AppIcon name="default" size={size} />;
}
