import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"
import axiosAuth from "./axiosAuth"

// Types
import {
  SignUp,
  Login,
  RefreshToken,
  Comment,
  UpdateComments,
  ChangeRole,
  AdminPassReset,
  Subscribe,
  AuthState
} from "./types"

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isRefreshing: false,

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
      passwordResetInitiate: async (email: string) => {
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

      updateSubscription: async () =>{
        try{
          const response = await axiosAuth.patch(`/users/subscription/`)
          return { success: true, data: response.data }
        } catch (error: any) {
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Network error. Please try again."
          return { success: false, message }
        }
      },

     setAccessToken: async (refreshToken: RefreshToken) => {
  // Start refresh
  set({ isRefreshing: true })

  try {
    const response = await axios.post(`auth/token/refresh/`, refreshToken)

    const data = response.data
    if (data?.access_token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`

      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isRefreshing: false, // ✅ Done refreshing
      })

      return { success: true, data }
    } else {
      // If access token wasn't returned
      set({ isRefreshing: false })
      return { success: false, message: "Token refresh failed" }
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      "Network error. Please try again."

    // Clear auth state if token refresh fails
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isRefreshing: false,
    })

    return { success: false, message }
  }
},
      passwordCompletionReset: async (token: string, new_password: string) => {
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

          return { success: true, data: response.data }
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
        credentials: UpdateComments
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

getRecentActivity: async () =>{
  try {
    const response = await axiosAuth.get("/activity-logs/recent/");
    return { success: true, data: response.data };
  } catch (error: any) {
    const message =
      error?.response?.data?.detail || error?.message || "Error fetching recent activity.";
    return { success: false, message };
  }
},

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

      postAdminChangeRole: async (data: ChangeRole) => {
        try {
          const response = await axiosAuth.post(`admin/users/op/change-role/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error changing role.";
          return { success: false, message };
        }
      },
      adminResetPassword: async (data: AdminPassReset) => {
        try {
          const response = await axiosAuth.post(`admin/users/op/reset-password/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error resetting password.";
    return { success: false, message };
  }
},

subscribeToNotifications: async (data: Subscribe) => {
  try{
    const response = await axiosAuth.post(`subscriptions/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = error?.response?.data?.detail || error?.message || "Error subscribing to notifications.";
    return { success: false, message };
  }
},

adminGetSubscription: async  () =>{
try{
  const response = await axiosAuth.get(`admin/subscriptions/`)
  return{success: true, data: response.data}
}
catch(err: any){
  const message = err?.response.data?.detail || err?.message || "Error fetching subscriptions.";
  return {success: false, message}
}
},

securityGetStats: async () =>{
  try{
  const response = await axiosAuth.get(`security/incident-statistics/`)
  return{success: true, data: response.data}
}
catch(err: any){
  const message = err?.response.data?.detail || err?.message || "Error fetching security statistics.";
  return {success: false, message}
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
          const response = await axiosAuth.post("/incidents/", data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
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
          const response = await axiosAuth.post("/anonymous/incidents/", data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error reporting anonymously.";
          return { success: false, message };
        }
      },

      // ---------- PUBLIC ----------
      getPublicIncidents: async () => {
        try {
          const response = await axiosAuth.get("/public/incidents/");
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching public incidents.";
          return { success: false, message };
        }
      },

      getIncidentStatistics: async () => {
        try {
          const response = await axiosAuth.get("/public/incident-statistics/");
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
          const response = await axiosAuth.get("/incident-categories/");
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching incident tags.";
          return { success: false, message };
        }
      },
      // Get Incidents by ID ⚠️I am not using this
      getIncidentTagById: async (incidentCatId: string) => {
        try {
          const response = await axiosAuth.get(`/incident-categories/${incidentCatId}/`);
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

      adminGetAllUsers: async () => {
        try {
          const response = await axiosAuth.get(`admin/users/`)
          return { success: true, data: response.data }
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Failed to fetch admin users"
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
          // Update the user in the store with the latest profile data
          set((state) => ({
            ...state,
            user: response.data || state.user,
          }))
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Failed to update profile";
          return { success: false, message };
        }
      },

      deleteUser: async (id: string) => {
        try {
          await axiosAuth.delete(`admin/users/${id}/`);
          return { success: true };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Failed to delete user";
          return { success: false, message };
        }
      },

updateIncident: async (id: string, data: object) => {
        try {
          const response = await axiosAuth.patch(`/admin/incidents/${id}/status/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error updating incident status.";
          return { success: false, message };
        }
      },
      
      addUser: async (id: string, data:object)=>{
        try{
          const response= await axiosAuth.post (`admin/users/`, data,
            {headers: {
              "Content-Type": "multipart/form-data",
            }
          }
          )
          return { success: true, data: response.data }
        } catch (error: any) {
            const message = error?.response?.data?.detail || error?.message || "Error adding user.";
            return { success: false, message };
          
        }
      },

      getRoles: async (id:string, data:object) => {
        try {
          const response = await axiosAuth.get(`/admin/roles/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching roles.";
          return { success: false, message };
        }
      },
       createRoles: async (id:string, data:object) => {
        try {
          const response = await axiosAuth.post(`/admin/roles/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching roles.";
          return { success: false, message };
        }
      },
       deleteRole: async (id:string, data:object) => {
        try {
          const response = await axiosAuth.delete(`/admin/roles/${id}/`, { data });
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching roles.";
          return { success: false, message };
        }
      },

      getInvestigatingTeamMembers: async () => {
        try {
          const response = await axiosAuth.get(`/admin/investigating-team-members/`);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching investigating team.";
          return { success: false, message };
        }
      },

      deleteInvestigatingTeamMember: async (id: string) => {
        try {
          await axiosAuth.delete(`/admin/investigating-team-members/${id}/`);
          return { success: true };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error deleting investigating team member.";
          return { success: false, message }; 
        }
      },
deleteInvestigatingTeam: async(id:string) => {
        try {
          await axiosAuth.delete(`/admin/investigating-teams/${id}/`);
          return { success: true };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error deleting investigating team.";
          return { success: false, message };
        }
      },  
      assignInvestigatingTeam: async (incident_id: string, team_id: string) => {
        try {
          const response = await axiosAuth.post(`/admin/incidents/op/assign-team/`, { incident_id, team_id });
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching investigating teams.";
          return { success: false, message };
        }
      },

      getUserNotification: async()=> {
          try{
            const response= await axiosAuth.get(`/notifications/`)
            return {success: true, data: response.data}
          }
          catch(error:any){
            const message = error?.response?.data?.detail || "Error fecthing notification"
            return{success: false, message}
          }
      },

markNotification: async (id:string, read:boolean) => {
  try{ 
    const response = await axiosAuth.patch(`notifications/${id}/mark-read/?read=${read}`);
    return{success: true, data:response.data}
  }
  catch(error:any){
    const message= error?.response?.data?.detail || "Error marking notification as read"
    return {success: false, message}
  }
},

      getInvestigatingTeam: async() => {
        try{
          const response= await axiosAuth.get(`/admin/investigating-teams/`)
          return { success: true, data: response.data };
        }
        catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching investigating team.";
          return { success: false, message };
        }
      },

      
      postInvestigatingTeam: async (data:object) => {
        try {
          const response = await axiosAuth.post(`/admin/investigating-team-members/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching investigating team.";
          return { success: false, message };
        }
      },

      createInvestigatingTeam: async ( data:object) => {
        try {
          const response = await axiosAuth.post(`/admin/investigating-teams/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error creating investigating team.";
          return { success: false, message };
        }
      },

      passwordReset: async (token:string, data:object)=>{
        try{
          const response = await axiosAuth.post(`auth/complete-password-reset/`, { token, ...data });
          return { success: true, data: response.data };
        }
        catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error resetting password.";
          return { success: false, message };
        }
      },

  getUserDetails: async (id:string, data:object) => {
        try {
          const response = await axiosAuth.get(`/admin/users/${id}/`, data);
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Error fetching user details.";
          return { success: false, message };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null })
        delete axios.defaults.headers.common["Authorization"]
      },
      verifyAccessToken: async (token: string) => {
        try {
          const response = await axiosAuth.post("auth/token/verify/", { token });
          return { success: true, data: response.data };
        } catch (error: any) {
          const message = error?.response?.data?.detail || error?.message || "Token verification failed.";
          return { success: false, message };
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Auth protection hook
export function useRequireAuth() {
  const { isAuthenticated, user, isRefreshing } = useAuthStore()
  return { isAuthenticated, user, isRefreshing }
}
