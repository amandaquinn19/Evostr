export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Growth', value: 'growth' },
          { title: 'Expertise', value: 'expertise' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Evolution', value: 'evolution' },
          { title: 'Technology', value: 'technology' },
          { title: 'Valuation', value: 'valuation' },
        ],
        layout: 'tags',
      },
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary shown in article listings and previews.',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'blank', type: 'boolean', title: 'Open in new tab' },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
    },
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Overrides the title in search results. Keep under 60 characters.',
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Shown in search results. Keep under 155 characters.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'coverImage',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `By ${author}` : '',
        media,
      }
    },
  },
}
