# Haulo Junk Removal — Website

A ground-up redesign of haulojunk.com. Same-day junk removal for homes and
businesses throughout the Phoenix Valley.

**We Haul It. You Relax.** · Call or text **480-299-4648** · hello@haulojunk.com

## Stack

Vanilla HTML, CSS, and JavaScript — no build step, no dependencies, no external
APIs. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Full single-page site, semantic markup, meta tags, JSON-LD `HomeAndConstructionBusiness` schema |
| `styles.css` | Design system (custom properties), layout, components, responsive rules |
| `script.js` | Mobile nav, sticky header, scroll reveal, scroll spy, quote form → pre-filled SMS, estimate modal |
| `favicon.svg` | Site icon |

## Sections

Hero + quote form · Services · How It Works · Why Choose Haulo · What Helps Us
Estimate · Reviews · Service Area · CTA · Contact · Footer

## Notes

- The quote form has no backend. On submit it validates the fields and opens a
  pre-filled SMS to 480-299-4648 with the name, ZIP, and item list.
- The estimate modal appears once per session (deep scroll or exit intent) and
  is dismissible with the close button, backdrop, "No thanks", or `Esc`.
- Accessibility: skip link, focus-visible styles, focus trap in the dialog,
  labelled controls, descriptive alt text, and `prefers-reduced-motion` support.
