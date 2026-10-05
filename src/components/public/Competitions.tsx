import React, { useState } from 'react';
import { AchievementItem } from '../../types/portfolio';
import { DetailModal, ModalItem } from './DetailModal';
import { Trophy } from 'lucide-react';

interface CompetitionsProps {
  achievements: AchievementItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Competitions: React.FC<CompetitionsProps> = ({
  achievements,
  currentLang = 'en',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalItems: ModalItem[] = achievements.map((ach) => ({
    id: ach.id,
    title: ach.title,
    subtitle: ach.organization,
    date: ach.date,
    category: 'Honors & Competitions',
    organization: ach.organization || 'Aerospace Competition',
    summary: ach.description,
    externalUrl: ach.link,
    mediaUrl: ach.image,
    highlights: [
      `Award Title: ${ach.title}`,
      `Organization / Competition: ${ach.organization}`,
      `Date: ${ach.date}`,
    ],
    technologies: [],
  }));

  const handleOpenExplore = (idx: number) => {
    setSelectedIndex(idx);
    setModalOpen(true);
  };

  return (
    <section className="section" id="competitions">
      <div className="container">
        <h1>{currentLang === 'zh' ? '荣誉与竞赛' : 'Honors & Competitions'}</h1>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach, idx) => (
            <div
              key={ach.id}
              onClick={() => handleOpenExplore(idx)}
              className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    <Trophy className="w-3.5 h-3.5" />
                    Honors
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{ach.date}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {ach.title}
                </h3>
                {ach.organization && (
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-2">
                    {ach.organization}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                  {currentLang === 'zh' ? '查看详情 →' : 'Explore Details →'}
                </span>
                <span className="text-[11px] text-slate-400">Verified Achievement</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        <DetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={modalItems}
          currentIndex={selectedIndex}
          onNavigate={(newIdx) => setSelectedIndex(newIdx)}
        />
      </div>
    </section>
  );
};
