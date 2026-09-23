import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, FileText } from 'lucide-react';
import type { BackupPayload } from '../utils/backup';
import { MOTION } from '../motion/tokens';

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

  if (!payload) return null;

  const content = activeTab === 'markdown' ? payload.markdown : payload.xml;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cs-ai-agent-backup-${new Date().toISOString().slice(0, 10)}.${activeTab === 'markdown' ? 'md' : 'xml'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-semibold">飞书文档备份内容</h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'markdown' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('xml')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'xml' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    飞书 XML
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="text-xs bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 overflow-auto whitespace-pre-wrap break-all"
                >
                  {content}
                </motion.pre>
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" /> 下载
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                <Copy className="w-4 h-4" /> {copied ? '已复制' : '复制'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
