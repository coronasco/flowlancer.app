# STYLEGUIDE

- Tokens in `/styles/theme.css`: use CSS vars (`--bg`, `--fg`, `--brand-*`, radii, shadows)
- Components use `cn()` from `/lib/utils.ts`
- Mobile-first; visible focus; aria on icon-only controls
- No raw hex in components; prefer tokens
- Variants: Button (solid|soft|ghost), Card, Badge
- Utilities: `.brand-gradient`, `.brand-ring`
