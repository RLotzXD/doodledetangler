import { BrandTemplate } from './types';

export const templates: BrandTemplate[] = [
  {
    id: 'generic',
    name: 'Generic',
    primaryColor: '#1a1a1a',
    secondaryColor: '#f5f5f5',
    accentColor: '#666666',
    fontFamily: 'system-ui, sans-serif',
    logoPlaceholder: 'Generic',
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    primaryColor: '#F40009',
    secondaryColor: '#ffffff',
    accentColor: '#000000',
    fontFamily: 'Georgia, serif',
    logoPlaceholder: 'Coca-Cola',
  },
  {
    id: 'colgate',
    name: 'Colgate',
    primaryColor: '#E21836',
    secondaryColor: '#ffffff',
    accentColor: '#00529B',
    fontFamily: 'Arial, sans-serif',
    logoPlaceholder: 'Colgate',
  },
  {
    id: 'shell',
    name: 'Shell',
    primaryColor: '#FFC726',
    secondaryColor: '#ffffff',
    accentColor: '#E03E2D',
    fontFamily: 'Arial, sans-serif',
    logoPlaceholder: 'Shell',
  },
];

export function getTemplate(id: string): BrandTemplate {
  return templates.find((t) => t.id === id) ?? templates[0];
}
