# UI Components (shadcn/ui)

This directory contains a collection of reusable UI components built with Radix UI primitives and Tailwind CSS, following the shadcn/ui design system.

## Design Philosophy

These components are built on the following principles:

- **Accessibility**: Built on Radix UI primitives for full accessibility support
- **Customizable**: Uses Tailwind CSS with design tokens for consistent theming
- **Composable**: Components are split into sub-components for maximum flexibility
- **Type Safety**: Full TypeScript support with proper type definitions
- **Modern**: Uses React 19 features and modern CSS patterns

## Component Architecture

### Core Patterns

- **Data Slots**: Components use `data-slot` attributes for targeting sub-elements
- **Compound Components**: Many components export multiple parts (Root, Trigger, Content, etc.)
- **Variants**: Components with multiple styles use `class-variance-authority` (CVA)
- **Utils**: Common styling logic uses the `cn()` utility for conditional classes

### Key Dependencies

- **@radix-ui/react-\***: Accessibility-focused primitives
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **@/lib/utils**: Shared utility functions

## Component Categories

### Form Components

- **Input** - Text input fields with various states and validation styles
- **Textarea** - Multi-line text input
- **Select** - Dropdown selection with search, groups, and custom rendering
- **Checkbox** - Boolean selection inputs
- **Radio Group** - Single selection from multiple options
- **Switch** - Toggle boolean values
- **Slider** - Range selection controls
- **Field** - Form field wrapper with labels and descriptions

### Layout Components

- **Card** - Content containers with header, body, and footer sections
- **Accordion** - Collapsible content sections
- **Tabs** - Tabbed content navigation
- **Separator** - Visual dividers
- **Scroll Area** - Custom scrollable containers
- **Resizable** - Resizable panel layouts

### Navigation Components

- **Button** - Versatile button with multiple variants and sizes
- **Button Group** - Grouped button controls
- **Breadcrumb** - Navigation breadcrumb trails
- **Pagination** - Page navigation controls

### Overlay Components

- **Dialog** - Modal dialogs with overlay and close functionality
- **Alert Dialog** - Confirmation dialogs
- **Popover** - Floating content containers
- **Hover Card** - Hover-triggered floating cards
- **Tooltip** - Contextual help text
- **Sheet** - Slide-out side panels
- **Drawer** - Bottom slide-out panels

### Data Display Components

- **Table** - Data tables with header, body, and footer
- **Badge** - Status indicators and labels
- **Avatar** - User profile images and initials
- **Progress** - Progress bars and indicators
- **Skeleton** - Loading state placeholders
- **Calendar** - Date picker and calendar display
- **Command** - Command palette-style menus

### Advanced Components

- **Sidebar** - Application navigation sidebars
- **Context Menu** - Right-click context menus
- **Command** - Command palette with search and keyboard navigation

## Styling System

### Design Tokens

Components use CSS custom properties for consistent theming:

- `--background` - Main background colors
- `--foreground` - Main text colors
- `--primary` - Primary brand colors
- `--secondary` - Secondary colors
- `--muted` - Subtle text and backgrounds
- `--accent` - Highlight colors
- `--destructive` - Error/danger colors
- `--border` - Border colors
- `--ring` - Focus ring colors

### Responsive Design

Components follow a mobile-first approach with responsive breakpoints:

- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

### Dark Mode

All components support dark mode through Tailwind's dark mode variant and appropriate color schemes.

## Usage Examples

### Basic Button

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>;
```

### Card Component

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>;
```

### Form Input with Label

```tsx
import { Field, Input, Label } from "@/components/ui";

<Field>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</Field>;
```

### Dialog Modal

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>;
```

## Best Practices

1. **Composition**: Combine sub-components to create custom layouts
2. **Accessibility**: Always include proper ARIA labels and semantic markup
3. **Styling**: Use the `cn()` utility for conditional classes and overrides
4. **Consistency**: Follow established patterns for spacing and typography
5. **Performance**: Components are optimized for React 19 and modern browsers

## Customization

### Theme Customization

Modify the CSS custom properties in your globals.css to customize colors and spacing:

```css
:root {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  /* ... other tokens */
}

```

### Component Variants

Add new variants using class-variance-authority (CVA) patterns:

```tsx
const buttonVariants = cva(baseClasses, {
  variants: {
    variant: {
      default: "...",
      // Add new variants here
    }
  }
});
```

## Integration Notes

- These components work seamlessly with React Hook Form for form validation
- Use with TanStack Query for data fetching and caching
- Compatible with React 19's new concurrent features
- Built to work with Tailwind CSS 4.x and above

## File Structure

Each component file typically exports:

- Main component (e.g., `Button`)
- Compound parts (e.g., `ButtonTrigger`, `ButtonContent`)
- Utility variants (e.g., `buttonVariants`)
- TypeScript interfaces for props

All components follow the established patterns and can be easily extended or customized for specific use cases.
