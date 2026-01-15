import * as React from "react";

interface PageHeaderProps {
  title: string;
  date?: string;
}

export function PageHeader({ title, date }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        {title}
      </h1>
      {date && (
        <div className="text-sm text-muted-foreground mb-2">{date}</div>
      )}
      <div className="border-b border-border w-full" />
    </header>
  );
}
