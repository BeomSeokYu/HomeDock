import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
            width: 420,
            height: 420,
            borderRadius: 96,
            background: 'linear-gradient(180deg, #182436 0%, #0B0F16 100%)',
            border: '8px solid #7EF5D2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: 72,
              height: 212,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #7EF5D2 0%, #8AB6FF 100%)',
              position: 'absolute',
              left: 120,
              top: 120
            }}
          />
          <div
            style={{
              width: 72,
              height: 212,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #7EF5D2 0%, #8AB6FF 100%)',
              position: 'absolute',
              right: 120,
              top: 120
            }}
          />
          <div
            style={{
              width: 112,
              height: 48,
              borderRadius: 24,
              background: '#7EF5D2',
              position: 'absolute',
              left: '50%',
              top: 200,
              transform: 'translateX(-50%)'
            }}
          />
          <div
            style={{
              width: 200,
              height: 20,
              borderRadius: 10,
              background: '#1F2C3D',
              position: 'absolute',
              bottom: 70,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: '#7EF5D2',
              position: 'absolute',
              left: 168,
              bottom: 72
            }}
          />
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: '#8AB6FF',
              position: 'absolute',
              left: '50%',
              bottom: 72,
              transform: 'translateX(-50%)'
            }}
          />
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: '#FFB86B',
              position: 'absolute',
              right: 168,
              bottom: 72
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
