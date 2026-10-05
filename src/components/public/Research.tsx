import React, { useState } from 'react';
import { ProjectItem } from '../../types/portfolio';
import { DetailModal, ModalItem } from './DetailModal';
import { BookOpen, ExternalLink, ArrowUpRight, GraduationCap, FileText, CheckCircle2, Copy } from 'lucide-react';

interface ResearchProps {
  research?: ProjectItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Research: React.FC<ResearchProps> = ({
  research = [],
  currentLang = 'en',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModalIndex, setSelectedModalIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default research papers if not yet populated in CMS
  const defaultPapers: ProjectItem[] = [
    {
      id: 'res-vslam',
      title: 'A Review of Visual and Visual-Inertial SLAM Techniques for Dynamic-Environment Localization and Mapping in Autonomous UAVs',
      shortDescription: 'Technical review paper synthesizing 27 recent papers on GPS-denied VSLAM/VI-SLAM under dynamic environments for sub-2 kg UAV companion computers.',
      fullDescription: `What started as exploratory research for my Final Year Project three days ago has rapidly evolved into a complete technical review paper (short article). Titled "A Review of Visual and Visual-Inertial SLAM Techniques for Dynamic-Environment Localization and Mapping in Autonomous UAVs," the paper dives deep into the challenge of GPS-denied navigation in the real, moving world.

Most classical VSLAM pipelines operate on a flawed assumption: that the environment remains perfectly static. In reality, UAVs encounter pedestrians, moving vehicles, and wind-blown objects that severely degrade map consistency and pose estimation.

To understand the current frontier of this problem, I synthesized 27 recent papers and broke down the landscape:
1. Categorization: Existing dynamic-handling strategies were classified into detection-based, geometry-based, and hybrid semantic-geometric frameworks.
2. Hardware Constraints: The analysis deliberately prioritizes techniques capable of running on the strict compute and power budgets of sub-2 kg UAV platforms, rather than relying on heavy desktop-class GPUs.
3. Sensor Fusion Realities: The review highlights that while IMU fusion in VI-SLAM is critical for handling rapid aerial maneuvers and bridging brief occlusions, it still requires explicit dynamic-object filtering to maintain long-term accuracy.
4. The Evaluation Gap: The paper identifies a significant lack of real-world aerial benchmarking, as most dynamic-SLAM systems are still validated on ground-robot or handheld datasets like TUM RGB-D instead of actual flight data.

This literature review establishes the exact trajectory for my Final Year Project at the School of Electrical Engineering and Computer Science (SEECS) at NUST (Advisor: Dr. Muhammad Moazzam Ali, Co-Advisor: Muhammad Saad Zia).`,
      technologies: [
        'Visual SLAM',
        'VI-SLAM',
        'IMU Sensor Fusion',
        'Dynamic Filtering',
        'Semantic Segmentation',
        'GPS-Denied Navigation',
        'SEECS NUST',
      ],
      category: 'Technical Review (FYP)',
      projectImage: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/UnknownEng',
      liveDemoUrl: '',
      documentationUrl: '',
      myRole: 'Lead Author & FYP Researcher (SEECS NUST)',
      projectDate: '2026',
      featured: true,
      status: 'published',
      order: 1,
    },
    {
      id: 'res-nav2',
      title: 'A Layered ROS 2/Nav2 Architecture for Fail-Safe Indoor UAV Navigation with Deterministic Dynamic-Obstacle Braking',
      shortDescription: 'Peer-reviewed research architecture utilizing ROS 2 and Nav2 for deterministic obstacle braking and collision avoidance in indoor UAV flights.',
      fullDescription: 'Developed a layered ROS 2 and Nav2 autonomy architecture engineered specifically for fail-safe indoor UAV navigation. Integrates deterministic dynamic-obstacle braking layers into local costmaps, ensuring provable collision avoidance bounds during GPS-denied indoor trajectories.',
      technologies: [
        'ROS 2',
        'Nav2',
        'Costmap Layers',
        'Dynamic Braking',
        'Indoor Autonomy',
        'Deterministic Systems',
      ],
      category: 'Peer-Reviewed Paper',
      projectImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/UnknownEng',
      liveDemoUrl: '',
      documentationUrl: '',
      myRole: 'Author & Autonomy Architect',
      projectDate: '2025 – 2026',
      featured: true,
      status: 'published',
      order: 2,
    },
    {
      id: 'res-swarm',
      title: 'Decentralized Multi-UAV Swarm Formation Control & Peer-to-Peer Consensus',
      shortDescription: 'Field-deployed decentralized flocking protocols and multi-agent coordination for autonomous quadcopter swarms via MAVLink mesh.',
      fullDescription: 'Researched and implemented decentralized flocking and multi-agent coordination protocols for autonomous quadcopter swarms using MAVLink, ROS, and distributed consensus algorithms. Validated flight software in multi-vehicle Gazebo SITL simulation before hardware flight tests, achieving sub-meter formation spacing with collision-avoidance potential fields.',
      technologies: [
        'MAVLink',
        'ROS',
        'Swarm Robotics',
        'Gazebo',
        'Distributed Consensus',
        'ArduPilot',
      ],
      category: 'Swarm Research',
      projectImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/UnknownEng',
      liveDemoUrl: '',
      documentationUrl: '',
      myRole: 'Lead Research Engineer (CSN Lab)',
      projectDate: '2025 – 2026',
      featured: true,
      status: 'published',
      order: 3,
    },
  ];

  const papers = research && research.length > 0 ? research : defaultPapers;

  const modalItems: ModalItem[] = papers.map((paper, idx) => ({
    id: paper.id,
    title: paper.title,
    subtitle: paper.category,
    date: paper.projectDate,
    category: 'Research & Publications',
    organization: paper.myRole || 'School of Electrical Engineering and Computer Science (SEECS), NUST',
    summary: paper.fullDescription || paper.shortDescription,
    mediaUrl: paper.projectImage || defaultPapers[idx % defaultPapers.length].projectImage,
    externalUrl: paper.githubUrl || paper.documentationUrl,
    highlights: [
      `Authorship: ${paper.myRole || 'Mansoor Ahmed Rind (Lead Author)'}`,
      `Affiliation: SEECS — National University of Sciences and Technology (NUST)`,
      `Status: ${paper.category}`,
      ...(paper.technologies ? [`Key Methodologies: ${paper.technologies.join(', ')}`] : []),
    ],
    technologies: paper.technologies || [],
  }));

  const handleOpenModal = (index: number) => {
    setSelectedModalIndex(index);
    setModalOpen(true);
  };

  const handleCopyCitation = (paper: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `@article{rind2026${paper.id.replace(/[^a-z0-9]/gi, '')},
  title={${paper.title}},
  author={Rind, Mansoor Ahmed},
  institution={School of Electrical Engineering and Computer Science (SEECS), NUST},
  year={${paper.projectDate.split('–')[0].trim() || '2026'}}
}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(paper.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section className="section" id="research">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>NUST SEECS AUTONOMY LABS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {currentLang === 'zh' ? '学术研究与论文' : 'Research & Publications'}
          </h1>

          <p className="max-w-2xl text-slate-400 text-sm sm:text-base mt-2 font-normal leading-relaxed">
            {currentLang === 'zh'
              ? '专注于动态环境下的视觉惯性 SLAM (V-SLAM)、ROS 2 确定性避障算法与多智能体无人机蜂群自主协同控制。'
              : 'Peer-reviewed technical reviews, conference architectures, and Final Year Project (FYP) visual SLAM autonomy research at the School of Electrical Engineering & Computer Science (SEECS), NUST.'}
          </p>
        </div>

        {/* Research Papers Grid */}
        <div className="publications-wrapper w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper, idx) => (
              <div
                key={paper.id}
                className="publication-card cursor-pointer group flex flex-col justify-between"
                onClick={() => handleOpenModal(idx)}
              >
                <div
                  className="background-media"
                  style={{
                    backgroundImage: `url(${paper.projectImage || defaultPapers[idx % defaultPapers.length]?.projectImage})`,
                  }}
                />

                <div className="content flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="publication-type"
                        data-type={
                          paper.category.includes('Review')
                            ? 'IEEE'
                            : paper.category.includes('Peer')
                            ? 'ACM'
                            : 'Teknofest'
                        }
                      >
                        {paper.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{paper.projectDate}</span>
                    </div>

                    <h3 className="header line-clamp-2 text-white font-bold text-base sm:text-lg mb-1 group-hover:text-cyan-400 transition">
                      {paper.title}
                    </h3>

                    <h4 className="subtitle text-xs text-cyan-300 font-mono mb-3">
                      {paper.myRole || 'SEECS — NUST'}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed font-sans">
                      {paper.shortDescription}
                    </p>
                  </div>

                  <div>
                    {/* Key Tech Tags */}
                    {paper.technologies && paper.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {paper.technologies.slice(0, 3).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700/60"
                          >
                            {tech}
                          </span>
                        ))}
                        {paper.technologies.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md text-cyan-400">
                            +{paper.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        className="btn flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(idx);
                        }}
                      >
                        <FileText className="w-3.5 h-3.5 inline mr-1" />
                        {currentLang === 'zh' ? '阅读论文摘要' : 'Read Paper'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyCitation(paper, e)}
                        className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-mono transition shrink-0"
                        title="Copy BibTeX Citation"
                      >
                        {copiedId === paper.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
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
          currentIndex={selectedModalIndex}
          onNavigate={(newIdx) => setSelectedModalIndex(newIdx)}
        />
      </div>
    </section>
  );
};
