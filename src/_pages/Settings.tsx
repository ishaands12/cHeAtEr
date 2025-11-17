import React, { useState, useEffect } from "react"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastVariant,
  ToastMessage
} from "../components/ui/toast"

interface SettingsProps {
  setView: React.Dispatch<React.SetStateAction<"queue" | "solutions" | "debug" | "settings">>
}

const Settings: React.FC<SettingsProps> = ({ setView }) => {
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [provider, setProvider] = useState<"azure" | "gemini">("gemini")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [azureApiKey, setAzureApiKey] = useState("")
  const [azureEndpoint, setAzureEndpoint] = useState("")
  const [azureDeployment, setAzureDeployment] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("llm-settings")
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setProvider(settings.provider || "gemini")
        setGeminiApiKey(settings.geminiApiKey || "")
        setAzureApiKey(settings.azureApiKey || "")
        setAzureEndpoint(settings.azureEndpoint || "")
        setAzureDeployment(settings.azureDeployment || "")
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }
  }, [])

  const showToast = (title: string, description: string, variant: ToastVariant) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Validate inputs
      if (provider === "gemini" && !geminiApiKey.trim()) {
        showToast("Error", "Please enter your Gemini API key", "error")
        setIsSaving(false)
        return
      }

      if (provider === "azure") {
        if (!azureApiKey.trim() || !azureEndpoint.trim() || !azureDeployment.trim()) {
          showToast("Error", "Please fill in all Azure fields", "error")
          setIsSaving(false)
          return
        }
      }

      // Save to localStorage
      const settings = {
        provider,
        geminiApiKey: provider === "gemini" ? geminiApiKey : "",
        azureApiKey: provider === "azure" ? azureApiKey : "",
        azureEndpoint: provider === "azure" ? azureEndpoint : "",
        azureDeployment: provider === "azure" ? azureDeployment : ""
      }

      localStorage.setItem("llm-settings", JSON.stringify(settings))

      // Send to main process to update LLMHelper
      const response = await window.electronAPI?.invoke?.(
        "update-llm-settings",
        settings
      )

      if (response?.success) {
        showToast("Success", "Settings saved and LLM provider updated", "neutral")
        // Go back to queue after successful save
        setTimeout(() => {
          setView("queue")
        }, 1500)
      } else {
        showToast("Error", response?.error || "Failed to update LLM provider", "error")
      }
    } catch (error) {
      showToast("Error", `Failed to save settings: ${String(error)}`, "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app-container">
      <Toast open={toastOpen} onOpenChange={setToastOpen} variant={toastMessage.variant} duration={3000}>
        <ToastTitle>{toastMessage.title}</ToastTitle>
        <ToastDescription>{toastMessage.description}</ToastDescription>
      </Toast>

      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="app-logo">Settings</div>
        </div>
        <div className="top-bar-right">
          <button
            className="icon-button close"
            title="Back to chat"
            onClick={() => setView("queue")}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ padding: "20px", overflowY: "auto" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Provider Selection */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "12px", color: "rgba(255, 255, 255, 0.9)" }}>
              AI Provider
            </h2>
            <div style={{ display: "flex", gap: "12px" }}>
              <label style={{ flex: 1, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === "gemini"}
                  onChange={(e) => setProvider(e.target.value as "gemini")}
                  style={{ marginRight: "8px" }}
                  disabled={isSaving}
                />
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Google Gemini</span>
                {provider === "gemini" && !geminiApiKey.trim() && (
                  <div style={{ fontSize: "11px", color: "rgba(239, 68, 68, 0.9)", marginTop: "4px" }}>
                    ⚠ API key required
                  </div>
                )}
              </label>
              <label style={{ flex: 1, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="provider"
                  value="azure"
                  checked={provider === "azure"}
                  onChange={(e) => setProvider(e.target.value as "azure")}
                  style={{ marginRight: "8px" }}
                  disabled={isSaving}
                />
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Azure OpenAI</span>
                {provider === "azure" && (!azureApiKey.trim() || !azureEndpoint.trim() || !azureDeployment.trim()) && (
                  <div style={{ fontSize: "11px", color: "rgba(239, 68, 68, 0.9)", marginTop: "4px" }}>
                    ⚠ All fields required
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Gemini Settings */}
          {provider === "gemini" && (
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "rgba(255, 255, 255, 0.9)" }}>
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  boxSizing: "border-box"
                }}
              />
              <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "8px" }}>
                Get your free API key from{" "}
                <a href="https://makersuite.google.com/app/apikey" style={{ color: "rgba(96, 165, 250, 0.9)" }}>
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Azure Settings */}
          {provider === "azure" && (
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "rgba(255, 255, 255, 0.9)" }}>
                Azure API Key
              </label>
              <input
                type="password"
                value={azureApiKey}
                onChange={(e) => setAzureApiKey(e.target.value)}
                placeholder="Enter your Azure API key"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  marginBottom: "12px"
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "rgba(255, 255, 255, 0.9)" }}>
                Azure Endpoint
              </label>
              <input
                type="text"
                value={azureEndpoint}
                onChange={(e) => setAzureEndpoint(e.target.value)}
                placeholder="https://your-resource.openai.azure.com/"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  marginBottom: "12px"
                }}
              />

              <label style={{ display: "block", marginBottom: "8px", color: "rgba(255, 255, 255, 0.9)" }}>
                Deployment Name
              </label>
              <input
                type="text"
                value={azureDeployment}
                onChange={(e) => setAzureDeployment(e.target.value)}
                placeholder="e.g., gpt-4o, gpt-5-mini"
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || (provider === "gemini" && !geminiApiKey.trim()) || (provider === "azure" && (!azureApiKey.trim() || !azureEndpoint.trim() || !azureDeployment.trim()))}
            style={{
              width: "100%",
              padding: "10px",
              background: (isSaving || (provider === "gemini" && !geminiApiKey.trim()) || (provider === "azure" && (!azureApiKey.trim() || !azureEndpoint.trim() || !azureDeployment.trim())))
                ? "rgba(96, 165, 250, 0.3)"
                : "linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.5))",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              borderRadius: "6px",
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "12px",
              fontWeight: "600",
              cursor: ((isSaving || (provider === "gemini" && !geminiApiKey.trim()) || (provider === "azure" && (!azureApiKey.trim() || !azureEndpoint.trim() || !azureDeployment.trim())))) ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
