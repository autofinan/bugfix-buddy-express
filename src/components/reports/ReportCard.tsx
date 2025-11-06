import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "green" | "red" | "blue" | "yellow" | "purple";
  icon?: LucideIcon;
  className?: string;
}

const colorClasses = {
  green: "text-green-600 dark:text-green-400",
  red: "text-red-600 dark:text-red-400",
  blue: "text-blue-600 dark:text-blue-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  purple: "text-purple-600 dark:text-purple-400",
};

const bgColorClasses = {
  green: "bg-green-100 dark:bg-green-900/20",
  red: "bg-red-100 dark:bg-red-900/20",
  blue: "bg-blue-100 dark:bg-blue-900/20",
  yellow: "bg-yellow-100 dark:bg-yellow-900/20",
  purple: "bg-purple-100 dark:bg-purple-900/20",
};

export function ReportCard({ 
  title, 
  value, 
  subtitle, 
  color = "blue", 
  icon: Icon,
  className 
}: ReportCardProps) {
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-lg", bgColorClasses[color])}>
            <Icon className={cn("h-4 w-4", colorClasses[color])} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl sm:text-3xl font-bold", colorClasses[color])}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
