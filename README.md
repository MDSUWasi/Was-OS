Was-Operating System v4.0
License: MIT | Offline Ready: Yes | Web-Based: Browser Only | Language: JavaScript ES2022
A fully functional, offline-capable web-based operating system simulation built with pure HTML, CSS, and JavaScript. No external dependencies required.

TABLE OF CONTENTS

About
Features
Architecture Overview
File Structure
Code Documentation
Terminal Commands
Installation & Usage
Customization Guide
Troubleshooting
Contributing
License
Acknowledgments



ABOUT

Was-OS v4.0 is a lightweight web-based operating system simulation that runs entirely in your browser. It provides a desktop-like environment with window management, a virtual filesystem, and multiple applications—all without requiring any external dependencies or internet connection.
Built with pure HTML, CSS, and JavaScript, Was-OS demonstrates how modern web technologies can replicate traditional desktop computing experiences while remaining 100% self-contained.
Key Highlights:

Zero External Dependencies: 100% self-contained, no CDN or APIs required.
Persistent Storage: Files saved via localStorage survive browser restarts.
Window Management: Drag, resize, minimize, maximize, close windows.
Virtual Filesystem: Create, read, update, delete files and folders.
Customizable Themes: Choose from pre-built themes or upload custom wallpapers.
Keyboard Shortcuts: Alt+Tab, Ctrl+W, Escape support.



FEATURES

Core Desktop Environment:

Top Panel: Start menu, Activities search, Clock, Calendar, Settings, Power button.
Start Menu: Application launcher with categories.
Taskbar: Active windows with minimize/maximize controls.
Notifications: Toast-style system notifications.
Activities Overlay: Global app and file search interface.
Window Manager: Cascade stacking, focus management, z-index control.

Pre-installed Applications:

Terminal (📟): Full CLI with command history, themed output.
File Manager (📁): Browse, open, and navigate virtual filesystem.
Notepad (📝): Multi-tab text editor with save functionality.
Calculator (🧮): Basic arithmetic with keyboard support.
Settings (⚙️): System configuration, wallpaper, theme options.
About (ℹ️): System information and neofetch-style stats.



ARCHITECTURE OVERVIEW

The system is organized into three main layers:
Layer 1: User Interface

Top Panel, Windows, Taskbar, Desktop Workspace

Layer 2: Core Layer

WindowManager: Handles window creation and positioning.
OS Kernel: Manages processes and app registration.
VFS (Virtual File System): Simulates storage.
Notifier: Handles system notifications.

Layer 3: Browser APIs

LocalStorage: Persists data on the user's device.
DOM API: Manipulates the page structure.
Performance API: Tracks boot times.

Data Flow:
User Click -> Event Listener -> WindowManager -> OS Launch App -> VFS Read/Write -> LocalStorage -> DOM Update -> Visual Feedback


FILE STRUCTURE

was-os/
├── index.html                    # Main entry point
├── LICENSE                       # MIT License text
├── README.md                     # This documentation file
├── .gitignore                    # Git ignore rules
├── css/
│   └── styles.css                # Complete stylesheet
└── js/
├── init.js                   # Boot sequence & initialization
├── utils/
│   └── notifier.js           # Notification system logic
├── core/
│   ├── os.js                 # Core OS kernel (process management)
│   ├── vfs.js                # Virtual File System implementation
│   └── wm.js                 # Window Manager logic
└── apps/
├── calculator.js         # Calculator application
├── filemanager.js        # File explorer application
├── notepad.js            # Text editor application
├── settings.js           # System settings application
└── terminal.js           # Command line interface application


CODE DOCUMENTATION

index.html — Entry Point
Purpose: The main HTML skeleton defining all UI containers.
Key Sections:

top-panel: Banner with Start button, clock.
start-menu: Hidden by default, toggled via WindowManager.
desktop-workspace: Container for all windows.
taskbar: Shows active running windows.
notification-area: Toast notification area.
activities-overlay: Global search interface.

Critical Load Order:

vfs.js (Filesystem foundation)
os.js (Core OS registration)
wm.js (Window manager)
notifier.js (Notification system)
App scripts (Calculator, Terminal, etc.)
init.js (Boot loader, runs last)

js/init.js — Boot Sequence
Purpose: Initializes the entire system after the DOM loads.
Steps:

Initialize VFS.
Initialize Core Components (WindowManager, Notifier) in parallel.
Setup UI Components (Clock, Calendar, Start Menu).
Restore User Settings (theme persistence from localStorage).
Calculate boot time.
Show welcome notification.

UI Event Bindings:

Start Button: Toggles start menu.
Activities Button: Opens global search overlay.
Settings Button: Launches Settings app.
Power Button: Triggers shutdown confirmation.
Window drag/resize: Managed internally by WindowManager.

js/core/os.js — Operating System Kernel
Purpose: Manages applications, processes, and lifecycle events.
Key Methods:

registerApp(): Registers an app with ID, title, icon, and init function.
launchApp(appId): Creates process and window, returns Process ID (PID).
closeProcess(pid): Cleans up process and destroys the window.
setupStartMenu(): Dynamically builds the start menu from the registry.
shutdown(): Gracefully closes all windows and fades out the screen.
getStats(): Returns system stats (open windows, installed apps, storage used).

App Registration Example:
OS.registerApp({
id: 'calculator',
title: 'Calculator',
icon: '🧮',
description: 'Basic calculator',
category: 'utilities',
singleInstance: false,
init: (pid, bodyId, state) => { /* ... / },
cleanup: (pid, state) => { / ... */ }
});
js/core/vfs.js — Virtual Filesystem
Purpose: Simulates a file system using browser localStorage.
Storage Location: localStorage.setItem('wasos_vfs_data', JSON.stringify(data))
Supported Operations:

list(dir): List contents of a directory.
read(filePath): Read file content.
write(filePath, content): Write or create a file.
delete(filePath): Remove a file.
exists(filePath): Check if a path exists.
isDirectory(path): Check if a path is a folder.
move(from, to): Move file between locations.
getAllFiles(dir): Recursively get all files.
getStorageUsed(): Returns bytes used in localStorage.
clear(): Wipe all VFS data.

Default Directory Structure:
{
documents: { 'welcome.txt': 'Welcome...', 'notes.txt': 'Quick notes...' },
pictures: {},
trash: {}
}
Note: Directories are created automatically when you write a file with a nested path (e.g., 'folder/file.txt').
js/core/wm.js — Window Manager
Purpose: Handles all window creation, positioning, focus, and manipulation.
Key Properties:

windows: Object storing all open windows by PID.
activeWindow: Currently focused window PID.
zIndexCounter: Z-index stack counter.
dragState/resizeState: Current mouse interaction states.

Core Methods:

createWindow(pid, title, appId, icon): Creates new DOM window element.
destroyWindow(pid): Removes window with animation.
focus(pid): Brings window to front, updates z-index.
minimize(pid): Hides window, marks as minimized.
restore(pid): Shows hidden window, brings to front.
maximize(pid): Expands to fill workspace (minus panels).
getWindowCount(): Returns number of open windows.
handleDrag(e): Mouse drag handler for moving windows.
handleResize(e): Mouse resize handler.

Keyboard Shortcuts:

Alt + Tab: Cycle through open windows.
Ctrl/Cmd + W: Close active window.
Escape: Close current window (if not maximized).

js/utils/notifier.js — Notification System
Purpose: Displays toast notifications for system events.
Usage Example:
Notifier.show({
title: 'System Ready',
message: 'Welcome to Was-OS v4.0!',
type: 'success',
duration: 4000
});
js/apps/calculator.js — Calculator Application
Features: Standard numeric keypad, keyboard input support, expression evaluation.
Keyboard Mapping: Numbers/Operators add to expression; Enter executes; Escape clears; Backspace deletes.
js/apps/filemanager.js — File Manager
Features: Grid view, navigation bar, up-level button, click-to-open.
Icon Assignment: Folders (📁), Documents (📄), Images (🖼️).
js/apps/notepad.js — Notepad Application
Features: Multiple tab support, unsaved changes indicator, save to VFS.
js/apps/settings.js — System Settings
Configuration Options: Wallpaper, Background Type, Terminal Theme.
Wallpaper Themes: Blue Gradient, Dark Gray, Nature Green, Purple Nebula, Custom Image (max 3MB).
js/apps/terminal.js — Terminal Application
Purpose: Full CLI experience inside the OS simulation.
Commands Implemented: help, ls, cd, cat, mkdir, rm, clear, about, date, whoami.
Features: Command history, light/dark theme toggle, uptime tracking.
css/styles.css — Stylesheet
CSS Variables: Defines colors for background, text, accents, success/warning/error states.
Animations: bgShift (background gradient), slideUp (start menu), slideIn (notifications).
Font Stack: Uses system fonts ('Segoe UI', system-ui, -apple-system) for zero external calls.


TERMINAL COMMANDS REFERENCE

Navigation:

user@wasos:~$ cd documents
user@wasos:~/documents$ cd ..
user@wasos:~$ ls

File Operations:

user@wasos:~/documents$ cat readme.txt
user@wasos:~$ mkdir projects
user@wasos:~$ rm old_file.txt

System Info:

user@wasos:~$ about
user@wasos:~$ date
user@wasos:~$ whoami

Utilities:

user@wasos:~$ help
user@wasos:~$ clear



INSTALLATION & USAGE

Option 1: Direct File Open (Recommended)

Download or Clone the repository.
Navigate to the folder in your file explorer.
Double-click index.html to open in your default browser.
Disconnect internet to verify offline functionality.

Option 2: Local Server

Using Python 3: python -m http.server 8080
Using Node.js: npx serve .
Using PHP: php -S localhost:8080
Then open: http://localhost:8080

Browser Requirements:

Chrome 90+
Firefox 88+
Safari 14+
Edge 90+

Required Features: ES2022 JavaScript support, localStorage API, Flexbox/Grid CSS, CSS Variables.


CUSTOMIZATION GUIDE

Adding a New Application:

Create a file in js/apps/myapp.js.
Register the app using OS.registerApp() with id, title, icon, init, and cleanup functions.
Add a script tag in index.html: <script src="js/apps/myapp.js"></script>
Refresh the page; the app will appear in the Start Menu.

Modifying Default Files:
Edit the initial data structure in vfs.js to change the default welcome.txt or notes.txt.
Changing Startup Apps:
Modify the load order in init.js or add/remove script tags in index.html.


TROUBLESHOOTING


Blank screen after reload: Clear your browser's localStorage and refresh the page.
Windows won't open: Check the console for "[WM] WindowManager not loaded" errors. Ensure script order is correct.
Files disappear: VFS uses localStorage. Check if your browser is set to block local storage or clear data on exit.
Themes not persisting: Verify the "wasos_background" key exists in localStorage.
Terminal commands fail: Ensure vfs.js is loaded before terminal.js in index.html.
Max windows reached (false error): Reload the page to reset the ghost window count.

Debug Mode:
Open browser DevTools (F12) -> Console. Look for logs prefixed with [BOOT], [OS], [WM], [VFS], [Notifier], or [Terminal].


CONTRIBUTING

Contributions are welcome!

Fork the repository.
Create a feature branch (git checkout -b feature/amazing-feature).
Commit your changes (git commit -m 'Add amazing feature').
Push to the branch (git push origin feature/amazing-feature).
Open a Pull Request.

Guidelines:

Keep functions modular and well-documented.
Use existing patterns (like OS.registerApp).
Test in multiple browsers.
Do not add external dependencies.
Avoid breaking existing functionality.



LICENSE

This project is licensed under the MIT License. See the LICENSE file for full details.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


ACKNOWLEDGMENTS


Built with vanilla JavaScript (no frameworks).
Inspired by traditional desktop operating systems.
Designed for educational purposes and offline productivity.

Made with ❤️ by Was-OS Project