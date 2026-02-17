export type GuidedExerciseId = "box-breathing" | "grounding-54321" | "gratitude-pause" | "body-stretch";

export type GuidedExerciseCategory = "Breathing" | "Anxiety" | "Reflection" | "Body";

export type GuidedExerciseMeta = {
  id: GuidedExerciseId;
  title: string;
  category: GuidedExerciseCategory;
  minutesLabel: string;
  description: string;
  accent: string;
};

export const guidedExercises: GuidedExerciseMeta[] = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    category: "Breathing",
    minutesLabel: "4 cycles",
    description: "Inhale, hold, exhale, hold — steady and calm.",
    accent: "#8B5CF6",
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    category: "Anxiety",
    minutesLabel: "~2 min",
    description: "Bring attention back to the present moment.",
    accent: "#FB923C",
  },
  {
    id: "gratitude-pause",
    title: "Gratitude Pause",
    category: "Reflection",
    minutesLabel: "2 min",
    description: "Three quiet prompts to reflect and reset.",
    accent: "#FBBF24",
  },
  {
    id: "body-stretch",
    title: "Body Stretch Timer",
    category: "Body",
    minutesLabel: "~4 min",
    description: "Six simple stretches, one at a time.",
    accent: "#2DD4BF",
  },
];
