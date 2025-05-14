import { create } from "zustand"
import { persist } from "zustand/middleware"

// Mock user data
export const mockUsers = [
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
  email: string
  role: "admin" | "security" | "student" | "faculty" | "guest"
  avatar?: string
  department?: string
  joinedAt: string
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const user = mockUsers.find(
          (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
        )

        if (user) {
          // Create a new object without the password
          const { password: _, ...userWithoutPassword } = user
          set({ user: userWithoutPassword as User, isAuthenticated: true })
          return { success: true, message: "Login successful" }
        }

        return { success: false, message: "Invalid email or password" }
      },

      signup: async (name, email, password, role) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if user already exists
        const existingUser = mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase())

        if (existingUser) {
          return { success: false, message: "Email already in use" }
        }

        // Create new user
        const newUser = {
          id: (mockUsers.length + 1).toString(),
          name,
          email,
          password,
          role: role as "admin" | "security" | "student" | "faculty" | "guest",
          avatar: `/avatars/0${Math.floor(Math.random() * 5) + 1}.png`,
          department: "Not specified",
          joinedAt: new Date().toISOString().split("T")[0],
        }

        // In a real app, we would save this to a database
        mockUsers.push(newUser)

        // Create a new object without the password
        const { password: _, ...userWithoutPassword } = newUser
        set({ user: userWithoutPassword as User, isAuthenticated: true })

        return { success: true, message: "Account created successfully" }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
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
