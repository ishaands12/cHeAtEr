import { AzureOpenAI } from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"

interface OllamaResponse {
  response: string
  done: boolean
}

export class LLMHelper {
  private azureClient: AzureOpenAI | null = null
  private geminiClient: GoogleGenerativeAI | null = null
  private readonly systemPrompt = `You are Wingman AI, a helpful assistant for coding and technical questions. Your responses should be:
- Direct and practical
- Concise, without unnecessary elaboration
- Code-focused when relevant
- Straight to the point

For code questions: Provide clean, working code with brief explanations.
Never ask users to upload images or provide canned responses about images.
Always respond to the user's actual question directly.`
  private useOllama: boolean = false
  private useGemini: boolean = false
  private ollamaModel: string = "llama3.2"
  private ollamaUrl: string = "http://localhost:11434"
  private azureModelName: string = "gpt-5-mini"
  private currentProvider: "azure" | "gemini" | "ollama" = "azure"

  constructor(useOllama: boolean = false, ollamaModel?: string, ollamaUrl?: string) {
    this.useOllama = useOllama

    if (useOllama) {
      this.ollamaUrl = ollamaUrl || "http://localhost:11434"
      this.ollamaModel = ollamaModel || "gemma:latest" // Default fallback
      console.log(`[LLMHelper] Using Ollama with model: ${this.ollamaModel}`)
      this.currentProvider = "ollama"

      // Auto-detect and use first available model if specified model doesn't exist
      this.initializeOllamaModel()
    } else {
      console.log("[LLMHelper] Initialized without provider. Please configure Gemini or Azure in Settings.")
    }
  }

  public async configureProvider(settings: {
    provider: "azure" | "gemini"
    geminiApiKey?: string
    azureApiKey?: string
    azureEndpoint?: string
    azureDeployment?: string
  }): Promise<boolean> {
    try {
      if (settings.provider === "gemini") {
        if (!settings.geminiApiKey || !settings.geminiApiKey.trim()) {
          throw new Error("Gemini API key is required")
        }
        this.geminiClient = new GoogleGenerativeAI(settings.geminiApiKey)
        this.useGemini = true
        this.useOllama = false
        this.currentProvider = "gemini"
        console.log("[LLMHelper] Configured Gemini API")
        return true
      } else if (settings.provider === "azure") {
        if (!settings.azureApiKey || !settings.azureApiKey.trim() ||
            !settings.azureEndpoint || !settings.azureEndpoint.trim() ||
            !settings.azureDeployment || !settings.azureDeployment.trim()) {
          throw new Error("Missing Azure configuration")
        }
        this.azureClient = new AzureOpenAI({
          apiKey: settings.azureApiKey,
          endpoint: settings.azureEndpoint,
          apiVersion: "2024-08-01-preview"
        })
        this.azureModelName = settings.azureDeployment
        this.useGemini = false
        this.useOllama = false
        this.currentProvider = "azure"
        console.log(`[LLMHelper] Configured Azure OpenAI with deployment: ${settings.azureDeployment}`)
        return true
      }
      throw new Error("Invalid provider specified")
    } catch (error) {
      console.error("[LLMHelper] Failed to configure provider:", error)
      return false
    }
  }

  private async fileToBase64(imagePath: string): Promise<string> {
    const imageData = await fs.promises.readFile(imagePath)
    return imageData.toString("base64")
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    // Remove any leading/trailing whitespace
    text = text.trim();
    return text;
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data: OllamaResponse = await response.json()
      return data.response
    } catch (error) {
      console.error("[LLMHelper] Error calling Ollama:", error)
      throw new Error(`Failed to connect to Ollama: ${error.message}. Make sure Ollama is running on ${this.ollamaUrl}`)
    }
  }

  private async checkOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }

  private async initializeOllamaModel(): Promise<void> {
    try {
      const availableModels = await this.getOllamaModels()
      if (availableModels.length === 0) {
        console.warn("[LLMHelper] No Ollama models found")
        return
      }

      // Check if current model exists, if not use the first available
      if (!availableModels.includes(this.ollamaModel)) {
        this.ollamaModel = availableModels[0]
        console.log(`[LLMHelper] Auto-selected first available model: ${this.ollamaModel}`)
      }

      // Test the selected model works
      const testResult = await this.callOllama("Hello")
      console.log(`[LLMHelper] Successfully initialized with model: ${this.ollamaModel}`)
    } catch (error) {
      console.error(`[LLMHelper] Failed to initialize Ollama model: ${error.message}`)
      // Try to use first available model as fallback
      try {
        const models = await this.getOllamaModels()
        if (models.length > 0) {
          this.ollamaModel = models[0]
          console.log(`[LLMHelper] Fallback to: ${this.ollamaModel}`)
        }
      } catch (fallbackError) {
        console.error(`[LLMHelper] Fallback also failed: ${fallbackError.message}`)
      }
    }
  }

  public async extractProblemFromImages(imagePaths: string[]) {
    try {
      const imageContents = await Promise.all(
        imagePaths.map(async (path) => ({
          type: "image_url" as const,
          image_url: {
            url: `data:image/png;base64,${await this.fileToBase64(path)}`
          }
        }))
      )

      const prompt = `${this.systemPrompt}\n\nYou are a wingman. Please analyze these images and extract the following information in JSON format:\n{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`

      const response = await this.azureClient!.chat.completions.create({
        model: this.azureModelName,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...imageContents
            ]
          }
        ],
        max_completion_tokens: 2000
      })

      const text = this.cleanJsonResponse(response.choices[0].message.content || "")
      return JSON.parse(text)
    } catch (error) {
      console.error("Error extracting problem from images:", error)
      throw error
    }
  }

  public async generateSolution(problemInfo: any) {
    const prompt = `${this.systemPrompt}\n\nGiven this problem or situation:\n${JSON.stringify(problemInfo, null, 2)}\n\nPlease provide your response in the following JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`

    console.log("[LLMHelper] Calling Azure OpenAI for solution...");
    try {
      const response = await this.azureClient!.chat.completions.create({
        model: this.azureModelName,
        messages: [
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 2000
      })
      console.log("[LLMHelper] Azure OpenAI returned result.");
      const text = this.cleanJsonResponse(response.choices[0].message.content || "")
      const parsed = JSON.parse(text)
      console.log("[LLMHelper] Parsed LLM response:", parsed)
      return parsed
    } catch (error) {
      console.error("[LLMHelper] Error in generateSolution:", error);
      throw error;
    }
  }

  public async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]) {
    try {
      const imageContents = await Promise.all(
        debugImagePaths.map(async (path) => ({
          type: "image_url" as const,
          image_url: {
            url: `data:image/png;base64,${await this.fileToBase64(path)}`
          }
        }))
      )

      const prompt = `${this.systemPrompt}\n\nYou are a wingman. Given:\n1. The original problem or situation: ${JSON.stringify(problemInfo, null, 2)}\n2. The current response or approach: ${currentCode}\n3. The debug information in the provided images\n\nPlease analyze the debug information and provide feedback in this JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`

      const response = await this.azureClient!.chat.completions.create({
        model: this.azureModelName,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...imageContents
            ]
          }
        ],
        max_completion_tokens: 2000
      })

      const text = this.cleanJsonResponse(response.choices[0].message.content || "")
      const parsed = JSON.parse(text)
      console.log("[LLMHelper] Parsed debug LLM response:", parsed)
      return parsed
    } catch (error) {
      console.error("Error debugging solution with images:", error)
      throw error
    }
  }

  public async analyzeAudioFile(audioPath: string): Promise<{ text: string; timestamp: number }> {
    // Note: Azure OpenAI doesn't support audio input directly
    // This would need to be implemented with a speech-to-text service first
    return {
      text: "Audio analysis is not currently supported with Azure OpenAI. Please use text-based input or switch to a provider that supports audio.",
      timestamp: Date.now()
    };
  }

  public async analyzeAudioFromBase64(data: string, mimeType: string): Promise<{ text: string; timestamp: number }> {
    // Note: Azure OpenAI doesn't support audio input directly
    // This would need to be implemented with a speech-to-text service first
    return {
      text: "Audio analysis is not currently supported with Azure OpenAI. Please use text-based input or switch to a provider that supports audio.",
      timestamp: Date.now()
    };
  }

  public async analyzeImageFile(imagePath: string) {
    try {
      const base64Image = await this.fileToBase64(imagePath);
      const prompt = `${this.systemPrompt}\n\nAnalyze this screenshot and look for any visible questions, problems, or coding challenges. If you find any questions:
1. Provide a clear, concise answer to the question
2. If it's a coding problem, provide working code with explanations
3. Include examples or step-by-step solutions when relevant

If no clear question is visible, briefly describe what you see and suggest how you can help. Be direct and practical in your response.`;

      const response = await this.azureClient!.chat.completions.create({
        model: this.azureModelName,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_completion_tokens: 1500
      })

      const text = response.choices[0].message.content || "";
      return { text, timestamp: Date.now() };
    } catch (error) {
      console.error("Error analyzing image file:", error);
      throw error;
    }
  }

  public async chatWithGemini(message: string, history?: Array<{role: string; text: string}>, screenshotPath?: string): Promise<string> {
    try {
      if (this.useGemini) {
        if (!this.geminiClient) {
          throw new Error("Gemini API is not configured. Please configure your API key in Settings.");
        }

        // Try different Gemini models - prefer lightweight models first
        const modelCandidates = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
        let model = null;
        let lastError = null;

        for (const modelName of modelCandidates) {
          try {
            model = this.geminiClient.getGenerativeModel({ model: modelName });
            console.log(`[LLMHelper] Using Gemini model: ${modelName}`);
            break;
          } catch (error) {
            lastError = error;
            console.warn(`[LLMHelper] Model ${modelName} not available, trying next...`);
          }
        }

        if (!model) {
          throw lastError || new Error("No compatible Gemini model found");
        }

        // Build conversation history
        const chatHistory = history?.map(msg => ({
          role: msg.role === "gemini" ? "model" : "user",
          parts: [{ text: msg.text }]
        })) || [];

        // Create chat session
        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        });

        // Prepare message parts
        let messageParts: any[] = [{ text: message }];

        // Add screenshot if provided
        if (screenshotPath) {
          try {
            const imageData = await this.fileToBase64(screenshotPath);
            console.log("[LLMHelper] Adding screenshot to Gemini request");
            messageParts.unshift({
              inlineData: {
                mimeType: "image/png",
                data: imageData
              }
            });
          } catch (error) {
            console.error("[LLMHelper] Error processing screenshot for Gemini:", error);
            // Continue without image
          }
        }

        // Send message with optional image
        console.log("[LLMHelper] Sending request to Gemini...");
        const result = await chat.sendMessage(messageParts);
        const response = await result.response;
        console.log("[LLMHelper] Gemini response received successfully");
        return response.text() || "No response";
      } else if (this.useOllama) {
        // Ollama doesn't support images, just use the text
        return this.callOllama(message);
      } else if (this.azureClient) {
        // Build conversation history
        const messages: Array<any> = [
          { role: "system", content: this.systemPrompt }
        ];

        // Add conversation history if provided
        if (history && history.length > 0) {
          history.forEach(msg => {
            messages.push({
              role: msg.role === "gemini" ? "assistant" : "user",
              content: msg.text
            });
          });
        }

        // Add current message (vision not supported by gpt-5-mini)
        if (screenshotPath) {
          console.log(`[LLMHelper] Screenshot path received: ${screenshotPath}`);
          console.log("[LLMHelper] Note: gpt-5-mini doesn't support vision. Please describe the screenshot in your message.");
          messages.push({ role: "user", content: message || "I've taken a screenshot. Please help me." });
        } else {
          messages.push({ role: "user", content: message });
        }

        console.log("[LLMHelper] Sending request to Azure OpenAI...");
        console.log("[LLMHelper] Model:", this.azureModelName);
        console.log("[LLMHelper] Message count:", messages.length);
        console.log("[LLMHelper] Last message has image:",
          Array.isArray(messages[messages.length - 1]?.content) &&
          messages[messages.length - 1]?.content.some((c: any) => c.type === "image_url")
        );

        const response = await this.azureClient.chat.completions.create({
          model: this.azureModelName,
          messages: messages,
          max_completion_tokens: 2000
        })

        console.log("[LLMHelper] Response received successfully");
        return response.choices[0].message.content || "";
      } else {
        throw new Error("No LLM provider configured");
      }
    } catch (error) {
      console.error("[LLMHelper] Error in chatWithGemini:", error);
      throw error;
    }
  }

  public async chat(message: string): Promise<string> {
    return this.chatWithGemini(message);
  }

  public isUsingOllama(): boolean {
    return this.useOllama;
  }

  public async getOllamaModels(): Promise<string[]> {
    if (!this.useOllama) return [];
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error("[LLMHelper] Error fetching Ollama models:", error);
      return [];
    }
  }

  public getCurrentProvider(): "ollama" | "gemini" {
    return this.useOllama ? "ollama" : "gemini";
  }

  public getCurrentModel(): string {
    return this.useOllama ? this.ollamaModel : this.azureModelName;
  }

  public async switchToOllama(model?: string, url?: string): Promise<void> {
    this.useOllama = true;
    if (url) this.ollamaUrl = url;
    
    if (model) {
      this.ollamaModel = model;
    } else {
      // Auto-detect first available model
      await this.initializeOllamaModel();
    }
    
    console.log(`[LLMHelper] Switched to Ollama: ${this.ollamaModel} at ${this.ollamaUrl}`);
  }

  public async switchToGemini(apiKey?: string): Promise<void> {
    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey)
      this.useGemini = true
      this.useOllama = false
      console.log("[LLMHelper] Switched to Gemini");
    } else {
      throw new Error("Gemini API key is required");
    }
  }

  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useOllama) {
        const available = await this.checkOllamaAvailable();
        if (!available) {
          return { success: false, error: `Ollama not available at ${this.ollamaUrl}` };
        }
        // Test with a simple prompt
        await this.callOllama("Hello");
        return { success: true };
      } else {
        if (!this.azureClient) {
          return { success: false, error: "No Azure OpenAI client configured" };
        }
        // Test with a simple prompt
        const response = await this.azureClient.chat.completions.create({
          model: this.azureModelName,
          messages: [{ role: "user", content: "Hello" }],
          max_completion_tokens: 10
        })
        const text = response.choices[0].message.content; // Ensure the response is valid
        if (text) {
          return { success: true };
        } else {
          return { success: false, error: "Empty response from Azure OpenAI" };
        }
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 