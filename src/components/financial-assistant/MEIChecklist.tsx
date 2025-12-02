import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  period: "mensal" | "anual";
  deadline?: string;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "das",
    title: "Pagar DAS (Documento de Arrecadação do Simples Nacional)",
    description: "Pagamento mensal obrigatório do MEI - R$ 66,00 a R$ 71,00",
    period: "mensal",
    deadline: "Dia 20 de cada mês",
  },
  {
    id: "dasn",
    title: "Declaração Anual do Simples Nacional (DASN-SIMEI)",
    description: "Declaração anual de faturamento",
    period: "anual",
    deadline: "Até 31 de maio",
  },
  {
    id: "nf",
    title: "Emitir Notas Fiscais",
    description: "Emita NF para vendas a empresas (B2B)",
    period: "mensal",
  },
  {
    id: "controle",
    title: "Controle de Receitas e Despesas",
    description: "Mantenha registro mensal de entradas e saídas",
    period: "mensal",
  },
  {
    id: "limite",
    title: "Verificar Limite de Faturamento",
    description: "Limite anual: R$ 81.000,00 (média de R$ 6.750,00/mês)",
    period: "mensal",
  },
  {
    id: "inss",
    title: "Verificar Contribuição INSS",
    description: "DAS garante aposentadoria, auxílio-doença e licença-maternidade",
    period: "anual",
  },
  {
    id: "alvara",
    title: "Renovar Alvará de Funcionamento",
    description: "Verificar com prefeitura se precisa renovar",
    period: "anual",
  },
  {
    id: "cadastro",
    title: "Atualizar Dados Cadastrais",
    description: "Mantenha seus dados atualizados no Portal do Empreendedor",
    period: "anual",
  },
];

export function MEIChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleCheck = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const monthlyItems = checklistItems.filter(item => item.period === "mensal");
  const annualItems = checklistItems.filter(item => item.period === "anual");

  const monthlyCompleted = monthlyItems.filter(item => checked[item.id]).length;
  const annualCompleted = annualItems.filter(item => checked[item.id]).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Checklist de Obrigações MEI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">⚠️ Importante para MEI:</p>
            <p className="text-sm">
              Manter em dia com as obrigações evita multas e garante seus benefícios previdenciários.
              Use este checklist para não esquecer nada!
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Obrigações Mensais</h3>
              <Badge variant={monthlyCompleted === monthlyItems.length ? "default" : "secondary"}>
                {monthlyCompleted}/{monthlyItems.length} completas
              </Badge>
            </div>
            <div className="space-y-3">
              {monthlyItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Checkbox
                    id={item.id}
                    checked={checked[item.id] || false}
                    onCheckedChange={() => handleCheck(item.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {item.title}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    {item.deadline && (
                      <p className="text-xs text-primary mt-1 font-semibold">
                        📅 {item.deadline}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Obrigações Anuais</h3>
              <Badge variant={annualCompleted === annualItems.length ? "default" : "secondary"}>
                {annualCompleted}/{annualItems.length} completas
              </Badge>
            </div>
            <div className="space-y-3">
              {annualItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Checkbox
                    id={item.id}
                    checked={checked[item.id] || false}
                    onCheckedChange={() => handleCheck(item.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {item.title}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    {item.deadline && (
                      <p className="text-xs text-primary mt-1 font-semibold">
                        📅 {item.deadline}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2 text-sm">
          <p className="font-semibold">📚 Links Úteis:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Portal do Empreendedor: <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gov.br/empreendedor</a></li>
            <li>• Emissão de DAS: <a href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portal do Simples Nacional</a></li>
            <li>• DASN-SIMEI: <a href="https://www8.receita.fazenda.gov.br/SimplesNacional/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Declaração Anual</a></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
