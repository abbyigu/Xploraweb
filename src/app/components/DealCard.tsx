interface DealCardProps {
  title: string;
  venue: string;
  category: string;
}

export function DealCard({ title, venue, category }: DealCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:border-secondary/50 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs text-secondary mb-1">{category}</div>
          <h4 className="text-base mb-1 group-hover:text-secondary transition-colors">{title}</h4>
          <p className="text-sm text-muted-foreground">{venue}</p>
        </div>
        <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">✨</div>
      </div>
    </div>
  );
}
