import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillnovaacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "SkillNova Academy | Web-Based Learning Management Platform",
    template: "%s | SkillNova Academy",
  },
  description:
    "A full-stack, state-of-the-art Web-based Learning Management Platform engineered for modern computer science education. Lead Instructor: Murtaza Wazir. BS CS Final Year Project.",
  keywords: [
    "SkillNova Academy",
    "SkillNova",
    "Learning Management System",
    "LMS",
    "Computer Science Courses",
    "Web Development",
    "Full-Stack Next.js",
    "Murtaza Wazir",
    "Pakistan",
  ],
  authors: [
    {
      name: "Murtaza Wazir",
      url: `${appUrl}/about`,
    },
  ],
  creator: "Murtaza Wazir",
  publisher: "SkillNova Academy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "SkillNova Academy",
    title: "SkillNova Academy | Web-Based Learning Management Platform",
    description:
      "A full-stack, state-of-the-art Web-based Learning Management Platform engineered for modern computer science education.",
    images: [
      {
        url: "/murtaza-wazir.jpg",
        width: 800,
        height: 800,
        alt: "SkillNova Academy - Murtaza Wazir",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillNova Academy | Web-Based Learning Management Platform",
    description:
      "A full-stack, state-of-the-art Web-based Learning Management Platform engineered for modern computer science education.",
    images: ["/murtaza-wazir.jpg"],
  },
  alternates: {
    canonical: appUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 1. Filter out console errors triggered by Bitdefender / third-party browser extensions
                  const origError = console.error;
                  console.error = function(...args) {
                    const msg = args
                      .map(function(a) {
                        try {
                          return typeof a === 'object' ? JSON.stringify(a) : String(a);
                        } catch (e) {
                          return String(a);
                        }
                      })
                      .join(' ');

                    if (
                      msg.includes('bis_skin_checked') ||
                      msg.includes('bis_register') ||
                      msg.includes('__processed_')
                    ) {
                      return;
                    }
                    return origError.apply(console, args);
                  };

                  // 2. MutationObserver to strip extension attributes from the DOM before React hydrates
                  const cleanNode = function(node) {
                    if (node && node.nodeType === 1) {
                      if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                      if (node.hasAttribute('bis_register')) node.removeAttribute('bis_register');
                    }
                  };

                  const observer = new MutationObserver(function(mutations) {
                    for (let i = 0; i < mutations.length; i++) {
                      const m = mutations[i];
                      if (m.type === 'attributes') {
                        if (
                          m.attributeName === 'bis_skin_checked' ||
                          m.attributeName === 'bis_register' ||
                          (m.attributeName && m.attributeName.indexOf('__processed_') === 0)
                        ) {
                          m.target.removeAttribute(m.attributeName);
                        }
                      } else if (m.type === 'childList') {
                        for (let j = 0; j < m.addedNodes.length; j++) {
                          const n = m.addedNodes[j];
                          cleanNode(n);
                          if (n.querySelectorAll) {
                            const sub = n.querySelectorAll('[bis_skin_checked], [bis_register]');
                            for (let k = 0; k < sub.length; k++) {
                              cleanNode(sub[k]);
                            }
                          }
                        }
                      }
                    }
                  });

                  if (document.documentElement) {
                    observer.observe(document.documentElement, {
                      attributes: true,
                      subtree: true,
                      childList: true,
                      attributeFilter: ['bis_skin_checked', 'bis_register']
                    });
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body 
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A]"
      >
        {children}
      </body>
    </html>
  );
}
