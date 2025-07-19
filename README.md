# Qube-Inventory Delivery Aging Tracker

A professional web application for tracking delivery performance and aging statistics with real-time updates via Supabase database.

## 📁 Project Structure

```
project/
├── index.html              # Main HTML file
├── css/                    # Stylesheets (organized by purpose)
│   ├── variables.css       # CSS custom properties and themes
│   ├── base.css           # Reset styles and base typography
│   ├── layout.css         # Main layout components
│   ├── components.css     # UI components (buttons, cards, modals)
│   ├── tables.css         # Table-specific styles and badges
│   ├── reminders.css      # Reminder section styles
│   ├── utilities.css      # Utility classes
│   └── responsive.css     # Media queries and responsive design
├── js/                    # JavaScript files
│   └── app.js            # Main application logic
└── README.md             # This documentation
```

## 🎨 CSS Architecture

### **variables.css**
- CSS custom properties for colors, spacing, and themes
- Light theme variables (with dark theme support)
- Consistent color system for aging statuses

### **base.css**
- CSS reset and normalization
- Base typography and font settings
- Global focus and accessibility styles
- Custom scrollbar styling

### **layout.css**
- Main container and layout grid
- Header, stats, controls, and data table sections
- Responsive grid systems

### **components.css**
- Reusable UI components
- Button variants and states
- Modal dialogs
- Form elements
- Status messages

### **tables.css**
- Table styling and hover effects
- Badge system for status indicators
- Ticket information display
- Pulse animations for urgent items

### **reminders.css**
- Driver action items section
- Performance cards and grids
- Reminder categories and styling

### **utilities.css**
- Utility classes for quick styling
- Text colors, backgrounds, spacing
- Display and positioning helpers
- Responsive utilities

### **responsive.css**
- Mobile-first responsive design
- Tablet and mobile optimizations
- Print styles
- High DPI display support

## 🔧 JavaScript Architecture

### **app.js**
The main application file contains:

- **Configuration**: Supabase database settings
- **Data Management**: CRUD operations with Supabase
- **UI Controllers**: Event handlers and DOM manipulation
- **File Processing**: Excel/CSV data parsing
- **Real-time Updates**: Auto-refresh functionality

## 🚀 Features

- **Professional Structure**: Separated concerns with modular CSS/JS
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization
- **File Upload**: Excel/CSV data import
- **Advanced Filtering**: Multiple filter options
- **Performance Analytics**: Delivery performance tracking
- **Accessibility**: Keyboard navigation and screen reader support

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile Landscape**: 480px - 768px
- **Mobile Portrait**: < 480px

## 🎯 Performance Optimizations

- **Modular CSS**: Load only necessary styles
- **Efficient DOM Updates**: Minimized reflows and repaints
- **Optimized Images**: Proper image handling
- **Caching**: Browser caching for CSS/JS files

## 🔄 Browser Support

- Chrome 90+
- Firefox 85+
- Safari 14+
- Edge 90+

## 📋 Development Guidelines

### CSS Naming Convention
- **BEM-inspired**: Component-based naming
- **Semantic**: Meaningful class names
- **Consistent**: Standardized prefixes and patterns

### JavaScript Patterns
- **ES6+ Features**: Modern JavaScript syntax
- **Async/Await**: Clean asynchronous operations
- **Error Handling**: Comprehensive error management
- **Modular Functions**: Single responsibility principle

## 🛠️ Maintenance

### Adding New Styles
1. Choose the appropriate CSS file based on purpose
2. Follow existing naming conventions
3. Use CSS custom properties for consistency
4. Test responsive behavior

### Adding New Features
1. Update the relevant JavaScript module
2. Add corresponding CSS if needed
3. Test across all supported browsers
4. Update documentation

## 📈 Performance Metrics

The application is optimized for:
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Largest Contentful Paint**: < 2.5s

## 🔒 Security

- Password-protected admin functions
- Input validation and sanitization
- SQL injection prevention
- XSS protection

---

**Version**: 2.0  
**Last Updated**: 2025-01-19  
**Maintained by**: Qube Apps Solutions