import './globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'Analytics Dashboard',
  description: 'Modern analytics dashboard with dark mode',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
