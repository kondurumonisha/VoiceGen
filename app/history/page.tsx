"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  History,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Copy,
  Languages,
  ArrowLeft,
  BarChart3,
  Clock,
  FileText,
} from "lucide-react"
import { useHistory } from "@/hooks/use-history"
import { useAuth } from "@/contexts/auth-context"
import { TTSEngine } from "@/components/tts-engine"
import { format, isToday, isYesterday } from "date-fns"
import Link from "next/link"
import type { HistoryRecord } from "@/lib/history-storage"

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

export default function HistoryPage() {
  const { user, isAuthenticated } = useAuth()
  const {
    records,
    isLoading,
    error,
    deleteRecord,
    clearHistory,
    filterRecords,
    getStatistics,
    exportHistory,
    importHistory,
  } = useHistory()

  const [searchQuery, setSearchQuery] = useState("")
  const [sourceLanguageFilter, setSourceLanguageFilter] = useState<string>("all")
  const [targetLanguageFilter, setTargetLanguageFilter] = useState<string>("all")
  const [filteredRecords, setFilteredRecords] = useState<HistoryRecord[]>([])
  const [showStats, setShowStats] = useState(false)
  const [copiedId, setCopiedId] = useState<string>("")

  // Filter records based on search and language filters
  useEffect(() => {
    const filters = {
      searchQuery: searchQuery || undefined,
      sourceLanguage: sourceLanguageFilter === "all" ? undefined : sourceLanguageFilter,
      targetLanguage: targetLanguageFilter === "all" ? undefined : targetLanguageFilter,
    }

    const filtered = filterRecords(filters)
    setFilteredRecords(filtered)
  }, [records, searchQuery, sourceLanguageFilter, targetLanguageFilter, filterRecords])

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(""), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const handleExportHistory = () => {
    const data = exportHistory()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voicegen-history-${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        const success = importHistory(content)
        if (success) {
          alert("History imported successfully!")
        } else {
          alert("Failed to import history. Please check the file format.")
        }
      }
    }
    reader.readAsText(file)
  }

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, "HH:mm")}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "HH:mm")}`
    } else {
      return format(date, "MMM dd, yyyy 'at' HH:mm")
    }
  }

  const getLanguageName = (code: string) => {
    if (code === "en") return "English"
    return INDIAN_LANGUAGES.find((lang) => lang.code === code)?.name || code
  }

  const statistics = getStatistics()

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background language-symbols-bg-authenticated p-4">
        <div className="mx-auto max-w-6xl space-y-6 content-layer">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to VoiceGen
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-accent flex items-center gap-3">
                  <History className="h-8 w-8 text-primary" />
                  Translation History
                </h1>
                <p className="text-muted-foreground">View and manage your translation and speech conversion records</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Stats
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View usage statistics</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleExportHistory}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export history as JSON</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                      <input
                        id="import-file"
                        type="file"
                        accept=".json"
                        onChange={handleImportHistory}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import history from JSON file</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Statistics Card */}
          {showStats && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{statistics.totalRecords}</div>
                    <div className="text-sm text-muted-foreground">Total Translations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{Object.keys(statistics.languagePairs).length}</div>
                    <div className="text-sm text-muted-foreground">Language Pairs Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {statistics.recentActivity.reduce((sum, day) => sum + day.count, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Last 7 Days</div>
                  </div>
                </div>

                {Object.keys(statistics.languagePairs).length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Most Used Language Pairs</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statistics.languagePairs)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([pair, count]) => (
                          <Badge key={pair} variant="secondary">
                            {pair} ({count})
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Text</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search translations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-filter">Source Language</Label>
                  <Select value={sourceLanguageFilter} onValueChange={setSourceLanguageFilter}>
                    <SelectTrigger id="source-filter">
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      {INDIAN_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-filter">Target Language</Label>
                  <Select value={targetLanguageFilter} onValueChange={setTargetLanguageFilter}>
                    <SelectTrigger id="target-filter">
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All languages</SelectItem>
                      {INDIAN_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("")
                        setSourceLanguageFilter("all")
                        setTargetLanguageFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                    {records.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to clear all history?")) {
                            clearHistory()
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">Loading history...</div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && filteredRecords.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No translation history found</h3>
                    <p className="text-muted-foreground">
                      {records.length === 0
                        ? "Start translating text to build your history."
                        : "Try adjusting your search filters."}
                    </p>
                  </div>
                  <Link href="/">
                    <Button>Start Translating</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Records */}
          {!isLoading && filteredRecords.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {filteredRecords.length} Record{filteredRecords.length !== 1 ? "s" : ""}
                </h2>
              </div>

              {filteredRecords.map((record) => (
                <Card key={record.id} className="bg-card border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatTimestamp(record.timestamp)}</span>
                        <Badge variant="outline" className="text-xs">
                          {getLanguageName(record.sourceLanguage)} → {getLanguageName(record.targetLanguage)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyText(record.inputText, `${record.id}-input`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy original text</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyText(record.translatedText, `${record.id}-translated`)}
                            >
                              <Languages className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy translated text</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this record?")) {
                                  deleteRecord(record.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete record</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Original Text ({record.sourceLangName})</Label>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {record.inputText}
                          {copiedId === `${record.id}-input` && <span className="text-green-500 ml-2">Copied!</span>}
                        </div>
                        <TTSEngine text={record.inputText} language={record.sourceLanguage} />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Translated Text ({record.targetLangName})</Label>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {record.translatedText}
                          {copiedId === `${record.id}-translated` && (
                            <span className="text-green-500 ml-2">Copied!</span>
                          )}
                        </div>
                        <TTSEngine text={record.translatedText} language={record.targetLanguage} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
