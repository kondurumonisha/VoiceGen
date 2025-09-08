"use client"

import { useState, useEffect, useCallback } from "react"
import { historyStorage, type HistoryRecord, type HistoryFilters } from "@/lib/history-storage"

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load history records
  const loadHistory = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)
      const historyRecords = historyStorage.getHistory()
      setRecords(historyRecords)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add new record
  const addRecord = useCallback((record: Omit<HistoryRecord, "id" | "timestamp">) => {
    try {
      const newRecord = historyStorage.addRecord(record)
      setRecords((prev) => [newRecord, ...prev])
      return newRecord
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add record")
      throw err
    }
  }, [])

  // Delete record
  const deleteRecord = useCallback((id: string) => {
    try {
      const success = historyStorage.deleteRecord(id)
      if (success) {
        setRecords((prev) => prev.filter((record) => record.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record")
      return false
    }
  }, [])

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      const success = historyStorage.clearHistory()
      if (success) {
        setRecords([])
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear history")
      return false
    }
  }, [])

  // Filter records
  const filterRecords = useCallback((filters: HistoryFilters) => {
    try {
      const filteredRecords = historyStorage.filterHistory(filters)
      return filteredRecords
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter records")
      return []
    }
  }, [])

  // Get statistics
  const getStatistics = useCallback(() => {
    try {
      return historyStorage.getStatistics()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get statistics")
      return {
        totalRecords: 0,
        languagePairs: {},
        recentActivity: [],
      }
    }
  }, [])

  // Export history
  const exportHistory = useCallback(() => {
    try {
      return historyStorage.exportHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export history")
      return ""
    }
  }, [])

  // Import history
  const importHistory = useCallback(
    (jsonData: string) => {
      try {
        const success = historyStorage.importHistory(jsonData)
        if (success) {
          loadHistory() // Reload to show imported data
        }
        return success
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to import history")
        return false
      }
    },
    [loadHistory],
  )

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    records,
    isLoading,
    error,
    addRecord,
    deleteRecord,
    clearHistory,
    filterRecords,
    getStatistics,
    exportHistory,
    importHistory,
    refreshHistory: loadHistory,
  }
}
