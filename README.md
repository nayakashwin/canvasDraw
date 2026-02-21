# Canvas Draw - Comprehensive Guide

A powerful, browser-based diagramming application built with TypeScript. Create UML diagrams, workflows, freehand drawings, and add text/comments - all within your web browser with no server dependencies.

## 📚 Table of Contents

1. [What is Canvas Draw?](#what-is-canvas-draw)
2. [Installation & Setup](#installation--setup)
3. [Quick Start Guide](#quick-start-guide)
4. [Running on a Personal Server](#running-on-a-personal-server)
5. [How the Code Works](#how-the-code-works)
6. [Project Structure](#project-structure)
7. [Key Concepts](#key-concepts)
8. [Development Guide](#development-guide)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)
11. [Learning Resources](#learning-resources)

---

## 🎨 What is Canvas Draw?

Canvas Draw is a **browser-based diagramming application**. Think of it as a digital whiteboard where you can:
- Draw diagrams (UML, workflows, flowcharts)
- Make freehand sketches
- Add text and comments
- Save your work automatically
- Export to share with others

**Key Point**: It runs entirely in your web browser - no software installation needed!

### Real-World Use Cases

- **Software Developers**: Create UML diagrams for system design
- **Project Managers**: Draw workflow diagrams for processes
- **Students**: Create visual notes and diagrams
- **Teachers**: Draw illustrations for lessons
- **Anyone Who Needs to Sketch**: Quick visualizations and brainstorming

### Core Features

- **Multiple Drawing Modes**: UML diagrams, workflows, freehand drawing, and text/comments
- **Infinite Canvas**: Pan and zoom freely with no boundaries
- **Object Management**: Create, select, move, delete objects with ease
- **Multi-level Undo/Redo**: Full history support with up to 50 undo steps
- **Color System**: 10 predefined colors + custom color picker
- **Stroke Width**: Adjustable thin, medium, and thick options
- **Auto-Save**: Automatic saving to IndexedDB every 5 minutes
- **XML Export**: Export your diagrams to XML format for sharing
- **Client-Side Only**: No server required - runs entirely in the browser
- **Fast Performance**: Optimized rendering with smooth 60 FPS

---

## 🔧 Installation & Setup

### Prerequisites Checklist

Before you begin, ensure you have:
- [ ] Node.js (v14 or higher) - Download from https://nodejs.org/
- [ ] npm (comes with Node.js)
- [ ] Modern web browser (Chrome, Firefox, or Edge)
- [ ] Text editor (VS Code recommended but any will work)

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download and install the LTS (Long Term Support) version
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v18.x.x or higher)

### Step 2: Set Up the Project

1. Navigate to the project folder:
   ```bash
   cd "/home/ash/GDrive/Canvas Draw"
   ```
   (Or wherever you've placed the project)

2. Install dependencies:
   ```bash
   npm install
   ```
   
   **What this does**: Downloads all the tools and libraries the project needs. This includes:
   - TypeScript compiler
   - Webpack (build tool)
   - Konva (canvas library)
   - Development dependencies

3. Build the project:
   ```bash
   npm run build
   ```
   
   **What this does**: Compiles TypeScript to JavaScript and creates the production bundle

### Understanding the Technology Stack

Think of building a house as an analogy:

- **HTML** = The blueprint (structure of the webpage)
- **CSS** = The interior design (colors, layout, fonts)
- **TypeScript** = The construction workers (functionality)
- **Node.js** = The construction site manager (runs development tools)
- **Webpack** = The delivery truck that brings materials together (bundles code)

### Why TypeScript Instead of JavaScript?

**JavaScript** (without TypeScript):
```javascript
let name = "John"; // We don't know what type "name" is
name = 42; // This might cause bugs later
```

**TypeScript**:
```typescript
let name: string = "John"; // We know it's a string
name = 42; // Error! Can't put a number in a string variable
```

**Benefits**:
- Catches errors before you run the code
- Makes code easier to understand
- Provides better autocomplete in editors
- Prevents common bugs

---

## 🚀 Quick Start Guide

### Starting the Development Server

**For Local Development**:
```bash
npm run dev
```
This starts a development server at http://localhost:3000 with hot-reload enabled.

**For Production**:
```bash
npm start
```
This starts the production server with the built bundle.

### Basic Usage

1. **Select a Tool**: Click on a tool in the toolbar (Selection, Pen, Text, etc.)
2. **Choose a Color**: Click on a color swatch or use the custom color picker
3. **Draw**: Click and drag on the canvas to draw
4. **Zoom**: Use the mouse wheel or +/- buttons
5. **Pan**: Hold middle mouse button or spacebar + drag
6. **Undo/Redo**: Use Ctrl+Z and Ctrl+Y (or Ctrl+Shift+Z)
7. **Export**: Click the export button to save as XML

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last action (can press multiple times) |
| `Ctrl+Y` or `Ctrl+Shift+Z` | Redo undone action |
| `Delete` / `Backspace` | Delete selected objects |
| `Escape` | Deselect all objects |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom to 100% |

### Console Commands for Testing

Open the browser console (F12) to access debug commands:

```javascript
// Zoom controls
window.app.zoomIn()          // Zoom in by 10%
window.app.zoomOut()         // Zoom out by 10%
window.app.getZoom()         // Get current zoom level

// Object management
window.app.createObject(
  'class',                   // Object type
  {x: 100, y: 100},        // Position
  {width: 200, height: 100} // Size
)
window.app.deleteSelected()    // Delete selected objects
window.app.clearCanvas()      // Clear everything
window.app.getObjectCount()   // Count objects on canvas

// History
window.app.undo()             // Undo last action
window.app.redo()             // Redo undone action
window.app.canUndo()          // Check if undo is available
window.app.canRedo()          // Check if redo is available

// Export
window.app.exportToXML('my-diagram.xml')
```

---

## 🌐 Running on a Personal Server

### Option 1: Using Node.js (Recommended)

#### Step 1: Build for Production
```bash
npm run build
```

#### Step 2: Start the Production Server
```bash
npm start
```

The server will run at http://localhost:3000

#### Step 3: Access from Other Devices (Optional)

To access from other devices on your network:

1. **Find your local IP address**:
   - Windows: Open Command Prompt, type `ipconfig`
   - Mac/Linux: Open Terminal, type `ifconfig` or `ip addr`

2. **Modify server.js** to listen on all interfaces:
   ```javascript
   // In server.js, change:
   app.listen(3000, 'localhost', () => {
   
   // To:
   app.listen(3000, '0.0.0.0', () => {
   ```

3. **Restart the server**:
   ```bash
   npm start
   ```

4. **Access from other devices**:
   - Use your IP: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

#### Security Considerations

For production deployments:
- **Use HTTPS**: Configure SSL/TLS certificates
- **Add Authentication**: Implement user login
- **Use a Reverse Proxy**: Nginx or Apache in front of Node.js
- **Enable Firewall Rules**: Only allow necessary ports
- **Keep Dependencies Updated**: Regularly run `npm audit fix`

### Option 2: Using a Web Server (Nginx/Apache)

#### Step 1: Build for Production
```bash
npm run build
```

#### Step 2: Deploy Files

Copy these files to your web server:
- `public/index.html`
- `public/styles.css`
- `dist/bundle.js`

#### Step 3: Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/canvas-draw/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /bundle.js {
        alias /path/to/canvas-draw/dist/bundle.js;
    }
}
```

### Option 3: Using Static File Hosting

You can host Canvas Draw on any static file hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

Simply deploy the `public/` and `dist/` folders.

### Performance Tips for Production

1. **Enable Gzip Compression**:
   ```javascript
   // In server.js
   const compression = require('compression');
   app.use(compression());
   ```

2. **Set Cache Headers**:
   ```javascript
   // In server.js
   app.use(express.static('public', {
     maxAge: '1y'  // Cache static assets for 1 year
   }));
   ```

3. **Use CDN for Libraries** (optional):
   - Load Konva from CDN instead of bundling
   - Reduces bundle size

---

## 🧠 How the Code Works

### High-Level Architecture

```
User Action → App Class → Managers → Canvas → Visual Result
```

### Step-by-Step Example: Drawing a Rectangle

1. **User clicks "Rectangle" tool**
   - Browser detects mouse click
   - Sends event to App class

2. **App class receives click**
   - Tells ObjectManager to create a rectangle
   - Tells HistoryManager to save state (for undo)

3. **ObjectManager creates rectangle**
   - Creates a rectangle object with position and size
   - Stores it in the objects list
   - Tells CanvasManager to draw it

4. **CanvasManager renders rectangle**
   - Clears the canvas
   - Draws all objects (including the new rectangle)
   - Shows the result on screen

5. **User sees the rectangle**
   - The canvas displays the rectangle
   - Ready for more interactions!

### The Manager Pattern

The application uses a **Manager Pattern** - specialized classes that handle specific tasks:

```
┌─────────────────────────────────────┐
│           App Class                 │  ← The "brain"
│  Coordinates all the managers      │
└─────────────────────────────────────┘
            │
    ┌───────┴───────┬───────────┬───────────┐
    │               │           │           │
┌───▼────┐   ┌────▼────┐  ┌───▼────┐ ┌───▼────┐
│ Canvas  │   │ Object  │  │History  │ │Storage │
│ Manager │   │ Manager │  │ Manager │ │ Manager│
└─────────┘   └─────────┘  └─────────┘ └─────────┘
  Draws all    Creates &    Saves      Saves to
  objects      deletes     states     browser
               objects     for undo   & exports
```

### Core Classes Explained

#### 1. App Class (`src/core/app.ts`)
**Role**: The main application coordinator
**Responsibilities**:
- Initializes all managers
- Handles user interactions (mouse, keyboard)
- Manages application state
- Coordinates between components

**Analogy**: The conductor of an orchestra - keeps everything working together

#### 2. CanvasManager (`src/core/canvasManager.ts`)
**Role**: Canvas operations
**Responsibilities**:
- Rendering objects on the canvas
- Zoom and pan functionality
- Event handling (mouse, keyboard)
- Layer management

**Analogy**: The painter who draws on the canvas

#### 3. ObjectManager (`src/core/objectManager.ts`)
**Role**: Object lifecycle management
**Responsibilities**:
- Create, update, delete objects
- Selection and grouping
- Object properties management
- Convert objects to/from Konva nodes

**Analogy**: The librarian who manages a collection of books

#### 4. HistoryManager (`src/core/historyManager.ts`)
**Role**: Undo/redo functionality
**Responsibilities**:
- Save canvas states
- Navigate through history
- Configurable history depth (50 steps)
- Manage current position in history

**How Undo Works**:
1. Each action saves a complete state snapshot
2. History is stored as an array: [State0, State1, State2, ...]
3. Undo moves back one step in the array
4. Canvas is cleared and recreated from the previous state

**Example**:
- State 0: Empty canvas
- State 1: Line drawn
- State 2: Text added
- State 3: Another line drawn
- Ctrl+Z → Restores State 2 (removes last line)
- Ctrl+Z → Restores State 1 (removes text)

**Analogy**: A time machine for your canvas

#### 5. StorageManager (`src/core/storageManager.ts`)
**Role**: Persistence and export
**Responsibilities**:
- Save to IndexedDB (browser storage)
- Load from IndexedDB
- Auto-save every 5 minutes
- Export to XML format

**Analogy**: The filing cabinet for your documents

### State Management

"State" means the current condition of the application. We save state to:
- Remember where objects are
- Enable undo/redo
- Auto-save work
- Export to other formats

**Example State Structure**:
```typescript
{
  zoom: 1.5,                    // Zoomed to 150%
  pan: { x: 100, y: 50 },      // Panned right and down
  objects: [...],                // All objects on canvas
  selectedIds: ["obj1"],        // Which objects are selected
  groupedIds: [...]               // Which objects are grouped
}
```

### Event Handling

Events are things that happen (clicks, keys pressed, etc.).

**Event Flow**:
```
User Action → Browser Detects Event → App Receives Event → Action Taken
```

**Common Events**:
- `mousedown`: Mouse button pressed
- `mousemove`: Mouse moved
- `mouseup`: Mouse button released
- `keydown`: Key pressed
- `wheel`: Mouse wheel scrolled

### The DOM (Document Object Model)

The DOM is how browsers represent HTML as objects.

**HTML Structure**:
```html
<body>
  <div id="app">
    <canvas></canvas>
  </div>
</body>
```

**Browser DOM Representation**:
```javascript
document.body
  └─ document.getElementById('app')
      └─ document.querySelector('canvas')
```

---

## 📁 Project Structure

### The Big Picture

```
Canvas Draw/                    ← Your project folder
├── public/                     ← Files the browser sees
│   ├── index.html              ← Main webpage
│   └── styles.css              ← Visual styling
├── src/                        ← Source code (we write this)
│   ├── core/                   ← Core application logic
│   │   ├── app.ts              ← Main controller
│   │   ├── canvasManager.ts    ← Canvas operations
│   │   ├── objectManager.ts    ← Object handling
│   │   ├── historyManager.ts    ← Undo/redo
│   │   └── storageManager.ts   ← Saving & loading
│   ├── types/                  ← Type definitions
│   │   └── index.ts            ← All types
│   └── main.ts                 ← Entry point
├── dist/                       ← Compiled code (auto-generated)
├── node_modules/               ← Dependencies (auto-generated)
├── package.json                ← Project configuration
├── tsconfig.json               ← TypeScript settings
├── webpack.config.js           ← Build tool settings
└── server.js                   ← Development server
```

### File-by-File Explanation

#### `public/index.html`
**What it is**: The HTML file that browsers load
**What it contains**: The structure of the webpage
**Analogy**: The skeleton of a webpage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Canvas Draw</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>  <!-- Our app renders here -->
  <script src="bundle.js"></script>  <!-- Our compiled code -->
</body>
</html>
```

#### `public/styles.css`
**What it is**: Styling for the application
**What it contains**: Colors, fonts, layout, animations
**Analogy**: The interior design of a house

#### `src/main.ts`
**What it is**: The entry point - first code that runs
**What it does**: Creates and initializes the App
**Analogy**: The "Start" button for the application

```typescript
import { App } from './core/app';

const app = new App('app');
await app.initialize();
```

#### `src/core/app.ts`
**What it is**: Main application class
**What it does**: Coordinates all managers, handles user input
**Analogy**: The brain or conductor of an orchestra

#### `src/core/canvasManager.ts`
**What it is**: Handles canvas operations
**What it does**: Draws objects, handles zoom/pan, manages events
**Analogy**: The painter who draws on the canvas

#### `src/core/objectManager.ts`
**What it is**: Manages objects (shapes, text, etc.)
**What it does**: Creates, updates, deletes objects
**Analogy**: The librarian who manages a collection of books

#### `src/core/historyManager.ts`
**What it is**: Handles undo/redo functionality
**What it does**: Saves states, allows going back/forward in time
**Analogy**: A time machine for your canvas

#### `src/core/storageManager.ts`
**What it is**: Handles saving and loading
**What it does**: Saves to IndexedDB, exports to XML
**Analogy**: The filing cabinet for your documents

#### `src/types/index.ts`
**What it is**: Type definitions
**What it contains**: Interfaces for all data structures
**Analogy**: A dictionary that defines what things look like

### What are the other folders?

#### `dist/`
- **What**: Compiled JavaScript code
- **Generated by**: Webpack
- **Don't edit**: This is auto-generated from `src/`

#### `node_modules/`
- **What**: All the libraries and dependencies
- **Generated by**: `npm install`
- **Don't edit**: This contains third-party code

---

## 💡 Key Concepts

### 1. Objects (Shapes, Text, etc.)

In Canvas Draw, everything you draw is an "object".

**Object Structure**:
```typescript
{
  id: "unique-id",           // Unique identifier
  type: "rectangle",         // What kind of object
  position: { x: 100, y: 50 }, // Where it is
  size: { width: 200, height: 100 }, // How big
  properties: {              // How it looks
    stroke: "black",         // Border color
    fill: "white",           // Background color
    strokeWidth: 2           // Border thickness
  }
}
```

**Analogy**: Think of objects as digital stickers you can place, move, and remove.

### 2. The Canvas

The canvas is the drawing surface - like a digital whiteboard.

**Key Features**:
- **Infinite**: No boundaries, can scroll forever
- **Zoomable**: Can zoom in and out
- **Pannable**: Can move around to see different areas

**How it Works**:
1. Canvas is cleared every frame
2. All objects are drawn in order
3. Result is shown on screen

### 3. Object Types

**Shapes**:
- **CLASS**: UML class box (rectangle)
- **USE_CASE**: UML use case (ellipse)
- **PROCESS**: Workflow step (rectangle)
- **DECISION**: Decision point (diamond)
- **TERMINATOR**: Start/end (rounded rectangle)

**Freehand & Text**:
- **FREEHAND**: Freehand drawing path
- **TEXT**: Text box
- **COMMENT**: Sticky note comment

**Connectors**:
- **ARROW**: Arrow connector
- **LINE**: Straight line
- **CURVED_LINE**: Bezier curve

### 4. Undo/Redo System

**How it works**:
1. Each action saves a complete state snapshot
2. History is stored as an array of states
3. Undo moves back through the array
4. Redo moves forward through the array

**Example Scenario**:
User performs these actions:
1. Draws a line (Line 1)
2. Adds a textbox (Text 1)
3. Draws another line (Line 2)

**History Stack**:
- State 0: Empty canvas
- State 1: Line 1
- State 2: Line 1 + Text 1
- State 3: Line 1 + Text 1 + Line 2

**After first Ctrl+Z**:
- Restores State 2 (Line 1 + Text 1)
- Removes Line 2

**After second Ctrl+Z**:
- Restores State 1 (Line 1 only)
- Removes Text 1

**Configuration**:
- History depth: 50 steps (configurable)
- Saves complete state after each action
- Line drawings are fully tracked and undoable

---

## 💻 Development Guide

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit TypeScript files in `src/`
   - Edit CSS in `public/styles.css`
   - Edit HTML in `public/index.html`

3. **Automatic Build**
   - Webpack watches for changes
   - Automatically rebuilds on save
   - Browser auto-refreshes

4. **TypeScript Compilation**
   - Files are compiled to JavaScript
   - Output goes to `dist/` directory
   - Type errors are shown in console

### Building for Production

```bash
npm run build
```

This creates an optimized bundle in `dist/`.

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **Comments**: Comprehensive JSDoc-style comments
- **Naming**: 
  - camelCase for variables and functions
  - PascalCase for classes and interfaces
- **Formatting**: Consistent indentation and spacing

### Adding New Features

1. **Define Types** in `src/types/index.ts`
2. **Implement Logic** in appropriate core class
3. **Update UI** in HTML/CSS if needed
4. **Test** thoroughly
5. **Document** your changes

### Common Development Tasks

#### Task 1: Add a New Color to the Palette

**File to edit**: `public/index.html`

Find the color palette section and add:
```html
<button class="color-swatch" style="background-color: #FF69B4;" data-color="#FF69B4"></button>
```

#### Task 2: Change Default Zoom Level

**File to edit**: `src/core/app.ts`

Find the default state:
```typescript
this.currentState = {
  zoom: 1.0,  // Change this!
  pan: { x: 0, y: 0 },
  ...
};
```

Change `zoom: 1.0` to `zoom: 1.5` for 150% default zoom.

#### Task 3: Add a Keyboard Shortcut

**File to edit**: `src/main.ts`

Add to the main function:
```typescript
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    window.app?.exportToXML('quick-save.xml');
  }
});
```

#### Task 4: Change Auto-Save Interval

**File to edit**: `src/core/app.ts`

Find the auto-save line:
```typescript
this.storageManager!.enableAutoSave(this.currentState, 300000);
```

Change `300000` (5 minutes) to `60000` (1 minute).

---

## 🐛 Troubleshooting

### Application Won't Load

#### Step 1: Check Browser Console

1. Open the application in your browser at http://localhost:3000
2. Press F12 to open Developer Tools
3. Click on the "Console" tab
4. Look for any error messages (red text)

#### Step 2: Refresh the Browser

The webpack dev server should auto-refresh, but sometimes you need to manually refresh:
- Press F5 or Ctrl+R (Windows/Linux) or Cmd+R (Mac)
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

#### Step 3: Check if JavaScript is Enabled

1. In your browser settings, ensure JavaScript is enabled
2. Try a different browser (Chrome, Firefox, Edge)

#### Step 4: Clear Browser Cache

1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

#### Step 5: Check Network Tab

1. Open Developer Tools (F12)
2. Click on "Network" tab
3. Refresh the page
4. Look for any failed requests (red items)
5. Ensure `bundle.js` is loading successfully

### Common Error Messages

**"Container element with id 'app' not found"**
- Solution: Ensure `public/index.html` has `<div id="app"></div>`

**"Error initializing Canvas Draw"**
- Check the full error message in the console
- The error might be related to IndexedDB or Canvas API

**"Module not found" errors**
- Solution: Run `npm install` again to ensure all dependencies are installed

### White Screen Issue

If you see a white screen:

1. **Restart the dev server**:
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

2. **Check the dist folder**:
   - Ensure `dist/bundle.js` exists
   - If not, run `npm run build`

3. **Try production build**:
   - Run `npm run build`
   - Open `public/index.html` directly in your browser

### Expected Console Output

When the application loads successfully, you should see:

```
Creating Canvas Draw application...
Initializing Canvas Draw...
Restored saved state
(or)
No saved state found, starting fresh
Canvas Draw initialized successfully!
================================================================
  Canvas Draw - Ready!
================================================================
```

### Security Vulnerabilities

All security vulnerabilities have been fixed:
- Run `npm audit` to verify
- Should show: `found 0 vulnerabilities`

### Console Commands for Debugging

Once the app is running, you can use these commands in the browser console:

```javascript
// Check if app is loaded
window.app

// Test canvas manager
window.app.canvasManager

// Test object manager
window.app.objectManager

// Test history manager
window.app.historyManager

// Test storage manager
window.app.storageManager

// Get current state
window.app.currentState

// Force a re-render
window.app.canvasManager.getLayer().batchDraw()
```

### Known Issues

#### Issue: Loading screen doesn't disappear

**Cause**: JavaScript error during initialization
**Solution**: Check browser console for errors

#### Issue: Canvas not visible

**Cause**: Canvas has 0 height or width
**Solution**: Resize browser window to force canvas resize

#### Issue: Zoom not working

**Cause**: Mouse event not properly bound
**Solution**: Click on the canvas first, then try zooming with mouse wheel

---

## 📚 API Reference

### App Class

Main application interface.

#### Constructor

```typescript
new App(containerId: string)
```

Creates a new App instance.

#### Methods

```typescript
async initialize(): Promise<void>
```
Initializes the application.

```typescript
createObject(type: ObjectType, position: Point, size: Size, properties?: ObjectProperties): void
```
Creates a new object on the canvas.

**Parameters**:
- `type`: The type of object to create (from ObjectType enum)
- `position`: The position where to create the object
- `size`: The size of the object
- `properties`: Optional object properties

```typescript
deleteSelected(): void
```
Deletes all selected objects.

```typescript
undo(): void
```
Undoes the last action.

```typescript
redo(): void
```
Redoes the last undone action.

```typescript
clearCanvas(): void
```
Clears all objects from the canvas.

```typescript
exportToXML(filename: string): void
```
Exports the canvas to XML format.

```typescript
zoomIn(): void
```
Zooms in by 10%.

```typescript
zoomOut(): void
```
Zooms out by 10%.

```typescript
setTool(tool: ToolType): void
```
Sets the current drawing tool.

```typescript
setColor(color: string): void
```
Sets the current drawing color.

```typescript
setStrokeWidth(width: number): void
```
Sets the current stroke width in pixels.

```typescript
canUndo(): boolean
```
Checks if undo is available.

```typescript
canRedo(): boolean
```
Checks if redo is available.

### Type Interfaces

#### CanvasState

```typescript
interface CanvasState {
  zoom: number;                  // Current zoom level
  pan: Point;                    // Current pan position
  objects: CanvasObject[];         // All objects on canvas
  selectedIds: string[];          // IDs of selected objects
  groupedIds: string[][];         // Groups of object IDs
  history: CanvasState[];          // History states
  historyIndex: number;           // Current position in history
}
```

#### CanvasObject

```typescript
interface CanvasObject {
  id: string;                    // Unique identifier
  type: ObjectType;              // Object type
  position: Point;                // Position on canvas
  size: Size;                    // Dimensions
  properties: ObjectProperties | TextProperties | PathProperties | ConnectorProperties;
  layer?: number;                 // Layer index
  groupIds?: string[];           // Group memberships
  createdAt?: Date;               // Creation timestamp
  updatedAt?: Date;               // Last update timestamp
}
```

#### Point

```typescript
interface Point {
  x: number;                     // X coordinate
  y: number;                     // Y coordinate
}
```

#### Size

```typescript
interface Size {
  width: number;                  // Width in pixels
  height: number;                 // Height in pixels
}
```

---

## 📖 Learning Resources

### For Absolute Beginners

1. **HTML & CSS Basics**
   - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Learn
   - FreeCodeCamp: https://www.freecodecamp.org/

2. **JavaScript Fundamentals**
   - JavaScript.info: https://javascript.info/
   - Eloquent JavaScript: https://eloquentjavascript.net/

3. **TypeScript Basics**
   - TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
   - TypeScript Deep Dive: https://basarat.gitbook.io/typescript/

### For This Project

1. **Canvas API**
   - MDN Canvas Tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
   - Canvas API Reference: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

2. **IndexedDB**
   - IndexedDB Guide: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
   - Using IndexedDB: https://javascript.info/indexeddb

3. **Browser APIs**
   - MDN Web APIs: https://developer.mozilla.org/en-US/docs/Web/API

### Recommended Learning Path

**Week 1**: HTML & CSS basics
- Learn HTML structure
- Understand CSS styling
- Practice creating simple webpages

**Week 2**: JavaScript fundamentals
- Variables, functions, objects
- DOM manipulation
- Event handling

**Week 3**: TypeScript basics
- Type system
- Interfaces
- Classes and methods

**Week 4**: Canvas API
- Drawing shapes
- Handling mouse events
- Animation basics

**Week 5**: Dive into Canvas Draw code
- Read through the files
- Make small changes
- Understand the architecture

---

## ❓ Frequently Asked Questions

### General Questions

**Q: Do I need to know how to program to use this?**
A: No! You can use the application without any programming knowledge. Programming is only needed if you want to modify or extend it.

**Q: Can I use this offline?**
A: Yes! Once loaded, the application works entirely offline.

**Q: Will my drawings be saved if I close the browser?**
A: Yes! Auto-save saves to your browser's storage. Your work is preserved.

**Q: How many undo steps are available?**
A: Up to 50 undo steps are available by default. This can be configured by changing the `maxHistory` parameter in `src/core/app.ts`.

**Q: Can I undo line drawings?**
A: Yes! Line drawings created with the pen tool are fully tracked and can be undone just like any other object.

### Technical Questions

**Q: What's the difference between `src/` and `public/`?**
A: 
- `src/` = Source code we write (TypeScript)
- `public/` = Files that go to the browser (HTML, CSS)

**Q: What is `dist/`?**
A: It's where compiled JavaScript goes. You don't need to edit this - it's auto-generated.

**Q: Why do I see so many comments in the code?**
A: Comprehensive comments help beginners understand what each part does. They're like inline documentation!

**Q: What's `node_modules/`?**
A: It contains all the dependencies (libraries) the project uses. You don't need to edit this.

### Development Questions

**Q: How do I see errors?**
A: Check your browser console (F12 → Console tab) and the terminal where you ran `npm run dev`.

**Q: Why does my change not show up?**
A: Try refreshing the browser. Webpack usually auto-rebuilds, but sometimes you need to refresh manually.

**Q: Can I use a different text editor?**
A: Yes! VS Code is recommended, but any text editor works. Some good options: Sublime Text, Atom, WebStorm.

**Q: How do I share my changes with others?**
A: You can share the entire project folder, or use Git to version control your changes.

### Learning Questions

**Q: I'm new to programming. Where should I start?**
A: Start with HTML & CSS basics, then move to JavaScript, then TypeScript. The "Learning Resources" section above has good starting points.

**Q: How long does it take to understand the code?**
A: It depends on your background. For a complete beginner, expect 2-4 weeks of study to understand the basics.

**Q: Can I make modifications without understanding everything?**
A: Yes! You can make small changes (colors, text, settings) without deep understanding. The comments guide you.

**Q: What if I get stuck?**
A: 
1. Read the code comments
2. Check the browser console for errors
3. Look up error messages online
4. Try the simple examples in this guide

---

## 🎯 Next Steps

You've completed the guide! Here's what to do next:

1. **Explore the Code**: Read through the source files and understand the structure
2. **Make Small Changes**: Try modifying colors, text, or settings
3. **Build Something**: Add a simple feature like a new button or color
4. **Learn More**: Study the resources listed above
5. **Experiment**: Don't be afraid to break things - you can always revert!

## 🔗 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Webpack Documentation](https://webpack.js.org/)
- [Konva.js Documentation](https://konvajs.org/docs)

---

**Remember**: Every expert was once a beginner. Take your time, ask questions, and most importantly - have fun learning! 🎉

**Built with ❤️ using TypeScript**