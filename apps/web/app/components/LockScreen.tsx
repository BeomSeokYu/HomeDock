import type { PointerEvent, RefObject, TouchEvent } from 'react';

type LockScreenProps = {
  unlocked: boolean;
  token: string | null;
  timeLabel: string;
  dateLabel: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  lockRef: RefObject<HTMLDivElement>;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
  onUnlock: (withKick?: boolean) => void;
};

export function LockScreen({
  unlocked,
  token,
  timeLabel,
  dateLabel,
  t,
  lockRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onUnlock
}: LockScreenProps) {
  return (
    <div
      ref={lockRef}
      className={`lock-screen ${unlocked ? 'unlocked' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div className="status-bar">
        <div className="status-left">
          {token ? t('loginActive') : t('loginInactive')}
        </div>
        <div className="status-right" />
      </div>
      <div className="lock-content">
        <div className="lock-time">{timeLabel}</div>
        <div className="lock-date">{dateLabel}</div>
      </div>
      <button
        type="button"
        className="swipe-indicator"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onUnlock(true);
        }}
        onMouseDownCapture={(event) => event.stopPropagation()}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onUnlock(true);
        }}
        onPointerDownCapture={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onUnlock(true);
        }}
        onTouchStartCapture={(event) => event.stopPropagation()}
        onClick={() => onUnlock(true)}
      >
        <span>{'\u2191'}</span> {t('lockSwipe')}
      </button>
    </div>
  );
}
