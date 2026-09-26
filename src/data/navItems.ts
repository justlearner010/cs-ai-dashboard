import {
  Target,
  LayoutDashboard,
  Trophy,
  Radar,
  TrendingUp,
  Calendar,
  MapPin,
  BookOpen,
  PenLine,
  History,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** 页面导航锚点（独立模块，避免 Sidebar ↔ useActiveSection 循环引用） */
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'section-today', label: '今日焦点', icon: Target },
  { id: 'section-overview', label: '概览', icon: LayoutDashboard },
  { id: 'section-achievements', label: '成长成就', icon: Trophy },
  { id: 'section-radar', label: '能力雷达图', icon: Radar },
  { id: 'section-trend', label: '学习趋势', icon: TrendingUp },
  { id: 'section-heatmap', label: '学习热力图', icon: Calendar },
  { id: 'section-path', label: '学习路径', icon: MapPin },
  { id: 'section-courses', label: '课程清单', icon: BookOpen },
  { id: 'section-daily', label: '每日记录', icon: PenLine },
  { id: 'section-logs', label: '学习日志', icon: History },
];

export const SECTION_IDS: string[] = SIDEBAR_ITEMS.map(item => item.id);
