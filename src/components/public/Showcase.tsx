import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { DetailModal, ModalItem } from './DetailModal';
import { ShowcaseItem } from '../../types/portfolio';

interface ShowcaseProps {
  showcase?: ShowcaseItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Showcase: React.FC<ShowcaseProps> = ({ showcase, currentLang = 'en' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModalIndex, setSelectedModalIndex] = useState(0);

  const defaultItems: ModalItem[] = [
    {
      id: 'showcase-vslam',
      title: 'A Review of Visual & Visual-Inertial SLAM in Dynamic UAV Environments',
      subtitle: 'SEECS NUST Technical Review Paper & FYP Trajectory',
      date: '2026',
      category: 'Research & Autonomy',
      organization: 'SEECS — NUST (Advised by Dr. Moazzam Ali & Muhammad Saad Zia)',
      summary:
        'Synthesized 27 recent papers on GPS-denied VI-SLAM, categorizing detection-based, geometry-based, and semantic-geometric frameworks running on sub-2 kg UAV compute budgets.',
      mediaUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Synthesized 27 state-of-the-art papers classifying dynamic-handling pipelines.',
        'Prioritized techniques running under strict sub-2 kg UAV embedded compute constraints.',
        'Highlighted essential sensor fusion realities and need for dynamic-object filtering.',
        'Exposed the evaluation gap between ground datasets and real aerial dynamic flight.',
      ],
      technologies: ['Visual SLAM', 'VI-SLAM', 'IMU Fusion', 'Dynamic Filtering', 'GPS-Denied', 'SEECS NUST'],
    },
    {
      id: 'showcase-maverick',
      title: 'maverick_.tech — High-Velocity Beta Systems Lab',
      subtitle: 'Sub-Startup of AeroMavericks Technologies',
      date: '2026',
      category: 'Startup & AI Products',
      organization: 'maverick_.tech / AeroMavericks Technologies',
      summary:
        'Founded maverick_.tech to architect rapid beta systems for modern challenges. Built and deployed LawerAI (legal intelligence) and Sasta Dawa Finder (medicine price transparency).',
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      externalUrl: 'https://lawerai-alpha.vercel.app/',
      highlights: [
        'LawerAI: AI-powered legal assistant for automated statute reasoning and case analysis (lawerai-alpha.vercel.app).',
        'Sasta Dawa Finder: Pharmaceutical price transparency and generic medicine engine (sasta-dawa-finder.vercel.app).',
        'Continuous deployment and AI vector search workflows deployed on Vercel.',
        'Incubated within AeroMavericks Technologies ecosystem.',
      ],
      technologies: ['Next.js', 'AI / LLMs', 'TypeScript', 'Vector Search', 'Healthcare Tech', 'Vercel'],
    },
    {
      id: 'showcase-1',
      title: 'Decentralized Multi-UAV Swarm Formation Control',
      subtitle: 'Research & Field Deployment',
      date: '2025 – 2026',
      category: 'Swarm Systems',
      organization: 'CSN Lab, NUST & INTELGENCY IT Solutions',
      summary:
        'Engineered decentralized flocking and multi-agent coordination protocols for autonomous quadcopter swarms using MAVLink, ROS, and distributed consensus algorithms.',
      mediaUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Implemented Reynolds flocking models and virtual leader-follower formation geometry.',
        'Eliminated centralized single points of failure through peer-to-peer telemetry mesh.',
        'Validated flight software in multi-vehicle Gazebo SITL simulation before hardware flight tests.',
        'Achieved sub-meter formation spacing with collision-avoidance potential fields.',
      ],
      technologies: ['MAVLink', 'ROS', 'Python', 'ArduPilot', 'Gazebo', 'Swarm Robotics'],
    },
    {
      id: 'showcase-2',
      title: 'Custom Ground Control Station for Multi-UAV Swarms',
      subtitle: 'Avionics & Telemetry Command Interface',
      date: '2025 – 2026',
      category: 'GCS',
      organization: 'Team AeroMavericks',
      summary:
        'Developed a centralized, MAVLink-integrated ground control application capable of simultaneous telemetry ingestion, packet inspection, and real-time waypoint mission dispatching for multi-drone fleets.',
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Real-time visualization of GPS coordinates, battery voltage, airspeed, and flight modes for up to 10 vehicles.',
        'Asynchronous telemetry parser built with PyMAVLink and multi-threaded socket pipelines.',
        'Emergency failsafe trigger broadcasting return-to-launch (RTL) or loiter commands across all aircraft.',
      ],
      technologies: ['PyMAVLink', 'Python', 'Telemetry Radios', 'UI/UX', 'ROS'],
    },
    {
      id: 'showcase-3',
      title: 'Dynamic Precision UAV Landing on Moving Autonomous USV',
      subtitle: 'Teknofest Turkey 2025 Finalist Project',
      date: '2025',
      category: 'Teknofest',
      organization: 'Team Vitesse — Teknofest Turkey',
      summary:
        'Engineered an autonomous visual servoing and precision landing pipeline enabling a hexacopter UAV to detect, track, and land on an autonomous moving unmanned surface vessel (USV).',
      mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Trained visual detection algorithms for dynamic fiducial AprilTags and platform motion estimation.',
        'Constructed Kalman filter velocity estimator to compensate for wave-induced pitch, roll, and heave.',
        'Selected as International Finalist at Teknofest Turkey 2025.',
      ],
      technologies: ['OpenCV', 'Pixhawk', 'ArduPilot', 'Visual Servoing', 'Precision Landing'],
    },
    {
      id: 'showcase-4',
      title: 'Autonomous Anti-Drone Interceptor UAV Platform',
      subtitle: 'Teknofest Turkey 2024 Finalist Project',
      date: '2024',
      category: 'Aerospace',
      organization: 'Team Vitesse — Teknofest Turkey',
      summary:
        'Designed high-speed avionics, power distribution, and computer vision guidance loops for an aerial interceptor quadcopter designed to autonomously pursue rogue drones.',
      mediaUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Integrated onboard companion computer running YOLO object detection at 30+ FPS.',
        'Developed proportional navigation guidance algorithms to close line-of-sight velocity vectors.',
        'Recognized as International Finalist at Teknofest Turkey 2024.',
      ],
      technologies: ['YOLO', 'OpenCV', 'Raspberry Pi', 'Pixhawk', 'Guidance Algorithms'],
    },
    {
      id: 'showcase-5',
      title: 'Medical Sample Autonomous Delivery & Recovery UAV',
      subtitle: 'National Aerothon ’25 — 3rd Overall & Swift Wing Award',
      date: '2025',
      category: 'Aerothon',
      organization: 'Team AeroMavericks',
      summary:
        'Architected an autonomous disaster-relief UAV system with custom payload winch mechanism, GPS precision navigation, and autonomous sample collection routines.',
      mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Awarded 3rd Overall and the prestigious "Swift Wing" title at National Aerothon ’25.',
        'Designed fail-safe payload mechanism with optical confirmation and telemetry feedback.',
        'Completed simulated hazardous medical extraction mission fully autonomously.',
      ],
      technologies: ['Autonomous Navigation', 'Precision Landing', 'Pixhawk', 'ArduPilot', 'UAV Electronics'],
    },
    {
      id: 'showcase-6',
      title: 'Software-in-the-Loop (SITL) Gazebo & ArduPilot Simulation',
      subtitle: 'Digital Twin Robotics Framework',
      date: '2025 – 2026',
      category: 'Research',
      organization: 'CSN Lab, SEECS — NUST',
      summary:
        'Built full digital twin testing environments in Gazebo and ROS for simulating complex aerodynamic disturbances, sensor noise, GPS-denied environments, and multi-rotor dynamics.',
      mediaUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Integrated multi-vehicle ArduPilot SITL instances communicating via simulated MAVLink network.',
        'Modeled wind gusts, rotor ground effect, and camera gimbal dynamics.',
        'Decreased physical flight testing crashes by over 80% through exhaustive SITL regression testing.',
      ],
      technologies: ['Gazebo', 'ROS', 'SITL', 'ArduPilot', 'Linux', 'Python'],
    },
  ];
  
  const showcaseItems: ModalItem[] = showcase && showcase.length > 0 ? showcase : defaultItems;
  const totalSlides = showcaseItems.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleOpenModal = (idx: number) => {
    setSelectedModalIndex(idx);
    setModalOpen(true);
  };

  const activeItem = showcaseItems[currentSlide];

  return (
    <section className="section" id="showcase">
      <div className="container">
        <h1>{currentLang === 'zh' ? '自主无人机与蜂群亮点' : 'Autonomous UAV & Swarm Highlights'}</h1>
        <h3 className="text-sm md:text-base font-semibold text-sky-600 dark:text-sky-400 -mt-5 mb-8 tracking-wider uppercase">
          {currentLang === 'zh' ? '2024 至今' : '2024 to Present'}
        </h3>

        {/* Master Carousel Container matching Steven Feng layout */}
        <div className="project-wrapper w-full">
          <div className="masterCarousel relative rounded-2xl overflow-hidden shadow-2xl w-full min-h-[460px] md:min-h-[500px]">
            {/* Background Media */}
            <img
              src={activeItem.mediaUrl}
              alt={activeItem.title}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Slide Navigation Buttons */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Caption Box */}
            <div className="carousel-caption-custom">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-sky-500/80 text-white">
                  {activeItem.category}
                </span>
                <span className="text-xs text-sky-300 font-semibold">• {activeItem.organization}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{activeItem.title}</h3>
              <h4 className="text-sm font-semibold text-sky-300 mb-2">{activeItem.subtitle}</h4>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mb-4">{activeItem.summary}</p>

              <button
                type="button"
                onClick={() => handleOpenModal(currentSlide)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-lg hover:scale-105"
              >
                <span>{currentLang === 'zh' ? '查看技术详情' : 'Explore Details'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {showcaseItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === idx ? 'w-6 bg-sky-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        <DetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={showcaseItems}
          currentIndex={selectedModalIndex}
          onNavigate={(newIdx) => setSelectedModalIndex(newIdx)}
        />
      </div>
    </section>
  );
};
