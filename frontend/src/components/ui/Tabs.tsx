import { cn } from '../../lib/utils';
import React, { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultActive?: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultActive, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultActive || tabs[0]?.id);

  return (
    <div className={cn(className)}>
      <div className="flex gap-1 border-b border-border mb-4 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'px-4 py-2 text-t-body transition-colors border-b-2',
              active === tab.id
                ? 'border-accent text-fg-1'
                : 'border-transparent text-fg-3 hover:text-fg-2'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const props = child.props as any;
          if (props.id === active) return child;
          return null;
        })}
      </div>
    </div>
  );
}
