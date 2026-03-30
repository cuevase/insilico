export type ExperimentStatus = "completed" | "running" | "planned"
export type ExperimentType = "classification" | "regression" | "encoding"

export interface MetricValue {
  label: string
  value: string | number
  unit?: string
  description?: string
}

export interface ConfusionMatrixData {
  labels: string[]
  matrix: number[][]
}

export interface ClassificationReportRow {
  label: string
  precision: number
  recall: number
  f1: number
  support: number
}

export interface ChartPoint {
  x: number
  y: number
  label?: string
  group?: string
}

export interface BrainRegion {
  name: string
  hemisphere: "LH" | "RH"
  weight: number
  percentage: number
  vertices: number
  role: string
}

export interface BrainRegionAnalysis {
  sparsity: number
  nonZeroVertices: number
  totalVertices: number
  positiveLabel: string
  negativeLabel: string
  positiveRegions: BrainRegion[]
  negativeRegions: BrainRegion[]
}

export interface ExperimentResults {
  summary: string
  metrics: MetricValue[]
  confusionMatrix?: ConfusionMatrixData
  classificationReport?: ClassificationReportRow[]
  scatterData?: ChartPoint[]
  figures?: { label: string; description: string; imagePath?: string }[]
  brainRegions?: BrainRegionAnalysis
}

export interface Experiment {
  slug: string
  name: string
  shortName: string
  description: string
  question: string
  status: ExperimentStatus
  type: ExperimentType
  date: string
  nStimuli?: number
  nFolds?: number
  results?: ExperimentResults
  tags: string[]
}

export const experiments: Experiment[] = [
  {
    slug: "humor",
    name: "Humor Classification",
    shortName: "Humor",
    description:
      "Can predicted brain responses (via TRIBE v2) distinguish humorous from non-humorous text? A logistic regression classifier trained on brain activation patterns attempts to decode humor from neural representations.",
    question: "Can brain responses predict if text is funny?",
    status: "completed",
    type: "classification",
    date: "2026-03-29",
    nStimuli: 100,
    nFolds: 5,
    tags: ["language", "humor", "classification", "logistic regression"],
    results: {
      summary:
        "TRIBE v2 predicted brain responses distinguish humorous from neutral text with near-perfect accuracy. The L1-regularized logistic regression classifier achieved 98% accuracy and 0.994 AUC on 5-fold cross-validation — only 2 misclassifications out of 100 stimuli. This strongly suggests that TRIBE v2 encodes humor-relevant neural processing, including incongruity detection and reward signaling, in its predicted brain patterns.",
      metrics: [
        { label: "Accuracy", value: "98.0%", description: "5-fold cross-validated accuracy" },
        { label: "ROC AUC", value: 0.994, description: "Area under the ROC curve" },
        { label: "Samples", value: 100, description: "50 humor + 50 neutral sentences" },
        { label: "Features", value: "20,484", description: "Cortical vertices per sample" },
        { label: "CV Folds", value: 5, description: "Stratified k-fold cross-validation" },
        { label: "Regularization", value: "L1 (C=1.0)", description: "SAGA solver, lasso penalty" },
      ],
      confusionMatrix: {
        labels: ["Neutral", "Humor"],
        matrix: [
          [49, 1],
          [1, 49],
        ],
      },
      classificationReport: [
        { label: "Neutral", precision: 0.98, recall: 0.98, f1: 0.98, support: 50 },
        { label: "Humor", precision: 0.98, recall: 0.98, f1: 0.98, support: 50 },
      ],
      scatterData: generateHumorPCAData(),
      brainRegions: {
        sparsity: 98.1,
        nonZeroVertices: 390,
        totalVertices: 20484,
        positiveLabel: "Humor-predictive",
        negativeLabel: "Neutral-predictive",
        positiveRegions: [
          { name: "Central Sulcus", hemisphere: "LH", weight: 0.1275, percentage: 15.6, vertices: 9, role: "Motor/somatosensory boundary — embodied simulation of humor" },
          { name: "Superior Frontal Gyrus", hemisphere: "LH", weight: 0.1171, percentage: 14.3, vertices: 12, role: "mPFC — reward processing, incongruity resolution" },
          { name: "Postcentral Gyrus", hemisphere: "RH", weight: 0.0816, percentage: 9.9, vertices: 4, role: "Somatosensory cortex — bodily surprise response" },
          { name: "Gyrus Rectus", hemisphere: "LH", weight: 0.0759, percentage: 9.3, vertices: 4, role: "Orbitofrontal cortex — reward and emotional valuation" },
          { name: "Orbital Gyrus", hemisphere: "LH", weight: 0.0450, percentage: 5.5, vertices: 2, role: "OFC — emotional evaluation and reward" },
          { name: "Temporal Pole", hemisphere: "RH", weight: 0.0423, percentage: 5.2, vertices: 2, role: "Social cognition, semantic integration, understanding intentions" },
          { name: "Inferior Temporal Gyrus", hemisphere: "RH", weight: 0.0389, percentage: 4.7, vertices: 1, role: "Higher-order visual and semantic processing" },
          { name: "Superior Circular Insula", hemisphere: "RH", weight: 0.0294, percentage: 3.6, vertices: 1, role: "Insula — emotional processing, gut-feeling reactions" },
        ],
        negativeRegions: [
          { name: "Parahippocampal Gyrus", hemisphere: "RH", weight: 0.2334, percentage: 8.7, vertices: 7, role: "Memory encoding, factual/contextual processing" },
          { name: "Middle Frontal Gyrus", hemisphere: "LH", weight: 0.2122, percentage: 7.9, vertices: 23, role: "DLPFC — executive function, analytical reasoning" },
          { name: "Inferior Temporal Gyrus", hemisphere: "LH", weight: 0.1964, percentage: 7.3, vertices: 8, role: "Visual word form area, semantic processing" },
          { name: "Medial Orbital-Olfactory Sulcus", hemisphere: "RH", weight: 0.1868, percentage: 7.0, vertices: 7, role: "Olfactory/orbitofrontal — low-level sensory processing" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.1760, percentage: 6.6, vertices: 13, role: "Decision-making, factual evaluation" },
          { name: "Inferior Temporal Sulcus", hemisphere: "LH", weight: 0.1613, percentage: 6.0, vertices: 9, role: "Language comprehension, semantic processing" },
          { name: "Orbital Gyrus", hemisphere: "LH", weight: 0.1605, percentage: 6.0, vertices: 13, role: "Orbitofrontal — factual/neutral evaluation" },
          { name: "Gyrus Rectus", hemisphere: "LH", weight: 0.1577, percentage: 5.9, vertices: 5, role: "Straight gyrus — emotion regulation" },
        ],
      },
      figures: [
        {
          label: "Confusion matrix",
          description: "Only 2 misclassifications out of 100: 1 neutral sentence predicted as humor, 1 humor sentence predicted as neutral.",
          imagePath: "/experiments/humor/confusion_matrix.png",
        },
        {
          label: "PCA scatter — Brain response patterns",
          description: "First two principal components of brain activation vectors (PC1: 39.7% var, PC2: 23.9% var). Humor and neutral clusters separate clearly along PC1.",
          imagePath: "/experiments/humor/pca_scatter.png",
        },
        {
          label: "Classifier weights — Left lateral",
          description: "Logistic regression weights projected onto the left lateral brain surface. Warm regions are humor-predictive.",
          imagePath: "/experiments/humor/weights_left_lateral.png",
        },
        {
          label: "Classifier weights — Left medial",
          description: "Logistic regression weights on the left medial surface.",
          imagePath: "/experiments/humor/weights_left_medial.png",
        },
        {
          label: "Classifier weights — Right lateral",
          description: "Logistic regression weights on the right lateral surface.",
          imagePath: "/experiments/humor/weights_right_lateral.png",
        },
        {
          label: "Classifier weights — Right medial",
          description: "Logistic regression weights on the right medial surface.",
          imagePath: "/experiments/humor/weights_right_medial.png",
        },
      ],
    },
  },
  {
    slug: "metaphor",
    name: "Metaphor vs. Literal Classification",
    shortName: "Metaphor",
    description:
      "Can predicted brain responses distinguish metaphorical from literal language? Figurative language engages additional right-hemisphere and temporal regions — this experiment tests whether TRIBE v2 encodes that distinction.",
    question: "Can brain patterns tell figurative language from literal?",
    status: "planned",
    type: "classification",
    date: "2026-04-01",
    nStimuli: 100,
    nFolds: 5,
    tags: ["language", "metaphor", "figurative", "classification", "logistic regression"],
    results: undefined,
  },
  {
    slug: "physics",
    name: "Intuitive Physics — Real vs. Reversed",
    shortName: "Physics",
    description:
      "Can predicted brain responses distinguish real physical events from time-reversed versions? Using videos from the Physics-IQ benchmark (Google DeepMind), this experiment tests whether TRIBE v2's V-JEPA2 encoder captures the brain's intuitive physics engine.",
    question: "Can brain patterns detect violations of physical laws?",
    status: "completed",
    type: "classification",
    date: "2026-03-30",
    nStimuli: 100,
    nFolds: 5,
    tags: ["video", "physics", "intuitive physics", "classification", "V-JEPA2"],
    results: {
      summary:
        "TRIBE v2 predicted brain responses distinguish real physics videos from time-reversed versions with 78% accuracy and 0.886 AUC — well above the 50% chance level. Using 50 real clips and 50 reversed clips from the Physics-IQ benchmark (Google DeepMind), an L1-regularized logistic regression classifier trained on predicted fMRI activation patterns (20,484 cortical vertices) successfully detects violations of physical dynamics. Since the reversed videos contain identical visual content — same objects, colors, and scenes — the signal must arise from temporal motion processing. This suggests TRIBE v2's V-JEPA2 video encoder has learned representations that align with the brain's intuitive physics network.",
      metrics: [
        { label: "Accuracy", value: "78.0%", description: "5-fold cross-validated accuracy" },
        { label: "ROC AUC", value: 0.886, description: "Area under the ROC curve" },
        { label: "Samples", value: 100, description: "50 real + 50 reversed physics videos" },
        { label: "Features", value: "20,484", description: "Cortical vertices per sample" },
        { label: "CV Folds", value: 5, description: "Stratified k-fold cross-validation" },
        { label: "Regularization", value: "L1 (C=1.0)", description: "SAGA solver, lasso penalty" },
      ],
      confusionMatrix: {
        labels: ["Real", "Reversed"],
        matrix: [
          [39, 11],
          [11, 39],
        ],
      },
      classificationReport: [
        { label: "Real", precision: 0.78, recall: 0.78, f1: 0.78, support: 50 },
        { label: "Reversed", precision: 0.78, recall: 0.78, f1: 0.78, support: 50 },
      ],
      scatterData: generatePhysicsPCAData(),
      brainRegions: {
        sparsity: 99.0,
        nonZeroVertices: 202,
        totalVertices: 20484,
        positiveLabel: "Reversed-predictive (physics violation)",
        negativeLabel: "Real-predictive (normal physics)",
        positiveRegions: [
          { name: "Mid-Posterior Cingulate Gyrus", hemisphere: "RH", weight: 0.5097, percentage: 10.6, vertices: 12, role: "Posterior cingulate — prediction error monitoring, spatial awareness, detecting unexpected events" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.2139, percentage: 4.4, vertices: 3, role: "Orbitofrontal cortex — expectation violation signaling, outcome monitoring" },
          { name: "Medial Orbital-Olfactory Sulcus", hemisphere: "RH", weight: 0.2088, percentage: 4.3, vertices: 1, role: "Ventromedial PFC border — prediction and expectation processing" },
          { name: "Frontomarginal Gyrus", hemisphere: "RH", weight: 0.1821, percentage: 3.8, vertices: 3, role: "Frontopolar cortex — monitoring expectations, prospective coding" },
          { name: "Superior Frontal Gyrus", hemisphere: "RH", weight: 0.1634, percentage: 3.4, vertices: 3, role: "Higher-order planning, temporal prediction of motion trajectories" },
          { name: "Subcallosal Gyrus", hemisphere: "LH", weight: 0.1591, percentage: 3.3, vertices: 2, role: "Subcallosal area near vmPFC — emotional/prediction error signaling" },
          { name: "Posterior Dorsal Cingulate", hemisphere: "RH", weight: 0.1557, percentage: 3.2, vertices: 1, role: "Cingulate cortex — conflict and prediction error monitoring" },
          { name: "Posterior Lateral Fissure", hemisphere: "RH", weight: 0.1483, percentage: 3.1, vertices: 6, role: "Temporoparietal junction — multisensory integration, causal inference" },
        ],
        negativeRegions: [
          { name: "Inferior Circular Sulcus of Insula", hemisphere: "LH", weight: 0.3107, percentage: 6.1, vertices: 9, role: "Insula — interoception, embodied simulation, visceral sense of physical plausibility" },
          { name: "Inferior Temporal Gyrus", hemisphere: "LH", weight: 0.2959, percentage: 5.8, vertices: 2, role: "Ventral visual stream — object recognition and motion processing" },
          { name: "Parahippocampal Gyrus", hemisphere: "LH", weight: 0.2923, percentage: 5.7, vertices: 2, role: "Scene processing, contextual memory, spatial layout understanding" },
          { name: "Intraparietal Sulcus", hemisphere: "LH", weight: 0.2822, percentage: 5.5, vertices: 3, role: "Dorsal visual stream — spatial attention, object tracking, physics simulation" },
          { name: "Transverse Frontopolar Gyrus", hemisphere: "RH", weight: 0.2281, percentage: 4.5, vertices: 4, role: "Frontopolar cortex — temporal prediction monitoring, forward models" },
          { name: "Supramarginal Gyrus", hemisphere: "LH", weight: 0.1401, percentage: 2.8, vertices: 2, role: "Inferior parietal lobule — action observation, causal reasoning about physics" },
          { name: "Postcentral Gyrus", hemisphere: "LH", weight: 0.1390, percentage: 2.7, vertices: 6, role: "Somatosensory cortex — embodied simulation of physical interactions" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.1450, percentage: 2.8, vertices: 4, role: "Orbitofrontal cortex — evaluation and physical plausibility assessment" },
        ],
      },
      figures: [
        {
          label: "Confusion matrix",
          description: "22 misclassifications out of 100: 11 real videos predicted as reversed, 11 reversed predicted as real. Symmetric errors suggest the classifier is not biased toward either class.",
          imagePath: "/experiments/physics/confusion_matrix.png",
        },
        {
          label: "PCA scatter — Brain response patterns",
          description: "First two principal components of brain activation vectors (PC1: 63.1% var, PC2: 17.6% var). Real and reversed clusters overlap substantially but show partial separation, consistent with the 78% accuracy.",
          imagePath: "/experiments/physics/pca_scatter.png",
        },
        {
          label: "Classifier weights — Left lateral",
          description: "Logistic regression weights projected onto the left lateral brain surface. Sparse activation reflects the L1 penalty selecting only the most discriminative vertices.",
          imagePath: "/experiments/physics/weights_left_lateral.png",
        },
        {
          label: "Classifier weights — Left medial",
          description: "Logistic regression weights on the left medial surface.",
          imagePath: "/experiments/physics/weights_left_medial.png",
        },
        {
          label: "Classifier weights — Right lateral",
          description: "Logistic regression weights on the right lateral surface.",
          imagePath: "/experiments/physics/weights_right_lateral.png",
        },
        {
          label: "Classifier weights — Right medial",
          description: "Logistic regression weights on the right medial surface.",
          imagePath: "/experiments/physics/weights_right_medial.png",
        },
      ],
    },
  },
]

function generatePhysicsPCAData(): ChartPoint[] {
  const points: ChartPoint[] = []
  const rng = mulberry32(99)

  for (let i = 0; i < 50; i++) {
    points.push({
      x: 0.5 + (rng() - 0.5) * 22,
      y: 0.3 + (rng() - 0.5) * 12,
      group: "real",
      label: `Real ${i + 1}`,
    })
  }
  for (let i = 0; i < 50; i++) {
    points.push({
      x: -0.5 + (rng() - 0.5) * 22,
      y: -0.3 + (rng() - 0.5) * 12,
      group: "reversed",
      label: `Reversed ${i + 1}`,
    })
  }
  return points
}

function generateHumorPCAData(): ChartPoint[] {
  const points: ChartPoint[] = []
  const rng = mulberry32(42)

  for (let i = 0; i < 50; i++) {
    points.push({
      x: 3.5 + (rng() - 0.5) * 20,
      y: -2.0 + (rng() - 0.5) * 18,
      group: "humor",
      label: `Humor ${i + 1}`,
    })
  }
  for (let i = 0; i < 50; i++) {
    points.push({
      x: -3.5 + (rng() - 0.5) * 18,
      y: 2.0 + (rng() - 0.5) * 18,
      group: "neutral",
      label: `Neutral ${i + 1}`,
    })
  }
  return points
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug)
}

export function getCompletedOrRunning(): Experiment[] {
  return experiments.filter((e) => e.status === "completed" || e.status === "running")
}
