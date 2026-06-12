import { Grade, Inspection, RATING_ITEMS } from '@/types';

export interface GradeResult {
  score: number;
  grade: Grade;
  details: {
    item: string;
    rating: number;
    weight: number;
    weightedScore: number;
  }[];
}

const WEIGHTS: Record<string, number> = {
  deckPavement: 0.10,
  expansionJoint: 0.10,
  bearing: 0.15,
  superstructure: 0.25,
  substructure: 0.25,
  railing: 0.05,
  drainage: 0.10,
};

export function calculateOverallGrade(inspection: Partial<Inspection>): GradeResult {
  const details = RATING_ITEMS.map((item) => {
    const rating = inspection[item.key] as number | undefined;
    const weight = WEIGHTS[item.key];
    const weightedScore = rating ? (6 - rating) * weight * 20 : 0;
    return {
      item: item.label,
      rating: rating || 0,
      weight,
      weightedScore,
    };
  });

  const score = details.reduce((sum, d) => sum + d.weightedScore, 0);

  let grade: Grade;
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 45) grade = 'D';
  else grade = 'E';

  return { score: Math.round(score * 10) / 10, grade, details };
}

export function getGradeColor(grade: Grade): string {
  const colors: Record<Grade, string> = {
    A: '#10b981',
    B: '#f59e0b',
    C: '#f97316',
    D: '#ef4444',
    E: '#1f2937',
  };
  return colors[grade];
}

export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: '完好',
    2: '良好',
    3: '较差',
    4: '差',
    5: '危险',
  };
  return labels[rating] || '未知';
}
