import { cn } from "@/shared/lib/utils"

const Logo = ({
  title,
  className
}: {
  title: string
  className?: string
}) => {
  return (
    <p className={cn("text-xl font-bold tracking-tight", className)}>
      {title}
    </p>
  )
}

export default Logo