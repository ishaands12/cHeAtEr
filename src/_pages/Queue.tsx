import React, { useState, useEffect, useRef, useCallback } from "react"
import { useQuery } from "react-query"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastVariant,
  ToastMessage
} from "../components/ui/toast"

interface QueueProps {
  setView: React.Dispatch<React.SetStateAction<"queue" | "solutions" | "debug" | "settings">>
}

interface UISettings {
  windowPosition?: { x: number; y: number }
  windowSize?: { width: number; height: number }
  theme?: "dark" | "light"
}

const Queue: React.FC<QueueProps> = ({ setView }) => {
  // ============ STATE MANAGEMENT ============
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "gemini"; text: string }>>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [attachedScreenshot, setAttachedScreenshot] = useState<{ path: string; preview: string } | null>(null)

  // ============ REFS ============
  const responseAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ============ API & DATA FETCHING ============
  const { data: screenshots = [], refetch } = useQuery<Array<{ path: string; preview: string }>, Error>(
    ["screenshots"],
    async () => {
      try {
        const existing = await window.electronAPI?.getScreenshots?.() || []
        return existing
      } catch (error) {
        console.error("Error loading screenshots:", error)
        showToast("Error", "Failed to load screenshots", "error")
        return []
      }
    },
    { staleTime: Infinity, cacheTime: Infinity, refetchOnWindowFocus: true, refetchOnMount: true }
  )

  // ============ UTILITIES ============
  const showToast = useCallback((title: string, description: string, variant: ToastVariant) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (responseAreaRef.current) {
      setTimeout(() => {
        const element = responseAreaRef.current
        if (element) {
          // Use scrollIntoView as a fallback
          const lastChild = element.lastElementChild
          if (lastChild) {
            lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' })
          } else {
            // Fallback to scrollTo
            element.scrollTop = element.scrollHeight
          }
        }
      }, 100)
    }
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied", "Message copied to clipboard", "neutral")
    }).catch(() => {
      showToast("Error", "Failed to copy to clipboard", "error")
    })
  }, [showToast])

  // ============ LOCALSTORAGE PERSISTENCE ============
  useEffect(() => {
    const saved = localStorage.getItem("cluely-ui-settings")
    if (saved) {
      try {
        JSON.parse(saved) // Validate JSON
      } catch (e) {
        console.error("Failed to parse UI settings:", e)
      }
    }
  }, [])

  // ============ UTILITY FUNCTIONS ============
  const detectAndFormatCodeQuestion = (text: string): string => {
    // Check if the message looks like it contains code or is asking about code
    const codeKeywords = [
      'how to', 'write', 'function', 'class', 'def ', 'const ', 'let ', 'var ',
      'import', 'export', 'return', 'if ', 'for ', 'while', 'code', 'program',
      'script', 'error', 'bug', 'debug', 'fix', 'implement', 'create'
    ]

    const hasCodeKeyword = codeKeywords.some(keyword => text.toLowerCase().includes(keyword))

    if (hasCodeKeyword && !text.includes('```')) {
      // Try to detect if there's actual code in the text
      const codePattern = /([a-zA-Z_]\w*\s*[=(]\s*|\w+\s*\(\s*|function\s+\w+)/
      if (codePattern.test(text)) {
        // Extract potential code parts and wrap them
        return text.replace(
          /([a-zA-Z_]\w*(?:\s*[=;]|\s*\(|.*?\))|function\s+\w+.*?{[\s\S]*?})/g,
          '```\n$1\n```'
        )
      }
    }

    return text
  }

  // ============ CHAT OPERATIONS ============
  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim() && !attachedScreenshot) return

    let userMessage = chatInput

    // Format coding questions
    userMessage = detectAndFormatCodeQuestion(userMessage)

    // Add screenshot context if attached
    if (attachedScreenshot) {
      userMessage = `[Screenshot attached]\n${userMessage || "Can you analyze this screenshot?"}`
    }

    setChatMessages((prev) => [...prev, { role: "user", text: userMessage }])
    setChatLoading(true)
    setChatInput("")

    try {
      // Prepare the payload with screenshot if available
      const payload: any = {
        message: userMessage,
        history: chatMessages
      }

      // If screenshot is attached, send it to the AI
      if (attachedScreenshot) {
        payload.screenshotPath = attachedScreenshot.path
      }

      const response = await window.electronAPI?.invoke?.(
        "gemini-chat",
        payload
      ) || "Error: Could not reach AI service"

      setChatMessages((prev) => [...prev, { role: "gemini", text: response }])

      // Clear the attached screenshot after sending
      setAttachedScreenshot(null)
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "gemini", text: `Error: ${String(err)}` }])
      showToast("Error", "Failed to get response", "error")
    } finally {
      setChatLoading(false)
      inputRef.current?.focus()
    }
  }, [chatInput, attachedScreenshot, chatMessages, showToast])

  // ============ KEYBOARD SHORTCUTS ============
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl+B: Toggle window visibility
      if (modifier && e.key === "b") {
        e.preventDefault()
        window.electronAPI?.invoke?.("toggle-window")
        return
      }

      // Cmd/Ctrl+H: Take screenshot
      if (modifier && e.key === "h") {
        e.preventDefault()
        window.electronAPI?.takeScreenshot?.()
        return
      }

      // Arrow keys: Move window (with Shift for larger steps)
      if (modifier && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        switch (e.key) {
          case "ArrowUp":
            window.electronAPI?.invoke?.("move-window", "up", step)
            break
          case "ArrowDown":
            window.electronAPI?.invoke?.("move-window", "down", step)
            break
          case "ArrowLeft":
            window.electronAPI?.invoke?.("move-window", "left", step)
            break
          case "ArrowRight":
            window.electronAPI?.invoke?.("move-window", "right", step)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleChatSend])

  // ============ AUTO-SCROLL ON NEW MESSAGES ============
  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, chatLoading, scrollToBottom])

  // ============ ELECTRON IPC LISTENERS ============
  useEffect(() => {
    const cleanup = [
      window.electronAPI?.onScreenshotTaken?.((data) => {
        console.log("[Queue] Screenshot taken event received:", data)
        setAttachedScreenshot(data)
        refetch()
        showToast("Screenshot Captured", "Screenshot attached to your next message", "neutral")
      }),
      window.electronAPI?.onResetView?.(() => {
        console.log("[Queue] Reset view event received")
        refetch()
      }),
      window.electronAPI?.onSolutionError?.((error: string) => {
        console.error("[Queue] Solution error event:", error)
        showToast("Processing Failed", "Error processing screenshots", "error")
        console.error("Processing error:", error)
      })
    ].filter(Boolean)

    return () => cleanup.forEach((fn) => fn?.())
  }, [refetch, showToast])

  // ============ RENDER - MAIN LAYOUT ============
  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast open={toastOpen} onOpenChange={setToastOpen} variant={toastMessage.variant} duration={3000}>
        <ToastTitle>{toastMessage.title}</ToastTitle>
        <ToastDescription>{toastMessage.description}</ToastDescription>
      </Toast>

      {/* ============ TOP BAR ============ */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="app-logo">cHeAtEr</div>
        </div>
        <div className="top-bar-right">
          <button
            className="icon-button"
            title="Settings"
            onClick={() => setView("settings")}
            onMouseDown={(e) => e.preventDefault()}
          >
            ⚙️
          </button>
          <button
            className="icon-button close"
            title="Hide window (⌘B)"
            onClick={() => window.electronAPI?.invoke?.("toggle-window")}
            onMouseDown={(e) => e.preventDefault()}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="main-content">
        {/* Response Area */}
        <div className="response-area" ref={responseAreaRef}>
          {chatMessages.length > 0 && (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={`response-card ${msg.role}`}>
                {msg.role === "gemini" && (
                  <div className="response-card-header">
                    <span className="response-card-role">AI</span>
                    <div className="response-card-actions">
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(msg.text)}
                        title="Copy response"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                <div className="response-content">
                  {msg.role === "gemini" ? (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading State */}
          {chatLoading && (
            <div className="response-card ai">
              <div className="response-card-header">
                <span className="response-card-role">AI</span>
              </div>
              <div className="loading-indicator">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ INPUT SECTION (Bottom) ============ */}
      <div className="input-section">
        {attachedScreenshot && (
          <div style={{
            padding: '8px 10px',
            background: 'rgba(96, 165, 250, 0.1)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'rgba(96, 165, 250, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>📸 Screenshot attached</span>
            <button
              onClick={() => setAttachedScreenshot(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(96, 165, 250, 0.9)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '0 4px'
              }}
              title="Remove screenshot"
            >
              ✕
            </button>
          </div>
        )}
        <div className="input-group">
          <input
            ref={inputRef}
            className="message-input"
            type="text"
            placeholder="What should I say? (Press Enter to send)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              // Send on Enter key
              if (e.key === "Enter") {
                e.preventDefault()
                handleChatSend()
              }
            }}
            disabled={chatLoading}
            autoFocus
          />
          <button
            className="action-button send-button"
            onClick={handleChatSend}
            disabled={chatLoading || (!chatInput.trim() && !attachedScreenshot)}
            title="Send (⏎)"
          >
            Send
          </button>
          <button
            className="action-button"
            onClick={() => window.electronAPI?.takeScreenshot?.()}
            title="Screenshot (⌘H)"
          >
            📸
          </button>
        </div>

      </div>
    </div>
  )
}

export default Queue
