/**
 * Type definitions for PortoWeb CRT Terminal Portfolio
 */

export type PhosphorTheme = 'green' | 'amber' | 'white' | 'cyber';
export type FontMode = 'pixel' | 'clean';
export type CurvatureId = 'flat' | 'subtle' | 'authentic' | 'heavy';

export interface CurvaturePreset {
  id: CurvatureId;
  label: string;
  k: number;
  scale: number;
}

export interface Profile {
  handle: string;
  host: string;
  title: string;
  location: string;
  status: string;
  systemName: string;
  version: string;
  bio: string[];
}

export interface SocialLink {
  name: string;
  url: string;
  handle: string;
}

export interface SkillItem {
  name: string;
  tier: string;
  exp: string;
  focus: string;
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
}

export interface ProjectLinks {
  demo: string;
  github: string;
  demoLabel: string;
}

export interface Project {
  id: string;
  num: string;
  title: string;
  category: string;
  year: string;
  tags: string[];
  description: string;
  highlights: string[];
  links: ProjectLinks;
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface PortfolioData {
  profile: Profile;
  socials: SocialLink[];
  skills: SkillCategory[];
  projects: Project[];
  experience: ExperienceItem[];
  asciiLogo: string;
  vectorLogo?: string;
}

export interface CommandDefinition {
  cmd: string;
  aliases?: string[];
  num?: string;
  args?: string;
  desc: string;
  category?: string;
}
