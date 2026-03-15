import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google"

import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"

const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-serif" })

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const metadata = {
  title: "Alicia - AI Storytelling Companion",
  description:
    "Alicia is an AI-powered storytelling companion designed to help writers craft engaging narratives. With features like AI-assisted writing, character development, and world-building tools, Alicia provides personalized support throughout the creative process.",
}

export { metadata }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-serif",
        robotoSlab.variable
      )}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors position="top-center" />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
