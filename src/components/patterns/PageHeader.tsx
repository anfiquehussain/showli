import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

const PageHeader = ({ title, description, actions, children }: PageHeaderProps) => {
  return (
    <div className="space-y-6 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-4xl font-heading font-bold text-gradient-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
