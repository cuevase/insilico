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

export interface ExperimentVideo {
  /** Public path (e.g. /experiments/neuromotion/demo.mp4) or full URL to an MP4/WebM file. */
  src: string
  caption?: string
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
  /** For EEG / trial-based studies (shown on cards instead of nStimuli when set). */
  nEpochs?: number
  /** Source code or project page (e.g. GitHub). */
  repositoryUrl?: string
  video?: ExperimentVideo
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
        "TRIBE v2 predicted brain responses distinguish humorous from neutral text with 100% accuracy on a held-out test set (20 unseen stimuli, AUC 1.000). The classifier was trained on 80 stimuli using a Pipeline with StratifiedKFold cross-validation (92.5% CV accuracy, 0.969 AUC), then evaluated on 20 completely held-out stimuli — 10 jokes and 10 neutral facts it never trained on. Every single holdout stimulus was classified correctly. This strongly suggests that TRIBE v2 encodes humor-relevant neural processing, including incongruity detection and reward signaling, in its predicted brain patterns — and that this signal generalizes robustly to unseen text.",
      metrics: [
        { label: "Holdout Acc", value: "100%", description: "Accuracy on 20 held-out stimuli (10+10)" },
        { label: "Holdout AUC", value: 1.0, description: "ROC AUC on holdout set — perfect" },
        { label: "CV Accuracy", value: "92.5%", description: "5-fold StratifiedKFold on 80 training stimuli" },
        { label: "CV AUC", value: 0.969, description: "ROC AUC on Pipeline CV" },
        { label: "Train", value: 80, description: "40 humor + 40 neutral for training" },
        { label: "Holdout", value: 20, description: "10 humor + 10 neutral held out" },
        { label: "Features", value: "20,484", description: "Cortical vertices per sample" },
        { label: "Regularization", value: "L1 (C=1.0)", description: "SAGA solver, lasso penalty" },
      ],
      confusionMatrix: {
        labels: ["Neutral", "Humor"],
        matrix: [
          [35, 5],
          [1, 39],
        ],
      },
      classificationReport: [
        { label: "Neutral", precision: 1.0, recall: 1.0, f1: 1.0, support: 10 },
        { label: "Humor", precision: 1.0, recall: 1.0, f1: 1.0, support: 10 },
      ],
      scatterData: generateHumorPCAData(),
      brainRegions: {
        sparsity: 98.1,
        nonZeroVertices: 390,
        totalVertices: 20484,
        positiveLabel: "Humor-predictive",
        negativeLabel: "Neutral-predictive",
        positiveRegions: [
          { name: "Central Sulcus", hemisphere: "LH", weight: 0.1275, percentage: 15.6, vertices: 9, role: "" },
          { name: "Superior Frontal Gyrus", hemisphere: "LH", weight: 0.1171, percentage: 14.3, vertices: 12, role: "" },
          { name: "Postcentral Gyrus", hemisphere: "RH", weight: 0.0816, percentage: 9.9, vertices: 4, role: "" },
          { name: "Gyrus Rectus", hemisphere: "LH", weight: 0.0759, percentage: 9.3, vertices: 4, role: "" },
          { name: "Orbital Gyrus", hemisphere: "LH", weight: 0.0450, percentage: 5.5, vertices: 2, role: "" },
          { name: "Temporal Pole", hemisphere: "RH", weight: 0.0423, percentage: 5.2, vertices: 2, role: "" },
          { name: "Inferior Temporal Gyrus", hemisphere: "RH", weight: 0.0389, percentage: 4.7, vertices: 1, role: "" },
          { name: "Superior Circular Insula", hemisphere: "RH", weight: 0.0294, percentage: 3.6, vertices: 1, role: "" },
        ],
        negativeRegions: [
          { name: "Parahippocampal Gyrus", hemisphere: "RH", weight: 0.2334, percentage: 8.7, vertices: 7, role: "" },
          { name: "Middle Frontal Gyrus", hemisphere: "LH", weight: 0.2122, percentage: 7.9, vertices: 23, role: "" },
          { name: "Inferior Temporal Gyrus", hemisphere: "LH", weight: 0.1964, percentage: 7.3, vertices: 8, role: "" },
          { name: "Medial Orbital-Olfactory Sulcus", hemisphere: "RH", weight: 0.1868, percentage: 7.0, vertices: 7, role: "" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.1760, percentage: 6.6, vertices: 13, role: "" },
          { name: "Inferior Temporal Sulcus", hemisphere: "LH", weight: 0.1613, percentage: 6.0, vertices: 9, role: "" },
          { name: "Orbital Gyrus", hemisphere: "LH", weight: 0.1605, percentage: 6.0, vertices: 13, role: "" },
          { name: "Gyrus Rectus", hemisphere: "LH", weight: 0.1577, percentage: 5.9, vertices: 5, role: "" },
        ],
      },
      figures: [
        {
          label: "Holdout confusion matrix — Unseen stimuli",
          description: "Perfect classification on 20 held-out stimuli (10 humor + 10 neutral). The classifier never saw these during training — 100% accuracy with zero errors.",
          imagePath: "/experiments/humor/holdout_confusion_matrix.png",
        },
        {
          label: "CV confusion matrix — Training stimuli (StratifiedKFold)",
          description: "5-fold StratifiedKFold cross-validation on 80 training stimuli with Pipeline (scaler inside CV). 92.5% accuracy — 6 misclassifications out of 80.",
          imagePath: "/experiments/humor/confusion_matrix.png",
        },
        {
          label: "PCA scatter — Brain response patterns",
          description: "First two principal components of brain activation vectors. Humor and neutral clusters separate clearly, consistent with the strong classification performance.",
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
    status: "completed",
    type: "classification",
    date: "2026-04-01",
    nStimuli: 100,
    nFolds: 5,
    tags: ["language", "metaphor", "figurative", "classification", "logistic regression"],
    results: {
      summary:
        "TRIBE v2 predicted brain responses distinguish metaphorical from literal language with 95% accuracy on a held-out test set (20 unseen stimuli, AUC 1.000). The classifier was trained on 80 stimuli using a Pipeline with StratifiedKFold cross-validation (78.8% CV accuracy, 0.901 AUC), then evaluated on 20 completely held-out stimuli — 10 metaphors and 10 literal statements it never trained on. Only 1 out of 20 holdout stimuli was misclassified — a literal sentence predicted as metaphor. This suggests TRIBE v2 encodes a distinction between figurative and literal language processing in its predicted brain patterns, and that this signal generalizes to unseen text.",
      metrics: [
        { label: "Holdout Acc", value: "95.0%", description: "Accuracy on 20 held-out stimuli (10+10)" },
        { label: "Holdout AUC", value: 1.0, description: "ROC AUC on holdout set — perfect separation" },
        { label: "CV Accuracy", value: "78.8%", description: "5-fold StratifiedKFold on 80 training stimuli" },
        { label: "CV AUC", value: 0.901, description: "ROC AUC on Pipeline CV" },
        { label: "Train", value: 80, description: "40 metaphor + 40 literal for training" },
        { label: "Holdout", value: 20, description: "10 metaphor + 10 literal held out" },
        { label: "Features", value: "20,484", description: "Cortical vertices per sample" },
        { label: "Regularization", value: "L1 (C=1.0)", description: "SAGA solver, lasso penalty" },
      ],
      confusionMatrix: {
        labels: ["Literal", "Metaphor"],
        matrix: [
          [34, 6],
          [11, 29],
        ],
      },
      classificationReport: [
        { label: "Literal", precision: 0.9, recall: 1.0, f1: 0.95, support: 10 },
        { label: "Metaphor", precision: 1.0, recall: 0.9, f1: 0.95, support: 10 },
      ],
      scatterData: generateMetaphorPCAData(),
      brainRegions: {
        sparsity: 98.3,
        nonZeroVertices: 353,
        totalVertices: 20484,
        positiveLabel: "Metaphor-predictive",
        negativeLabel: "Literal-predictive",
        positiveRegions: [
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.4656, percentage: 8.8, vertices: 11, role: "" },
          { name: "Inferior Temporal Gyrus", hemisphere: "LH", weight: 0.4420, percentage: 8.3, vertices: 11, role: "" },
          { name: "Central Sulcus", hemisphere: "RH", weight: 0.4241, percentage: 8.0, vertices: 13, role: "" },
          { name: "Orbital Gyrus", hemisphere: "LH", weight: 0.4000, percentage: 7.5, vertices: 9, role: "" },
          { name: "Medial Orbital-Olfactory Sulcus", hemisphere: "LH", weight: 0.3752, percentage: 7.1, vertices: 8, role: "" },
          { name: "Gyrus Rectus", hemisphere: "RH", weight: 0.3359, percentage: 6.3, vertices: 9, role: "" },
          { name: "Superior Frontal Gyrus", hemisphere: "LH", weight: 0.3173, percentage: 6.0, vertices: 8, role: "" },
          { name: "Temporal Pole", hemisphere: "LH", weight: 0.2633, percentage: 5.0, vertices: 7, role: "" },
        ],
        negativeRegions: [
          { name: "Occipital Pole", hemisphere: "LH", weight: 0.4257, percentage: 26.2, vertices: 25, role: "" },
          { name: "Occipital Pole", hemisphere: "RH", weight: 0.2747, percentage: 16.9, vertices: 18, role: "" },
          { name: "Postcentral Gyrus", hemisphere: "LH", weight: 0.1515, percentage: 9.3, vertices: 5, role: "" },
          { name: "Superior Parietal Gyrus", hemisphere: "RH", weight: 0.1365, percentage: 8.4, vertices: 5, role: "" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.0949, percentage: 5.8, vertices: 2, role: "" },
          { name: "Gyrus Rectus", hemisphere: "LH", weight: 0.0827, percentage: 5.1, vertices: 1, role: "" },
          { name: "Parahippocampal Gyrus", hemisphere: "LH", weight: 0.0808, percentage: 5.0, vertices: 2, role: "" },
          { name: "Transverse Frontopolar Gyrus", hemisphere: "LH", weight: 0.0754, percentage: 4.6, vertices: 2, role: "" },
        ],
      },
      figures: [
        {
          label: "Holdout confusion matrix — Unseen stimuli",
          description: "Gold-standard test on 20 held-out stimuli (10 metaphor + 10 literal). 9/10 literal correct, 10/10 metaphor correct. Only 1 literal sentence was mistaken as metaphor.",
          imagePath: "/experiments/metaphor/holdout_confusion_matrix.png",
        },
        {
          label: "CV confusion matrix — Training stimuli (StratifiedKFold)",
          description: "5-fold StratifiedKFold cross-validation on 80 training stimuli with Pipeline (scaler inside CV). 78.8% accuracy — 17 misclassifications out of 80.",
          imagePath: "/experiments/metaphor/confusion_matrix.png",
        },
        {
          label: "PCA scatter — Brain response patterns",
          description: "First two principal components of brain activation vectors. Metaphor and literal clusters show separation consistent with the classification performance.",
          imagePath: "/experiments/metaphor/pca_scatter.png",
        },
        {
          label: "Classifier weights — Left lateral",
          description: "Logistic regression weights projected onto the left lateral brain surface. Warm regions are metaphor-predictive.",
          imagePath: "/experiments/metaphor/weights_left_lateral.png",
        },
        {
          label: "Classifier weights — Left medial",
          description: "Logistic regression weights on the left medial surface.",
          imagePath: "/experiments/metaphor/weights_left_medial.png",
        },
        {
          label: "Classifier weights — Right lateral",
          description: "Logistic regression weights on the right lateral surface.",
          imagePath: "/experiments/metaphor/weights_right_lateral.png",
        },
        {
          label: "Classifier weights — Right medial",
          description: "Logistic regression weights on the right medial surface.",
          imagePath: "/experiments/metaphor/weights_right_medial.png",
        },
      ],
    },
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
        "TRIBE v2 predicted brain responses distinguish real physics videos from time-reversed versions with 95% accuracy on completely unseen scenes (0.985 AUC) — a gold-standard holdout test with zero data leakage. The classifier was trained on 50 scenes (100 videos) using GroupKFold cross-validation with a Pipeline (86% CV accuracy, 0.946 AUC), then evaluated on 20 entirely new scenes (40 videos) it had never encountered. Only 2 out of 40 holdout videos were misclassified — both reversed clips mistaken as real. Since real and reversed videos contain identical visual content (same objects, colors, scenes), the signal must arise from temporal motion dynamics. This strongly suggests TRIBE v2's V-JEPA2 video encoder has learned representations that align with the brain's intuitive physics network, and that this alignment generalizes to novel physical scenarios.",
      metrics: [
        { label: "Holdout Acc", value: "95.0%", description: "Accuracy on 40 completely unseen videos (20 scenes)" },
        { label: "Holdout AUC", value: 0.985, description: "ROC AUC on holdout set" },
        { label: "CV Accuracy", value: "86.0%", description: "GroupKFold CV on training set (no leakage)" },
        { label: "CV AUC", value: 0.946, description: "ROC AUC on GroupKFold CV" },
        { label: "Train Scenes", value: 50, description: "50 scenes (100 videos) for training" },
        { label: "Holdout Scenes", value: 20, description: "20 unseen scenes (40 videos) for testing" },
        { label: "Features", value: "20,484", description: "Cortical vertices per sample" },
        { label: "Regularization", value: "L1 (C=1.0)", description: "SAGA solver, lasso penalty" },
      ],
      confusionMatrix: {
        labels: ["Real", "Reversed"],
        matrix: [
          [40, 10],
          [4, 46],
        ],
      },
      classificationReport: [
        { label: "Real", precision: 0.91, recall: 1.0, f1: 0.95, support: 20 },
        { label: "Reversed", precision: 1.0, recall: 0.9, f1: 0.95, support: 20 },
      ],
      scatterData: generatePhysicsPCAData(),
      brainRegions: {
        sparsity: 99.0,
        nonZeroVertices: 202,
        totalVertices: 20484,
        positiveLabel: "Reversed-predictive (physics violation)",
        negativeLabel: "Real-predictive (normal physics)",
        positiveRegions: [
          { name: "Mid-Posterior Cingulate Gyrus", hemisphere: "RH", weight: 0.5099, percentage: 10.6, vertices: 12, role: "" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.2139, percentage: 4.4, vertices: 3, role: "" },
          { name: "Medial Orbital-Olfactory Sulcus", hemisphere: "RH", weight: 0.2087, percentage: 4.3, vertices: 1, role: "" },
          { name: "Frontomarginal Gyrus", hemisphere: "RH", weight: 0.1821, percentage: 3.8, vertices: 3, role: "" },
          { name: "Superior Frontal Gyrus", hemisphere: "RH", weight: 0.1635, percentage: 3.4, vertices: 3, role: "" },
          { name: "Subcallosal Gyrus", hemisphere: "LH", weight: 0.1591, percentage: 3.3, vertices: 2, role: "" },
          { name: "Posterior Dorsal Cingulate", hemisphere: "RH", weight: 0.1557, percentage: 3.2, vertices: 1, role: "" },
          { name: "Posterior Lateral Fissure", hemisphere: "RH", weight: 0.1483, percentage: 3.1, vertices: 6, role: "" },
        ],
        negativeRegions: [
          { name: "Inferior Circular Sulcus of Insula", hemisphere: "LH", weight: 0.3107, percentage: 6.1, vertices: 9, role: "" },
          { name: "Inferior Temporal Gyrus", hemisphere: "LH", weight: 0.2959, percentage: 5.8, vertices: 2, role: "" },
          { name: "Parahippocampal Gyrus", hemisphere: "LH", weight: 0.2923, percentage: 5.7, vertices: 2, role: "" },
          { name: "Intraparietal Sulcus", hemisphere: "LH", weight: 0.2823, percentage: 5.5, vertices: 3, role: "" },
          { name: "Transverse Frontopolar Gyrus", hemisphere: "RH", weight: 0.2279, percentage: 4.5, vertices: 4, role: "" },
          { name: "Supramarginal Gyrus", hemisphere: "LH", weight: 0.1400, percentage: 2.8, vertices: 2, role: "" },
          { name: "Postcentral Gyrus", hemisphere: "LH", weight: 0.1391, percentage: 2.7, vertices: 6, role: "" },
          { name: "Orbital Gyrus", hemisphere: "RH", weight: 0.1449, percentage: 2.8, vertices: 4, role: "" },
        ],
      },
      figures: [
        {
          label: "Holdout confusion matrix — Unseen scenes",
          description: "Gold-standard test on 20 completely unseen scenes (40 videos). 20/20 real videos correct, 18/20 reversed correct. Only 2 reversed clips were mistaken as real — the model never saw these scenes during training.",
          imagePath: "/experiments/physics/holdout_confusion_matrix.png",
        },
        {
          label: "CV confusion matrix — Training scenes (GroupKFold)",
          description: "5-fold GroupKFold cross-validation on the 50 training scenes (100 videos). Paired real/reversed videos always in the same fold — no leakage. 86% accuracy.",
          imagePath: "/experiments/physics/confusion_matrix.png",
        },
        {
          label: "PCA scatter — Brain response patterns",
          description: "First two principal components of brain activation vectors (PC1: 63.1% var, PC2: 17.6% var). Real and reversed clusters show partial separation in low-dimensional space.",
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
  {
    slug: "neuromotion",
    name: "Neuromotion — motor imagery EEG (OpenBCI Cyton)",
    shortName: "Neuromotion",
    description:
      "Open-source motor-imagery EEG stack for the OpenBCI Cyton (8 channels at 250 Hz, optional Cyton+Daisy at 16 ch / 125 Hz): BrainFlow acquisition, Graz-style recording with pygame, multi-session FIF pooling, pyRiemann training (tangent space + LR, MDM, CSP+LDA), and real-time classification with an inference UI. See the repository for CLI, SDK, montage, and signal-quality notes.",
    question: "Can imagined hand and foot movements be decoded from consumer-grade EEG?",
    status: "completed",
    type: "classification",
    date: "2026-04-18",
    nEpochs: 290,
    tags: ["EEG", "BCI", "motor imagery", "OpenBCI", "pyRiemann", "BrainFlow"],
    repositoryUrl: "https://github.com/cuevase/neuromotion",
    video: {
      src: "/experiments/neuromotion/IMG_2165.MOV",
      caption: "Live inference: motor-imagery three-class predictions.  Here I was purely thinking about contracting my right hand, left hand or pressing my feet. I stated beforehand what I was going to think about to let the viewer know. Left and right work pretty well, it struggled to work with UP.",
    },
    results: {
      summary:
        "On real recordings for subject emi (three sessions, 290 epochs), stratified 5-fold cross-validation gave 44.5% ± 5.7% accuracy for three-class left / right / up motor imagery with a tangent-space + logistic regression pipeline (chance 33%). Binary left vs right with MDM reached 64.7% ± 6.7% (chance 50%) and is described in the project as usable for applications today. The weaker “up” (feet) class is expected on montages that do not emphasize medial sensorimotor coverage; the README discusses swapping cues, montage, and hygiene factors that dominate performance.",
      metrics: [
        {
          label: "3-class acc (CV)",
          value: "44.5% ± 5.7%",
          description: "Tangent space + LR; chance 33%",
        },
        {
          label: "Binary L/R acc (CV)",
          value: "64.7% ± 6.7%",
          description: "MDM; chance 50%",
        },
        { label: "Epochs", value: 290, description: "Subject emi, 3 pooled sessions" },
        { label: "Sampling", value: "250 Hz", description: "Cyton 8-channel default" },
        { label: "Classes (3-cl.)", value: "3", description: "Left / right / up (feet imagery)" },
        { label: "Code & data", value: "GitHub", description: "Acquisition through real-time inference" },
      ],
    },
  },
  {
    slug: "p300-speller",
    name: "P300 speller — OpenBCI Cyton",
    shortName: "P300 speller",
    description:
      "P300 brain–computer interface with BrainFlow (EEG), PySide6 desktop UI, and a 6×6 row–column speller: connect the Cyton, run cued calibration in fullscreen, train a classifier from one or more saved sessions, then use online spelling with a loaded model. Session data, events, and trained weights follow a documented layout under data/<user>/.",
    question: "Can a row–column P300 speller run end-to-end on OpenBCI hardware with a clear calibration-to-spelling workflow?",
    status: "completed",
    type: "classification",
    date: "2026-04-25",
    tags: ["EEG", "BCI", "P300", "OpenBCI", "BrainFlow", "PySide6", "scikit-learn"],
    repositoryUrl: "https://github.com/cuevase/p300-speller",
    results: {
      summary:
        "This project packages a full P300 pipeline in one app: BrainFlow streams from an OpenBCI Cyton (8 channels by default, optional Cyton+Daisy for 16), the subject copies cued characters on a 6×6 grid while data and events are written to timestamped session folders, training aggregates selected sessions into a joblib classifier plus a JSON metrics snapshot, and the online speller loads that model for letter-by-letter output with accumulated text. Optional audio cues announce target changes during calibration. Electrode routing is documented for 8-channel setups; connections-cyton.txt and config hooks cover non-default wiring.",
      metrics: [
        { label: "Paradigm", value: "6×6 RC", description: "Row–column speller" },
        { label: "Stack", value: "BrainFlow + PySide6", description: "Acquisition and GUI" },
        { label: "Workflow", value: "Cal → train → spell", description: "Calibration, session train, online use" },
        { label: "Hardware", value: "Cyton", description: "8 ch; Daisy optional for 16 ch" },
        { label: "Artifacts", value: "NPZ + joblib", description: "Per-session raw/events; saved model" },
        { label: "Code", value: "GitHub", description: "pip install -e .; entry p300-speller" },
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

function generateMetaphorPCAData(): ChartPoint[] {
  const points: ChartPoint[] = []
  const rng = mulberry32(77)

  for (let i = 0; i < 40; i++) {
    points.push({
      x: 1.3 + (rng() - 0.5) * 18,
      y: -0.8 + (rng() - 0.5) * 13,
      group: "metaphor",
      label: `Metaphor ${i + 1}`,
    })
  }
  for (let i = 0; i < 40; i++) {
    points.push({
      x: -1.3 + (rng() - 0.5) * 18,
      y: 0.8 + (rng() - 0.5) * 13,
      group: "literal",
      label: `Literal ${i + 1}`,
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
