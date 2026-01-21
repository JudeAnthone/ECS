import Navigation from "@/shared/components/layout/landing/Navigation"
import Footer from "@/shared/components/layout/landing/Footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <Navigation />
        {children}
    <Footer />
    </>
  )
}