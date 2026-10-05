import React, { useState } from 'react';
import { EducationItem, CertificationItem, LeadershipItem } from '../../types/portfolio';
import { DetailModal, ModalItem } from './DetailModal';

interface EducationProps {
  education: EducationItem[];
  certifications?: CertificationItem[];
  leadership?: LeadershipItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Education: React.FC<EducationProps> = ({
  education,
  certifications = [],
  leadership = [],
  currentLang = 'en',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // High quality background images matching university / research aesthetics
  const getEduBackground = (index: number) => {
    const backgrounds = [
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', // NUST campus style
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', // IoT circuit
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', // Autonomous aerial
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', // Research team
    ];
    return backgrounds[index % backgrounds.length];
  };

  // Transform education and certifications into ModalItems
  const modalItems: ModalItem[] = [
    ...education.map((edu, idx) => ({
      id: edu.id,
      title: edu.institution,
      subtitle: edu.degree,
      date: `${edu.startDate} – ${edu.endDate || 'Present'} ${edu.gpa ? `• ${edu.gpa}` : ''}`,
      category: 'Education',
      organization: edu.institution,
      summary: edu.description,
      mediaUrl: edu.image || getEduBackground(idx),
      highlights: [
        ...(edu.achievements || []),
        ...(edu.relevantCoursework ? [`Relevant Coursework: ${edu.relevantCoursework.join(', ')}`] : []),
      ],
      technologies: edu.relevantCoursework || [],
    })),
    ...certifications.map((cert) => ({
      id: cert.id,
      title: cert.name,
      subtitle: cert.issuingOrganization,
      date: cert.date,
      category: 'Certification',
      organization: cert.issuingOrganization,
      summary: cert.description || `Professional certification credential in ${cert.name} verified by ${cert.issuingOrganization}.`,
      externalUrl: cert.credentialUrl,
      highlights: cert.credentialId ? [`Credential ID: ${cert.credentialId}`] : [],
      technologies: [],
    })),
  ];

  const handleOpenExplore = (idx: number) => {
    setSelectedIndex(idx);
    setModalOpen(true);
  };

  return (
    <section className="section" id="education">
      <div className="container">
        <h1>{currentLang === 'zh' ? '教育背景' : 'Education'}</h1>

        <div className="education-wrapper w-full">
          <div className="grid">
            {education.map((edu, idx) => (
              <div
                key={edu.id}
                className="card group cursor-pointer"
                onClick={() => handleOpenExplore(idx)}
              >
                {/* Background image with gradient overlay */}
                <div
                  className="background-image"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.88) 100%), url(${edu.image || getEduBackground(idx)})`,
                  }}
                />

                {/* Card Content Overlay */}
                <div className="content">
                  <h1 className="header text-white font-bold text-center">
                    {edu.institution}
                  </h1>
                  <p className="text text-slate-100 text-center text-xs">
                    {edu.degree} {edu.gpa ? `(${edu.gpa})` : ''}
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
