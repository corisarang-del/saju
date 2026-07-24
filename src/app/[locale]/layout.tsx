import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import type { Metadata } from "next";
import "../globals.css";
import {
  SUPPORT_CONTACT,
  buildPricingFaqAnswer,
  buildProductJsonLd,
} from "@/lib/monthly-saju/pricing";
import { arePaymentsEnabled } from "@/lib/payments/feature-flag";

import { ClientWidgets } from "@/components/shared/ClientWidgets";

function getPublicAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://monthlysaju.vercel.app").replace(/\/+$/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  await params;
  const baseUrl = getPublicAppUrl();

  return {
    title: {
      template: "%s | 월간사주",
      default: "월간사주 - 먼저 챙겨주는 사주친구",
    },
    description:
      "사주팔자와 대화 기억을 바탕으로 오늘의 선택과 월간 흐름을 먼저 챙겨주는 AI 사주 라이프 코치.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    authors: [{ name: "월간사주" }],
    creator: "월간사주",
    publisher: "월간사주",
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
    keywords: [
      "사주분석",
      "AI 사주",
      "만세력",
      "사주팔자",
      "운세",
      "2026년 운세",
      "월간사주",
      "사주 상담",
      "자미두수",
      "서양점성술",
      "오행 분석",
      "데이터 기반 AI 사주",
      "AI 운세 분석",
    ],
    openGraph: {
      type: "website",
      siteName: "월간사주",
      title: "월간사주 - 먼저 챙겨주는 사주친구",
      description:
        "사주팔자와 대화 기억을 바탕으로 오늘의 선택과 월간 흐름을 먼저 챙겨주는 AI 사주 라이프 코치.",
      url: baseUrl,
      locale: "ko_KR",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "월간사주 - 먼저 챙겨주는 사주친구",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "월간사주 - 먼저 챙겨주는 사주친구",
      description:
        "사주팔자와 대화 기억을 바탕으로 오늘의 선택과 월간 흐름을 먼저 챙겨주는 AI 사주 라이프 코치.",
      images: [`${baseUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const paymentsEnabled = arePaymentsEnabled();
  const baseUrl = getPublicAppUrl();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* JSON-LD: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "월간사주",
              url: baseUrl,
              description:
                "사주팔자와 대화 기억을 바탕으로 오늘의 선택과 월간 흐름을 먼저 챙겨주는 AI 사주 라이프 코치.",
              inLanguage: "ko",
            }),
          }}
        />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "월간사주",
              url: baseUrl,
              contactPoint: {
                "@type": "ContactPoint",
                email: SUPPORT_CONTACT.email,
                contactType: "customer support",
              },
            }),
          }}
        />
        {/* JSON-LD: Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductJsonLd()),
          }}
        />
        {/* JSON-LD: FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "월간사주는 어떤 서비스인가요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "월간사주는 사주팔자와 대화 기억을 바탕으로 오늘의 선택과 월간 흐름을 먼저 챙겨주는 AI 사주 라이프 코치입니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: "무료로 이용할 수 있나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: paymentsEnabled
                      ? "네, 처음 가입하면 3회 무료 상담을 체험할 수 있습니다. 결제 기능이 켜진 뒤에는 상담권으로 상담을 이어갈 수 있습니다."
                      : "네, 처음 가입하면 3회 무료 상담을 체험할 수 있습니다. 유료 충전과 멤버십은 정식 결제 기능 안정화 후 열릴 예정입니다.",
                  },
                },
                {
                  "@type": "Question",
                  name: paymentsEnabled
                    ? "상담권 가격은 얼마인가요?"
                    : "유료 충전과 멤버십은 언제 열리나요?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: paymentsEnabled
                      ? buildPricingFaqAnswer()
                      : "유료 충전과 멤버십은 정식 결제 기능 안정화 후 열릴 예정입니다.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="monthlysaju"
            forcedTheme="monthlysaju"
            disableTransitionOnChange
            value={{ monthlysaju: "monthlysaju" }}
          >
            <ClientWidgets />
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
