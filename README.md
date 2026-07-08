# Scaffold — info site

A small, static marketing/info site for **Scaffold**, a digital space dedicated to
critical thinking. Plain HTML/CSS/JS — no build step, no framework, no server.

## Pages

| File | Tab | Purpose |
| --- | --- | --- |
| `index.html` | Philosophy | Landing page — what Scaffold is and the Socratic method behind it |
| `about-us.html` | About Us | The makers (Brendan & Hillary) and why they built it |
| `community.html` | Community | Beta community + feedback form |
| `resources.html` | Resources | Launch links, tips, and reading on critical thinking |

## Structure

```
scaffold-info-site/
  index.html
  about-us.html
  community.html
  resources.html
  css/styles.css      shared styles (palette mirrored from the Scaffold app)
  js/main.js          mobile nav toggle + footer year
  assets/scaffold.svg the ladder logo
```

## Run locally

It's static, so just open `index.html` in a browser — or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Before you ship

- Replace the `href="#"` **"Launch Scaffold"** links (marked with `TODO` comments in
  the HTML) with the deployed app URL.
- The feedback-form links point at the live Google Form.

## Deploy

Drop the folder on any static host — GitHub Pages, Netlify, or Vercel all work with
zero configuration.
