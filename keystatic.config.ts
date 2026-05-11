// Keystatic CMS config. Schema-as-code for the /admin surface.
//
// Storage: cloud (via Keystatic Cloud). Static export rules out a server-side
// API route, which local mode would need, so dev and production both speak to
// GitHub through Keystatic Cloud's OAuth proxy. Free auth tier; no monthly
// bill. Owner must create a project at https://keystatic.cloud once and set
// NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT to the project slug.

import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: { kind: "cloud" },
  cloud: {
    project: process.env.NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT ?? "",
  },
  ui: {
    brand: { name: "Stoned Goose Admin" },
  },
  collections: {
    news: collection({
      label: "News posts",
      slugField: "slug",
      path: "content/news/*",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        slug: fields.slug({
          name: { label: "Slug", description: "URL-friendly id. Lowercase, hyphens." },
        }),
        title: fields.text({
          label: "Title",
          validation: { length: { min: 1, max: 120 } },
        }),
        date: fields.date({
          label: "Publish date",
          description: "ISO date, used for ordering against social posts.",
        }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: { length: { min: 1, max: 280 } },
          description: "One or two sentences. No em dashes.",
        }),
        image: fields.image({
          label: "Hero image",
          directory: "public/images/news",
          publicPath: "/images/news/",
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        body: fields.markdoc({
          label: "Body",
          description: "Long-form copy. House voice. No em dashes.",
          options: {
            image: {
              directory: "public/images/news",
              publicPath: "/images/news/",
            },
          },
        }),
      },
    }),
  },
});
