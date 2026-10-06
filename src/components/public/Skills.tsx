import React, { useState } from 'react';
import { SkillItem } from '../../types/portfolio';
import {
  Cpu,
  Code2,
  Terminal,
  Radio,
  Eye,
  Layers,
  Wrench,
  Compass,
  Zap,
  Users,
  Globe,
  Briefcase,
  MessageSquare,
  Shield,
  Languages,
  Award,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface SkillsProps {
  skills?: SkillItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

type SkillCategory = 'all' | 'social' | 'robotics' | 'software' | 'hardware';

interface SkillDisplayItem {
  id: string;
  name: string;
  category: 'social' | 'robotics' | 'software' | 'hardware';
  categoryLabel: string;
  badgeColor: string;
  icon: React.ReactNode;
  desc: string;
  highlight?: string;
}

export const Skills: React.FC<SkillsProps> = ({ skills = [], currentLang = 'en' }) => {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('all');

  const defaultSkills: SkillDisplayItem[] = [
    // --- 1. Leadership & Social Skills ---
    {
      id: 'soc-1',
      name: 'Cross-Cultural Communication & Global Operations',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      desc: 'Directed international internship operations onboarding 51 international interns from 15+ countries at NUST Placement Office.',
      highlight: '51 Interns • 15+ Countries',
    },
    {
      id: 'soc-2',
      name: 'Team Captaincy & Engineering Leadership',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      desc: 'Founder and Captain of Team AeroMavericks and co-founder of maverick_.tech, directing multi-disciplinary engineers in hardware and AI software development.',
      highlight: 'Founder & Team Captain',
    },
    {
      id: 'soc-3',
      name: 'Corporate Relations & Large-Scale Coordination',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
      desc: 'Coordinated security, finances, registration and logistics for NUST Career Connect 2026, managing corporate relations with 150+ companies.',
      highlight: '150+ Companies Managed',
    },
    {
      id: 'soc-4',
      name: 'Public Speaking & Workshop Instruction',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      desc: 'Delivered hands-on robotics workshops at National School & College System and directed orientation liaison onboarding 3,000+ incoming university students.',
      highlight: '3,000+ Students Mentored',
    },
    {
      id: 'soc-5',
      name: 'Crisis Management & Mission-Critical Operations',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      desc: 'Commanded live telemetry pipelines, flight-line safety protocols, and emergency recovery loops under high pressure at Teknofest Turkey and National Aerothon.',
      highlight: 'Flight Line Operations',
    },
    {
      id: 'soc-6',
      name: 'Sponsorship Acquisition & Negotiation',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      desc: 'Headed Sponsorship & Operations at NUST Digital Club, successfully securing corporate sponsorships and institutional partnerships for campus technical conventions.',
      highlight: 'Sponsorship & Partnerships',
    },
    {
      id: 'soc-7',
      name: 'Agile Product Strategy & Startup Prototyping',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      desc: 'Rapid product development sprints, user empathy, and swift deployment of real-world beta solutions (LawerAI & Sasta Dawa Finder) under maverick_.tech.',
      highlight: 'maverick_.tech Ventures',
    },
    {
      id: 'soc-8',
      name: 'Multilingual Fluency & Global Collaboration',
      category: 'social',
      categoryLabel: 'Social & Leadership',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Languages className="w-5 h-5 text-emerald-400" />,
      desc: 'Fluent in English (Professional Working Proficiency), Urdu (Native / Bilingual), and Sindhi (Native / Bilingual).',
      highlight: 'English • Urdu • Sindhi',
    },

    // --- 2. Robotics & Autonomous Systems ---
    {
      id: 'rob-1',
      name: 'Autonomous UAV Navigation & Mission Planning',
      category: 'robotics',
      categoryLabel: 'Robotics & Autonomy',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: <Compass className="w-5 h-5 text-sky-400" />,
      desc: 'Waypoints generation, geofencing, failsafe state-machines, and dynamic path re-planning using ArduPilot, PX4, and QGroundControl.',
      highlight: 'ArduPilot • PX4 • QGC',
    },
    {
      id: 'rob-2',
      name: 'Decentralized Swarm Robotics & Flocking',
      category: 'robotics',
      categoryLabel: 'Robotics & Autonomy',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      desc: 'Reynolds flocking models, virtual leader-follower formation geometry, and peer-to-peer telemetry mesh independent of a central GCS.',
      highlight: 'Multi-Agent Mesh',
    },
    {
      id: 'rob-3',
      name: 'Precision Dynamic Landing on Moving USVs',
      category: 'robotics',
      categoryLabel: 'Robotics & Autonomy',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: <Eye className="w-5 h-5 text-sky-400" />,
      desc: 'Fiducial AprilTag tracking, visual servoing, and Kalman filter velocity estimation compensating for sea-wave pitch and heave.',
      highlight: 'Teknofest Finalist Project',
    },
    {
      id: 'rob-4',
      name: 'Visual SLAM & VI-SLAM (GPS-Denied)',
      category: 'robotics',
      categoryLabel: 'Robotics & Autonomy',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      desc: 'Visual-inertial odometry, semantic-geometric dynamic obstacle filtering, and feature tracking on sub-2 kg UAV companion computers (NUST SEECS FYP).',
      highlight: 'NUST SEECS FYP Research',
    },

    // --- 3. Software & Frameworks ---
    {
      id: 'soft-1',
      name: 'ROS & ROS 2 (Humble / Iron / Jazzy), Nav2',
      category: 'software',
      categoryLabel: 'Software & Frameworks',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      desc: 'Distributed ROS 2 nodes, micro-ROS, DDS middleware, deterministic obstacle costmap layers, and MAVROS bridges.',
      highlight: 'Packt Certified ROS 2',
    },
    {
      id: 'soft-2',
      name: 'Gazebo & ArduPilot SITL Digital Twins',
      category: 'software',
      categoryLabel: 'Software & Frameworks',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      desc: 'Multi-vehicle software-in-the-loop simulation modeling wind gusts, ground effect, aerodynamics, and virtual telemetry sockets.',
      highlight: '80% Crash Reduction',
    },
    {
      id: 'soft-3',
      name: 'Python, C++, Embedded C, CUDA',
      category: 'software',
      categoryLabel: 'Software & Frameworks',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      desc: 'High-performance control loops, PyMAVLink asynchronous parsers, mathematical state estimation, and GPU edge acceleration.',
      highlight: 'Modern C++ & Python',
    },
    {
      id: 'soft-4',
      name: 'Computer Vision: OpenCV & YOLOv8',
      category: 'software',
      categoryLabel: 'Software & Frameworks',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      desc: 'Real-time object detection at 30+ FPS on edge computers, road defect classification, and aerial tracking loops.',
      highlight: 'Real-Time Edge AI',
    },
    {
      id: 'soft-5',
      name: 'Full-Stack Web: Next.js, TypeScript & Vercel',
      category: 'software',
      categoryLabel: 'Software & Frameworks',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      desc: 'Architecting modern web applications and AI platforms with reactive interfaces, vector search, and edge deployments (LawerAI & Sasta Dawa Finder).',
      highlight: 'Production Deployments',
    },

    // --- 4. Embedded Hardware & Flight Electronics ---
    {
      id: 'hard-1',
      name: 'Pixhawk Autopilots & Companion Computers',
      category: 'hardware',
      categoryLabel: 'Hardware & Avionics',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: 'Pixhawk 6X/6C/Cube wiring, Raspberry Pi 4/5 & Jetson companion computer integration, serial telemetry pipes, and fail-safe power rails.',
      highlight: 'Pixhawk & Companion Stack',
    },
    {
      id: 'hard-2',
      name: 'Embedded Microcontrollers: STM32 & ESP32',
      category: 'hardware',
      categoryLabel: 'Hardware & Avionics',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: 'Bare-metal C programming, FreeRTOS tasks, hardware interrupts, I2C, SPI, UART, PWM motor actuation, and sensor interfacing.',
      highlight: 'Bare-Metal & FreeRTOS',
    },
    {
      id: 'hard-3',
      name: 'MAVLink & Telemetry Radio Networks',
      category: 'hardware',
      categoryLabel: 'Hardware & Avionics',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Radio className="w-5 h-5 text-purple-400" />,
      desc: '433MHz / 915MHz SiK radios, RF mesh transceivers, telemetry encryption, antenna diversity, and signal-to-noise optimization.',
      highlight: 'Long-Range RF Mesh',
    },
    {
      id: 'hard-4',
      name: 'Avionics Schematics & Power Distribution',
      category: 'hardware',
      categoryLabel: 'Hardware & Avionics',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Wrench className="w-5 h-5 text-purple-400" />,
      desc: 'Custom power distribution boards, optocoupled ESC signaling, LiPo battery management systems (BMS), and EMI noise shielding.',
      highlight: 'Clean Avionics Power',
    },
  ];

  // Helper to map CMS skill category to display category
  const mapCategory = (cat: string): { key: 'social' | 'robotics' | 'software' | 'hardware'; label: string; badge: string } => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('social') || lower.includes('lead') || lower.includes('op') || lower.includes('manage') || lower.includes('coord')) {
      return { key: 'social', label: 'Social & Leadership', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (lower.includes('robot') || lower.includes('nav') || lower.includes('guid') || lower.includes('swarm') || lower.includes('uav')) {
      return { key: 'robotics', label: 'Robotics & Autonomy', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    }
    if (lower.includes('soft') || lower.includes('prog') || lower.includes('frame') || lower.includes('web') || lower.includes('ai')) {
      return { key: 'software', label: 'Software & Frameworks', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }
    return { key: 'hardware', label: 'Hardware & Avionics', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  };

  const getDynamicIcon = (iconName?: string, categoryKey?: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'Users': return <Users className="w-5 h-5 text-emerald-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-400" />;
      case 'Languages': return <Languages className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-sky-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-sky-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-sky-400" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-indigo-400" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-purple-400" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-purple-400" />;
      default:
        if (categoryKey === 'social') return <Users className="w-5 h-5 text-emerald-400" />;
        if (categoryKey === 'robotics') return <Compass className="w-5 h-5 text-sky-400" />;
        if (categoryKey === 'software') return <Terminal className="w-5 h-5 text-indigo-400" />;
        return <Cpu className="w-5 h-5 text-purple-400" />;
    }
  };

  // Merge CMS skills with default skills, allowing admin edits to take precedence
  const allSkills: SkillDisplayItem[] = React.useMemo(() => {
    if (!skills || skills.length === 0) return defaultSkills;

    // Check if CMS has social skills
    const hasSocialInCms = skills.some(s => s.category.toLowerCase().includes('social') || s.category.toLowerCase().includes('leadership'));

    // Map all active skills from CMS
    const activeCmsSkills = skills.filter(s => s.enabled !== false);
    if (activeCmsSkills.length === 0) return defaultSkills;

    return activeCmsSkills.map((s) => {
      const catInfo = mapCategory(s.category);
      const defaultMatch = defaultSkills.find(
        (d) => d.name.toLowerCase() === s.name.toLowerCase() || d.id === s.id
      );

      return {
        id: s.id,
        name: s.name,
        category: catInfo.key,
        categoryLabel: catInfo.label,
        badgeColor: catInfo.badge,
        icon: getDynamicIcon(s.icon, catInfo.key),
        desc: s.description || defaultMatch?.desc || `${s.name} in ${s.category}`,
        highlight: defaultMatch?.highlight || (s.featured ? 'Core Competency' : undefined),
      };
    });
  }, [skills]);

  const filteredSkills = allSkills.filter((skill) => {
    if (activeCategory === 'all') return true;
    return skill.category === activeCategory;
  });

  const categories = [
    { id: 'all', label: currentLang === 'zh' ? '全部技能' : 'All Skills', count: allSkills.length, icon: Sliders },
    {
      id: 'social',
      label: currentLang === 'zh' ? '🤝 领导与社交技能' : '🤝 Leadership & Social Skills',
      count: allSkills.filter((s) => s.category === 'social').length,
      icon: Users,
    },
    {
      id: 'robotics',
      label: currentLang === 'zh' ? '🤖 机器人与自主导航' : '🤖 Robotics & Autonomy',
      count: allSkills.filter((s) => s.category === 'robotics').length,
      icon: Compass,
    },
    {
      id: 'software',
      label: currentLang === 'zh' ? '💻 软件与算法' : '💻 Software & Frameworks',
      count: allSkills.filter((s) => s.category === 'software').length,
      icon: Terminal,
    },
    {
      id: 'hardware',
      label: currentLang === 'zh' ? '⚡ 硬件与航电设备' : '⚡ Hardware & Avionics',
      count: allSkills.filter((s) => s.category === 'hardware').length,
      icon: Cpu,
    },
  ];

  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CORE COMPETENCIES & LEADERSHIP</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {currentLang === 'zh' ? '专业与社交技能' : 'Technical & Social Skills'}
          </h1>

          <p className="max-w-2xl text-slate-400 text-sm sm:text-base mt-2 font-normal leading-relaxed">
            {currentLang === 'zh'
              ? '结合扎实的电气工程无人机研发硬实力，与卓越的团队领导、国际文化交流、大型活动协调与初创项目孵化能力。'
              : 'Synthesizing verified UAV robotics engineering expertise with proven team captaincy, international diplomacy, corporate stakeholder liaison, and high-impact startup product leadership.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as SkillCategory)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20 scale-105'
                    : 'bg-slate-900/80 dark:bg-slate-900/80 text-slate-400 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-slate-800 dark:hover:bg-slate-800 border border-slate-800 dark:border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-950 text-sky-300'
                      : 'bg-slate-800 dark:bg-slate-800 text-slate-300 dark:text-slate-300'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <div className="skills-wrapper w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="skill-item flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 dark:bg-slate-900/60 border border-slate-800/80 dark:border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900/90 transition-all duration-300 hover:scale-[1.01] group shadow-sm"
              >
                <div className="skill-icon-wrap p-2.5 rounded-xl bg-slate-950/80 dark:bg-slate-950/80 border border-slate-800 dark:border-slate-800 group-hover:border-sky-500/40 transition shrink-0">
                  {skill.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${skill.badgeColor}`}>
                      {skill.categoryLabel}
                    </span>
                    {skill.highlight && (
                      <span className="text-[10px] font-mono text-sky-500 dark:text-sky-400 font-medium truncate">
                        {skill.highlight}
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-slate-100 dark:text-slate-100 text-sm leading-snug group-hover:text-sky-500 dark:group-hover:text-sky-300 transition">
                    {skill.name}
                  </p>

                  <p className="text-xs text-slate-400 dark:text-slate-400 font-normal mt-1 leading-relaxed">
                    {skill.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
