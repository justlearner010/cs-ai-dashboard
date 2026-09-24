import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, FileText } from 'lucide-react';
import type { BackupPayload } from '../utils/backup';
import { MOTION } from '../motion/tokens';
import { GlassSurface } from './glass/GlassSurface';

interface BackupModalProps {
  payload: BackupPayload | null;
  onClose: () => void;
}

export function BackupModal({ payload, onClose }: BackupModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'markdown' | 'xml'>('markdown');

  useEffect(() => {
    if (payload) {
      setCopied(false);
      setActiveTab('markdown');
    }
  }, [payload]);

  const content = activeTab === 'markdown' ? payload?.markdown : payload?.xml;

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content || !payload) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cs-ai-agent-backup-${new Date().toISOString().slice(0, 10)}.${activeTab === 'markdown' ? 'md' : 'xml'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // AnimatePresence 常驻：payload 归 null 时播放退出动画后再卸载
  return (
    <AnimatePresence>
      {payload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION.duration.base / 1000, ease: MOTION.ease.out }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: MOTION.duration.slow / 1000, ease: MOTION.ease.out }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl"
          >
            <GlassSurface
              display="flex"
              className="glass-strong rounded-2xl w-full max-h-[80vh] flex flex-col"
            >
            <div className="flex items-center justify-between p-4 border-b border-white/50 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-semibold">飞书文档备份内容</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="关闭"
                className="btn btn--quiet btn--icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-white/50 dark:border-slate-700/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex rounded-lg border border-white/50 dark:border-slate-700 overflow-hidden glass-subtle">
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'markdown' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('xml')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'xml' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700'
                    }`}
                  >
                    飞书 XML
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeTab === 'markdown'
                    ? '可复制到飞书文档「导入 Markdown」'
                    : '可配合 scripts/backup-to-feishu.mjs 自动创建文档'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: MOTION.duration.fast / 1000, ease: MOTION.ease.out }}
                  className="text-xs glass-subtle rounded-xl p-4 overflow-auto whitespace-pre-wrap break-all"
                >
                  {content}
                </motion.pre>
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-white/50 dark:border-slate-700/60 flex justify-end gap-3">
              <button
                onClick={handleDownload}
                className="btn btn--quiet px-4"
              >
                <Download className="w-4 h-4" /> 下载
              </button>
              <button
                onClick={handleCopy}
                className="btn btn--solid px-4"
              >
                <Copy className="w-4 h-4" /> {copied ? '已复制' : '复制'}
              </button>
            </div>
            </GlassSurface>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
