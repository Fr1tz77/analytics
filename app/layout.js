import './globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'Analytics Dashboard',
  description: 'Modern analytics dashboard with dark mode',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-100 dark:bg-gray-900">
      <body className="h-full">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
