"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, VolumeX, Pause, Play, Square, Settings } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

interface TTSEngineProps {
  text: string
  language: string
  onSpeakingChange: (isSpeaking: boolean) => void
}

interface VoiceOption {
  voice: SpeechSynthesisVoice
  name: string
  lang: string
  isDefault: boolean
  gender: "male" | "female" | "child" | "unknown"
}

const detectVoiceGender = (voiceName: string): "male" | "female" | "child" | "unknown" => {
  const name = voiceName.toLowerCase()

  if (
    name.includes("female") ||
    name.includes("woman") ||
    name.includes("girl") ||
    name.includes("samantha") ||
    name.includes("susan") ||
    name.includes("victoria") ||
    name.includes("karen") ||
    name.includes("moira") ||
    name.includes("tessa") ||
    name.includes("fiona") ||
    name.includes("veena") ||
    name.includes("kanya") ||
    name.includes("lekha") ||
    name.includes("raveena")
  ) {
    return "female"
  }

  if (
    name.includes("male") ||
    name.includes("man") ||
    name.includes("boy") ||
    name.includes("alex") ||
    name.includes("daniel") ||
    name.includes("tom") ||
    name.includes("fred") ||
    name.includes("ralph") ||
    name.includes("jorge") ||
    name.includes("diego") ||
    name.includes("carlos") ||
    name.includes("raj") ||
    name.includes("rishi") ||
    name.includes("tarun")
  ) {
    return "male"
  }

  if (
    name.includes("child") ||
    name.includes("kid") ||
    name.includes("junior") ||
    name.includes("young") ||
    name.includes("little")
  ) {
    return "child"
  }

  return "unknown"
}

export function TTSEngine({ text, language, onSpeakingChange }: TTSEngineProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [rate, setRate] = useState([1])
  const [pitch, setPitch] = useState([1])
  const [volume, setVolume] = useState([0.8])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [speechProgress, setSpeechProgress] = useState(0)

  const loadVoices = useCallback(() => {
    const availableVoices = speechSynthesis.getVoices()
    const voiceOptions: VoiceOption[] = availableVoices
      .filter((voice) => {
        const supportedLangs = ["en", "hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "pa", "or", "as", "ur"]
        return supportedLangs.some((lang) => voice.lang.startsWith(lang))
      })
      .map((voice) => ({
        voice,
        name: voice.name,
        lang: voice.lang,
        isDefault: voice.default,
        gender: detectVoiceGender(voice.name),
      }))
      .sort((a, b) => {
        if (a.lang.startsWith(language) && !b.lang.startsWith(language)) return -1
        if (!a.lang.startsWith(language) && b.lang.startsWith(language)) return 1
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return a.name.localeCompare(b.name)
      })

    setVoices(voiceOptions)

    if (voiceOptions.length > 0 && !selectedVoice) {
      const bestVoice = voiceOptions.find((v) => v.lang.startsWith(language)) || voiceOptions[0]
      setSelectedVoice(bestVoice.voice.name)
    }
  }, [language, selectedVoice])

  useEffect(() => {
    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices)
  }, [loadVoices])

  useEffect(() => {
    if (voices.length > 0) {
      const bestVoice = voices.find((v) => v.lang.startsWith(language))
      if (bestVoice && bestVoice.voice.name !== selectedVoice) {
        setSelectedVoice(bestVoice.voice.name)
      }
    }
  }, [language, voices, selectedVoice])

  const handleSpeak = () => {
    if (!text.trim()) return

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    const voice = voices.find((v) => v.voice.name === selectedVoice)?.voice
    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = rate[0]
    utterance.pitch = pitch[0]
    utterance.volume = volume[0]
    utterance.lang = language === "en" ? "en-US" : `${language}-IN`

    let startTime = Date.now()
    const estimatedDuration = (text.length / 10) * 1000

    const progressInterval = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / estimatedDuration) * 100, 95)
        setSpeechProgress(progress)
      }
    }, 100)

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
      setSpeechProgress(0)
      onSpeakingChange(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      setSpeechProgress(100)
      setCurrentUtterance(null)
      onSpeakingChange(false)
      clearInterval(progressInterval)
      setTimeout(() => setSpeechProgress(0), 1000)
    }

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
      setIsSpeaking(false)
      setIsPaused(false)
      setSpeechProgress(0)
      setCurrentUtterance(null)
      onSpeakingChange(false)
      clearInterval(progressInterval)
    }

    utterance.onpause = () => {
      setIsPaused(true)
      clearInterval(progressInterval)
    }

    utterance.onresume = () => {
      setIsPaused(false)
      startTime = Date.now() - (speechProgress / 100) * estimatedDuration
    }

    setCurrentUtterance(utterance)
    speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
    }
  }

  const handleResume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }

  const handleStop = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentUtterance(null)
    onSpeakingChange(false)
    setSpeechProgress(0)
  }

  const getFilteredVoices = () => {
    if (selectedGender === "all") return voices
    return voices.filter((voice) => voice.gender === selectedGender)
  }

  const setPresetSpeed = (speed: number) => {
    setRate([speed])
  }

  const getVoiceDisplayName = (voice: VoiceOption) => {
    const langName = voice.lang.split("-")[0].toUpperCase()
    const genderIcon =
      voice.gender === "female" ? "♀" : voice.gender === "male" ? "♂" : voice.gender === "child" ? "👶" : ""
    return `${genderIcon} ${voice.name} (${langName})`
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSpeak}
                disabled={!text.trim() || isSpeaking}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isSpeaking ? "Speaking..." : "Speak Text"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Convert text to speech</p>
            </TooltipContent>
          </Tooltip>

          {isSpeaking && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={isPaused ? handleResume : handlePause} disabled={!isSpeaking}>
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPaused ? "Resume" : "Pause"} speech</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleStop} disabled={!isSpeaking}>
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stop speech</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {isSpeaking && (
          <div className="space-y-1">
            <Progress value={speechProgress} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {isPaused ? "Speech paused" : "Speaking..."}
            </div>
          </div>
        )}

        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <CollapsibleContent>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Voice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Voice Type</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Voices</SelectItem>
                      <SelectItem value="female">♀ Female Voices</SelectItem>
                      <SelectItem value="male">♂ Male Voices</SelectItem>
                      <SelectItem value="child">👶 Child Voices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredVoices().map((voiceOption) => (
                        <SelectItem key={voiceOption.voice.name} value={voiceOption.voice.name}>
                          {getVoiceDisplayName(voiceOption)}
                          {voiceOption.isDefault && " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Speed Presets</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={rate[0] === 0.5 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPresetSpeed(0.5)}
                      className="flex-1"
                    >
                      0.5x
                    </Button>
                    <Button
                      variant={rate[0] === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPresetSpeed(1)}
                      className="flex-1"
                    >
                      1x
                    </Button>
                    <Button
                      variant={rate[0] === 1.5 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPresetSpeed(1.5)}
                      className="flex-1"
                    >
                      1.5x
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Speed: {rate[0].toFixed(1)}x</Label>
                  <Slider value={rate} onValueChange={setRate} min={0.1} max={3} step={0.1} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label>Pitch: {pitch[0].toFixed(1)}</Label>
                  <Slider value={pitch} onValueChange={setPitch} min={0} max={2} step={0.1} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    Volume: {Math.round(volume[0] * 100)}%
                  </Label>
                  <Slider value={volume} onValueChange={setVolume} min={0} max={1} step={0.1} className="w-full" />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRate([1])
                    setPitch([1])
                    setVolume([0.8])
                    setSelectedGender("all")
                  }}
                  className="w-full"
                >
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  )
}
