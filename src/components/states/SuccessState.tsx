import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

interface SuccessStateProps {
  title: string;
  description: string;
  nextStep?: {
    label: string;
    onClick: () => void;
  };
}

export default function SuccessState({ title, description, nextStep }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-success/10 border border-success/20">
        <CheckCircle className="size-5 text-success" />
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4">{description}</p>
      {nextStep && (
        <Button onClick={nextStep.onClick} className="text-xs bg-success hover:bg-success/90 text-white gap-1.5">
          {nextStep.label} <ArrowRight className="size-3" />
        </Button>
      )}
    </div>
  );
}
