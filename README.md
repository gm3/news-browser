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
- **Search & Filter**: Real-time search and collapsible category filters
- **Drag & Drop Curation**: Curate items by dragging them to the drop zone
- **JSON Generation**: Create curated JSON from selected items
- **Live News Viewer**: Separate viewer for curated content with enhanced display

### Modern UI/UX
- **Responsive Design**: Mobile-first approach with hamburger menu
- **Sliding Panels**: Right panel for curation and AI chatbot
- **Compact Header**: Icon-based action buttons and space-efficient layout
- **Mobile Optimization**: Bottom-sliding panels on mobile devices
- **Modern Cards**: Enhanced visual design with hover effects

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
- **Action Buttons**: Icon-based buttons for Load News, View JSON, Generate, Live News, Curation, and AI Chat
- **Filters Toggle**: Collapsible category filters (collapsed by default)

### Mobile Menu
- **Hamburger Menu**: Slide-out menu for mobile devices
- **Mobile Header**: Logo and close button
- **Mobile Date Navigation**: Compact date controls
- **Mobile Search**: Search functionality
- **Mobile Actions**: All action buttons in mobile format

### Right Panel
- **Curation Panel**: Drag and drop area for curating news items
- **AI Chatbot Panel**: AI chat interface
- **Toggle Functionality**: Switch between curation and chatbot modes
- **Responsive Behavior**: Slides from right on desktop, from bottom on mobile

## 📱 Responsive Design

### Desktop Layout
- **Two-Column Layout**: Main content and right panel when expanded
- **Fixed Header**: Compact header with all controls
- **Sliding Right Panel**: Contextual panel for curation and AI chat

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
1. Drag news items to the right panel
2. Items are automatically added to curated list
3. Use "Generate Curated JSON" to create a new JSON file
4. Save curated items to localStorage for persistence

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
- **Format Conversion**: Handles both array and object-based category formats
- **Error Handling**: Robust error handling with user feedback
- **Local Storage**: Persistent data storage for curated items
- **Date Management**: Complex date navigation logic for historical data

### CSS Architecture
- **Mobile-First**: Responsive design starting from mobile
- **Flexbox Layout**: Modern layout techniques
- **CSS Transitions**: Smooth animations and transitions
- **Media Queries**: Responsive breakpoints for different screen sizes

## 🔄 Recent Updates

### UI/UX Improvements
- **Compact Header**: Reduced padding and margins for space efficiency
- **Icon-Based Actions**: Converted text buttons to icons
- **Collapsible Filters**: Filters start collapsed by default
- **Sliding Right Panel**: Contextual panel for curation and AI chat
- **Mobile Menu**: Complete mobile navigation with hamburger menu

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