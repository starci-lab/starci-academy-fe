# feature to icon map

This file answers “which icon represents this feature?” Read it before adding or changing an
`IconName`. The table maps PRODUCT MEANINGS, not screens: when the same feature appears in
navigation, a card and an empty state, every placement reuses the same meaning and StarCi cut.

The governing rule lives in `.claude/fe/gates/patterns/icon/INDEX.md`. A feature-to-glyph decision
changes canon and this source map together: canon carries the cross-repository law, while this copy
stays beside the code so an author or AI cannot miss it while choosing an icon.

Do not choose a glyph because it resembles the nearest existing one. A new feature either reuses
an existing product meaning deliberately or receives a unique row here and matching entries in
`IconName` and `GLYPHS`.

## Role table

| Placement role | Heroicons family | Rendered size | Use when |
|---|---|---:|---|
| `heading` | `@heroicons/react/24/outline` or a missing cut from `@starci/heroicons/24/outline` | `size-6` | The glyph introduces a heading or empty region |
| `leading` | `@heroicons/react/24/outline` or a missing cut from `@starci/heroicons/24/outline` | `size-5` | The glyph leads navigation, a row, field, switch or icon control |
| `chip` | `@heroicons/react/16/solid` or a missing cut from `@starci/heroicons/16/solid` | `size-4` | The glyph sits inside a compact chip or text action |

Use upstream Heroicons directly when the drawing exists. `@starci/heroicons` contains reviewed
custom cuts only and never re-exports upstream. Product callers still go through the `Icon` leaf;
they never choose either package or draw a substitute at the call site.

Role never changes the feature mapping. `course` remains `BookOpenIcon` in every placement; the
icon leaf selects the outline or micro drawing from the role.

## Feature mapping

| Meaning (`IconName`) | Product feature | Heroicon | Why this glyph owns the feature |
|---|---|---|---|
| `brand` | Academy/learning identity | `AcademicCapIcon` | A graduation cap names education without borrowing the course-reading mark |
| `aiChatbot` | Global StarCi AI assistant and Code coach | Purpose-drawn `StarCiChatbotMark` | A speech silhouette containing code chevrons makes the assistant distinct from the generic talent sparkle and readable without a text label |
| `streak` | Learning streak | `FireIcon` | Fire is the established continuous-streak metaphor |
| `credit` | AI credit/quota | `BoltIcon` | A bolt reads as consumable AI power, distinct from rewards |
| `reward` | Rewards and gift points | `GiftIcon` | A gift names the thing received rather than its numeric balance |
| `course` | Courses and content | `BookOpenIcon` | An open book names study content and course browsing |
| `email` | Email identity | `EnvelopeIcon` | The envelope is the direct address/message metaphor |
| `password` | Password field | `LockClosedIcon` | A closed lock names protected credentials |
| `revealPassword` | Reveal a masked password | `EyeIcon` | An open eye names making the currently hidden secret visible |
| `hidePassword` | Hide a visible password | `EyeSlashIcon` | A crossed eye names returning a visible secret to its masked state |
| `code` | Verification/security code | `ShieldCheckIcon` | The checked shield distinguishes verification from programming |
| `complete` | Completed/successful state | `CheckCircleIcon` | A checked circle names completion across authentication, quests and progress without tying the glyph to one feature |
| `included` | Benefit or capability included in an offering | `CheckCircleIcon` | A 20px outline checked circle marks what the offering contains; inherited foreground keeps inclusion distinct from achieved success without accent or solid weight |
| `incomplete` | Explicit unread/incomplete state | `XCircleIcon` | The crossed circle states that the item is not complete, distinct from the neutral pending ring |
| `pending` | Incomplete/pending progress | `CircleIcon` | The unfinished state is the exact empty twin of completion: keep Heroicons' outer `CheckCircleIcon` path and remove only its inner check |
| `signIn` | Enter account/session | `ArrowRightOnRectangleIcon` | The arrow entering a boundary names session entry |
| `signUp` | Create an account | `UserPlusIcon` | A person with a plus names account creation |
| `close` | Dismiss/close | `XMarkIcon` | The conventional close mark has one unambiguous action |
| `next` | Continue/go forward | `ArrowRightIcon` | A forward arrow names progression without implying login |
| `disclosure` | Open the profile/details named by a row | `ChevronRightIcon` | A chevron denotes disclosure into the row's own destination, not a generic forward action |
| `retry` | Retry/refresh failed work | `ArrowPathIcon` | The circular path names repeating the same operation |
| `send` | Send/submit message | `PaperAirplaneIcon` | The paper plane is reserved for outbound communication |
| `home` | Dashboard overview | `HomeIcon` | Home is the stable entry point to the learner dashboard |
| `explore` | Explore/discover catalogue | `GlobeAltIcon` | A globe names discovery beyond the current collection |
| `community` | Learner community | `UserGroupIcon` | A group names an existing community, distinct from finding talent |
| `league` | Leaderboard and competition | `TrophyIcon` | A trophy names ranking and competitive achievement |
| `livestream` | Upcoming/live video session | `VideoCameraIcon` | A video camera names a scheduled live learning session without borrowing the generic course mark |
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
| `profile` | Current learner profile | `UserIcon` | A single person names the learner's profile destination without reusing the enclosing account surface |
| `cv` | Learner CV | `DocumentTextIcon` | A text document names the compiled CV destination |
| `settings` | Account/profile settings | `Cog6ToothIcon` | A cog names configuration; the meaning remains available when the settings route is implemented |
| `signOut` | End the current session | `ArrowLeftStartOnRectangleIcon` | An arrow leaving a boundary is the directional counterpart to session entry |
| `saved` | Saved/bookmarked content | `BookmarkIcon` | The bookmark names content retained for later |
| `blog` | Blog/editorial content | `NewspaperIcon` | A newspaper names published articles without reusing Explore |
| `talents` | Talent discovery | `SparklesIcon` | Sparkles name exceptional ability without reusing account creation |
| `jobs` | IT jobs | `BriefcaseIcon` | A briefcase names employment and vacancies |
| `practice` | Programming/code practice | `CodeBracketIcon` | Code brackets name programming without reusing verification code |
| `viewGrid` | Lay a collection out as a card grid | `Squares2X2Icon` | Four equal panes name an arrangement rather than the content being arranged |
| `viewList` | Lay a collection out as compact rows | `ListBulletIcon` | A bulleted run of lines names row layout without borrowing the review clipboard |
| `collapseRail` | Collapse or restore the persistent course rail | `CourseRailIcon` | The two persistent panes reproduce the course-outline control and name changing the rail width without implying route navigation |
| `learnHome` | Course learning overview | `CourseOverviewIcon` | A home held inside the learning surface distinguishes the course overview from both the global dashboard and a generic grid layout |
| `courseContent` | Course lesson content | `CourseContentIcon` | An open text with lesson lines names the curriculum the learner reads rather than the wider course catalogue |
| `personalProject` | Personal course project | `PersonalProjectIcon` | A bounded authored code artifact names the learner's deliverable rather than generic code practice |
| `flashcards` | Course flashcard review | `FlashcardsIcon` | Overlapping study cards with a forward cue name moving through a review deck rather than checking assigned work |
| `mindMap` | Course mind map | `MindMapIcon` | A central concept joined to independent branches names the spatial knowledge map rather than editorial content |
| `mockInterview` | Course mock interview | `MockInterviewIcon` | A live microphone names spoken interview practice rather than generic talent discovery |
| `foundations` | Course foundations | `FoundationsIcon` | One block supported by two lower prerequisite blocks names a foundation rather than generic layers |
| `playground` | Executable course playground | `PlaygroundIcon` | A bounded terminal prompt names a runnable learning environment rather than credential verification |
| `courseLeaderboard` | Course leaderboard | `CourseLeaderboardIcon` | A three-place podium names ordered course standing directly instead of generic competitive achievement |
| `courseQa` | Course questions and answers | `CourseQaIcon` | A question bubble paired with its response names learner Q&A rather than the whole learner community |
| `rankFirst` | First leaderboard place | `FirstPlaceMedalIcon` | The authored numeral keeps first place distinct without another artwork vendor |
| `rankSecond` | Second leaderboard place | `SecondPlaceMedalIcon` | The authored numeral keeps second place distinct without another artwork vendor |
| `rankThird` | Third leaderboard place | `ThirdPlaceMedalIcon` | The authored numeral keeps third place distinct without another artwork vendor |
| `rankOther` | Leaderboard place below third | `TrophyIcon` | Upstream already has a faithful generic competition trophy |

## Selection procedure

Repeated metrics, goals, kind labels, streak captions and compact facts stay text-led when the
legacy reference is text-led. Do not decorate `Content`, a streak count or each goal with its
feature icon. Tiny inline glyphs are reserved for generic state or action meanings that are
actually present in the reference, such as complete, failed, close or disclosure. Navigation,
named entry points and large empty-region headings may retain their reference-backed feature icon.

1. Find the product feature in the mapping table.
2. Reuse its `IconName`; never import the listed Heroicon at the call site.
3. Choose `heading`, `leading` or `chip` from placement, not personal size preference.
4. If no feature matches, choose an upstream Heroicon first; when none is semantically faithful,
   add reviewed 24px outline and 16px solid cuts to `@starci/heroicons` and document the meaning here.
5. Update `IconName` and `GLYPHS` in the same change. The parity test rejects drift and duplicate
   Heroicons across different meanings.
