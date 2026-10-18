import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillnovaacademy.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/checkout/",
        "/api/",
        "/courses/*/learn/",
        "/courses/*/learn",
        "/uploads/",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
