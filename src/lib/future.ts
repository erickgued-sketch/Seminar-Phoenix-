// Future Self: illustrative arithmetic of compounding repetitions, with stated assumptions.
// It is NOT a prediction — outcomes depend on many things this app cannot see.
export type Scenario = { key: 'current' | 'steady' | 'stretch'; perWeek: number; reps90: number; reps365: number; hours365: number };

export function scenarios(currentPerWeek: number, targetPerWeek: number, minutesPerRep: number): Scenario[] {
  const mk = (key: Scenario['key'], perWeek: number): Scenario => ({
    key, perWeek, reps90: Math.round((perWeek * 90) / 7), reps365: Math.round(perWeek * 52), hours365: Math.round((perWeek * 52 * minutesPerRep) / 60),
  });
  return [mk('current', currentPerWeek), mk('steady', targetPerWeek), mk('stretch', Math.min(7, targetPerWeek + 2))];
}
