# Was-Operating System v5.0
License: MIT | Web-Based: Browser Only | Language: JavaScript ES2022
A fully functional, offline-capable web-based operating system simulation built with pure HTML, CSS, and JavaScript. No external dependencies required.


## ABOUT

Was-OS v5.0 is a lightweight web-based operating system simulation that runs entirely in your browser. It provides a desktop-like environment with window management, a virtual filesystem, and multiple applications—all without requiring any external dependencies or internet connection.
Built with pure HTML, CSS, and JavaScript, Was-OS demonstrates how modern web technologies can replicate traditional desktop computing experiences while remaining 100% self-contained.

## Key Highlights:

**Zero External Dependencies:** 100% self-contained, no CDN or APIs required.

**Persistent Storage:** Files saved via localStorage survive browser restarts.

**Window Management:** Drag, resize, minimize, maximize, close windows.

**Virtual Filesystem:** Create, read, update, delete files and folders.

**Customizable Themes:** Choose from pre-built themes or upload custom wallpapers.

**Keyboard Shortcuts:** Alt+Tab, Ctrl+W, Escape support.



## FEATURES

**Core Desktop Environment:**

**Top Panel:** Start menu, Activities search, Clock, Calendar, Settings, Power button.

**Start Menu:** Application launcher with categories.

**Taskbar:** Active windows with minimize/maximize controls.

**Notifications:** Toast-style system notifications.

**Activities Overlay:** Global app and file search interface.

**Window Manager:** Cascade stacking, focus management, z-index control.

## Pre-installed Applications:


**Terminal (📟):** Full CLI with command history, themed output.

**File Manager (📁):** Browse, open, and navigate virtual filesystem.

**Notepad (📝):** Multi-tab text editor with save functionality.

**Calculator (🧮):** Basic arithmetic with keyboard support.

**Settings (⚙️):** System configuration, wallpaper, theme options.

**Notes:** Notes creation.

**Paint:** An basic painting tool.

**Games:** Sample games (Currently under developemnt)

**Spreadsheet:** An spreadsheet calculating app.

**and more, for latest news see the release notes.**



## TERMINAL COMMANDS REFERENCE

### Navigation:
```

user@wasos:~$ cd documents


user@wasos:~/documents$ cd ..


user@wasos:~$ ls
```
### File Operations:
```
user@wasos:~/documents$ cat readme.txt


user@wasos:~$ mkdir projects


user@wasos:~$ rm old_file.txt
```
### System Info:
```
user@wasos:~$ about


user@wasos:~$ date


user@wasos:~$ whoami
```
### Utilities:
```
user@wasos:~$ help


user@wasos:~$ clear
```



## Browser Requirements:

Any web browser ( but with latest update)

**Required Features:** ES2022 JavaScript support, localStorage API, Flexbox/Grid CSS, CSS Variables.


## CUSTOMIZATION GUIDE
## CUSTOMIZATION GUIDE

## Adding a New Application:

Create a file in js/apps/myapp.js.


Register the app using OS.registerApp() with id, title, icon, init, and cleanup functions.


Add a script tag in index.html: <script src="js/apps/myapp.js"></script>


Refresh the page; the app will appear in the Start Menu.




## CONTRIBUTING

**Contributions are welcome!**


## LICENSE

**This project is under MIT License. See the License section from above or open the named file to see it.**


<h1>Made with ❤️ by Was-OS Project</h1>
