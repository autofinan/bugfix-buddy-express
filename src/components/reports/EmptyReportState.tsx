import { Card, CardContent } from "@/components/ui/card";
import { FileX, TrendingUp } from "lucide-react";

interface EmptyReportStateProps {
  title?: string;
  message?: string;
}

export function EmptyReportState({ 
  title = "Sem dados para exibir",
  message = "Realize algumas vendas ou registre despesas para visualizar este relatório."
}: EmptyReportStateProps) {
  return (
    <Card className="shadow-md">
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="rounded-full bg-muted p-4 sm:p-6 mb-4">
          <FileX className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {message}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Comece registrando suas vendas e despesas</span>
        </div>
      </CardContent>
    </Card>
  );
}
