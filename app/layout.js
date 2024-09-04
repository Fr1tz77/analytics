import './globals.css'

export const metadata = {
  title: 'Analytics',
  description: 'Analytics application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
