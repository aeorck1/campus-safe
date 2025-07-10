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

export type User = {
  id: string
  first_name: string
  last_name: string
  middle_name: string
  email: string
  avatar?: string
  department?: string
  date_joined: string
  username: string // Optional for API login
  profile_picture: string
  bio: string // Optional bio field
  role: string // Adjust based on your role type
  key?: string // Unique key for React lists
  number_of_reported_incidents?: number // Optional field for reported incidents
  notifications_enabled?: boolean // Optional field for notification preferences
}

export type RefreshToken = {
  refresh_token: string
}
export type Comments = {
  object_id: string,
  comment: string,
  object_type: string,
  parent_comment: string
}

export type Coordinate = [number, number]
export type ReportIncident = {
  tags: string[],
  title: string,
  description: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  location: string,
  latitude: number,
  longitude: number,
  media?: Array<{
    name: string,
    type?: string
  }>

}

export type VoteIncident = {
  incident_id: string,
  up_voted: boolean,
  // down_voted: boolean
}

export type ReportAnonymous = {
  tags: string[],
  title: string,
  description: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  location: string,
  latitude: number,
  longitude: number
  media?: Array<{
    name: string,
    type?: string
  }>
}

export type CreateTags = {
  id: string,
  created_by_user: string,
  name: string
}
export type SignUp = {
  first_name: string,
  last_name: string,
  email: string,
  username: string,
  password: string
}

export type CreateRole ={
  name: string,
  id: string,
  details?: string
}
export type RecentActivity = {
  id: string | number
  initials?: string
  description?: string
  time_ago?: string
 
}

export type InvestigatingTeamMembers = {
  id?: string,
  name?: string,
  email?: string,
  team: string,
  member: string,
  user_name?:string,
  created_by_user: any
}
export type InvestigatingTeam = {
  id: string,
name: string,
created_by_user: any
}


export type PasswordReset = {
  new_password: string
}

export interface AddUser {
  first_name: string,
  last_name: string,
  email: string,
  username: string,
  password: string
}

export type Comment = {
  object_id: string,
  comment: string,
  object_type: string,
  parent_comment?: string // Optional for top-level comments
}
export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  isRefreshing: boolean | null
  refreshToken: string | null
  passwordResetInitiate: (email: string) => Promise<{ success: boolean; data?: any; message?: string }>
  passwordCompletionReset: (token: string, new_password: string) => Promise<{ success: boolean; data?: any; message?: string }>
  incidentsListAdmin: () => Promise<{ success: boolean; data?: any; message?: string }>
  // Authentication methods
  signup: (
    credentials: SignUp
  ) => Promise<{ success: boolean; message: string }>
  loginWithApi: (
    credentials: Login
  ) => Promise<{ success: boolean; message: string }>
  setAccessToken: (refreshToken: RefreshToken) => Promise<{ success: boolean; data?: any; message?: string }>
  // Chat Endpoints

  logout: () => void
  incidents: () => Promise<{ success: boolean; data?: any; message?: string }>
  getPublicStats: () => Promise<{ success: boolean; data?: any; message?: string }>
  updateAdminIncidentStatus: (id: string, status: string) => Promise<{ success: boolean; data?: any; message?: string }>
  getCommentCount: (object_type: string, object_id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  postComment: (comment: Comment) => Promise<{ success: boolean; data?: any; message?: string }>
  getComment: (commentId: string) => Promise<{ success: boolean; data?: any; message?: string }>
  getUserComment: (commentId: string) => Promise<{ success: boolean; data?: any; message?: string }>
  updateUserComment: (
    credentials: UpdateComments
  ) => Promise<{ success: boolean; data?: any; message?: string }>
  getCommentsOnObject: (object_type: string, object_id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  // Incident Endpoints
  listAdminIncidents: () => Promise<{ success: boolean; data?: any; message?: string }>
  getAdminIncident: (id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  updateAdminIncident: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  patchAdminIncident: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  deleteAdminIncident: (id: string) => Promise<{ success: boolean; message?: string }>
  reportIncident: (data: ReportIncident) => Promise<{ success: boolean; data?: any; message?: string }>
  voteIncident: (data: VoteIncident) => Promise<{ success: boolean; data?: any; message?: string }>
  submitSatisfaction: (id: string, data: { satisfaction: number }) => Promise<{ success: boolean; data?: any; message?: string }>
  getMyReportedIncidents: () => Promise<{ success: boolean; data?: any; message?: string }>
  reportIncidentAnonymous: (data: ReportAnonymous) => Promise<{ success: boolean; data?: any; message?: string }>
  getPublicIncidents: () => Promise<{ success: boolean; data?: any; message?: string }>
  getIncidentStatistics: () => Promise<{ success: boolean; data?: any; message?: string }>
  // Incident Tag Endpoints
  getAllIncidentTags: () => Promise<{ success: boolean; data?: any; message?: string }>
  getIncidentTagById: (id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  getAdminIncidentTags: () => Promise<{ success: boolean; data?: any; message?: string }>
  createIncidentTag: (data: CreateTags) => Promise<{ success: boolean; data?: any; message?: string }>
  getAdminIncidentTagById: (id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  updateIncidentTag: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  patchIncidentTag: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  deleteIncidentTag: (id: string) => Promise<{ success: boolean; message?: string }>
  getAllUsers: () => Promise<{ success: boolean; data?: any; message?: string }>
  updateUserProfile: (payload: any) => Promise<{ success: boolean; data?: any; message?: string }>
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>
  adminGetAllUsers: () => Promise<{ success: boolean; data?: any; message?: string }>
  postAdminChangeRole: (data: ChangeRole) => Promise<{ success: boolean; data?: any; message?: string }>
  updateIncident: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  getRecentActivity: () => Promise<{ success: boolean; data?: any; message?: string }>
  addUser: (id: string, data: SignUp) => Promise<{ success: boolean; data?: any; message?: string }>
  verifyAccessToken: (token: string) => Promise<{ success: boolean; data?: any; message?: string }>
  getRoles: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  getUserDetails: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  createRoles: (id: string, data: CreateRole) => Promise<{ success: boolean; data?: any; message?: string }>
  deleteRole: (id: string, data: object) => Promise<{ success: boolean; data?: any; message?: string }>
  getInvestigatingTeam: () => Promise<{ success: boolean; data?: any; message?: string }>
  postInvestigatingTeam: (data: InvestigatingTeamMembers) => Promise<{ success: boolean; data?: any; message?: string }>
  createInvestigatingTeam: (data: InvestigatingTeam) => Promise<{ success: boolean; data?: any; message?: string }>
  passwordReset: (token: string, data: PasswordReset) => Promise<{ success: boolean; data?: any; message?: string }>
  adminResetPassword: (data: AdminPassReset) => Promise<{ success: boolean; data?: any; message?: string }>
  getInvestigatingTeamMembers: () => Promise<{ success: boolean; data?: any; message?: string }>
  deleteInvestigatingTeamMember: (id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  assignInvestigatingTeam: (incident_id: string, team_id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  deleteInvestigatingTeam: (id: string) => Promise<{ success: boolean; data?: any; message?: string }>
  getUserNotification: () => Promise<{success: boolean; data?: any; message?: string}>
  markNotification: (id: string, read: boolean) => Promise<{success: boolean; data?: any; message?: string}>
  subscribeToNotifications: (data: Subscribe) => Promise<{success: boolean; data?: any; message?: string}>
  adminGetSubscription: () => Promise<{success: boolean; data?: any; message?: string}>
  securityGetStats: () => Promise<{success: boolean; data?: any; message?: string}>
  updateSubscription: () => Promise<{success: boolean; data?: any; message?: string}>
}
export type Login = {
  username: string,
  password: string
}

export type ChangeRole = {
  user_id: string,
  role_id: string
}
export type UpdateComments = {
  id: string,
  comment: string
}

export type AdminPassReset = {
  user_id: string,
}
 export type Notification = {
    id: string
    title: string
    message: string
    date_created?: string
    read?: boolean
    link?: string
    [key: string]: any
  }

  export type Subscribe ={
    email?: string
    phone_number?: string
  }

export type AssignTeam = {
  incident_id: string,
  team_id: string
}