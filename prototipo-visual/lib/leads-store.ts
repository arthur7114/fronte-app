"use client"

import { useSyncExternalStore } from "react"

export type LeadOrigin = "popup" | "inline" | "cta" | "footer"
export type LeadStatus = "novo" | "engajado" | "inativo"
export type LeadInterest = "blog" | "dicas" | "promocoes" | "tudo"

export type Lead = {
  id: string
  email: string
  name?: string
  interest: LeadInterest
  origin: LeadOrigin
  status: LeadStatus
  createdAt: string // ISO
  sourceArticle?: string
}

const SEED_LEADS: Lead[] = [
  { id: "l1", email: "marina.silva@email.com", interest: "tudo", origin: "popup", status: "engajado", createdAt: "2026-04-08T10:12:00Z" },
  { id: "l2", email: "joao.pereira@gmail.com", interest: "blog", origin: "popup", status: "novo", createdAt: "2026-04-07T14:20:00Z" },
  { id: "l3", email: "ana.costa@outlook.com", interest: "dicas", origin: "inline", status: "engajado", createdAt: "2026-04-07T09:02:00Z", sourceArticle: "10 Dicas para Dentes Brancos" },
  { id: "l4", email: "pedro.santos@email.com", interest: "promocoes", origin: "cta", status: "novo", createdAt: "2026-04-06T18:40:00Z" },
  { id: "l5", email: "carla.martins@yahoo.com", interest: "tudo", origin: "popup", status: "inativo", createdAt: "2026-04-06T11:15:00Z" },
  { id: "l6", email: "ricardo.oliveira@gmail.com", interest: "blog", origin: "inline", status: "engajado", createdAt: "2026-04-05T16:30:00Z", sourceArticle: "Quanto Custa um Implante" },
  { id: "l7", email: "fernanda.almeida@email.com", interest: "dicas", origin: "popup", status: "novo", createdAt: "2026-04-05T08:50:00Z" },
  { id: "l8", email: "bruno.rocha@gmail.com", interest: "tudo", origin: "cta", status: "engajado", createdAt: "2026-04-04T19:22:00Z" },
  { id: "l9", email: "juliana.lima@outlook.com", interest: "promocoes", origin: "popup", status: "novo", createdAt: "2026-04-04T13:05:00Z" },
  { id: "l10", email: "marcelo.souza@gmail.com", interest: "blog", origin: "inline", status: "inativo", createdAt: "2026-04-03T22:14:00Z", sourceArticle: "Melhor Dentista em Moema" },
  { id: "l11", email: "patricia.gomes@email.com", interest: "dicas", origin: "popup", status: "engajado", createdAt: "2026-04-03T15:48:00Z" },
  { id: "l12", email: "thiago.carvalho@yahoo.com", interest: "tudo", origin: "cta", status: "novo", createdAt: "2026-04-02T12:33:00Z" },
  { id: "l13", email: "camila.nunes@gmail.com", interest: "blog", origin: "popup", status: "engajado", createdAt: "2026-04-02T09:17:00Z" },
  { id: "l14", email: "roberto.dias@email.com", interest: "promocoes", origin: "inline", status: "novo", createdAt: "2026-04-01T20:40:00Z" },
  { id: "l15", email: "luana.ferreira@outlook.com", interest: "dicas", origin: "popup", status: "inativo", createdAt: "2026-04-01T10:05:00Z" },
  { id: "l16", email: "gustavo.barros@gmail.com", interest: "tudo", origin: "cta", status: "engajado", createdAt: "2026-03-31T17:28:00Z" },
  { id: "l17", email: "beatriz.ramos@email.com", interest: "blog", origin: "popup", status: "novo", createdAt: "2026-03-31T11:55:00Z" },
  { id: "l18", email: "daniel.melo@yahoo.com", interest: "dicas", origin: "inline", status: "engajado", createdAt: "2026-03-30T14:42:00Z", sourceArticle: "10 Dicas para Dentes Brancos" },
  { id: "l19", email: "isabela.torres@gmail.com", interest: "promocoes", origin: "popup", status: "novo", createdAt: "2026-03-30T08:19:00Z" },
  { id: "l20", email: "vinicius.pinto@email.com", interest: "tudo", origin: "cta", status: "inativo", createdAt: "2026-03-29T21:10:00Z" },
  { id: "l21", email: "larissa.campos@outlook.com", interest: "blog", origin: "footer", status: "engajado", createdAt: "2026-03-29T16:03:00Z" },
  { id: "l22", email: "eduardo.monteiro@gmail.com", interest: "dicas", origin: "inline", status: "novo", createdAt: "2026-03-28T13:27:00Z" },
  { id: "l23", email: "natalia.borges@email.com", interest: "tudo", origin: "popup", status: "engajado", createdAt: "2026-03-28T10:44:00Z" },
  { id: "l24", email: "felipe.araujo@yahoo.com", interest: "promocoes", origin: "cta", status: "novo", createdAt: "2026-03-27T19:52:00Z" },
  { id: "l25", email: "renata.moraes@gmail.com", interest: "blog", origin: "popup", status: "inativo", createdAt: "2026-03-27T07:38:00Z" },
]

type StoreState = {
  leads: Lead[]
}

const state: StoreState = {
  leads: SEED_LEADS,
}

const listeners = new Set<() => void>()

function emit() {
  // Snapshot must change by reference for useSyncExternalStore to notify
  state.leads = [...state.leads]
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return state.leads
}

function getServerSnapshot() {
  return state.leads
}

export function useLeads() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function addLead(lead: Omit<Lead, "id" | "createdAt" | "status"> & { status?: LeadStatus }) {
  const newLead: Lead = {
    id: `l-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: lead.status ?? "novo",
    ...lead,
  }
  state.leads = [newLead, ...state.leads]
  emit()
  return newLead
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  state.leads = state.leads.map((l) => (l.id === id ? { ...l, status } : l))
  emit()
}

export function deleteLead(id: string) {
  state.leads = state.leads.filter((l) => l.id !== id)
  emit()
}

export function getLeadCount() {
  return state.leads.length
}
