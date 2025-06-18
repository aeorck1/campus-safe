import { ReportIncidentForm } from "@/components/forms/report-incident-form"

export default function ReportPage() {
  return (
    <div className="max-w-2xl mx-auto py-6 w-[85%]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Report an Incident</h1>
        <p className="text-muted-foreground mt-2">
          Help keep our campus safe by reporting incidents or safety concerns
        </p>
      </div>
      <ReportIncidentForm />
    </div>
  )
}
