"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Volume2,
  Languages,
  Type,
  AlertCircle,
  Copy,
  Check,
  ArrowRightLeft,
  Keyboard,
  HelpCircle,
  User,
  LogOut,
  Settings,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TTSEngine } from "@/components/tts-engine"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிฬ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "ur", name: "Urdu", native: "اردو" },
]

export default function TextToSpeechApp() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth()

  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("hi")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [translationError, setTranslationError] = useState("")
  const [copiedText, setCopiedText] = useState("")
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "Enter":
            event.preventDefault()
            if (inputText.trim() && !isTranslating) {
              handleTranslate()
            }
            break
          case "k":
            event.preventDefault()
            setIsHelpOpen(!isHelpOpen)
            break
          case "l":
            event.preventDefault()
            swapLanguages()
            break
        }
      }
    },
    [inputText, isTranslating, isHelpOpen],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardShortcuts)
    return () => document.removeEventListener("keydown", handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    setTranslationError("")

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          sourceLang: sourceLanguage,
          targetLang: targetLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      setTranslatedText(data.translatedText)
    } catch (error) {
      console.error("Translation error:", error)
      setTranslationError(error instanceof Error ? error.message : "Translation failed. Please try again.")
    } finally {
      setIsTranslating(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      setTimeout(() => setCopiedText(""), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const swapLanguages = () => {
    const tempLang = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(tempLang)

    // Also swap the text if both exist
    if (inputText && translatedText) {
      setInputText(translatedText)
      setTranslatedText(inputText)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen bg-background p-4 ${isAuthenticated ? "language-symbols-bg-authenticated" : "language-symbols-bg"}`}
      >
        <div className="mx-auto max-w-4xl space-y-6 content-layer">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1" />
              <div className="flex-1 flex justify-center">
                <h1 className="text-4xl font-bold text-accent flex items-center gap-3">
                  <Languages className="h-8 w-8 text-primary" />
                  VoiceGen
                </h1>
              </div>
              <div className="flex-1 flex justify-end">
                {!authLoading && (
                  <>
                    {isAuthenticated && user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 bg-card/50 border border-border/50"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link href="/login">
                        <Button variant="outline" className="bg-card/50 border-border/50">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <p className="text-muted-foreground text-lg text-balance">
              Experience smooth text-to-speech with instant language conversion
            </p>

            {isAuthenticated && user && (
              <div className="mt-4">
                <Alert className="bg-primary/10 border-primary/20">
                  <User className="h-4 w-4" />
                  <AlertDescription className="text-primary">
                    Welcome back, {user.name.split(" ")[0]}! Your preferences and history are saved.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex justify-center gap-2 mt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setIsHelpOpen(!isHelpOpen)}>
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View keyboard shortcuts and help</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Help Section */}
          <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <CollapsibleContent>
              <Card className="bg-muted/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Shortcuts & Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Translate text</span>
                      <Badge variant="secondary">Ctrl/Cmd + Enter</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Swap languages</span>
                      <Badge variant="secondary">Ctrl/Cmd + L</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Toggle help</span>
                      <Badge variant="secondary">Ctrl/Cmd + K</Badge>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    <p>
                      💡 <strong>Tip:</strong> Use the sample buttons to quickly test different phrases
                    </p>
                    <p>
                      🎯 <strong>Tip:</strong> Adjust voice settings in the TTS controls for better pronunciation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {translationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{translationError}</AlertDescription>
            </Alert>
          )}

          {/* Language Swap Button */}
          <div className="flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={swapLanguages} className="flex items-center gap-2 bg-transparent">
                  <ArrowRightLeft className="h-4 w-4" />
                  Swap Languages
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Swap source and target languages (Ctrl/Cmd + L)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Main Interface */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Input Section */}
            <Card className="bg-card border-border transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Input Text
                </CardTitle>
                <CardDescription>Enter the text you want to translate and convert to speech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source-lang">Source Language</Label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger id="source-lang">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      {INDIAN_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name} ({lang.native})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="input-text">Text to Translate</Label>
                    {inputText && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(inputText, "input")}>
                            {copiedText === "input" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy input text</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <Textarea
                    id="input-text"
                    placeholder="Enter your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-32 bg-input border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault()
                        handleTranslate()
                      }
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {inputText.length} characters • Press Ctrl/Cmd + Enter to translate
                  </div>
                </div>

                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleTranslate}
                        disabled={!inputText.trim() || isTranslating}
                        className="flex-1 transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isTranslating ? "Translating..." : "Translate"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Translate text to{" "}
                        {INDIAN_LANGUAGES.find((l) => l.code === targetLanguage)?.name || "target language"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {inputText && (
                  <div className="pt-2 border-t">
                    <Label className="text-sm font-medium mb-2 block">Speak Original Text</Label>
                    <TTSEngine text={inputText} language={sourceLanguage} onSpeakingChange={setIsSpeaking} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="bg-card border-border transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-accent" />
                  Translated Output
                </CardTitle>
                <CardDescription>Translated text ready for speech conversion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-lang">Target Language</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger id="target-lang">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name} ({lang.native})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="output-text">Translated Text</Label>
                    {translatedText && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText, "output")}>
                            {copiedText === "output" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy translated text</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <Textarea
                    id="output-text"
                    placeholder="Translated text will appear here..."
                    value={translatedText}
                    readOnly
                    className="min-h-32 bg-muted border-border"
                  />
                  {translatedText && (
                    <div className="text-xs text-muted-foreground">
                      {translatedText.length} characters • Translation complete
                    </div>
                  )}
                </div>

                {translatedText && (
                  <TTSEngine text={translatedText} language={targetLanguage} onSpeakingChange={setIsSpeaking} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Samples</Label>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setInputText("Hello, how are you today?")}>
                        Sample: Greeting
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load a greeting sample</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setInputText("Thank you for your help.")}>
                        Sample: Thanks
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load a thank you sample</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setInputText("What is your name?")}>
                        Sample: Question
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load a question sample</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputText("I need help with directions to the nearest hospital.")}
                      >
                        Sample: Emergency
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load an emergency phrase sample</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputText("")
                          setTranslatedText("")
                          setTranslationError("")
                        }}
                      >
                        Clear All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all text and reset</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
