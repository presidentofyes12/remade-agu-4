export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

// Mock data for initial development
export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Research Team Alpha',
    description: 'A team focused on advancing research in climate science and sustainability.',
    memberCount: 5,
  },
  {
    id: '2',
    name: 'Data Science Group',
    description: 'Working on data analysis and visualization tools for scientific research.',
    memberCount: 3,
  },
  {
    id: '3',
    name: 'Education Committee',
    description: 'Developing educational resources and training programs for the community.',
    memberCount: 4,
  },
]; 