import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function RecipeCardSkeleton({ size = "default", showFooter = true }) {
  const isCompact = size === 'compact';

  return (
    <Card className="h-full flex flex-col overflow-hidden border-border bg-card">
      {/* Image Skeleton */}
      <div className={`w-full ${isCompact ? 'aspect-video' : 'aspect-4/3'}`}>
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <CardContent className={`flex-1 flex flex-col ${isCompact ? 'p-3' : 'p-4 md:p-5'}`}>
        {/* Title Skeleton - 2 lines */}
        <Skeleton className="h-6 w-[85%] mb-2" />
        <Skeleton className="h-6 w-[60%] mb-4" />

        {/* Meta info skeleton */}
        <div className="flex gap-4 mb-3 mt-auto">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Diet tags skeleton */}
        {!isCompact && (
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        )}
      </CardContent>

      {showFooter && (
        <CardFooter className={`border-t border-border ${isCompact ? 'p-2' : 'p-3'}`}>
          <Skeleton className="h-9 w-full rounded-md" />
        </CardFooter>
      )}
    </Card>
  );
}
