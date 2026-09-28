import type { HingePosture } from 'expo-foldables';

export const colors = {
  background: '#0B0B0F',
  card: '#16161D',
  border: '#26262F',
  text: '#F5F5F7',
  muted: '#8E8E99',
  accent: '#0A84FF',
  foldFill: 'rgba(10, 132, 255, 0.18)',
  foldLine: 'rgba(10, 132, 255, 0.9)',
};

export const postureColors: Record<HingePosture, string> = {
  closed: '#8E8E93',
  'partially-open': '#FF9F0A',
  'fully-open': '#30D158',
  unknown: '#636366',
};

export const postureLabels: Record<HingePosture, string> = {
  closed: 'Closed',
  'partially-open': 'Partially open',
  'fully-open': 'Fully open',
  unknown: 'Unknown',
};

export const spacing = 24;
