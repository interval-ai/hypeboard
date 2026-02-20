export const metadata = {
  title: 'Interval HypeBoard',
  description: 'Internal team recognition platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#080a0f' }}>
        {children}
      </body>
    </html>
  )
}
