import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/50 py-5 text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center sm:gap-4">
        <Link
          href="https://kybervision.eu/"
          className="transition-colors hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kyber Vision &mdash; Volleyball Analytics Platform
        </Link>
        <span className="hidden sm:inline text-border">|</span>
        <Link
          href="/privacy-policy"
          className="transition-colors hover:text-foreground"
        >
          Privacy Policy
        </Link>
        <span className="hidden sm:inline text-border">|</span>
        <Link
          href="/delete-account"
          className="transition-colors hover:text-foreground"
        >
          Delete Account
        </Link>
      </div>
    </footer>
  )
}
