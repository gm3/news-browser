# AI News Browser

A modern, responsive news browser application that fetches and displays news from the ElizaOS daily feed with advanced curation capabilities, date navigation, and mobile-first design.

## 🏗️ Project Structure

```
news-browser/
├── index.html              # Main application page
├── css/
│   └── style.css          # Core application styles
├── scripts/
│   ├── app.js             # Main application entry point
│   ├── components/
│   │   ├── Toast.js       # Toast notification system
│   │   ├── Modal.js       # Modal dialogs and JSON viewer
│   │   ├── Calendar.js    # Date selection calendar
│   │   └── ReactBitsUI.js # Modern UI components
│   ├── utils/
│   │   ├── dateUtils.js   # Date formatting and parsing
│   │   ├── domUtils.js    # DOM manipulation helpers
│   │   └── dataUtils.js   # Data processing utilities
│   └── services/
│       ├── newsService.js # News fetching and processing
│       ├── storageService.js # localStorage operations
│       └── dateService.js # Date navigation and management
├── live/
│   ├── livenewsviewer.html # Live News Viewer page
│   ├── livenewsviewer.js   # Viewer functionality
│   └── livenewsviewer.css  # Viewer-specific styles
└── README.md              # Project documentation
```

## 🚀 Features

### Core Functionality
- **News Fetching**: Loads news from [ElizaOS daily feed](https://elizaos.github.io/knowledge/the-council/facts/daily.json)
- **Historical Navigation**: Browse through historical news with forward/back buttons and calendar
- **Date Navigation**: Compact date browser with Today button and calendar picker
- **Search & Filter**: Real-time search and collapsible category filters that work across all layouts
- **Curation (Star Toggle)**: Curate items directly from cards using a small star icon in the top-right
- **JSON Generation**: Create curated JSON from selected items
- **Live News Viewer**: Full-screen text-centric viewer for curated content

### Modern UI/UX
- **Newspaper Layout (default)**: 2-column (65% / 35%). Left: Main & Development with horizontal sub-carousels. Right: Community & Market with a vertical carousel
- **Masonry Layout**: Toggle via the brick button to switch to a responsive multi-column grid
- **News Ticker**: Horizontal ticker between Main News and Development showing randomized headlines across categories
- **Responsive Design**: Mobile-first approach with hamburger menu
- **Sliding Panels**: Right panel for curated items and AI chatbot
- **Compact Header**: Black-and-white newspaper aesthetic and icon-based actions (Help in header)
- **Modern Cards**: Compact wireframe look, glassmorphism, image fallbacks
- **Modals**: Click any card to view a detailed metadata modal (supports varied schemas)

### Enhanced UX with ReactBits
- **Modern Cards**: Gradient backgrounds with glassmorphism effects
- **Enhanced Toasts**: Positioned notifications with icons
- **Loading Indicators**: Animated spinners with progress bars
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Calendar Component**: Interactive date picker with available dates highlighting

## 🎨 UI Components

### Header Layout
- **Logo & Title**: Compact news browser branding
- **Date Navigation**: Compact date browser with Today/Calendar buttons
- **Search Bar**: Real-time search functionality
- **Action Buttons**: Load, View JSON, Generate, Live Viewer, Curation, AI Chat, Layout toggle, Help
- **Filters Toggle**: Collapsible category filters (collapsed by default)

### Mobile Menu
- **Hamburger Menu**: Slide-out menu for mobile devices
- **Mobile Header**: Logo and close button
- **Mobile Date Navigation**: Compact date controls
- **Mobile Search**: Search functionality
- **Mobile Actions**: All action buttons in mobile format

### Right Panel
- **Curated Items Grid**: Responsive grid of starred items; clear/save actions
- **AI Chatbot Panel**: AI chat interface
- **Toggle Functionality**: Switch between curated items and chatbot
- **Responsive Behavior**: Slides from right on desktop, from bottom on mobile

## 📱 Responsive Design

### Desktop Layout
- **Two-Column Layout (65/35)**: Main content on the left, Community/Market on the right
- **Fixed Header**: Compact header with all controls
- **Sliding Right Panel**: Contextual panel for curated items and AI chat

### Mobile Layout
- **Hamburger Menu**: All controls accessible via slide-out menu
- **Bottom Panels**: Curation and AI chat panels slide up from bottom
- **Optimized Content**: News content prioritized on mobile screens
- **Touch-Friendly**: Larger touch targets and simplified interactions

## 🔧 Usage

### Basic Setup
1. Clone the repository
2. Open `index.html` in a web browser
3. The application will automatically load news from the default URL

### Date Navigation
- **Today Button**: Jump to current day's news
- **Calendar**: Pick specific historical dates
- **Forward/Back**: Navigate through available dates
- **Date Display**: Shows current date in MM/DD/YY format

### Curation Workflow
1. Click the star icon on any card to add/remove it from the curated list
2. Open the right panel to review the curated grid; use Clear/Save to manage
3. Use "Generate Curated JSON" to create a new JSON snapshot
4. Curated items persist in localStorage

### Mobile Usage
1. Use hamburger menu to access all controls
2. Swipe or tap to navigate between dates
3. Right panel slides up from bottom on mobile
4. Touch-friendly interface optimized for mobile devices

## 🛠️ Technical Implementation

### Modular Architecture
- **ES6 Modules**: Clean import/export structure
- **Separation of Concerns**: UI, business logic, and utilities separated
- **Reusable Components**: Toast, Modal, Calendar components
- **Service Layer**: News, storage, and date services

### Data Processing
- **Normalization**: Converts heterogeneous category structures to a consistent array via `convertJsonFormat`
- **Filtering/Search**: Applies filters and search across Newspaper and Masonry layouts
- **Local Storage**: Persistent curated items
- **Date Management**: Handles daily feed vs. historical dates; corrects off-by-one via offset and `viewingDaily` state

### CSS Architecture
- **Mobile-First**: Responsive design starting from mobile
- **Grid & Flexbox**: Newspaper grid (65/35), carousels, and responsive curated grid
- **Wireframe Theme**: Black-and-white newspaper aesthetic
- **CSS Transitions**: Smooth animations and transitions
- **Media Queries**: Responsive breakpoints for different screen sizes

## 🔄 Recent Updates

### UI/UX Improvements
- **Newspaper Layout**: 65/35 columns; horizontal sub-rows on left, vertical carousel on right
- **Masonry Layout Toggle**: Quick switch with the brick icon
- **News Ticker**: Horizontal ticker between Main News and Development
- **Curation Overhaul**: Star icon on cards replaces drag-and-drop; curated items shown in a responsive grid
- **Header Polish**: Black-and-white theme, Help button in header, tightened spacing
- **Modals**: Detail modal for all cards with metadata and raw JSON

### Date Navigation Enhancements
- **Compact Date Browser**: Two-line height with minimal spacing
- **Today Button**: Explicit button to jump to current day
- **Calendar Integration**: Date picker with available dates
- **Mobile Sync**: Date display synchronized between desktop and mobile

### Mobile Responsiveness
- **Hamburger Menu**: Complete mobile navigation
- **Bottom Panels**: Right panel slides from bottom on mobile
- **Touch Optimization**: Larger touch targets and simplified interactions
- **Content Priority**: News content prioritized on mobile screens

## 🧭 Keyboard Shortcuts
- `L`: Load news
- `S`: Focus search
- `V`: View original JSON
- `G`: Generate curated JSON
- Arrow Left/Right: Navigate dates
- `?`: Toggle shortcuts panel

## 🎯 Future Enhancements

- **Real-time Updates**: WebSocket integration for live news
- **Advanced Filtering**: Date ranges, sentiment analysis
- **Export Options**: PDF, CSV, RSS feeds
- **Progressive Web App**: Offline capabilities and app-like experience
- **Advanced AI Features**: Enhanced chatbot with news analysis

## 🤝 Contributing

1. Follow the modular architecture
2. Maintain mobile-first responsive design
3. Use ReactBits principles for new UI components
4. Test on both desktop and mobile devices
5. Update documentation for new features

---

**Built with ❤️ using modern JavaScript, responsive design, and ReactBits UI principles**