# StruktHQ marketing website

The homepage and Elections page live in this project. The site uses plain HTML, CSS and browser JavaScript, with local image and font assets. Installed Untitled UI source components provide design references; the website runtime remains static HTML, CSS and JavaScript.

## Preview

Run `npm run dev`, then open http://localhost:4173. The homepage is `/`; the Elections page is `/elections/`. Legal drafts are at `/privacy/`, `/terms/` and `/cookies/`.

Run `npm run build` to verify page assets, element IDs, and navigation anchors, then create `dist/`. Run `npm run preview` to serve the built site. Hosting can use the entire `dist/` directory.

## Design and content

Cal.com guides section organization, grids, and divider lines. TalentLMS guides visual composition and typography character. Colors come from the provided StruktHQ cube logo. The user supplied all dashboard captures and the marketing content.

The six homepage module tabs support pointer and keyboard navigation. Dashboard images open in a full-screen dialog. Both pages include responsive navigation and inquiry forms with native browser validation.

## Inquiries

The receiving email is `admin@strukthq.com`, configured in `site-config.js`. Visitors review an inquiry, then open an email draft or copy it. The website does not send messages, create accounts, or persist form data on a server. Elections actions select the Elections plan; voter tier actions include the chosen plan in the message. The election report action requests the sanitized COMPSSA report because no public report URL was supplied.

## Typography

The user approved temporary open-source preview fonts: Fraunces for headings and Manrope for body text. Their licenses are in `assets/fonts/`. Recoleta and Axiforma are the requested final fonts; licensed webfont files have not been supplied or purchased. To switch, add the licensed files and matching `@font-face` declarations in `styles.css`; the `--heading` and `--body` stacks already prefer the requested family names.

## Before public launch

Review and approve the Privacy Policy and Terms of Service drafts before public launch. They cover this marketing website and its inquiry process; platform data-processing and paid-service arrangements require the applicable organization agreements. Confirm the legal operator, hosting/email providers, retention practices and service terms before adopting final policies. Confirm the deployment metrics and organization names are approved for public use. Add the actual public COMPSSA report link if available. The provided Elections proof is attributed to internal deployment reporting; no independent verification is claimed.

Reference captures, original image copies, content extraction, and review notes are retained under `work/`. That directory is excluded from the preview server and the build output.

## Photography and color refresh

Audience cards use local, optimized Pexels photography with blue, teal, amber and slate surfaces. Credits and source URLs are in `PHOTO-CREDITS.md`; these photos illustrate audience categories and are not customer evidence. The homepage platform section, benefits, pricing, and both pages’ calls to action use the approved stronger palette. Benefit visuals are crops of the supplied product screenshots. The Elections page uses the same photography language with distinct voting-mode, communication and pricing colors.

## Cookie controls

A notice and settings dialog are available on all five pages. No analytics or advertising services are installed. Choosing essential-only stores one first-party cookie, `strukthq_cookie_choice=essential-only-v1`, for 180 days with Path=/ and SameSite=Lax; HTTPS deployments also set Secure. The cookie contains no inquiry data or tracking identifier. The notice can be dismissed without storage, reopened from the footer, or reset by clearing the saved choice. Future optional tracking requires an updated policy and active controls before use.
