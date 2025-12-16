export interface TherapyService {
  id: number;
  title: string;
  description: string;
  features: string[];
  imageUrl: string;
  duration: string;
  format: string;
}

export interface Testimonial {
  id: number;
  name: string;
  therapyType: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  title: string;
  specialization: string[];
  bio: string;
  imageUrl: string;
  credentials: string;
}

export interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  readTime: string;
  date: string;
}

export interface Statistic {
  label: string;
  value: string;
  icon: string;
}

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  joinDate: string;
  coursesCompleted: number;
  hoursStudied: number;
}





