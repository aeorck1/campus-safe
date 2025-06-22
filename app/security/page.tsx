import { SecurityDashboard } from "@/components/security/security-dashboard"

export default function SecurityPage() {
  return (
    <div className="space-y-6 w-[90%] mx-auto my-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor and respond to campus incidents</p>
      </div>

      <SecurityDashboard />
    </div>
  )
}
