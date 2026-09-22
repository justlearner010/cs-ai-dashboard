import { useEffect, useRef } from 'react';
import type { Course } from '../types';
import { dueStatus, today } from '../utils/helpers';

const LAST_NOTIFIED_KEY = 'csAiAgentReminderLastNotified';

export function reminderSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * 浏览器通知提醒：页面打开期间，
 * 每天最多提醒一次「逾期 / 今天到期」的任务汇总。
 * 权限由 TodayFocus 中的按钮发起请求。
 */
export function useTaskReminders(courses: Course[]) {
  const coursesRef = useRef(courses);
  coursesRef.current = courses;

  useEffect(() => {
    const notify = () => {
      if (!reminderSupported() || Notification.permission !== 'granted') return;
      const todos = coursesRef.current.flatMap((c) => c.todos);
      const overdue = todos.filter((t) => dueStatus(t) === 'overdue').length;
      const dueToday = todos.filter((t) => dueStatus(t) === 'today').length;
      if (!overdue && !dueToday) return;
      if (localStorage.getItem(LAST_NOTIFIED_KEY) === today()) return;

      const parts = [
        overdue ? `${overdue} 项已逾期` : '',
        dueToday ? `${dueToday} 项今天到期` : '',
      ].filter(Boolean);
      const n = new Notification('🎯 学习任务提醒', {
        body: `${parts.join('，')}，打开仪表盘处理吧`,
        tag: 'cs-ai-reminders',
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
      localStorage.setItem(LAST_NOTIFIED_KEY, today());
    };

    const timer = window.setTimeout(notify, 3000);
    const interval = window.setInterval(notify, 5 * 60 * 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);
}
