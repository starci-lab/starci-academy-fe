# Plan record — `case-contact-page`

Status `direction-selected` · mode `migration` · delivery `single` ·
render status `directional-not-apply-baseline`.

Machine-readable twin: [`plan-record.json`](plan-record.json) — verified `ok: true`.

## Selected

**`direction-one-door`** — *one door per reader*. Posture `balanced`. Selected explicitly by the
owner: *"B đi"*.

The page answers "who are you" before anything else. Four channels sit in a compact strip; below
them is **one** conversation surface — a guest sees the message form, a signed-in learner sees their
founder DM thread with its history. The session decides which door exists, so the two never compete
for the same screen.

The alternatives were `direction-parity-first` (the legacy two-column grid, mandatory in migration
work) and `direction-channels-lead` (channels as the whole page, form collapsed into a disclosure).
Both are recorded in full in the JSON; both remain reachable if Preview finds B too expensive.

## Why this direction is not a new invention

Every capability it needs already exists on the server, which is the fact that changed the shape of
this page:

| Reader | Operation | Status |
|---|---|---|
| Guest | `mutation submitContact` — `name`, `email`, `category`, `message` | exists |
| Signed-in | `query myFounderConversation` — *"The viewer's private founder DM conversation handle"* | exists |
| Signed-in | `query chatMessages`, `mutation sendChatMessage` | exists |

`backendEnablerProposals` is therefore empty. Nothing about this page asks the backend for new
behavior.

## What blocks every direction, including this one

`label-field-hint` accepts `leaf: ["input","field"]`, and `InputKind` is
`email | password | newPassword | code | text`. The target has **no multi-line box and no select** —
while the legacy form uses HeroUI `TextArea` and `Select` for exactly those two controls. Until
`Textarea` and `Select` exist as leaves and the contract admits them, no form on this page can be
expressed at all. This is recorded as a vocabulary proposal, not worked around.

The target also has **no chat vocabulary whatsoever** — no message, thread, bubble, conversation or
comment owner anywhere in leaves, composites or blocks. `MessageBubble`, `MessageComposer` and
`conversation-thread` are genuinely new owners rather than duplicates of something already shipped.

## The one product fact this run derived rather than read

**Zalo appears nowhere in either repository.** The owner supplied the phone number `0828678897` and
this run derived `https://zalo.me/0828678897` from it. Every other contact fact on the page is read
verbatim from `starci-academy/src/resources/contact.ts`. If StarCi has a Zalo Official Account with
its own handle, this link is wrong, and Preview is where that gets settled.

## Route

`/contact` is currently a **dead link**: `ShellNav` already carries
`{ id: "contact", path: "/contact" }` while no route segment exists. The work item creates
`src/app/[lang]/contact` alongside the page owner, so the nav entry stops pointing at a 404.

## State manifest

Thirteen states, in two branches plus one floor. Preview owns rendering each of them.

**Guest** — `resting`, `ready`, `invalid`, `submitting`, `submitted`, `failed`.
**Signed-in** — `resting`, `empty`, `ready`, `sending`, `send-failed`, `thread-failed`.
**Both** — `channels-only`: the channel strip depends on no request, so even with every query
failed the reader can still reach the founder. That is why it sits above the conversation and not
beside it.

## Open questions carried into Preview

1. **Zalo destination** — derived link, or a real Official Account handle.
2. **Thread freshness** — how a reply becomes visible. Assumed: SWR revalidate-on-focus plus an
   explicit refresh after send; no polling, no socket. The target has no messaging hook to inherit
   a convention from.
3. **Category in a DM** — `submitContact` requires `category`, `sendChatMessage` has no such field.
   Assumed: the category belongs to the form only, because a DM is a conversation rather than a
   ticket and a control whose value the mutation discards is a false control.

## Direction lab

`direction-lab/` · served at `http://127.0.0.1:8097/` (8080 was occupied).

Every canvas carries `DIRECTIONAL — NOT AN APPLY BASELINE`. This HTML is a choice instrument. It is
not a parity baseline, not approved fidelity, and Preview must **rebuild** the selected direction as
an executable candidate rather than bless this mockup by copying it.

## Route onward

`$starci-fe-design-preview` with `caseId: case-contact-page`,
`selectedDirectionId: direction-one-door`.
