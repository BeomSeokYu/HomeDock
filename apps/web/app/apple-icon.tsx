import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0F16'
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 36,
            background: 'linear-gradient(180deg, #182436 0%, #0B0F16 100%)',
            border: '4px solid #7EF5D2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: 26,
              height: 70,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7EF5D2 0%, #8AB6FF 100%)',
              position: 'absolute',
              left: 44,
              top: 32
            }}
          />
          <div
            style={{
              width: 26,
              height: 70,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7EF5D2 0%, #8AB6FF 100%)',
              position: 'absolute',
              right: 44,
              top: 32
            }}
          />
          <div
            style={{
              width: 44,
              height: 18,
              borderRadius: 9,
              background: '#7EF5D2',
              position: 'absolute',
              left: '50%',
              top: 64,
              transform: 'translateX(-50%)'
            }}
          />
          <div
            style={{
              width: 80,
              height: 12,
              borderRadius: 6,
              background: '#1F2C3D',
              position: 'absolute',
              bottom: 22,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
