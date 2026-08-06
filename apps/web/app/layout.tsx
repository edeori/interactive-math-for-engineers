import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mérnöki Matematika",
  description:
    "Interaktív, gyakorlatorientált mérnöki matematika audió és DSP példákkal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>
        <header className="site-header">
          <Link
            href="/"
            className="brand"
            aria-label="Mérnöki Matematika kezdőlap"
          >
            <span className="brand-mark">∿</span>
            <span>
              <strong>Mérnöki Matematika</strong>
              <small>Interaktív tanulómotor</small>
            </span>
          </Link>
          <nav aria-label="Fő navigáció">
            <Link href="/#tanterv">Tanterv</Link>
            <Link href="/lessons/exponential-decay">Interaktív lecke</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <span>Matematika, amit látsz, hallasz és használsz.</span>
          <span>MVP · helyi tanulói profil</span>
        </footer>
      </body>
    </html>
  );
}
