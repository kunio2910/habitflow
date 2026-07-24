import "./globals.css";

export const metadata = {
  title: "HabitFlow — Quản lý thói quen",
  description: "Theo dõi thói quen, duy trì chuỗi ngày và tiến bộ mỗi ngày."
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
