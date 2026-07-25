# App Store metadata — Nourished by Mira (rebrand draft)

Paste-ready copy for App Store Connect. Submit with the version that changes the
display name. Character counts are against Apple limits.

## App name (30 max)
**Nourished by Mira: GLP-1** (24)

Alt if rejected for the drug-class term: `Nourished by Mira` (17).

## Subtitle (30 max)
**Protein & Lean Mass Coach** (25)

Carries the wedge (lean-mass protection) instead of "macros," where MyFitnessPal
and the GLP-1 tracker crowd already win.

## Keywords (100 max, no spaces after commas)
`glp1,semaglutide,tirzepatide,protein,muscle,lean mass,nutrition,meal plan,weight loss,appetite` (95)

No competitor brand names. Drug generic names only — brand names (Wegovy, Ozempic,
Mounjaro, Zepbound) stay out of keywords; where they appear in the description use
the registered mark: Wegovy(R) etc., or genericize to semaglutide/tirzepatide.

## Subscription display names (must match site + terms)
- Mira Pro (Monthly) — $9.99/mo
- Mira Pro (Yearly) — $49.99/yr
The site rebrand branch says "Mira Pro". If you keep a different display name in
App Store Connect, update terms.html Section 4 and pricing.html to match before
cutover. The receipt string is whatever ASC says.

## Release notes (never describe a repair; describe the capability)
> Your day counter is now fully adjustable — set it to match your journey and it
> stays consistent everywhere. Plus: scan your prescription label with the camera
> to set up your medication schedule in seconds.

## Description — first paragraph swap
Keep the current description (it is strong), with:
- "MemoryAisle" -> "Nourished by Mira"
- "MemoryAisle Pro" -> "Mira Pro"
- "Scan your bottle label" -> "Scan your pen or prescription label"

## Cutover checklist (site side is ready on this branch)
1. USPTO knockout: MIRA + NOURISH, classes 9/42/44, before submitting.
2. Submit app version with new display name + this metadata.
3. On approval: add nourishedbymira.com zone to Cloudflare, flip Route 53 registrar
   nameservers, attach domain to the worker, merge this branch, deploy.
4. 301 memoryaisle.app -> nourishedbymira.com (keep for 12+ months; deep links and
   emails still reference it).
5. Email routing for @nourishedbymira.com BEFORE changing any email address in copy
   (all @memoryaisle.app addresses intentionally unchanged on this branch).
6. App binary follow-ups (iOS repo): display name, memoryaisle:// scheme addition
   (keep old scheme registered), Universal Links entitlement + AASA for the new
   domain, in-app copy.
7. New icon: the gold cart logo is the old grocery brand AND fails at 60px per the
   audit. images/logo.png still ships on this branch as a placeholder — replace
   before cutover.
