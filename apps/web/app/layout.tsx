import './globals.css';

export const metadata = {
  title: 'HomeDock',
  description: '포트와 서브도메인을 한눈에 관리하는 홈서버 대시보드.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
