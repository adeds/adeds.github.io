import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM');
const platform = z.enum(['ios', 'android', 'cross', 'tooling', 'web']);

const experience = defineCollection({
  loader: file('src/data/experience.json'),
  schema: z.object({
    order: z.number(),
    company: z.string(),
    companyBlurb: z.string().optional(),
    role: z.string(),
    start: yearMonth,
    end: yearMonth.nullable(),
    location: z.string().optional(),
    tracks: z
      .array(z.object({ platform, label: z.string(), since: yearMonth }))
      .optional(),
    summary: z.string(),
    highlights: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: file('src/data/projects.json'),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    platform,
    year: z.number(),
    stars: z.number().optional(),
    description: z.string(),
    stack: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), href: z.url() })),
  }),
});

const writing = defineCollection({
  loader: file('src/data/writing.json'),
  schema: z.object({
    title: z.string(),
    date: z.iso.date(),
    publication: z.string(),
    summary: z.string(),
    href: z.url(),
  }),
});

const skills = defineCollection({
  loader: file('src/data/skills.json'),
  schema: z.object({
    order: z.number(),
    label: z.string(),
    items: z.array(z.string()).min(1).max(8),
  }),
});

export const collections = { experience, projects, writing, skills };
