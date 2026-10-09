import rawPortalData from './portalData.json';

export interface PortalOrganization {
  name: string;
  shortName: string;
  schoolName: string;
  tagline: string;
  heroBadge: string;
  academicYear: string;
  motto: string;
  description: string;
  vision: string;
  missions: string[];
  pembina: {
    name: string;
    nip: string;
    role: string;
  };
  headmaster: {
    name: string;
    nip: string;
    role: string;
  };
  contact: {
    address: string;
    email: string;
    phone: string;
    piketHours: string;
    room: string;
  };
  socials: {
    instagram: string;
    youtube: string;
    tiktok: string;
    github: string;
  };
}

export interface PortalStats {
  totalProker: number;
  prokerSelesai: number;
  prokerBerjalan: number;
  prokerDirencanakan: number;
  totalDokumentasi: number;
  totalAnggota: number;
  realisasiAnggaranPersen: number;
}

export interface PortalDivision {
  code: string;
  name: string;
  description: string;
  leaderName: string;
  color: string;
}

export type ProkerStatus = 'Selesai' | 'Berjalan' | 'Direncanakan';

export interface PortalWorkProgram {
  id: string;
  title: string;
  divisionCode: string;
  divisionName: string;
  month: string;
  monthIndex: number;
  status: ProkerStatus;
  startDate: string;
  endDate: string;
  picName: string;
  picRole: string;
  picAvatar: string;
  progress: number;
  budget: string;
  targetAudience: string;
  description: string;
  indicators: string[];
  outputs: string;
}

export interface PortalTimelineEvent {
  id: string;
  title: string;
  date: string;
  dayName: string;
  time: string;
  status: 'Mendatang' | 'Sedang Berlangsung' | 'Selesai';
  divisionCode: string;
  divisionName: string;
  location: string;
  description: string;
  category: string;
  isHighlighted?: boolean;
}

export interface PortalGalleryPhoto {
  id: string;
  title: string;
  eventName: string;
  category: string;
  date: string;
  imageUrl: string;
  caption: string;
  photographer: string;
  tags?: string[];
}

export interface PortalMember {
  id: string;
  fullName: string;
  role: string;
  divisionCode: string;
  divisionName: string;
  classRoom: string;
  photoUrl: string;
  motto: string;
  nisn: string;
  email: string;
  instagram: string;
}

export interface PortalData {
  organization: PortalOrganization;
  stats: PortalStats;
  divisions: PortalDivision[];
  workPrograms: PortalWorkProgram[];
  timelineEvents: PortalTimelineEvent[];
  galleryPhotos: PortalGalleryPhoto[];
  structureMembers: PortalMember[];
}

export const portalData: PortalData = rawPortalData as unknown as PortalData;
