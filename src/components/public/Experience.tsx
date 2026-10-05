import React, { useState } from 'react';
import { ExperienceItem } from '../../types/portfolio';
import { DetailModal, ModalItem } from './DetailModal';

interface ExperienceProps {
  experience: ExperienceItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Experience: React.FC<ExperienceProps> = ({
  experience,
  currentLang = 'en',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getWorkBackground = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', // drone airframe
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', // tech lab
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', // electronics lab
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80', // drone flight
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80', // simulation
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', // team leadership
    ];
    return images[index % images.length];
  };

  const modalItems: ModalItem[] = experience.map((exp, idx) => ({
    id: exp.id,
    title: exp.position,
    subtitle: exp.company,
    date: `${exp.startDate} – ${exp.endDate || 'Present'} • ${exp.location}`,
    category: 'Experience',
    organization: exp.company,
    organizationLogo: exp.companyLogo,
    summary: exp.description,
    mediaUrl: exp.image || getWorkBackground(idx),
    highlights: [...(exp.responsibilities || []), ...(exp.achievements || [])],
    technologies: exp.technologies || [],
  }));

  const handleOpenExplore = (idx: number) => {
    setSelectedIndex(idx);
    setModalOpen(true);
  };

  return (
    <section className="section" id="work">
      <div className="container">
        <h1>{currentLang === 'zh' ? '实习与工作经历' : 'Internships & Experience'}</h1>

        <div className="work-wrapper w-full">
          <div className="grid">
            {experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="card group cursor-pointer"
                onClick={() => handleOpenExplore(idx)}
              >
                {/* Background image */}
                <div
                  className="background-image"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.88) 100%), url(${exp.image || getWorkBackground(idx)})`,
                  }}
                />

                {/* Content Overlay */}
                <div className="content">
                  <h1 className="header text-white font-bold text-center">
                    {exp.company}
                  </h1>
                  <p className="text text-slate-100 text-center text-xs">
                    {exp.position} • {exp.startDate} – {exp.endDate || 'Present'}
                  </p>
                  <button
                    type="button"
                    className="btn mt-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenExplore(idx);
                    }}
                  >
                    {currentLang === 'zh' ? '查看详情' : 'Explore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
