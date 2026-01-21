import { Spinner } from "@/shared/components/ui/Spinner"

export default function DashboardPage() {
  return (
    /*
    * Change this into a skeleton for better UI 
    */
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Spinner />
      </div>
    </div>
  )
}