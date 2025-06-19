import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"
import axiosAuth from "./axiosAuth"
import axiosInstance from "./axiosInstance"
import { object } from "zod"
// const API_BASE_URL = "https://campussecuritybackend.onrender.com/api/v1/"


// Types
export type User = {
  id: string
  first_name: string
  last_name: string
  middle_name: string
  email: string
  avatar?: string
  department?: string
  joinedAt: string
  username: string // Optional for API login
  profile_picture: string
  bio: string // Optional bio field
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

export type Coordinate =[number, number]
export type ReportIncident ={
  tags:string[],
  title: string,
  description: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  location: string,
  latitude: number,
  longitude: number
  
}

export type VoteIncident = {
  incident_id: string,
  up_voted: boolean,
}

export type ReportAnonymous ={
  tags:string[],
  title: string,
  description: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  location: string,
  latitude: number,
  longitude: number
}

export type CreateTags={
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
  refreshToken: string | null
  passwordResetInitiate: (email:string) => Promise<{ success: boolean; data?: any; message?: string }>
  passwordCompletionReset: (token:string, new_password:string) => Promise<{ success: boolean; data?: any; message?: string }>
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
  updateUserProfile: (payload:any) => Promise<{ success: boolean; data?: any; message?: string }>
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>
}
export  type Login ={
     username: string,
        password: string
}

export type UpdateComments = {
     id: string,
    comment: string
}
// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      // Authentication
signup: async (
  credentials: SignUp
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosAuth.post(
      `users/students/register/`,
      credentials
    )

    return {
      success: true,
      message: "Account created successfully. Please login.",
    }
  } 
  
  catch (error: any) {
    const responseData = error?.response?.data

    let message = "Registration failed. Please try again."

    if (responseData) {
      // If error body is an object with "detail"
      if (typeof responseData === "object" && responseData.detail) {
        message = responseData.detail
      }

      // Or if it's a list of field errors (like Django REST Framework)
      else if (typeof responseData === "object") {
        const firstKey = Object.keys(responseData)[0]
        const firstError = responseData[firstKey]?.[0]
        message = firstError || message
      }
    }

    return { success: false, message }
  }
},
      loginWithApi: async (
        credentials: Login
      ): Promise<{ success: boolean; message: string }> => {
        try {
          const response = await axiosAuth.post(
            `auth/login/`,
            credentials
          )

          const data = response.data

          if (data && data.access_token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`
            set({
              user: data.user || null,
              isAuthenticated: true,
              accessToken: data.access_token,
              refreshToken: data.refresh_token
            })
            return { success: true, message: data.user }
          } else {
            return { success: false, message: data.detail || "Login failed" }
          }
        } catch (error: any) {
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Network error. Please try again."
          return { success: false, message }
        }
      },
      passwordResetInitiate: async (email:string) => {
        try {
          const response = await axiosAuth.post(`auth/initiate-password-reset/`, { email })
          return { success: true, data: response.data }
        } catch (error: any) {
          const message =
            error?.response.data.detail ||
            error?.message ||
            "Unable to initate password reset"
          return { success: false, message }
        }
      },

      setAccessToken: async (refreshToken: RefreshToken) => {
        try {
          const response = await axios.post(`auth/token/refresh/`, refreshToken)
          return { success: true, data: response.data }
        } catch (error: any) {
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Network error. Please try again."
          return { success: false, message }
        }
      },
      passwordCompletionReset: async (token:string, new_password: string) => {
        try {
          const response = await axiosAuth.post(`auth/complete-password-reset/`, { token, new_password })
          return { success: true, data: response.data }
        }
        catch (error: any) {
          const message = error?.response?.data?.detail ||
            error?.message ||
            "Reset failed"
          return { success: false, message }

        }
      },
      getPublicStats: async () => {
        try {
          const response = await axiosAuth.get(`public/incident-statistics/`)

          return { success: true, data: response.data}
        } catch (error: any) {
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Network error. Please try again."
          return { success: false, message }
        }
      },

      
      incidents: async () => {
        try {
          const response = await axiosAuth.get(`public/incidents/`)

          return { success: true, data: response.data }
        } catch (error: any) {
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Network error. Please try again."
          return { success: false, message }
        }
      },

      incidentsListAdmin: async () => {
        try {
          const response = await axiosAuth.get(`admin/incidents/`)

          return { success: true, data: response.data }
        } catch (error: any) {
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Network error. Please try again."
          return { success: false, message }
        }
      },

      // Chat
            // Chat Endpoints
      getCommentCount: async (object_type: string, object_id: string) => {
        try {
          const response = await axiosAuth.get(
            `chat/comment-participants/comments/objects/${object_type}/${object_id}/count/`
          );
          return { success: true, data: response.data };
        } catch (error: any) {
          const message =
            error?.response?.data?.detail || error?.message || "Error fetching comment count.";
          return { success: false, message };
        }
      },

      postComment: async (comment: Comment) => {
        try {
          const response = await axiosAuth.post(`chat/comments/`, comment);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message =
            error?.response?.data?.detail || error?.message || "Failed to post comment.";
          return { success: false, message };
        }
      },

      getComment: async (commentId: string) => {
        try {
          const response = await axiosAuth.get(`chat/comments/${commentId}/`);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message =
            error?.response?.data?.detail || error?.message || "Failed to get comment.";
          return { success: false, message };
        }
      },

      getUserComment: async (commentId: string) => {
        try {
          const response = await axiosAuth.get(`chat/comments/${commentId}/users/`);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message =
            error?.response?.data?.detail || error?.message || "Failed to retrieve user comment.";
          return { success: false, message };
        }
      },

      updateUserComment: async (
    credentials:UpdateComments
      ) => {
        try {
          const response = await axiosAuth.patch(
            `chat/comments/${credentials.id}/users/`,
            credentials
          );
          return { success: true, data: response.data };
        } catch (error: any) {
          const message =
            error?.response?.data?.detail || error?.message || "Failed to update comment.";
          return { success: false, message };
        }
      },

      getCommentsOnObject: async (object_type: string, object_id: string) => {
        try {
          const response = await axiosAuth.get(
            `chat/comments/objects/${object_type}/${object_id}/`
          );
          return { success: true, data: response.data };
        } catch (error: any) {
          const message =
            error?.response?.data?.detail || error?.message || "Failed to get object comments.";
          return { success: false, message };
        }
      },

// INCIDENT ENDPOINTS

// ---------- ADMIN ----------
listAdminIncidents: async () => {
  try {
    const response = await axiosAuth.get("/admin/incidents/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error fetching admin incidents.";
    return { success: false, message };
  }
},

getAdminIncident: async (incidentId: string) => {
  try {
    const response = await axiosAuth.get(`/admin/incidents/${incidentId}/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error retrieving incident.";
    return { success: false, message };
  }
},

updateAdminIncidentStatus: async (incidentId: string, status: string) => {
  try {
    const response = await axiosAuth.patch(`/admin/incidents/${incidentId}/status/`, { status });
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error updating status.";
    return { success: false, message };
  }
},

updateAdminIncident: async (incidentId: string, data: object) => {
  try {
    const response = await axiosAuth.put(`/admin/incidents/${incidentId}/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error updating incident.";
    return { success: false, message };
  }
},

patchAdminIncident: async (incidentId: string, data: object) => {
  try {
    const response = await axiosAuth.patch(`/admin/incidents/${incidentId}/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error patching incident.";
    return { success: false, message };
  }
},

deleteAdminIncident: async (incidentId: string) => {  
  try {
    await axiosAuth.delete(`/admin/incidents/${incidentId}/`);
    return { success: true };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error deleting incident.";
    return { success: false, message };
  }
},

// ---------- USER ----------
reportIncident: async (data: object) => {
  try {
    const response = await axiosAuth.post("/incidents/", data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error reporting incident.";
    return { success: false, message };
  }
},

voteIncident: async (data: { incident_id: string; up_voted: boolean }) => {
  try {
    const response = await axiosAuth.post("/incident-votes/", data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error voting on incident.";
    return { success: false, message };
  }
},

submitSatisfaction: async (incidentId: string, data: { satisfaction: number }) => {
  try {
    const response = await axiosAuth.patch(`/incidents/${incidentId}/satisfaction/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error submitting satisfaction.";
    return { success: false, message };
  }
},

getMyReportedIncidents: async () => {
  try {
    const response = await axiosAuth.get("/incidents/my-reports/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error fetching your reports.";
    return { success: false, message };
  }
},

// ---------- ANONYMOUS ----------
reportIncidentAnonymous: async (data: object) => {
  try {
    const response = await axiosInstance.post("/anonymous/incidents/", data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error reporting anonymously.";
    return { success: false, message };
  }
},

// ---------- PUBLIC ----------
getPublicIncidents: async () => {
  try {
    const response = await axiosInstance.get("/public/incidents/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error fetching public incidents.";
    return { success: false, message };
  }
},

getIncidentStatistics: async () => {
  try {
    const response = await axiosInstance.get("/public/incident-statistics/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error fetching statistics.";
    return { success: false, message };
  }
},

// INCIDENT TAG ENDPOINTS

// ---------- PUBLIC ----------
getAllIncidentTags: async () => {
  try {
    const response = await axiosInstance.get("/incident-categories/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error fetching incident tags.";
    return { success: false, message };
  }
},
// Get Incidents by ID ⚠️I am not using this
getIncidentTagById: async (incidentCatId: string) => {
  try {
    const response = await axiosInstance.get(`/incident-categories/${incidentCatId}/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error retrieving incident tag.";
    return { success: false, message };
  }
},


// ---------- ADMIN ----------
getAdminIncidentTags: async () => {
  try {
    const response = await axiosAuth.get("/incident-categories/admin/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error fetching admin tags.";
    return { success: false, message };
  }
},

createIncidentTag: async (data: object) => {
  try {
    const response = await axiosAuth.post("/incident-categories/admin/", data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error creating tag.";
    return { success: false, message };
  }
},

getAdminIncidentTagById: async (id: string) => {
  try {
    const response = await axiosAuth.get(`/incident-categories/admin/${id}/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error retrieving tag.";
    return { success: false, message };
  }
},

updateIncidentTag: async (id: string, data: object) => {
  try {
    const response = await axiosAuth.put(`/incident-categories/admin/${id}/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error updating tag.";
    return { success: false, message };
  }
},

patchIncidentTag: async (id: string, data: object) => {
  try {
    const response = await axiosAuth.patch(`/incident-categories/admin/${id}/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error patching tag.";
    return { success: false, message };
  }
},

deleteIncidentTag: async (id: string) => {
  try {
    await axiosAuth.delete(`/incident-categories/admin/${id}/`);
    return { success: true };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error deleting tag.";
    return { success: false, message };
  }
},
getAllUsers: async () => {
  try {
    const response = await axiosAuth.get(`users/`)
    return { success: true, data: response.data }
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Failed to fetch users"
    return { success: false, message }
  }
},

updateUserProfile: async (payload: any) => {
  try {
    const response = await axiosAuth.put(`users/profile/`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Failed to update profile";
    return { success: false, message };
  }
},

deleteUser: async (id: string) => {
  try {
    await axiosAuth.delete(`users/${id}/`);
    return { success: true };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Failed to delete user";
    return { success: false, message };
  }
},



      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null })
        delete axios.defaults.headers.common["Authorization"]
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Auth protection hook
export function useRequireAuth() {
  const { isAuthenticated, user } = useAuthStore()
  return { isAuthenticated, user }
}
// This hook can be used in components to check if the user is authenticated
// and access the user data. If not authenticated, you can redirect or show a message.
// Example usage in a component:
// const { isAuthenticated, user } = useRequireAuth();
// if (!isAuthenticated) {
//   return <Redirect to="/login" />;