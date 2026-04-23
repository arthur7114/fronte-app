"use client"

import { useSyncExternalStore } from "react"

export type BanScope = "strategy" | "workspace"
export type BanKind = "keyword" | "topic"

export type BannedItem = {
  id: string
  kind: BanKind
  term: string
  note?: string
  scope: BanScope
  strategyId?: string
  strategyName?: string
  bannedAt: string
}

type StoreState = {
  banned: BannedItem[]
  // id -> "rejected" (com ou sem banimento, mantemos o status de rejeitado)
  rejectedIds: Set<string>
}

const state: StoreState = {
  banned: [],
  rejectedIds: new Set<string>(),
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): StoreState {
  return state
}

function getServerSnapshot(): StoreState {
  return state
}

export function useWorkspaceStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function rejectItem(
  id: string,
  options: {
    kind: BanKind
    term: string
    note?: string
    ban?: BanScope | null
    strategyId?: string
    strategyName?: string
  },
) {
  state.rejectedIds = new Set(state.rejectedIds).add(id)
  if (options.ban) {
    state.banned = [
      {
        id: `b-${Date.now()}`,
        kind: options.kind,
        term: options.term,
        note: options.note,
        scope: options.ban,
        strategyId: options.ban === "strategy" ? options.strategyId : undefined,
        strategyName: options.ban === "strategy" ? options.strategyName : undefined,
        bannedAt: new Date().toISOString().slice(0, 10),
      },
      ...state.banned,
    ]
  }
  emit()
}

export function unbanItem(id: string) {
  state.banned = state.banned.filter((b) => b.id !== id)
  emit()
}

export function isRejected(id: string) {
  return state.rejectedIds.has(id)
}

export function getBannedForStrategy(strategyId: string, kind?: BanKind) {
  return state.banned.filter(
    (b) =>
      b.scope === "strategy" &&
      b.strategyId === strategyId &&
      (kind ? b.kind === kind : true),
  )
}

export function getBannedForWorkspace(kind?: BanKind) {
  return state.banned.filter(
    (b) => b.scope === "workspace" && (kind ? b.kind === kind : true),
  )
}
