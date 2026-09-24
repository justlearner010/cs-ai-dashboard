import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import type { Course, LogEntry, Mood } from '../types';
import { uuid, today, moodLabel } from '../utils/helpers';
import { SectionHeader } from './SectionHeader';
import { GlassSurface } from './glass/GlassSurface';

interface DailyLogFormProps {
  courses: Course[];
  editingLog: LogEntry | null;
  onSave: (log: LogEntry) => void;
  onCancelEdit: () => void;
}

const moods: Mood[] = ['focused', 'tired', 'excited', 'confused', 'productive'];

export function DailyLogForm({ courses, editingLog, onSave, onCancelEdit }: DailyLogFormProps) {
  const [date, setDate] = useState(today());
  const [course, setCourse] = useState('');
  const [hours, setHours] = useState(1);
  const [mood, setMood] = useState<Mood>('focused');
  const [knowledge, setKnowledge] = useState('');
  const [lab, setLab] = useState('');
  const [questions, setQuestions] = useState('');
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    if (courses.length > 0 && !course) {
      setCourse(`${courses[0].phase} — ${courses[0].name}`);
    }
  }, [courses, course]);

  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setCourse(editingLog.course);
      setHours(editingLog.hours);
      setMood(editingLog.mood || 'focused');
      setKnowledge(editingLog.knowledge);
      setLab(editingLog.lab);
      setQuestions(editingLog.questions);
      setReflection(editingLog.reflection || '');
    }
  }, [editingLog]);

  const reset = () => {
    setDate(today());
    setCourse(courses.length > 0 ? `${courses[0].phase} — ${courses[0].name}` : '');
    setHours(1);
    setMood('focused');
    setKnowledge('');
    setLab('');
    setQuestions('');
    setReflection('');
    onCancelEdit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: LogEntry = {
      id: editingLog ? editingLog.id : uuid(),
      date,
      course,
      hours,
      mood,
      knowledge,
      lab,
      questions,
      reflection,
      createdAt: editingLog ? editingLog.createdAt : new Date().toISOString(),
    };
    onSave(entry);
    reset();
  };

  return (
    <GlassSurface className="card p-4 sm:p-5">
      <SectionHeader icon={Save} title={editingLog ? '编辑学习记录' : '每日学习记录'} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">课程</label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              required
              className="input"
            >
              {courses.map(c => (
                <option key={c.id} value={`${c.phase} — ${c.name}`}>{c.phase} — {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">时长（小时）</label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">状态</label>
            <select
              value={mood}
              onChange={e => setMood(e.target.value as Mood)}
              className="input"
            >
              {moods.map(m => (
                <option key={m} value={m}>{moodLabel(m)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">📚 知识点（学了什么）</label>
            <textarea
              value={knowledge}
              onChange={e => setKnowledge(e.target.value)}
              rows={3}
              required
              placeholder="今天看完的章节/视频/概念..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">🛠️ Lab / 练习（做了什么）</label>
            <textarea
              value={lab}
              onChange={e => setLab(e.target.value)}
              rows={3}
              required
              placeholder="完成的作业、项目、代码..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">❓ 问题 / 反馈（卡点）</label>
            <textarea
              value={questions}
              onChange={e => setQuestions(e.target.value)}
              rows={3}
              required
              placeholder="没懂的地方、需要复习的点..."
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">💡 今日反思</label>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            rows={2}
            placeholder="一句话总结..."
            className="input"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn--solid px-4"
          >
            <Save className="w-4 h-4" /> {editingLog ? '更新记录' : '保存记录'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="btn btn--quiet px-4"
          >
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
        </div>
      </form>
    </GlassSurface>
  );
}
