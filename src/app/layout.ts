import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Viral Clip Finder - AI-Powered Content Creation',
  description: 'Transform your long-form content into viral social media clips with AI-powered analysis and automated editing.',
  keywords: 'viral clips, AI video editing, social media content, video analysis, content creation',
  authors: [{ name: 'Viral Clip Finder Team' }],
  openGraph: {
    title: 'Viral Clip Finder - AI-Powered Content Creation',
    description: 'Transform your long-form content into viral social media clips with AI-powered analysis and automated editing.',
    type: 'website',
    url: 'https://viralclipfinder.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viral Clip Finder - AI-Powered Content Creation',
    description: 'Transform your long-form content into viral social media clips with AI-powered analysis and automated editing.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>