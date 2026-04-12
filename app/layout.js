export const metadata = {
  title: 'SAFUU — ሳፉ | Ethiopian Anti-Corruption Platform',
  description: 'Anonymous anti-corruption intelligence platform for Ethiopia. Report bribery, land fraud, and abuse of power in any Ethiopian language.',
  keywords: 'Ethiopia, anti-corruption, FEACC, anonymous reporting, transparency, ሙስና',
  openGraph: {
    title: 'SAFUU — ሳፉ | Ethiopian Anti-Corruption Platform',
    description: 'Report corruption anonymously. Your identity is never stored.',
    url: 'https://safuu.net',
    siteName: 'Safuu Intel',
    locale: 'en_ET',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='33' fill='%23078930'/><rect y='33' width='100' height='34' fill='%23FCDD09'/><rect y='67' width='100' height='33' fill='%23DA121A'/></svg>"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="theme-color" content="#06080f"/>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#06080f' }}>{children}</body>
    </html>
  )
}
