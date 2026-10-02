# MD Nakibul Hassan — Portfolio

A single-page portfolio built with **React + TypeScript + Vite**, a **Three.js** hero (via React Three Fiber), **Motion** animations and **Tailwind CSS**.

## Run it

```bash
npm install        # once
npm run dev        # local dev server → http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build → http://localhost:4173
```

Requires Node.js 20+.

## Updating your content (no web knowledge needed)

All text lives in `src/data/`. You should almost never need to touch `src/components/`.

| What you want to change | File |
| --- | --- |
| Name, title, intro, email, location, photo, social links, About text, headline numbers | `src/data/profile.ts` |
| Jobs (timeline) | `src/data/experience.ts` |
| Projects | `src/data/projects.ts` |
| Skill groups | `src/data/skills.ts` |
| Android section layers | `src/data/android.ts` |
| Education & certifications | `src/data/education.ts` |
| Mentoring & leadership | `src/data/achievements.ts` |
| Navigation labels, section headings, site URL | `src/data/site.ts` |
| Contact form (inbox address, optional Web3Forms key) | `src/data/contact.ts` |
| Hero 3D object (`workspace` / `core` / `phone`) | `heroCenterpiece` in `src/data/site.ts` |
| Colours for dark & light themes | top of `src/styles/index.css` (scene colours: `palettes` in `src/components/three/SceneContents.tsx`) |
| SEO tags (title, description, social preview) | `index.html` |

Tips
- **Add a project:** copy one object in `projects.ts`, change the text, set `featured: true` for a large card, and choose a `motif` for its artwork. Add `link: 'https://…'` to show a "Visit project" button. Then add its `id` to the matching job's `projectIds` in `experience.ts`.
- **Add GitHub:** uncomment the GitHub line in `socialLinks` in `profile.ts`.
- **Show your phone number:** set `showPhone: true` in `profile.ts` (it's hidden by default, to avoid spam).
- **Reorder or remove sections:** edit the list in `src/App.tsx`.
- **Replace the photo:** put a portrait with a transparent background at `public/portrait.webp` (about 760×1200 px works well).
- **Default theme:** the site opens in dark mode; visitors' choice from the sun/moon button is remembered. To change the default, edit the small script near the top of `index.html`.

## Open TODOs (from the CV review)

1. **Activate the contact form (one time)**: the form sends through FormSubmit (free, no key). After deploying, send yourself one test message from the live site; FormSubmit emails `nakibhasan2711@gmail.com` an **Activate Form** link. Click it, and every later message lands in your inbox. (Optional: paste a Web3Forms key into `src/data/contact.ts` to use Web3Forms instead.)
2. **Domain**: the site is live at https://portfolio-delta-plum-99.vercel.app. If you add a custom domain, update it in `index.html`, `public/robots.txt`, `public/sitemap.xml` and `src/data/site.ts`.
3. **GitHub**: not in the CV, so not shown (see tip above).

## Deploying

The `dist/` folder is a static site. Any static host works:
- **Netlify / Vercel / Cloudflare Pages**: connect the repo; build command `npm run build`, output directory `dist`.
- **GitHub Pages**: if served from `https://<user>.github.io/<repo>/`, set `base: '/<repo>/'` in `vite.config.ts`.

## How it's built (short version)

- `src/components/three/`: the 3D hero. It's **lazy-loaded** after the page text renders. It scales quality to the device (particle count, resolution, antialiasing), lowers resolution if frames are slow, **stops rendering when scrolled out of view**, and renders a still frame for visitors with *reduce motion* enabled. If WebGL is unavailable or fails, a static SVG illustration is shown instead.
- `src/components/common/`: reusable building blocks (section layout, reveal-on-scroll, magnetic buttons, tilt cards).
- Accessibility: semantic landmarks, skip link, keyboard-navigable tabs and dialog, visible focus rings, `prefers-reduced-motion` respected everywhere, hover-only effects disabled on touch devices.
- I left out the extra libraries (Drei, post-processing, smooth-scroll libraries). The scene doesn't need them, and they would add weight.
