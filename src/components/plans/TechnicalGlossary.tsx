import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface TechnicalGlossaryProps {
  terms: GlossaryTerm[];
}

export function TechnicalGlossary({ terms }: TechnicalGlossaryProps) {
  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="glossary" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Entenda os termos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              {terms.map((item, index) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="font-semibold text-primary min-w-fit">{item.term}:</span>
                  <span className="text-muted-foreground">{item.definition}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
