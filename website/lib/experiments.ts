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

export interface ExperimentResults {
  summary: string
  metrics: MetricValue[]
  confusionMatrix?: ConfusionMatrixData
  classificationReport?: ClassificationReportRow[]
  scatterData?: ChartPoint[]
  figures?: { label: string; description: string }[]
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
    status: "running",
    type: "classification",
    date: "2026-03-29",
    nStimuli: 100,
    nFolds: 5,
    tags: ["language", "humor", "classification", "logistic regression"],
    results: {
      summary:
        "Preliminary results suggest the TRIBE v2 predicted brain responses carry signal that distinguishes humorous from neutral text above chance level. The classifier achieves moderate accuracy with L1-regularized logistic regression on 5-fold cross-validation.",
      metrics: [
        { label: "Accuracy", value: "72.0%", description: "5-fold cross-validated accuracy" },
        { label: "ROC AUC", value: 0.78, description: "Area under the ROC curve" },
        { label: "Samples", value: 100, description: "50 humor + 50 neutral sentences" },
        { label: "Features", value: "20,484", description: "Cortical vertices per sample" },
        { label: "CV Folds", value: 5, description: "Stratified k-fold cross-validation" },
        { label: "Regularization", value: "L1 (C=1.0)", description: "SAGA solver, lasso penalty" },
      ],
      confusionMatrix: {
        labels: ["Neutral", "Humor"],
        matrix: [
          [38, 12],
          [16, 34],
        ],
      },
      classificationReport: [
        { label: "Neutral", precision: 0.7, recall: 0.76, f1: 0.73, support: 50 },
        { label: "Humor", precision: 0.74, recall: 0.68, f1: 0.71, support: 50 },
      ],
      scatterData: generateHumorPCAData(),
      figures: [
        {
          label: "Classifier weight map",
          description: "Brain surface showing logistic regression weights. Positive (warm) = humor-predictive, negative (cool) = neutral-predictive.",
        },
        {
          label: "PCA scatter",
          description: "First two principal components of brain activation vectors, colored by condition.",
        },
        {
          label: "Confusion matrix",
          description: "Predicted vs actual labels across 5-fold cross-validation.",
        },
      ],
    },
  },
  {
    slug: "emotion-valence",
    name: "Emotion Valence Encoding",
    shortName: "Emotion",
    description:
      "How does emotional valence (positive vs. negative) modulate predicted brain activation patterns? This experiment examines whether TRIBE v2 captures affective dimensions of language processing.",
    question: "Do positive and negative sentences produce different brain patterns?",
    status: "planned",
    type: "classification",
    date: "2026-04-15",
    nStimuli: 200,
    tags: ["language", "emotion", "valence", "classification"],
    results: undefined,
  },
  {
    slug: "sentence-complexity",
    name: "Syntactic Complexity Regression",
    shortName: "Complexity",
    description:
      "Can we predict the syntactic complexity of a sentence from its predicted brain activation? A ridge regression model maps brain patterns to readability scores.",
    question: "Does brain activation scale with syntactic complexity?",
    status: "planned",
    type: "regression",
    date: "2026-05-01",
    nStimuli: 150,
    tags: ["language", "syntax", "regression", "readability"],
    results: {
      summary:
        "Mock results: Ridge regression achieves moderate correlation between predicted brain activation and Flesch-Kincaid readability scores, suggesting TRIBE v2 encodes syntactic complexity information.",
      metrics: [
        { label: "R²", value: 0.41, description: "Cross-validated coefficient of determination" },
        { label: "Pearson r", value: 0.64, description: "Correlation between predicted and actual" },
        { label: "MSE", value: 12.3, description: "Mean squared error" },
        { label: "Samples", value: 150 },
        { label: "Features", value: "20,484" },
        { label: "CV Folds", value: 5 },
      ],
      scatterData: generateRegressionData(),
      figures: [
        {
          label: "Predicted vs actual",
          description: "Scatter plot of predicted vs actual complexity scores with regression line.",
        },
        {
          label: "Weight map",
          description: "Brain regions most predictive of syntactic complexity.",
        },
      ],
    },
  },
  {
    slug: "semantic-similarity",
    name: "Semantic Similarity in Brain Space",
    shortName: "Similarity",
    description:
      "Do semantically similar sentences produce similar predicted brain patterns? We compare cosine similarity in TRIBE v2 brain space to semantic similarity from sentence transformers.",
    question: "Does brain-space distance track semantic similarity?",
    status: "planned",
    type: "encoding",
    date: "2026-05-15",
    tags: ["language", "semantics", "similarity", "encoding"],
    results: {
      summary:
        "Mock results: Moderate Spearman correlation between brain-space cosine similarity and semantic similarity scores, suggesting shared representational structure.",
      metrics: [
        { label: "Spearman ρ", value: 0.52, description: "Rank correlation of similarity matrices" },
        { label: "Mantel p-value", value: "<0.001", description: "Significance of matrix correlation" },
        { label: "Sentence pairs", value: "4,950", description: "From 100 sentences" },
        { label: "RSA method", value: "Spearman", description: "Representational similarity analysis" },
      ],
      figures: [
        {
          label: "Similarity matrices",
          description: "Comparison of brain-space and semantic similarity matrices.",
        },
      ],
    },
  },
]

function generateHumorPCAData(): ChartPoint[] {
  const points: ChartPoint[] = []
  const rng = mulberry32(42)

  for (let i = 0; i < 50; i++) {
    points.push({
      x: -1.5 + rng() * 3 - 0.5,
      y: -1.0 + rng() * 2.5 - 0.3,
      group: "humor",
      label: `Humor ${i + 1}`,
    })
  }
  for (let i = 0; i < 50; i++) {
    points.push({
      x: -0.5 + rng() * 3 + 0.3,
      y: -1.5 + rng() * 2.5 + 0.4,
      group: "neutral",
      label: `Neutral ${i + 1}`,
    })
  }
  return points
}

function generateRegressionData(): ChartPoint[] {
  const points: ChartPoint[] = []
  const rng = mulberry32(123)
  for (let i = 0; i < 150; i++) {
    const actual = 20 + rng() * 60
    const predicted = actual * 0.64 + (rng() - 0.5) * 30 + 15
    points.push({ x: actual, y: predicted, label: `Sentence ${i + 1}` })
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
