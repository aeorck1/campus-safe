import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "axios"

const API_BASE_URL = "http://127.0.0.1:8000/api/v1/"

// Mock user data
export const mockUsers = 
[
  {
    id: "1",
    name: "Admin User",
    email: "admin@ui.edu.ng",
    password: "password123", // In a real app, this would be hashed
    role: "admin",
    avatar: "/avatars/01.png",
    department: "Information Technology",
    joinedAt: "2023-01-10",
  },
  {
    id: "2",
    name: "Security Officer",
    email: "security@ui.edu.ng",
    password: "password123",
    role: "security",
    avatar: "/avatars/02.png",
    department: "Campus Security",
    joinedAt: "2023-02-15",
  },
  {
    id: "3",
    name: "John Doe",
    email: "john.doe@ui.edu.ng",
    password: "password123",
    role: "student",
    avatar: "/avatars/03.png",
    department: "Computer Science",
    joinedAt: "2023-03-20",
  },
  {
    id: "4",
    name: "Jane Smith",
    email: "jane.smith@ui.edu.ng",
    password: "password123",
    role: "faculty",
    avatar: "/avatars/04.png",
    department: "Engineering",
    joinedAt: "2023-04-05",
  },
  {
    id: "5",
    name: "Guest User",
    email: "guest@ui.edu.ng",
    password: "password123",
    role: "guest",
    avatar: "/avatars/05.png",
    department: "Visitor",
    joinedAt: "2023-05-12",
  },
]

// Types
export type User = {
  id: string
  name: string
  email?: string
  role: "admin" | "security" | "student" | "faculty" | "guest"
  avatar?: string
  department?: string
  joinedAt: string
  username: string // Optional for API login
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (
  first_name: string,
  last_name: string,
  email: string,
  username: string,
  password: string
   ) => Promise<{ success: boolean; message: string }>
  loginWithApi: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      login: async (email, password) => {
        // Simulate API call delay for mock login
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const user = mockUsers.find(
          (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
        )

        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({ user: userWithoutPassword as User, isAuthenticated: true })
          return { success: true, message: "Login successful" }
        }

        return { success: false, message: "Invalid email or password" }
      },

    signup: async (
  first_name: string,
  last_name: string,
  email: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}users/students/register/`,
      {
        first_name,
        last_name,
        email,
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = response.data

    if (response.status === 201 || response.status === 200) {
      return { success: true, message: "Account created successfully. Please login." }
    } else {
      return { success: false, message: data.detail || "Registration failed" }
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      "Network error. Please try again."
    return { success: false, message }
  }
},

      loginWithApi: async (
        username: string,
        password: string
      ): Promise<{ success: boolean; message: string }> => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}auth/login/`,
            { username, password },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )

          const data = response.data

          if (data && data.access_token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`
            set({
              user: data.user || null,
              isAuthenticated: true,
              accessToken: data.access_token,
            })
            return { success: true, message: "Login successful" }
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
      // incidentsListAdmin: async () => {
      //   try {
      //     const response = await axios.get(`${API_BASE_URL}admin/incidents/`, {
      //       headers: {
      //         Authorization: `Bearer ${get().accessToken}`,
      //       },
      //     })

      //     return { success: true, data: response.data }
      //   } catch (error: any) {
      //     const message =
      //       error?.response?.data?.detail ||
      //       error?.message ||
      //       "Network error. Please try again."
      //     return { success: false, message }
      //   }
      // },

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