"use client"

export type Incident = {
    id: string
    title: string
    description: string
    location: string
    status: "ACTIVE" | "RESOLVED" | "INVESTIGATING"
    severity: "LOW" | "MEDIUM" | "HIGH"
    date_created: string
    date_updated: string
    longitude: number
    latitude: number
    tags?: string[] // Optional, can be used for categorization
    upvotes?: number | 0 // Optional, for user engagement
    reporterName?: string // Optional, can be included if needed
    assignedTeamId?: string // Optional, for incidents assigned to a team
    assignedTeamName?: string // Optional, for display purposes
}

export type Statistics = {
    total_incidents: number
    active_incidents: number
    resolved_incidents: number
    investigating_incidents: number
    total_resolved_today: number
    total_security_personnel: number
    
}