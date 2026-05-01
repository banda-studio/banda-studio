import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  // Singleton: en sanity.config.ts el structure tool fuerza documentId
  // = 'siteSettings' para que solo exista un documento de este tipo.
  fields: [
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "social",
      title: "Social links",
      type: "object",
      fields: [
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "linkedin", type: "url", title: "LinkedIn" },
        { name: "vimeo", type: "url", title: "Vimeo" },
        { name: "behance", type: "url", title: "Behance" },
      ],
    }),
    defineField({
      name: "heroBadge",
      title: "Hero badge text",
      type: "string",
      initialValue: "High-End",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      initialValue: "Digital Creative Studio",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero subtitle",
      type: "string",
      initialValue: "We bring technical precision to your creative vision",
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA label",
      type: "string",
      initialValue: "Let's work together!",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
