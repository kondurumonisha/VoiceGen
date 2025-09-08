export interface HistoryRecord {
  id: string
  timestamp: Date
  inputText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  sourceLangName: string
  targetLangName: string
  userId?: string
}

export interface HistoryFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  sourceLanguage?: string
  targetLanguage?: string
  searchQuery?: string
}

class HistoryStorage {
  private readonly STORAGE_KEY = "voicegen_history"
  private readonly MAX_RECORDS = 1000 // Limit to prevent storage overflow

  // Get all history records
  getHistory(): HistoryRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const records = JSON.parse(stored) as HistoryRecord[]
      // Convert timestamp strings back to Date objects
      return records
        .map((record) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error("Error loading history:", error)
      return []
    }
  }

  // Add a new history record
  addRecord(record: Omit<HistoryRecord, "id" | "timestamp">): HistoryRecord {
    const newRecord: HistoryRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date(),
    }

    try {
      const existingRecords = this.getHistory()
      const updatedRecords = [newRecord, ...existingRecords].slice(0, this.MAX_RECORDS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords))
      return newRecord
    } catch (error) {
      console.error("Error saving history record:", error)
      throw new Error("Failed to save history record")
    }
  }

  // Delete a specific record
  deleteRecord(id: string): boolean {
    try {
      const records = this.getHistory()
      const filteredRecords = records.filter((record) => record.id !== id)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecords))
      return true
    } catch (error) {
      console.error("Error deleting history record:", error)
      return false
    }
  }

  // Clear all history
  clearHistory(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error("Error clearing history:", error)
      return false
    }
  }

  // Filter history records
  filterHistory(filters: HistoryFilters): HistoryRecord[] {
    const records = this.getHistory()

    return records.filter((record) => {
      // Date range filter
      if (filters.dateRange) {
        const recordDate = record.timestamp
        if (recordDate < filters.dateRange.start || recordDate > filters.dateRange.end) {
          return false
        }
      }

      // Source language filter
      if (filters.sourceLanguage && record.sourceLanguage !== filters.sourceLanguage) {
        return false
      }

      // Target language filter
      if (filters.targetLanguage && record.targetLanguage !== filters.targetLanguage) {
        return false
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const searchableText = `${record.inputText} ${record.translatedText}`.toLowerCase()
        if (!searchableText.includes(query)) {
          return false
        }
      }

      return true
    })
  }

  // Get history statistics
  getStatistics(): {
    totalRecords: number
    languagePairs: { [key: string]: number }
    recentActivity: { date: string; count: number }[]
  } {
    const records = this.getHistory()

    // Language pairs count
    const languagePairs: { [key: string]: number } = {}
    records.forEach((record) => {
      const pair = `${record.sourceLangName} → ${record.targetLangName}`
      languagePairs[pair] = (languagePairs[pair] || 0) + 1
    })

    // Recent activity (last 7 days)
    const recentActivity: { date: string; count: number }[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const count = records.filter((record) => {
        const recordDate = record.timestamp.toISOString().split("T")[0]
        return recordDate === dateStr
      }).length

      recentActivity.push({ date: dateStr, count })
    }

    return {
      totalRecords: records.length,
      languagePairs,
      recentActivity,
    }
  }

  // Export history as JSON
  exportHistory(): string {
    const records = this.getHistory()
    return JSON.stringify(records, null, 2)
  }

  // Import history from JSON
  importHistory(jsonData: string): boolean {
    try {
      const importedRecords = JSON.parse(jsonData) as HistoryRecord[]

      // Validate the imported data
      const validRecords = importedRecords
        .filter((record) => record.id && record.inputText && record.translatedText && record.timestamp)
        .map((record) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }))

      if (validRecords.length === 0) {
        throw new Error("No valid records found in import data")
      }

      // Merge with existing records and remove duplicates
      const existingRecords = this.getHistory()
      const allRecords = [...validRecords, ...existingRecords]
      const uniqueRecords = allRecords
        .filter((record, index, self) => index === self.findIndex((r) => r.id === record.id))
        .slice(0, this.MAX_RECORDS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(uniqueRecords))
      return true
    } catch (error) {
      console.error("Error importing history:", error)
      return false
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const historyStorage = new HistoryStorage()
