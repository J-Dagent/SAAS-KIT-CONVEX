export const seo = ({
  title,
  description,
  keywords,
  image,
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
}) => {
  const canonical = "https://www.acadelead.co/";
  const resolvedImage = image || `${canonical}brand/Banniere_Acadelead_LinkedIn.webp`;
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: resolvedImage },
    { property: "og:site_name", content: "Acadelead" },
    { name: "twitter:image", content: resolvedImage },
    { name: "twitter:card", content: "summary_large_image" },
  ];

  return tags;
};
