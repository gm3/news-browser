# AI News Browser - Modular Architecture

A modern, modular news browser application with ReactBits integration for enhanced UX. This application fetches news from the ElizaOS daily feed and provides powerful curation and filtering capabilities.

## 🏗️ Architecture Overview

The application has been refactored into a modular architecture with clear separation of concerns:

```
news-browser/
├── components/          # UI Components
│   ├── Toast.js        # Toast notifications
│   ├── Modal.js        # Modal dialogs and JSON viewer
│   └── ReactBitsUI.js  # ReactBits enhanced UI components
├── utils/              # Utility functions
│   ├── dateUtils.js    # Date formatting and parsing
│   ├── domUtils.js     # DOM manipulation helpers
│   └── dataUtils.js    # Data processing utilities
├── services/           # Business logic services
│   ├── newsService.js  # News fetching and processing
│   └── storageService.js # localStorage operations
├── app.js              # Main application file
├── index.html          # Main HTML file
└── style.css           # Core styles
```

## 🚀 Features

### Core Functionality
- **News Fetching**: Loads news from [ElizaOS daily feed](https://elizaos.github.io/knowledge/the-council/facts/daily.json)
- **Data Processing**: Handles new JSON format with object-based categories
- **Drag & Drop**: Curate items by dragging them to the drop zone
- **Search & Filter**: Filter by categories and search within content
- **JSON Generation**: Create curated JSON from selected items

### Enhanced UX with ReactBits
- **Modern Cards**: Gradient backgrounds with hover effects
- **Enhanced Toasts**: Positioned notifications with icons
- **Loading Indicators**: Animated spinners with progress bars
- **Responsive Design**: Grid-based layouts that adapt to screen size

## 📦 Module Breakdown

### Components (`components/`)

#### Toast.js
- `showToast(message, isError)` - Display toast notifications
- `createToastStyles()` - Inject toast CSS

#### Modal.js
- `showJsonViewer(jsonData)` - Display JSON in modal
- `showUrlPrompt(defaultUrl, onLoad)` - URL input modal
- `createModalStyles()` - Inject modal CSS

#### ReactBitsUI.js
- `createModernCard(item, categoryTitle)` - Enhanced card component
- `createEnhancedCategorySection(category)` - Modern category layout
- `createModernLoadingIndicator()` - Animated loading component
- `showEnhancedToast(message, isError, type)` - Enhanced notifications
- `createReactBitsStyles()` - Modern UI styles

### Utilities (`utils/`)

#### dateUtils.js
- `formatDate(unixTimestamp)` - Format timestamps
- `extractDateFromTitle(title)` - Extract dates from titles
- `parseBriefingDate(briefingDate)` - Parse new date format

#### domUtils.js
- `safeAddEventListener(id, event, handler)` - Safe event binding
- `formatUrl(url)` - Format URLs for display
- `createModal(className, width)` - Create modal elements
- `removeElement(element)` - Remove DOM elements
- `focusAndSelectInput(input)` - Focus and select input

#### dataUtils.js
- `convertJsonFormat(jsonData)` - Convert new JSON format
- `extractItemText(item)` - Extract text from various item structures
- `getSourceLinks(item)` - Generate source link HTML
- `getImageUrl(item)` - Get image URL from item

### Services (`services/`)

#### newsService.js
- `fetchNewsData(url)` - Fetch news from URL
- `processNewsData(jsonData)` - Process and format news data
- `loadNews(url)` - Complete news loading workflow

#### storageService.js
- `loadSavedItems()` - Load from localStorage
- `saveItems(items)` - Save to localStorage
- `clearSavedItems()` - Clear all saved items
- `addCuratedItem(curatedItems, newItem)` - Add item to curated list
- `removeCuratedItem(curatedItems, index)` - Remove item from list

## 🎨 ReactBits Integration

The application integrates ReactBits design principles for enhanced user experience:

### Modern UI Elements
- **Gradient Cards**: Beautiful gradient backgrounds with glassmorphism effects
- **Smooth Animations**: Hover effects and transitions
- **Enhanced Typography**: Better readability and hierarchy
- **Responsive Grid**: Adaptive layouts for different screen sizes

### Interactive Components
- **Expandable Cards**: Click to show/hide additional details
- **Category Actions**: Quick actions for entire categories
- **Enhanced Toasts**: Positioned notifications with icons
- **Modern Loading**: Animated spinners with progress indicators

## 🔧 Usage

### Basic Setup
1. Clone the repository
2. Open `index.html` in a web browser
3. The application will automatically load news from the default URL

### Custom News Sources
1. Click "Load News" button
2. Enter a custom JSON URL
3. Click "Load" to fetch from the new source

### Curation Workflow
1. Drag news items to the drop zone
2. Items are automatically added to curated list
3. Use "Generate Curated JSON" to create a new JSON file
4. Save curated items to localStorage for persistence

### Keyboard Shortcuts
- `L` - Load News
- `S` - Focus search
- `V` - View original JSON
- `G` - Generate curated JSON
- `?` - Toggle shortcuts panel

## 🛠️ Development

### Adding New Features
1. Create new modules in appropriate directories
2. Import and use in `app.js`
3. Follow the established patterns for consistency

### Styling
- Core styles in `style.css`
- Component-specific styles in respective component files
- ReactBits styles in `ReactBitsUI.js`

### Data Format Support
The application supports multiple JSON formats:
- Legacy array-based categories
- New object-based categories (ElizaOS format)
- Various item structures (claim, title, summary, etc.)

## 🔄 Migration from Original

The original `script.js` (931 lines) has been broken down into:
- **8 focused modules** with clear responsibilities
- **Improved maintainability** with single-purpose functions
- **Enhanced UX** with ReactBits integration
- **Better error handling** and user feedback
- **Modular architecture** for easy extension

## 📊 Performance Benefits

- **Reduced bundle size**: Only load what you need
- **Better caching**: Module-level caching
- **Improved debugging**: Isolated functionality
- **Easier testing**: Unit test individual modules
- **Faster development**: Reusable components

## 🎯 Future Enhancements

- **React/Vue integration**: Convert to modern framework
- **Real-time updates**: WebSocket integration
- **Advanced filtering**: Date ranges, sentiment analysis
- **Export options**: PDF, CSV, RSS feeds
- **Mobile app**: Progressive Web App features

## 🤝 Contributing

1. Follow the modular architecture
2. Add tests for new functionality
3. Update documentation
4. Maintain consistent styling
5. Use ReactBits principles for new UI components

---

**Built with ❤️ using modern JavaScript and ReactBits design principles**