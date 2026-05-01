import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) => Rule.min(2000).max(2100).integer(),
    }),
    defineField({
      name: "service",
      title: "Primary service",
      type: "reference",
      to: [{ type: "service" }],
      description: "El servicio principal bajo el que cae este proyecto.",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description:
        "YouTube o Vimeo. La detección de plataforma es automática (helper en lib/utils/parseVideoUrl.ts).",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"] }).custom((url) => {
          if (!url) return true;
          const isValid = /youtube\.com|youtu\.be|vimeo\.com/.test(url);
          return isValid || "Solo se admiten URLs de YouTube o Vimeo.";
        }),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Se muestra en la grilla antes de cargar el video.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Portable Text. Renderizar con @portabletext/react.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "client", media: "thumbnail" },
  },
});
