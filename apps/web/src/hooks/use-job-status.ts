"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { JobStatus, JobStatusResponse } from "@/app/api/job-status/route"

const POLL_INTERVAL_MS = 5_000
const COMPLETED_DISPLAY_MS = 6_000

export interface UseJobStatusReturn {
  status: JobStatus
  isRunning: boolean
  errorMessage: string | null
  /** Call immediately after dispatching the job action to show feedback right away */
  trigger: () => void
  /** Dismiss the current status (e.g. close a stale failed banner) */
  dismiss: () => void
}

export function useJobStatus(
  strategyId: string,
  jobType: string,
): UseJobStatusReturn {
  const router = useRouter()
  const [status, setStatus] = useState<JobStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Timestamp set when user triggers a job — used to ignore stale jobs from
  // before this action (e.g. previous failed attempts still in the 15-min window)
  const triggerTimeRef = useRef<number | null>(null)

  const isRunning = status === "pending" || status === "running"

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const poll = useCallback(async () => {
    if (!strategyId || !jobType) return

    try {
      const res = await fetch(
        `/api/job-status?strategy_id=${encodeURIComponent(strategyId)}&type=${encodeURIComponent(jobType)}`,
        { cache: "no-store" },
      )
      if (!res.ok) return
      const data: JobStatusResponse = await res.json()

      // If the job row in the DB predates when the user clicked "trigger",
      // it's a stale result (e.g. a failed attempt from before this action).
      // Keep polling — the worker hasn't picked up the new job yet.
      if (
        triggerTimeRef.current !== null &&
        data.jobCreatedAt &&
        new Date(data.jobCreatedAt).getTime() < triggerTimeRef.current
      ) {
        // Stale job — don't update UI, keep waiting
        return
      }

      setStatus((prev) => {
        // Transitioned from active → completed
        if (
          (prev === "pending" || prev === "running") &&
          data.status === "completed"
        ) {
          stopPolling()
          triggerTimeRef.current = null
          // Refresh server data so the table shows new keywords/topics
          router.refresh()
          // Auto-reset to idle after brief success display
          completedTimerRef.current = setTimeout(() => {
            setStatus("idle")
          }, COMPLETED_DISPLAY_MS)
        }

        if (data.status === "failed") {
          stopPolling()
          triggerTimeRef.current = null
          setErrorMessage(data.errorMessage ?? "Ocorreu um erro no job.")
        }

        return data.status
      })
    } catch {
      // Network error — keep polling
    }
  }, [strategyId, jobType, router, stopPolling])

  useEffect(() => {
    poll()
  }, [poll])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return // already polling
    poll() // immediate first check
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
  }, [poll])

  // Start polling whenever status becomes running/pending
  useEffect(() => {
    if (isRunning) {
      startPolling()
    } else {
      stopPolling()
    }
    return stopPolling
  }, [isRunning, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      if (completedTimerRef.current) clearTimeout(completedTimerRef.current)
    }
  }, [stopPolling])

  const trigger = useCallback(() => {
    triggerTimeRef.current = Date.now()
    setErrorMessage(null)
    setStatus("pending")
  }, [])

  const dismiss = useCallback(() => {
    stopPolling()
    triggerTimeRef.current = null
    setErrorMessage(null)
    setStatus("idle")
  }, [stopPolling])

  return { status, isRunning, errorMessage, trigger, dismiss }
}
