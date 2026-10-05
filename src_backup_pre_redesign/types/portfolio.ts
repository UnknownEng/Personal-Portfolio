export type StatusState = 'draft' | 'published';

export interface SiteSettings {
  websiteName: string;
  footerText: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  animationsEnabled: boolean;
  droneVisualizationEnabled: boolean;
  analyticsId: string;
  publicWebsiteUrl: string;
  lastUpdated: string;
}

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  backgroundSecondaryColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
}

export interface ThemeSettings extends ThemeColors {
  activePreset: 'cyan' | 'aerospace' | 'robotics' | 'minimal' | 'custom';
  mode: 'dark' | 'light' | 'system';
}

export interface SeoSettings {
  websiteTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

export interface SectionVisibility {
  hero: boolean;
  statusBanner: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  education: boolean;
  competitions: boolean;
  certifications: boolean;
  achievements: boolean;
  leadership: boolean;
  droneSchematic: boolean;
  contact: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
  isExternal?: boolean;
}

export interface HeroData {
  name: string;
  title: string;
  subtitle: string;
  badge: string;
  shortIntroduction: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  profileImage: string;
  backgroundEffect: 'radar' | 'grid' | 'particles' | 'none';
  telemetryStats: {
    alt: string;
    signal: string;
    gps: string;
    battery: string;
    flightTime: string;
    mode: string;
  };
}

export interface InfoCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  order: number;
}

export interface AboutData {
  sectionTitle: string;
  badge: string;
  bioParagraph: string;
  secondaryBio: string;
  profileImage: string;
  engineeringPhilosophy: string;
  focusAreas: string[];
  infoCards: InfoCard[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon: string;
  featured: boolean;
  order: number;
  enabled: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  technologies: string[];
  category: string;
  projectImage: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  documentationUrl?: string;
  myRole: string;
  projectDate: string;
  featured: boolean;
  status: StatusState;
  order: number;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
  status: StatusState;
  order: number;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  type: 'degree' | 'specialization';
  description: string;
  gpa?: string;
  relevantCoursework: string[];
  achievements: string[];
  status: StatusState;
  order: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
  description: string;
  image?: string;
  status: StatusState;
  order: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  image?: string;
  link?: string;
  status: StatusState;
  order: number;
}

export interface LeadershipItem {
  id: string;
  role: string;
  organization: string;
  date: string;
  description: string;
  bullets: string[];
  status: StatusState;
  order: number;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  order: number;
  enabled: boolean;
}

export interface ContactData {
  heading: string;
  description: string;
  email: string;
  phone: string;
  showPhone: boolean;
  location: string;
  linkedIn: string;
  availabilityStatus: string;
  formEnabled: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface PortfolioData {
  siteSettings: SiteSettings;
  theme: ThemeSettings;
  seo: SeoSettings;
  sectionVisibility: SectionVisibility;
  navigation: NavigationItem[];
  hero: HeroData;
  about: AboutData;
  skills: SkillItem[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  leadership: LeadershipItem[];
  socialLinks: SocialLinkItem[];
  contact: ContactData;
  contactMessages: ContactMessage[];
  media: MediaFile[];
}
