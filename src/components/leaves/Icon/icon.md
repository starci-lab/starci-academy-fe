# feature to icon map

This file answers “which icon represents this feature?” Read it before adding or changing an
`IconName`. The table maps PRODUCT MEANINGS, not screens: when the same feature appears in
navigation, a card and an empty state, every placement reuses the same meaning and Heroicon.

Do not choose a glyph because it resembles the nearest existing one. A new feature either reuses
an existing product meaning deliberately or receives a unique row here and matching entries in
`IconName` and `GLYPHS`.

## Role table

| Placement role | Heroicons family | Rendered size | Use when |
|---|---|---:|---|
| `heading` | `@heroicons/react/24/outline` | `size-6` | The glyph introduces a heading or empty region |
| `leading` | `@heroicons/react/24/outline` | `size-5` | The glyph leads navigation, a row, field, switch or icon control |
| `chip` | `@heroicons/react/16/solid` | `size-4` | The glyph sits inside a compact chip or text action |

Role never changes the feature mapping. `course` remains `BookOpenIcon` in every placement; the
icon leaf selects the outline or micro drawing from the role.

## Feature mapping

| Meaning (`IconName`) | Product feature | Heroicon | Why this glyph owns the feature |
|---|---|---|---|
| `brand` | Academy/learning identity | `AcademicCapIcon` | A graduation cap names education without borrowing the course-reading mark |
| `streak` | Learning streak | `FireIcon` | Fire is the established continuous-streak metaphor |
| `credit` | AI credit/quota | `BoltIcon` | A bolt reads as consumable AI power, distinct from rewards |
| `reward` | Rewards and gift points | `GiftIcon` | A gift names the thing received rather than its numeric balance |
| `course` | Courses and lessons | `BookOpenIcon` | An open book names study content and course browsing |
| `email` | Email identity | `EnvelopeIcon` | The envelope is the direct address/message metaphor |
| `password` | Password field | `LockClosedIcon` | A closed lock names protected credentials |
| `code` | Verification/security code | `ShieldCheckIcon` | The checked shield distinguishes verification from programming |
| `signedIn` | Successful authentication | `CheckCircleIcon` | A checked circle is a completed state, not the sign-in action |
| `signIn` | Enter account/session | `ArrowRightOnRectangleIcon` | The arrow entering a boundary names session entry |
| `close` | Dismiss/close | `XMarkIcon` | The conventional close mark has one unambiguous action |
| `next` | Continue/go forward | `ArrowRightIcon` | A forward arrow names progression without implying login |
| `retry` | Retry/refresh failed work | `ArrowPathIcon` | The circular path names repeating the same operation |
| `send` | Send/submit message | `PaperAirplaneIcon` | The paper plane is reserved for outbound communication |
| `home` | Dashboard overview | `HomeIcon` | Home is the stable entry point to the learner dashboard |
| `explore` | Explore/discover catalogue | `GlobeAltIcon` | A globe names discovery beyond the current collection |
| `community` | Learner community | `UserGroupIcon` | A group names an existing community, distinct from finding talent |
| `league` | Leaderboard and competition | `TrophyIcon` | A trophy names ranking and competitive achievement |
| `review` | Review assigned work | `ClipboardDocumentCheckIcon` | A checked clipboard names a review queue and completed checks |
| `light` | Light theme | `SunIcon` | The sun is the light-theme state |
| `dark` | Dark theme | `MoonIcon` | The moon is the dark-theme state |
| `locale` | Language/locale switch | `LanguageIcon` | The language mark names translation rather than geography |
| `google` | Google provider | `GoogleMark` | The exact provider SVG preserves Google identity |
| `github` | GitHub provider | `GithubMark` | The exact provider SVG preserves GitHub identity |
| `search` | Global search | `MagnifyingGlassIcon` | The magnifier is reserved for finding content |
| `cart` | Shopping cart | `ShoppingCartIcon` | The cart names purchasing and basket state |
| `notification` | Notifications | `BellIcon` | The bell names incoming alerts |
| `account` | Current user account | `UserCircleIcon` | A person in a circle names the signed-in account surface |
| `saved` | Saved/bookmarked content | `BookmarkIcon` | The bookmark names content retained for later |
| `blog` | Blog/editorial content | `NewspaperIcon` | A newspaper names published articles without reusing Explore |
| `talents` | Talent discovery | `UserPlusIcon` | Adding/finding a person distinguishes talent search from Community |
| `jobs` | IT jobs | `BriefcaseIcon` | A briefcase names employment and vacancies |
| `practice` | Programming/code practice | `CodeBracketIcon` | Code brackets name programming without reusing verification code |

## Selection procedure

1. Find the product feature in the mapping table.
2. Reuse its `IconName`; never import the listed Heroicon at the call site.
3. Choose `heading`, `leading` or `chip` from placement, not personal size preference.
4. If no feature matches, add one unique meaning and Heroicon to this table first.
5. Update `IconName` and `GLYPHS` in the same change. The parity test rejects drift and duplicate
   Heroicons across different meanings.
