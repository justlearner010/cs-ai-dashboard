import { motion, useReducedMotion } from 'framer-motion';
import { MOTION } from '../motion/tokens';

export type AvatarBand = 1 | 2 | 3 | 4 | 5;

/** 称号段位即形象分段：1-3 布衣 / 4-7 围巾木杖 / 8-9 披风腰带 / 10-14 光环星 / 15+ 王冠光晕 */
export function avatarBand(level: number): AvatarBand {
  return level >= 15 ? 5 : level >= 10 ? 4 : level >= 8 ? 3 : level >= 4 ? 2 : 1;
}

interface AvatarFigureProps {
  level: number;
  className?: string;
}

export function AvatarFigure({ level, className = '' }: AvatarFigureProps) {
  const reduce = useReducedMotion();
  const band = avatarBand(level);
  const dur = MOTION.duration.base / 1000;
  const ease = MOTION.ease.out;
  const layer = band >= 2 && !reduce
    ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: dur, ease } }
    : band >= 2
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : null;

  return (
    <svg
      viewBox="0 0 160 200"
      className={`w-44 h-auto shrink-0 ${className}`}
      role="img"
      aria-label={`RPG 形象，等级 ${level}`}
    >
      {band >= 5 && (
        <motion.g data-band="5" {...layer}>
          <circle cx="80" cy="84" r="74" className="fill-brand-300 dark:fill-brand-500" opacity="0.14" />
          <circle cx="80" cy="84" r="56" className="fill-brand-200 dark:fill-brand-400" opacity="0.16" />
        </motion.g>
      )}

      {band >= 3 && (
        <motion.g data-band="3" {...layer}>
          <path
            d="M54,90 Q80,82 106,90 L114,154 Q80,164 46,154 Z"
            className="fill-brand-700 dark:fill-brand-900"
          />
        </motion.g>
      )}

      {/* 基础体：圆脸大眼 Q 版小人（布衣） */}
      <g data-band="1">
        <rect x="74" y="78" width="12" height="12" rx="3" className="fill-rose-100 dark:fill-rose-200" />
        <path
          d="M56,92 Q80,86 104,92 L108,134 Q80,142 52,134 Z"
          className="fill-slate-300 dark:fill-slate-600"
        />
        <rect x="44" y="94" width="11" height="32" rx="5.5" className="fill-slate-300 dark:fill-slate-600" />
        <rect x="105" y="94" width="11" height="32" rx="5.5" className="fill-slate-300 dark:fill-slate-600" />
        <rect x="63" y="138" width="13" height="24" rx="4" className="fill-slate-400 dark:fill-slate-500" />
        <rect x="84" y="138" width="13" height="24" rx="4" className="fill-slate-400 dark:fill-slate-500" />
        <rect x="57" y="159" width="21" height="9" rx="4" className="fill-stone-600 dark:fill-stone-500" />
        <rect x="82" y="159" width="21" height="9" rx="4" className="fill-stone-600 dark:fill-stone-500" />
        <circle cx="80" cy="54" r="30" className="fill-rose-100 dark:fill-rose-200" />
        <path
          d="M52,54 C50,30 62,20 80,20 C98,20 110,30 108,54 C104,42 96,34 80,34 C64,34 56,42 52,54 Z"
          className="fill-slate-700 dark:fill-slate-300"
        />
        <circle cx="69" cy="58" r="5" className="fill-slate-900 dark:fill-slate-100" />
        <circle cx="91" cy="58" r="5" className="fill-slate-900 dark:fill-slate-100" />
        <circle cx="70.5" cy="56.5" r="1.6" fill="#fff" />
        <circle cx="92.5" cy="56.5" r="1.6" fill="#fff" />
        <ellipse cx="60" cy="67" rx="6" ry="3" className="fill-rose-300" opacity="0.7" />
        <ellipse cx="100" cy="67" rx="6" ry="3" className="fill-rose-300" opacity="0.7" />
        <path
          d="M75,71 Q80,76 85,71"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-slate-700 dark:stroke-slate-300"
        />
        <circle cx="49.5" cy="130" r="5.5" className="fill-rose-100 dark:fill-rose-200" />
        <circle cx="110.5" cy="130" r="5.5" className="fill-rose-100 dark:fill-rose-200" />
      </g>

      {band >= 2 && (
        <motion.g data-band="2" {...layer}>
          <path
            d="M62,86 Q80,96 98,86 L100,98 Q80,108 60,98 Z"
            className="fill-brand-500"
          />
          <path d="M94,96 L104,122 L94,120 L88,100 Z" className="fill-brand-600" />
          <rect x="116" y="66" width="7" height="86" rx="3.5" className="fill-stone-600 dark:fill-stone-500" />
        </motion.g>
      )}

      {band >= 3 && (
        <motion.g data-band="3b" {...layer}>
          <rect x="54" y="114" width="52" height="9" rx="2" className="fill-amber-700" />
          <rect x="74" y="114" width="12" height="9" rx="2" className="fill-amber-400" />
          <path d="M119.5,48 l9,11 -9,11 -9,-11 z" className="fill-emerald-400" />
        </motion.g>
      )}

      {band >= 4 && (
        <motion.g data-band="4" {...layer}>
          <ellipse
            cx="80"
            cy="16"
            rx="27"
            ry="7"
            fill="none"
            strokeWidth="3.5"
            className="stroke-amber-400"
          />
          <path d="M80,123 l5,6 -5,6 -5,-6 z" className="fill-brand-400" opacity="0.85" />
          <circle cx="67" cy="129" r="3" className="fill-brand-400" opacity="0.85" />
          <circle cx="93" cy="129" r="3" className="fill-brand-400" opacity="0.85" />
          <path
            d="M40,44 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 z"
            className="fill-amber-400"
          />
          <path
            d="M126,34 l1.6,4 4,1.6 -4,1.6 -1.6,4 -1.6,-4 -4,-1.6 4,-1.6 z"
            className="fill-amber-400"
          />
        </motion.g>
      )}

      {band >= 5 && (
        <motion.g data-band="5b" {...layer}>
          <path
            d="M58,32 L58,22 L68,28 L74,15 L80,25 L86,15 L92,28 L102,22 L102,32 Z"
            className="fill-amber-400 stroke-amber-600"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="68" cy="27" r="1.8" className="fill-brand-500" />
          <circle cx="80" cy="23" r="1.8" className="fill-brand-500" />
          <circle cx="92" cy="27" r="1.8" className="fill-brand-500" />
          <rect x="115.5" y="78" width="8" height="5" rx="1.5" className="fill-amber-400" />
          <rect x="115.5" y="132" width="8" height="5" rx="1.5" className="fill-amber-400" />
          <path
            d="M119.5,34 l1.8,4.4 4.4,1.8 -4.4,1.8 -1.8,4.4 -1.8,-4.4 -4.4,-1.8 4.4,-1.8 z"
            className="fill-amber-300"
          />
        </motion.g>
      )}
    </svg>
  );
}
