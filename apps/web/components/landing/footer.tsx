import { Hexagon, Github, Twitter } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface FooterProps {
  logo: React.ReactNode
  brandName: string
  socialLinks: Array<{
    icon: React.ReactNode
    href: string
    label: string
  }>
  mainLinks: Array<{
    href: string
    label: string
  }>
  legalLinks: Array<{
    href: string
    label: string
  }>
  copyright: {
    text: string
    license?: string
  }
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="border-t bg-background/50 pt-16 pb-6 backdrop-blur-sm lg:pt-24 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="md:flex md:items-start md:justify-between">
          <a
            href="/"
            className="flex items-center gap-x-2 transition-opacity hover:opacity-80"
            aria-label={brandName}
          >
            <div className="rounded-lg bg-primary/5 p-2 text-foreground">
              {logo}
            </div>
            <span className="text-xl font-bold tracking-tight">
              {brandName}
            </span>
          </a>
          <ul className="mt-6 flex list-none space-x-3 md:mt-0">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-border hover:bg-secondary/50"
                  asChild
                >
                  <a href={link.href} target="_blank" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:col-[4/11] lg:mt-0">
            <ul className="-mx-2 -my-1 flex list-none flex-wrap lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="mx-2 my-1 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 border-t pt-4 lg:col-[4/11] lg:mt-0 lg:border-none lg:pt-0">
            <ul className="-mx-3 -my-1 flex list-none flex-wrap lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="mx-3 my-1 shrink-0">
                  <a
                    href={link.href}
                    className="text-xs text-muted-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 text-[11px] font-medium tracking-[0.2em] whitespace-nowrap text-muted-foreground/40 uppercase lg:col-[1/4] lg:row-[1/3] lg:mt-0">
            <div className="flex flex-col gap-1">
              <span>{copyright.text}</span>
              {copyright.license && (
                <span className="text-[10px] lowercase">
                  {copyright.license}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function StoryFooter() {
  return (
    <Footer
      logo={<Hexagon className="h-6 w-6 stroke-[1.5]" />}
      brandName="Alicia"
      socialLinks={[
        {
          icon: <Twitter className="h-4 w-4" />,
          href: "https://x.com/the_sylus",
          label: "Twitter",
        },
        {
          icon: <Github className="h-4 w-4" />,
          href: "https://github.com/divin3circle",
          label: "GitHub",
        },
      ]}
      mainLinks={[
        { href: "#home", label: "Hero" },
        { href: "#pricing", label: "Pricing" },
        { href: "#comparison", label: "How it Works" },
        { href: "/onboarding", label: "Start Writing" },
      ]}
      legalLinks={[
        { href: "https://github.com/divin3circle", label: "Privacy Policy" },
        { href: "https://github.com/divin3circle", label: "Terms of Service" },
      ]}
      copyright={{
        text: `© ${new Date().getFullYear()} Alicia AI`,
        license: "For the next generation of authors.",
      }}
    />
  )
}
