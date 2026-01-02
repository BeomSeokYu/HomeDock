import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0B0F16 0%, #182436 100%)',
          color: '#E6EDF7',
          fontFamily: 'Arial, sans-serif',
          padding: 64,
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 64,
            background: '#101726',
            borderRadius: 32,
            border: '1px solid #1E2A3D',
            padding: '0 24px',
            marginBottom: 32
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: '#1E2A3D'
              }}
            />
            <span style={{ fontSize: 18 }}>HomeDock</span>
          </div>
          <div
            style={{
              padding: '6px 16px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #7EF5D2 0%, #8AB6FF 100%)',
              color: '#0B0F16',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Dashboard
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 44, fontWeight: 600 }}>
            HomeDock Main Dashboard
          </div>
          <div style={{ fontSize: 22, color: '#A8B5C9', marginTop: 8 }}>
            Ports, subdomains, and tools organized in one view.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div
            style={{
              flex: 1,
              background: '#121B29',
              borderRadius: 24,
              border: '1px solid #1E2A3D',
              padding: 24
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 12 }}>
              System Summary
            </div>
            <div style={{ height: 6, background: '#1E2A3D', marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#A8B5C9' }}>Active Services</span>
              <span>28</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#A8B5C9' }}>Auth Status</span>
              <span>Signed in</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#A8B5C9' }}>Last Sync</span>
              <span>09:48</span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: '#121B29',
              borderRadius: 24,
              border: '1px solid #1E2A3D',
              padding: 24
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 12 }}>
              Today's Weather
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  background: '#1E2A3D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}
              >
                22°
              </div>
              <div>
                <div style={{ fontSize: 18 }}>Clear</div>
                <div style={{ fontSize: 16, color: '#A8B5C9', marginTop: 6 }}>
                  Seoul · 06:52 / 19:38
                </div>
              </div>
            </div>
            <div style={{ height: 6, background: '#1E2A3D', marginTop: 18 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {['Media Zone', 'Infra Control', 'Storage Vault'].map((label) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: '#121B29',
                borderRadius: 24,
                border: '1px solid #1E2A3D',
                padding: 24,
                fontSize: 18
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
