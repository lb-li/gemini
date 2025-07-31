# Enterprise Icon System

## Overview

The Enterprise Icon System provides a unified, professional icon library for the AI chat platform. It replaces emojis and simple placeholders with hand-drawn style SVG icons that maintain consistency across the application.

## Features

- **Standardized Sizes**: 16px, 20px, 24px, 32px (sm, md, lg, xl)
- **Consistent Styling**: 2px stroke width, professional appearance
- **Theme Support**: Automatic color adaptation for light/dark themes
- **TypeScript Support**: Full type safety and IntelliSense
- **Accessibility**: WCAG 2.1 AA compliant contrast ratios

## Usage

### Basic Icon Component

```tsx
import { EnterpriseIcon } from "@/components/icons/icon-component"

// Basic usage
<EnterpriseIcon name="search" />

// With size and variant
<EnterpriseIcon name="send" size="lg" variant="primary" />

// With custom styling
<EnterpriseIcon name="settings" size="sm" variant="muted" className="mr-2" />
```

### Direct Icon Import

```tsx
import { Search, Send, Bot } from "@/components/icons"

<Search className="h-4 w-4" />
<Send className="h-5 w-5 text-primary" />
<Bot className="h-6 w-6" />
```

### Custom Icon Wrapper

```tsx
import { Icon } from "@/components/ui/icon"
import { Search } from "@/components/icons"

<Icon size="lg" variant="success">
  <Search />
</Icon>
```

## Available Icons

### Core UI Icons
- `search` - Search functionality
- `send` - Send messages/actions
- `add` - Add new items
- `delete` - Delete actions
- `settings` - Settings and configuration
- `menu` - Navigation menu
- `close` - Close dialogs/panels
- `check` - Confirmation/success

### Communication Icons
- `chat` - Chat conversations (custom)
- `message` - Individual messages
- `bot` - AI assistant
- `user` - User representation

### File & Media Icons
- `attach` - File attachments
- `file` - Generic files
- `document` - Text documents (custom)
- `image` - Image files
- `download` - Download actions
- `upload` - Upload actions

### Status Icons
- `loading` - Loading states
- `success` - Success states
- `warning` - Warning states
- `error` - Error states
- `info` - Information

### Data & Analytics
- `analytics` - Data analysis (custom)
- `chart` - Charts and graphs
- `statistics` - Statistics display (custom)

### System Icons
- `light` - Light theme
- `dark` - Dark theme
- `system` - System theme

## Icon Variants

### Size Options
- `sm` - 16px (h-4 w-4)
- `md` - 20px (h-5 w-5) - Default
- `lg` - 24px (h-6 w-6)
- `xl` - 32px (h-8 w-8)

### Color Variants
- `default` - Standard foreground color
- `muted` - Muted foreground color
- `primary` - Primary brand color
- `secondary` - Secondary color
- `success` - Green success color
- `warning` - Yellow warning color
- `error` - Red error color
- `info` - Blue information color

## Emoji Replacement Map

The system automatically maps common emojis to professional icons:

| Emoji | Icon Name | Description |
|-------|-----------|-------------|
| 💬 | `chat` | Conversation |
| 📄 | `document` | Document processing |
| 🔍 | `search` | Search functionality |
| 📊 | `statistics` | Data statistics |
| 📎 | `attach` | File attachment |
| 📷 | `image` | Image/camera |
| 📤 | `send` | Send action |
| 💡 | `💡` | Smart suggestions |
| ⌨️ | `⌨️` | Keyboard shortcuts |
| 🎯 | `🎯` | Target/focus |

## Custom Business Icons

### AI Assistant Icon
Professional representation of AI functionality with circuit-like design.

### Data Analysis Icon
Clean chart representation for analytics features.

### Conversation Icon
Speech bubble with content lines for chat functionality.

### Document Processing Icon
Document with processing indicator for file handling.

### Smart Suggestions Icon
Lightbulb with question mark for intelligent suggestions.

### Keyboard Shortcut Icon
Keyboard representation for shortcut displays.

### Statistics Icon
Table-like structure for data presentation.

### Target Icon
Concentric circles for focus/targeting actions.

## Best Practices

### Do's
- Use consistent sizing within the same context
- Apply appropriate variants for different states
- Maintain 2px stroke width for custom icons
- Use semantic icon names
- Provide alt text for accessibility when needed

### Don'ts
- Don't mix emoji with professional icons
- Don't use inconsistent stroke widths
- Don't create overly complex custom icons
- Don't ignore color contrast requirements
- Don't use decorative icons without purpose

## Accessibility

All icons follow WCAG 2.1 AA guidelines:
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Proper focus indicators
- Screen reader compatibility

## Performance

- Icons are tree-shakeable
- SVG format for scalability
- Minimal bundle impact
- Lazy loading support

## Migration Guide

### From Emoji to Professional Icons

1. Identify emoji usage in components
2. Replace with appropriate icon names
3. Update styling to use icon variants
4. Test accessibility and contrast
5. Verify responsive behavior

### Example Migration

```tsx
// Before
<h3>💬 智能对话</h3>

// After
<div className="flex items-center gap-2">
  <EnterpriseIcon name="chat" size="sm" variant="primary" />
  <h3>智能对话</h3>
</div>
```

## Contributing

When adding new icons:
1. Follow the 2px stroke width standard
2. Use 24x24 viewBox for consistency
3. Add to IconMap for easy access
4. Update TypeScript types
5. Document usage examples
6. Test across themes and sizes