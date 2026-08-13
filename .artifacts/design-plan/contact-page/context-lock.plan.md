# Context Lock — contact-page — plan

| Field | Value |
|---|---|
| Phase | `plan` |
| Skill | `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` |
| Design target | `starci-academy-fe` · `main` · `8410a74` |
| Parity baseline | `starci-academy` · `9a1934231` · `src/components/pages/ContactPage` |
| Business truth | `starci-academy-backend` · `submitContact`, `myFounderConversation`, `sendChatMessage`, `chatMessages` |
| Artifact root | `starci-academy-fe/.artifacts/design-plan/contact-page` |
| Write boundary | the artifact root only |
| Read-only | target `src`, both reference repositories, the trust tree |
| Mode | `migration` — a legacy render exists, so a `parity-first` direction is mandatory |
| Runtime | direction lab, first free port from 8080 → **8097** |
| Detected | 2026-08-13 |

## Scope, as the owner set it

Channels · founder card · public `submitContact` form · a founder DM entry for a signed-in viewer.

The FAQ of the legacy page is out. GitHub is out — the request names Facebook, Zalo, LinkedIn and
email. An AI chatbot that forwards messages was weighed and set aside: the backend already models a
private founder conversation, so a bot standing between reader and founder would add a layer to a
path that is already open, and `/contact` is where a wrong answer about refunds costs the most.

## Inheritance

None. This lock is detected, not inherited.
