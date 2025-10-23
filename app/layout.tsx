import NextUIProviderTemp from '@/components/NextUIProvider';
import '../styles/globals.css'

export const dynamic = 'force-dynamic';

async function getServerSideProps() {
  'use server'

  try {

  } catch (error) {
    console.log('LOAD LAYOUT GSSP', error)
    return { isValid: false }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  'use server'
  const props = await getServerSideProps()
  //console.log(props)
  return (
    <html lang='en'>
      <head>
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <title>{'Vцентре Склад'}</title>
      </head>
      <body>
        <main>
          <NextUIProviderTemp children={children} />
        </main>
      </body>
    </html>
  )
}