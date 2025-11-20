import { FileX } from "lucide-react";

interface NoDataProps {
  title: string;
  message: string;
}

export function NoData({ title, message }: NoDataProps) {
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileX className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {title}
        </h3>

        <p className="text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
