/**
 * Profile-level settings. Content lists (experience, projects, writing, skills)
 * live in src/data/*.json and are validated by src/content.config.ts.
 */
export const site = {
  name: 'Ade Dyas',
  fullName: 'Adetya Dyas',
  headline: 'Mobile Engineer',
  platforms: 'iOS & Android',
  location: 'Jakarta, Indonesia',
  tagline:
    'I build native apps for iOS and Android, and the design systems, modules, and pipelines that keep them shipping.',
  about: [
    'I started on Android in 2020 and added iOS in 2022. I never switched sides; I still ship on both. At Staffinc I work across the iOS and Android apps for field workers, the design system they share, and the architecture underneath.',
    'I care about the parts that keep a team fast: clear module boundaries, tests you can trust, and CI that does the boring work. Since late 2025 I pair with AI coding agents every day, and I still own the code they help write.',
  ],
  education:
    'B.Comp. in Informatics Engineering, Institut Teknologi Dirgantara Adisutjipto (2015–2019)',
  stats: [
    { value: '6+', label: 'years shipping mobile' },
    { value: '2', label: 'platforms, in parallel' },
    { value: '1,300+', label: 'merged pull requests' },
  ],
  /**
   * The address is stored in pieces and only assembled in the browser on click,
   * so it never appears whole in the HTML. Plain-text scrapers can't read it.
   */
  emailParts: { user: ['ade', 'yds'], domain: ['gmail', 'com'] },
  links: {
    linkedin: 'https://www.linkedin.com/in/adeyds',
    github: 'https://github.com/adeds',
    medium: 'https://medium.com/@adeds',
  },
  /** Availability badge. 'none' keeps the page neutral. */
  availability: 'none' as 'none' | 'open' | 'open-remote',
} as const;
