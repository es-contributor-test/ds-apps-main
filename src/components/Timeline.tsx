interface TimelineItem {
  timespan: string;
  title: string;
  company?: string;
  logo?: string;
  description?: string;
  details?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex gap-6 items-center rounded-2xl border border-border bg-primary-foreground px-5 py-3"
        >
          {/* Logo - Simple left side */}
          {item.logo && (
            <div className="flex-shrink-0">
              <img 
                src={`/logos/${item.logo}`} 
                alt={item.company || item.title}
                className="h-14 w-14 object-contain"
              />
            </div>
          )}
          
          {/* Content - Takes remaining space */}
          <div className="flex flex-col gap-y-1.5 flex-1">
            <div className="flex flex-col gap-y-0.5">
              <h1 className="text-lg font-medium">{item.title}</h1>
              {item.company && (
                <h2 className="text-muted-foreground">{item.company}</h2>
              )}
              <h2 className="text-muted-foreground">{item.timespan}</h2>
            </div>
            {item.description && (
              <p className="text-muted-foreground">{item.description}</p>
            )}
            {item.details && item.details.length > 0 && (
              <ul className="ml-4 list-disc text-muted-foreground">
                {item.details.map((detail, j) => (
                  <li key={j}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
