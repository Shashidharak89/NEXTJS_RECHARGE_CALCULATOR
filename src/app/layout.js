// app/layout.js
import './globals.css'
import { UserProvider } from '../context/UserContext'

// Metadata API (static). Works only in root-level server components in App Router.
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gamenexplay.live'
  ),
  title: {
    default: 'GameNexPlay',
    template: '%s | GameNexPlay',
  },
  description:
    'GameNexPlay – Play free games, earn daily rewards, coins, and compete in tournaments. Join our community and level up your gamer score!',
  keywords: [
    'GNP',
    'gnp',
    'gamenexplay.live',
    'gamenexplay',
    'gnplay',
  ],
  authors: [
    {
      name: 'GameNexPlay Team',
      url: process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL + '/about'
        : 'https://gamenexplay.live/about',
    },
  ],
  creator: 'GameNexPlay',
  openGraph: {
    title: 'GameNexPlay – Play & Earn Daily Rewards',
    description:
      'Play free games, earn coins, join giveaways, and track your daily gamer score at GameNexPlay.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL || 'https://gamenexplay.live',
    siteName: 'GameNexPlay',
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || 'https://gamenexplay.live'
        }/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'GameNexPlay logo and coins on dark background',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Free Games & Earn Rewards | GameNexPlay',
    description:
      'Join GameNexPlay to compete in tournaments, win coins, access tips & giveaways daily!',
    creator: '@GameNexPlay',
    images: [
      `${
        process.env.NEXT_PUBLIC_SITE_URL || 'https://gamenexplay.live'
      }/og-image.png`,
    ],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ||
      '', // Add Google Search Console code here
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
