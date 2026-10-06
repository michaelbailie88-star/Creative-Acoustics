# Creative Acoustics Ltd.

Website for **Creative Acoustics Ltd.**, a luthier shop run by James Omand in Falmouth, Nova Scotia, serving the Annapolis Valley.

Static HTML/CSS/JS with no build step and no dependencies. It works on GitHub Pages, Netlify, Vercel or any static host.

## Structure

```
creative-acoustics/
├── index.html                  Home page (hero, Why I Build Guitars, Services, Gallery, Testimonials, Contact)
├── css/styles.css              All styles
├── js/main.js                  Mobile nav, gallery filter, lightbox
└── assets/img/
    ├── brand/                  Logo (transparent PNG + original JPG), favicon, touch icon
    ├── gallery/                Full-size build photos (max 1600px)
    └── thumbs/                 Gallery thumbnails (max 640px)
```

## Home page sections

| Section | Anchor |
|---|---|
| Hero | `#top` |
| Why I Build Guitars | `#why` |
| Services: Guitar Building, Accessories, Wood Selections | `#services` |
| Gallery (filter: Guitars & Basses / Accessories / Details, with lightbox) | `#gallery` |
| Testimonials | `#testimonials` |
| Contact + Service Area | `#contact` |

## Before launch

- [ ] **Services copy:** confirm the offering lists match what James actually offers.
- [ ] **Social sharing:** once the live domain is known, change `og:image` to an absolute URL (for example `https://yourdomain/assets/img/gallery/guitar-burl-angle.jpg`).

## Deploy on GitHub Pages

1. Push this folder to the root of a GitHub repository.
2. In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
3. The site will be live at `https://<username>.github.io/<repo>/`.

Domain registration and hosting are the client's responsibility.

## Adding gallery photos

1. Add a full-size image (max 1600px on the long edge) to `assets/img/gallery/` and a thumbnail (max 640px) with the **same filename** to `assets/img/thumbs/`.
2. Copy an existing `<li class="gallery-item">` block in `index.html`, then update the filename, `alt` text, `width`/`height` and `data-category` (`builds`, `accessories` or `details`).

---

© Creative Acoustics Ltd.
