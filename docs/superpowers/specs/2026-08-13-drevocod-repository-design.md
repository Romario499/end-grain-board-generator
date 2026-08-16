# DREVOCOD repository design

## Status

Approved in chat on 2026-08-13. This document defines the first repository structure and the boundaries for brand content.

## Goal

Create a private GitHub repository named `DREVOCOD` for the brand platform, approved presentation copy, future website materials, visual assets, and working documentation.

The repository must preserve the confirmed brand language without turning positioning statements into unsupported operational claims.

## Repository ownership and visibility

- Owner: `Romario499`.
- Repository name: `DREVOCOD`.
- Visibility: private.
- Default branch: `main`.
- GitHub Project board: out of scope.

The repository was checked before implementation and did not exist at the time of the audit.

## Initial structure

```text
DREVOCOD/
|-- README.md
|-- brand/
|   |-- positioning.md
|   |-- presentation-text.md
|   |-- tone-of-voice.md
|   `-- brand-system.md
|-- website/
|   `-- README.md
|-- assets/
|   |-- README.md
|   |-- logo/
|   |   `-- .gitkeep
|   |-- images/
|   |   `-- .gitkeep
|   `-- fonts-reference/
|       `-- .gitkeep
|-- docs/
|   |-- README.md
|   `-- superpowers/specs/
|       `-- 2026-08-13-drevocod-repository-design.md
`-- .gitignore
```

Empty asset directories use `.gitkeep` so Git preserves the intended structure. Working directories use short README files to explain their scope.

## Document responsibilities

### `README.md`

Repository orientation: what DREVOCOD means, what is already confirmed, where each type of material belongs, and the current project status. It must not claim that products, services, production capabilities, or a live website already exist.

### `brand/positioning.md`

Concise positioning derived only from the approved presentation text: brand idea, DREVO + CODE meaning, value principles, audience language explicitly present in the source, and boundaries between concept and verified business facts.

### `brand/presentation-text.md`

The complete approved presentation text from the referenced conversation. Editorial changes are limited to Markdown cleanup; the meaning and claims remain unchanged.

### `brand/tone-of-voice.md`

Writing guidance inferred from the approved copy: calm, precise, tactile, contemporary, restrained, and respectful of the material. It includes preferred patterns and prohibited overclaims.

### `brand/brand-system.md`

Version 0.1 of the verbal brand system: name, approved slogans, semantic pillars, vocabulary, and content governance. Visual identity details such as colors, typography, logo rules, and layout specifications remain explicitly unconfirmed.

### `website/`, `assets/`, `docs/`

- `website/`: future website source and website-specific documentation.
- `assets/`: approved logos, images, and font references when supplied.
- `docs/`: research, decisions, specifications, and supporting documents.

## Source-of-truth rules

1. The approved presentation text is the primary source for verbal positioning.
2. Brand language is not proof of operational capability.
3. New factual claims require explicit confirmation or a source stored in the repository.
4. Unconfirmed items must be labelled as hypotheses, drafts, or pending decisions.
5. Files synchronized under the local `sources/` directory remain read-only and are not copied automatically.

## Unsupported claims excluded from the first version

The initial repository will not invent or assert:

- a concrete product catalogue;
- specific wood species or other materials;
- ownership of a workshop, factory, equipment, or production capacity;
- specific technologies, certifications, or environmental performance;
- team composition, founder history, or years of experience;
- geography, addresses, legal entity details, contacts, or sales channels;
- pricing, market segment, delivery, lead times, warranties, or service levels;
- completed projects, customers, partners, awards, or case studies;
- readiness to accept orders or a public launch date.

## Implementation flow

1. Create the local structure and populate the Markdown files.
2. Check required paths, links, headings, encoding, and placeholder language.
3. Initialize Git locally and review the staged scope.
4. Create the private GitHub repository only after a final action-time confirmation.
5. Publish the verified initial state to `main`.
6. Re-read repository metadata to verify its private visibility and default branch.

## Validation

- Every required file and directory exists.
- Markdown files are valid UTF-8 and contain no unresolved placeholder markers.
- The presentation text matches the recovered approved source.
- Searches find no unsupported concrete product, production, pricing, or customer claims.
- Git status contains only the intended new project files.
- After publication, GitHub reports `visibility: private` for `Romario499/DREVOCOD`.

## Risks and controls

- **Positioning may be mistaken for operational fact.** Controlled through explicit disclaimers and content boundaries.
- **Visual identity is not yet confirmed.** Visual-system sections remain pending rather than being invented.
- **Empty directories are not tracked by Git.** Controlled with `.gitkeep` or scope README files.
- **Repository creation may require an authenticated browser session.** If authentication blocks the action, work stops without attempting to access credentials.
