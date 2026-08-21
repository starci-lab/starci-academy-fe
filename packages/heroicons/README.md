# @starci/heroicons

Heroicons-compatible glyphs for stable StarCi product meanings that the upstream catalogue does
not contain. The two public subpaths mirror Heroicons:

```tsx
import { MindMapIcon } from "@starci/heroicons/24/outline"
import { MindMapIcon as MindMapSolidIcon } from "@starci/heroicons/16/solid"
```

Both subpaths re-export their matching `@heroicons/react` family, so a consuming icon owner needs
one import route. Custom outline cuts use the native `24 × 24`, `1.5` round-stroke grammar. Custom
micro cuts use the native `16 × 16` solid grammar. Every glyph inherits `currentColor`.

The package is a drawing vocabulary, not a product meaning map. Applications still expose semantic
names such as `mindMap` through their own closed icon leaf.
