import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoSearchResultsProps {
  query?: string;
  onReset?: () => void;
}

export default function NoSearchResults({ query, onReset }: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted border border-border">
        <SearchX className="size-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No results found</h3>
      {query && (
        <p className="text-xs text-muted-foreground mb-1">
          No matches for "<span className="font-medium text-foreground">{query}</span>"
        </p>
      )}
      <p className="text-xs text-muted-foreground/70 max-w-sm mb-4">
        Try adjusting your search terms or filters to find what you're looking for.
      </p>
      {onReset && (
        <Button variant="outline" onClick={onReset} className="text-xs">
          Clear search and filters
        </Button>
      )}
    </div>
  );
}
