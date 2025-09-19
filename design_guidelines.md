# Discord Bot Manager - Design Guidelines

## Design Decision & Approach
**Selected Approach**: Reference-Based (Social/Developer Tools)
**Primary Reference**: Discord's aesthetic + GitHub/VS Code developer interface
**Justification**: Arabic-language Discord bot management platform requires familiar Discord branding with professional developer tool functionality.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Dark Mode Primary: 220 13% 18% (Discord-inspired dark background)
- Secondary: 235 86% 65% (Discord blurple)
- Surface: 220 13% 22% (elevated surfaces)

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 235 86% 65%

**Accent Colors:**
- Success (Bot Online): 139 47% 57% (green)
- Error (Bot Offline): 358 75% 59% (red)
- Warning: 38 92% 50% (amber)

### B. Typography
**Font System**: 
- Primary: 'Cairo' (excellent Arabic support)
- Code/Technical: 'JetBrains Mono'
- Weights: 400 (regular), 500 (medium), 600 (semibold)

### C. Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
**Grid**: Sidebar navigation + main content area
**RTL Support**: Full right-to-left layout for Arabic

### D. Component Library

**Navigation:**
- Fixed sidebar with bot status indicators
- Collapsible mobile navigation drawer
- Breadcrumb navigation for file management

**Core Components:**
- Bot control panel with large start/stop toggle
- Advanced code editor with syntax highlighting
- Multi-tab file manager with drag-drop upload
- Real-time status cards with connection indicators
- Settings panels with form validation

**Data Displays:**
- Bot logs with real-time streaming
- File explorer tree view
- Token management with masked display

**Mobile Responsiveness:**
- Stacked layout on mobile
- Touch-optimized controls
- Swipe gestures for navigation
- Responsive code editor

### E. Visual Effects & Polish

**Subtle Animations:**
- Smooth bot status transitions
- Code editor syntax highlighting
- File upload progress indicators
- Loading states with Arabic text

**Modern Effects:**
- Subtle gradient overlays on cards
- Soft shadows for depth
- Smooth hover states
- Status indicator pulses

**Background Treatments:**
- Dark mode: Deep gradient (220 13% 18% to 220 13% 14%)
- Light mode: Subtle texture overlay
- Card backgrounds with slight transparency

## Key Features Design

**Bot Control Dashboard:**
- Prominent status indicator (online/offline)
- Large, accessible start/stop button
- Token input with security masking
- Real-time connection status

**Code Editor Interface:**
- Multi-file tabs with close buttons
- Syntax highlighting for JavaScript/Python
- Line numbers and code folding
- Save shortcuts and auto-save indicators

**File Management:**
- Grid and list view toggle
- Drag-and-drop upload zones
- File type icons and previews
- Bulk operations (delete, rename)

**Mobile Optimization:**
- Hamburger menu navigation
- Stacked content layout
- Touch-friendly button sizes
- Optimized code editor for mobile

The design emphasizes developer productivity while maintaining Discord's familiar aesthetic, with full Arabic language support and mobile-first responsive design.