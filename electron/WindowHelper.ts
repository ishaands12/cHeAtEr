
import { BrowserWindow, screen } from "electron"
import { AppState } from "main"
import path from "node:path"

const isDev = process.env.NODE_ENV === "development"

const startUrl = isDev
  ? "http://localhost:5180"
  : `file://${path.join(__dirname, "../dist/index.html")}`

export class WindowHelper {
  private mainWindow: BrowserWindow | null = null
  private isWindowVisible: boolean = false
  private windowPosition: { x: number; y: number } | null = null
  private windowSize: { width: number; height: number } | null = null
  private appState: AppState

  // Initialize with explicit number type and 0 value
  private screenWidth: number = 0
  private screenHeight: number = 0
  private step: number = 0
  private currentX: number = 0
  private currentY: number = 0

  constructor(appState: AppState) {
    this.appState = appState
  }

  /**
   * Set macOS-specific screen capture protection using native APIs
   * This makes the window invisible in Zoom, Teams, and other screen sharing apps
   *
   * NOTE: setContentProtection(true) provides basic protection but Zoom and some
   * other apps can still capture the window. For complete protection, users would
   * need a native module that sets NSWindowSharingType to NSWindowSharingNone.
   */
  private setMacOSScreenCaptureProtection(): void {
    if (!this.mainWindow || process.platform !== "darwin") return

    // setContentProtection provides some level of protection
    // It works well with macOS native screen recording (Cmd+Shift+5)
    // but may not work with all screen sharing apps like Zoom
    console.log('macOS content protection enabled (basic level)')
    console.log('Note: Zoom and some screen sharing apps may still capture this window')
    console.log('For complete protection, a native macOS module would be required')
  }

  public setWindowDimensions(width: number, height: number): void {
    // DISABLED: Auto-sizing causes window expansion glitch with aspect ratio
    // Window size is now fixed by user resizing only
    return
  }

  public createWindow(): void {
    console.log("=== CREATE WINDOW CALLED ===")
    if (this.mainWindow !== null) {
      console.log("Window already exists, skipping creation")
      return
    }

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    this.screenWidth = workArea.width
    this.screenHeight = workArea.height
    console.log("Screen dimensions:", this.screenWidth, "x", this.screenHeight)


    const windowSettings: Electron.BrowserWindowConstructorOptions = {
      width: 360,
      height: 202,
      minWidth: 360,
      minHeight: 200,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
        offscreen: false
      },
      show: true,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      fullscreenable: false,
      hasShadow: false,
      backgroundColor: "#00000000",
      acceptFirstMouse: true,
      resizable: true,
      movable: true,
      x: 100,
      y: 100,
      skipTaskbar: true,
      ...(process.platform === 'darwin' ? { type: 'panel' } : {})
    }

    this.mainWindow = new BrowserWindow(windowSettings)
    console.log("BrowserWindow created successfully")
    // Aspect ratio lock removed - window can be resized freely
    // this.mainWindow.webContents.openDevTools()

    // Screen capture protection - window remains visible to you but hidden in screen shares/recordings
    this.mainWindow.setContentProtection(true)
    console.log("Content protection enabled")

    if (process.platform === "darwin") {
      this.mainWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
      })
      this.mainWindow.setHiddenInMissionControl(true)
      this.mainWindow.setAlwaysOnTop(true, "floating")

      // Enhanced macOS screen sharing protection using native APIs
      this.setMacOSScreenCaptureProtection()

      // Prevent the window from ever taking focus when moved or interacted with
      // This keeps the underlying app focused even when the window is dragged
      try {
        // @ts-ignore - accessing internal getNativeWindowHandle for advanced control
        const nativeHandle = this.mainWindow.getNativeWindowHandle()
        // Setting window level to floating ensures it doesn't steal focus
        this.mainWindow.setAlwaysOnTop(true, "pop-up-menu", 1)
      } catch (e) {
        console.log("Could not set advanced window level:", e)
      }
    }
    if (process.platform === "linux") {
      // Linux-specific optimizations for better compatibility
      if (this.mainWindow.setHasShadow) {
        this.mainWindow.setHasShadow(false)
      }
    } 
    this.mainWindow.setSkipTaskbar(true)
    this.mainWindow.setAlwaysOnTop(true)

    console.log("Loading URL:", startUrl)
    this.mainWindow.loadURL(startUrl).then(() => {
      console.log("URL loaded successfully")
    }).catch((err) => {
      console.error("Failed to load URL:", err)
      console.error("URL was:", startUrl)
    })

    // Prevent focus events from being triggered by window interactions
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      // Allow keyboard input for text fields but prevent window-level focus events
      if (input.type === 'keyDown' || input.type === 'keyUp' || input.type === 'char') {
        // Allow keyboard events for typing
        return
      }
    })

    // Show window after loading URL and center it
    this.mainWindow.once('ready-to-show', () => {
      if (this.mainWindow) {
        console.log("=== WINDOW READY TO SHOW ===")
        // Center the window first
        this.centerWindow()
        this.mainWindow.showInactive() // Show without stealing focus
        this.mainWindow.setAlwaysOnTop(true)
        console.log("Window is now visible and centered (non-focus mode)")
        console.log("Window bounds:", this.mainWindow.getBounds())
        console.log("Window visible:", this.mainWindow.isVisible())
        console.log("Window opacity:", this.mainWindow.getOpacity())
      }
    })

    const bounds = this.mainWindow.getBounds()
    this.windowPosition = { x: bounds.x, y: bounds.y }
    this.windowSize = { width: bounds.width, height: bounds.height }
    this.currentX = bounds.x
    this.currentY = bounds.y

    this.setupWindowListeners()
    this.isWindowVisible = true
  }

  private setupWindowListeners(): void {
    if (!this.mainWindow) return

    this.mainWindow.on("move", () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds()
        this.windowPosition = { x: bounds.x, y: bounds.y }
        this.currentX = bounds.x
        this.currentY = bounds.y
      }
    })

    this.mainWindow.on("resize", () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds()
        this.windowSize = { width: bounds.width, height: bounds.height }
      }
    })

    this.mainWindow.on("closed", () => {
      this.mainWindow = null
      this.isWindowVisible = false
      this.windowPosition = null
      this.windowSize = null
    })
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public isVisible(): boolean {
    return this.isWindowVisible
  }

  public hideMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      console.warn("Main window does not exist or is destroyed.")
      return
    }

    const bounds = this.mainWindow.getBounds()
    this.windowPosition = { x: bounds.x, y: bounds.y }
    this.windowSize = { width: bounds.width, height: bounds.height }
    this.mainWindow.hide()
    this.isWindowVisible = false
  }

  public showMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      console.warn("Main window does not exist or is destroyed.")
      return
    }

    if (this.windowPosition && this.windowSize) {
      this.mainWindow.setBounds({
        x: this.windowPosition.x,
        y: this.windowPosition.y,
        width: this.windowSize.width,
        height: this.windowSize.height
      })
    }

    this.mainWindow.showInactive()

    this.isWindowVisible = true
  }

  public toggleMainWindow(): void {
    if (this.isWindowVisible) {
      this.hideMainWindow()
    } else {
      this.showMainWindow()
    }
  }

  private centerWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return
    }

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    
    // Get current window size or use defaults
    const windowBounds = this.mainWindow.getBounds()
    const windowWidth = windowBounds.width || 400
    const windowHeight = windowBounds.height || 600
    
    // Calculate center position
    const centerX = Math.floor((workArea.width - windowWidth) / 2)
    const centerY = Math.floor((workArea.height - windowHeight) / 2)
    
    // Set window position
    this.mainWindow.setBounds({
      x: centerX,
      y: centerY,
      width: windowWidth,
      height: windowHeight
    })
    
    // Update internal state
    this.windowPosition = { x: centerX, y: centerY }
    this.windowSize = { width: windowWidth, height: windowHeight }
    this.currentX = centerX
    this.currentY = centerY
  }

  public centerAndShowWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      console.warn("Main window does not exist or is destroyed.")
      return
    }

    this.centerWindow()
    this.mainWindow.showInactive() // Show without stealing focus
    this.mainWindow.setAlwaysOnTop(true)

    this.isWindowVisible = true

    console.log(`Window centered and shown (non-focus mode)`)
  }

  // New methods for window movement
  public moveWindowRight(): void {
    if (!this.mainWindow) return

    const windowWidth = this.windowSize?.width || 0
    const windowHeight = this.windowSize?.height || 0
    const halfWidth = windowWidth / 2

    // Ensure currentX and currentY are numbers
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentX = Math.min(
      this.screenWidth - halfWidth,
      this.currentX + this.step
    )

    // Use setBounds with animate: false to avoid focus stealing
    this.mainWindow.setBounds({
      x: Math.round(this.currentX),
      y: Math.round(this.currentY),
      width: windowWidth,
      height: windowHeight
    }, false) // false = no animation, reduces focus events
  }

  public moveWindowLeft(): void {
    if (!this.mainWindow) return

    const windowWidth = this.windowSize?.width || 0
    const windowHeight = this.windowSize?.height || 0
    const halfWidth = windowWidth / 2

    // Ensure currentX and currentY are numbers
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentX = Math.max(-halfWidth, this.currentX - this.step)

    this.mainWindow.setBounds({
      x: Math.round(this.currentX),
      y: Math.round(this.currentY),
      width: windowWidth,
      height: windowHeight
    }, false)
  }

  public moveWindowDown(): void {
    if (!this.mainWindow) return

    const windowWidth = this.windowSize?.width || 0
    const windowHeight = this.windowSize?.height || 0
    const halfHeight = windowHeight / 2

    // Ensure currentX and currentY are numbers
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentY = Math.min(
      this.screenHeight - halfHeight,
      this.currentY + this.step
    )

    this.mainWindow.setBounds({
      x: Math.round(this.currentX),
      y: Math.round(this.currentY),
      width: windowWidth,
      height: windowHeight
    }, false)
  }

  public moveWindowUp(): void {
    if (!this.mainWindow) return

    const windowWidth = this.windowSize?.width || 0
    const windowHeight = this.windowSize?.height || 0
    const halfHeight = windowHeight / 2

    // Ensure currentX and currentY are numbers
    this.currentX = Number(this.currentX) || 0
    this.currentY = Number(this.currentY) || 0

    this.currentY = Math.max(-halfHeight, this.currentY - this.step)

    this.mainWindow.setBounds({
      x: Math.round(this.currentX),
      y: Math.round(this.currentY),
      width: windowWidth,
      height: windowHeight
    }, false)
  }

  // Corner snap methods
  public snapToTopLeft(): void {
    if (!this.mainWindow) return

    const windowWidth = this.windowSize?.width || 360
    const windowHeight = this.windowSize?.height || 202

    this.currentX = 0
    this.currentY = 0

    this.mainWindow.setBounds({
      x: 0,
      y: 0,
      width: windowWidth,
      height: windowHeight
    }, false)

    this.windowPosition = { x: 0, y: 0 }
    console.log("Window snapped to top-left corner")
  }

  public snapToTopRight(): void {
    if (!this.mainWindow) return

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    const windowWidth = this.windowSize?.width || 360
    const windowHeight = this.windowSize?.height || 202

    this.currentX = workArea.width - windowWidth
    this.currentY = 0

    this.mainWindow.setBounds({
      x: this.currentX,
      y: 0,
      width: windowWidth,
      height: windowHeight
    }, false)

    this.windowPosition = { x: this.currentX, y: 0 }
    console.log("Window snapped to top-right corner")
  }

  public snapToBottomLeft(): void {
    if (!this.mainWindow) return

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    const windowWidth = this.windowSize?.width || 360
    const windowHeight = this.windowSize?.height || 202

    this.currentX = 0
    this.currentY = workArea.height - windowHeight

    this.mainWindow.setBounds({
      x: 0,
      y: this.currentY,
      width: windowWidth,
      height: windowHeight
    }, false)

    this.windowPosition = { x: 0, y: this.currentY }
    console.log("Window snapped to bottom-left corner")
  }

  public snapToBottomRight(): void {
    if (!this.mainWindow) return

    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    const windowWidth = this.windowSize?.width || 360
    const windowHeight = this.windowSize?.height || 202

    this.currentX = workArea.width - windowWidth
    this.currentY = workArea.height - windowHeight

    this.mainWindow.setBounds({
      x: this.currentX,
      y: this.currentY,
      width: windowWidth,
      height: windowHeight
    }, false)

    this.windowPosition = { x: this.currentX, y: this.currentY }
    console.log("Window snapped to bottom-right corner")
  }

  // Opacity control
  public setWindowOpacity(opacity: number): void {
    if (!this.mainWindow) return

    // Clamp opacity between 0.1 and 1.0
    const clampedOpacity = Math.max(0.1, Math.min(1.0, opacity))
    this.mainWindow.setOpacity(clampedOpacity)
    console.log(`Window opacity set to ${clampedOpacity}`)
  }

  public getWindowOpacity(): number {
    if (!this.mainWindow) return 1.0
    return this.mainWindow.getOpacity()
  }
}
