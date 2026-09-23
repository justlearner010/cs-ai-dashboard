import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  /** 标题旁的弱化信息（日期 / 说明 / 徽章） */
  muted?: ReactNode;
  /** 右侧操作区（按钮组 / 图例） */
  extra?: ReactNode;
}

/** 统一的区块标题头：图标 + h2 + 右侧操作，容器统一 mb-4。 */
export function SectionHeader({ icon: Icon, title, muted, extra }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <Icon className="w-5 h-5 text-brand-600 shrink-0" />
        <h2 className="text-lg font-semibold">{title}</h2>
        {muted}
      </div>
      {extra !== undefined && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
    </div>
  );
}
