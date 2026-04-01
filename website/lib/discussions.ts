export interface DiscussionRegion {
  name: string
  hemisphere: string
  weightShare: string
  literatureSupport: "Strong" | "Moderate" | "Weak"
  analysis: string
  verdict: string
}

export interface DiscussionSection {
  label: string
  description: string
  regions: DiscussionRegion[]
}

export interface ExperimentDiscussion {
  slug: string
  title: string
  subtitle: string
  intro: string
  sections: DiscussionSection[]
  overallVerdict: string
  references: string[]
}

export const discussions: Record<string, ExperimentDiscussion> = {
  humor: {
    slug: "humor",
    title: "Brain Region Analysis — Humor Classification",
    subtitle: "98.0% accuracy, 0.994 AUC",
    intro:
      "The classifier weights were mapped onto the Destrieux cortical atlas (fsaverage5) to identify which named brain regions drive humor vs. neutral classification. Each region is compared against published neuroscience literature.",
    sections: [
      {
        label: "Humor-predictive regions",
        description: "Regions whose activation predicts humorous text (positive classifier weights).",
        regions: [
          {
            name: "Superior Frontal Gyrus",
            hemisphere: "Bilateral",
            weightShare: "8.4%",
            literatureSupport: "Strong",
            analysis:
              "This is the strongest humor-predictive region, and it aligns directly with published fMRI studies. The superior frontal gyrus contains part of the medial prefrontal cortex (mPFC), which is one of the most consistently activated regions in humor processing studies. Chan et al. (2013) showed that the left superior frontal gyrus activates during humor comprehension, while the ventromedial prefrontal cortex activates during the \"elaboration\" stage — experiencing amusement after the joke is understood. Bekinschtein et al. (2011) further showed that jokes activate reward circuits (amygdala, ventral striatum) whose activity correlates with subjective funniness ratings. The mPFC's involvement likely reflects both cognitive processing of incongruity and reward signaling.",
            verdict: "Makes strong neuroscientific sense. The mPFC/SFG is one of the most replicated humor regions in the literature.",
          },
          {
            name: "Superior Temporal Sulcus",
            hemisphere: "Bilateral",
            weightShare: "7.2%",
            literatureSupport: "Strong",
            analysis:
              "The STS is the brain's hub for social perception and social cognition (Deen et al., 2015). It processes biological motion, social interaction, speech prosody, and — critically — the understanding of others' intentions. Much verbal humor depends on theory of mind (understanding the speaker's intended meaning vs. the literal meaning), which is a core STS function. The STS is also involved in pragmatic language processing, which is essential for detecting the incongruity that makes jokes funny.",
            verdict: "Makes strong neuroscientific sense. Humor requires social cognition and pragmatic inference, both core STS functions.",
          },
          {
            name: "Superior Parietal Gyrus + Precuneus",
            hemisphere: "Bilateral + RH",
            weightShare: "6.6%",
            literatureSupport: "Strong",
            analysis:
              "The precuneus is implicated in perspective-taking and self-referential processing (Cavanna & Trimble, 2006). Nakamura et al. (2018) found that precuneus volume correlates with self-enhancing humor style, though notably only in individuals with high cognitive empathy — suggesting the link is mediated by social cognition rather than humor per se. The superior parietal lobule supports attentional reorienting, relevant for the surprise/incongruity detection phase of humor. The dual-path model of humor processing (Cheng et al., 2017) specifically implicates the precuneus in the resolution of resolvable incongruity.",
            verdict: "Makes strong neuroscientific sense. Perspective-taking and attentional reorienting are core to humor processing.",
          },
          {
            name: "Supramarginal Gyrus (TPJ)",
            hemisphere: "RH",
            weightShare: "1.7%",
            literatureSupport: "Strong",
            analysis:
              "Part of the temporoparietal junction (TPJ), the supramarginal gyrus is a core theory-of-mind region. It's activated when understanding others' beliefs and intentions, which is exactly what verbal humor requires — the listener must infer the speaker's intended meaning behind the joke setup. The right TPJ in particular is one of the most replicated regions in false-belief tasks and social cognition studies.",
            verdict: "Makes strong neuroscientific sense. TPJ/supramarginal gyrus is a canonical theory-of-mind region.",
          },
          {
            name: "Central Sulcus + Precentral + Postcentral",
            hemisphere: "LH",
            weightShare: "~8.7%",
            literatureSupport: "Moderate",
            analysis:
              "These motor and somatosensory regions are less expected for humor. One possible explanation is embodied simulation — humor often involves physical scenarios (slapstick, bodily references) that may engage motor imagery. Another possibility is that TRIBE v2's text-to-speech pipeline engages articulatory motor regions differently for humorous vs. neutral content (e.g., different prosody or speech rhythm).",
            verdict: "Partially supported. Embodied simulation is a real phenomenon, but these regions are less typical in humor fMRI studies.",
          },
        ],
      },
      {
        label: "Neutral-predictive regions",
        description: "Regions whose activation predicts neutral/factual text (negative classifier weights).",
        regions: [
          {
            name: "Middle Frontal Gyrus (DLPFC)",
            hemisphere: "Bilateral",
            weightShare: "5.2%",
            literatureSupport: "Strong",
            analysis:
              "The MFG contains the dorsolateral prefrontal cortex (DLPFC), the brain's executive control center. It is engaged during analytical reasoning, working memory, and controlled attention (Curtis & D'Esposito, 2003). For neutral factual sentences, more controlled analytical processing would be expected compared to the more automatic, insight-like processing of humor. The DLPFC also supports ambiguity resolution and discourse management (Hertrich et al., 2021).",
            verdict: "Makes strong neuroscientific sense. Neutral factual sentences require more deliberate, analytical processing.",
          },
          {
            name: "Angular Gyrus",
            hemisphere: "Bilateral",
            weightShare: "3.8%",
            literatureSupport: "Strong",
            analysis:
              "The AG is a multimodal convergence zone that binds semantic features (Seghier, 2013). It overlaps with the default mode network and is activated during semantic matching, factual knowledge retrieval, and controlled semantic access (Binder et al., 2009). Neutral factual sentences likely engage this semantic retrieval system more than humor, which bypasses conventional semantic processing through incongruity.",
            verdict: "Makes strong neuroscientific sense. The angular gyrus is a canonical semantic processing region.",
          },
          {
            name: "Occipital Pole",
            hemisphere: "Bilateral",
            weightShare: "4.0%",
            literatureSupport: "Moderate",
            analysis:
              "Early visual cortex. Research shows that visual cortex activates during concrete language processing through mental imagery. Neutral sentences in our stimuli tend to describe concrete, factual scenarios (\"Water boils at 100 degrees\"), which may evoke more vivid visual imagery than humor stimuli, which rely on abstract incongruity.",
            verdict: "Moderately supported. Visual imagery for concrete factual content is a plausible explanation.",
          },
          {
            name: "Inferior Temporal Gyrus",
            hemisphere: "LH",
            weightShare: "1.9%",
            literatureSupport: "Strong",
            analysis:
              "Contains the visual word form area and supports semantic processing at the word level (Binder et al., 2009). More straightforward lexical-semantic processing for neutral content would activate this region more strongly.",
            verdict: "Makes neuroscientific sense.",
          },
        ],
      },
    ],
    overallVerdict:
      "The humor experiment's brain regions are highly consistent with the neuroscience literature. The humor-predictive regions correspond almost exactly to the known humor processing network: mPFC (reward/elaboration), STS (social cognition), TPJ/supramarginal gyrus (theory of mind), and precuneus (perspective-taking). The neutral-predictive regions correspond to the analytical/semantic processing network (DLPFC, angular gyrus, inferior temporal). The only partially unexplained finding is the motor/somatosensory involvement, which has a plausible embodied cognition explanation.",
    references: [
      "Bekinschtein, T. A., et al. (2011). Why clowns taste funny. Journal of Neuroscience, 31(26), 9665-9671.",
      "Binder, J. R., et al. (2009). Where is the semantic system? Cerebral Cortex, 19(12), 2767-2796.",
      "Cavanna, A. E., & Trimble, M. R. (2006). The precuneus: functional anatomy and behavioural correlates. Brain, 129(3), 564-583.",
      "Chan, Y. C., et al. (2013). Segregating the comprehension and elaboration processing of verbal jokes. NeuroImage, 61(4), 899-906.",
      "Cheng, C. M., et al. (2017). To resolve or not to resolve: The dual-path model of humor. Frontiers in Psychology, 8, 498.",
      "Deen, B., et al. (2015). Functional organization of social perception in the STS. Cerebral Cortex, 25(11), 4596-4609.",
      "Hertrich, I., et al. (2021). The role of the DLPFC for speech and language processing. Frontiers in Human Neuroscience, 15, 645209.",
      "Nakamura, T., et al. (2018). Self-enhancing humor and precuneus volume. Scientific Reports, 8, 5540.",
      "Seghier, M. L. (2013). The angular gyrus: Multiple functions and subdivisions. The Neuroscientist, 19(1), 43-61.",
    ],
  },

  metaphor: {
    slug: "metaphor",
    title: "Brain Region Analysis — Metaphor vs. Literal",
    subtitle: "78.8% CV accuracy, 0.90 AUC; 95% holdout accuracy",
    intro:
      "The classifier was 98.3% sparse — only 353 of 20,484 vertices had non-zero weights. Weights were mapped onto the Destrieux cortical atlas (fsaverage5). Each region is compared against published figurative language neuroscience literature.",
    sections: [
      {
        label: "Metaphor-predictive regions",
        description: "Regions whose activation predicts metaphorical text (positive classifier weights).",
        regions: [
          {
            name: "Orbital Gyrus + Gyrus Rectus (OFC)",
            hemisphere: "Bilateral",
            weightShare: "~26.9%",
            literatureSupport: "Moderate",
            analysis:
              "The orbitofrontal cortex (OFC) is the dominant metaphor-predictive region in our classifier, but this is not a well-established finding in the figurative language literature. Meta-analyses of metaphor processing (Rapp et al., 2012) identify left temporal, bilateral inferior frontal, and medial frontal regions — not the OFC — as the canonical metaphor network. The OFC is primarily known for reward evaluation, outcome prediction, and flexible value computation. Our interpretation is that metaphorical language may carry richer emotional and evaluative content than literal language, engaging the OFC's evaluation machinery. This is a plausible but speculative explanation — the OFC's role in metaphor processing has not been directly established.",
            verdict: "Our interpretation, not strongly established. The OFC is not identified as a core metaphor region in meta-analyses. Its activation here may reflect emotional/evaluative processing differences between metaphorical and literal text.",
          },
          {
            name: "Inferior Temporal Gyrus",
            hemisphere: "LH",
            weightShare: "8.3%",
            literatureSupport: "Strong",
            analysis:
              "The left ITG is part of the ventral language stream and supports semantic processing. Meta-analyses of figurative language processing (Rapp et al., 2012) identify the left temporal lobe as a key region for metaphor comprehension. The ITG specifically supports the retrieval and integration of distant semantic associations — mapping meaning from one conceptual domain to another.",
            verdict: "Makes strong neuroscientific sense. Left temporal regions are consistently activated in metaphor studies.",
          },
          {
            name: "Superior Frontal Gyrus (mPFC)",
            hemisphere: "LH",
            weightShare: "6.0%",
            literatureSupport: "Strong",
            analysis:
              "The SFG/mPFC is implicated in processing novel metaphors. Subramaniam et al. (2013) showed that novel unfamiliar metaphors elicit significant activation in the medial prefrontal cortex, posterior cingulate cortex, and right inferior parietal lobe. The mPFC likely mediates attention and cognitive control for integrating unusual semantic associations. Since our stimuli include creative metaphors (\"His anger was a volcano about to erupt\"), this activation is expected.",
            verdict: "Makes strong neuroscientific sense. mPFC activation for novel metaphors is supported by multiple studies.",
          },
          {
            name: "Temporal Pole",
            hemisphere: "LH",
            weightShare: "5.0%",
            literatureSupport: "Strong",
            analysis:
              "The temporal pole is a \"semantic hub\" that integrates conceptual features across modalities (Patterson et al., 2007). TMS studies by Pobric et al. (2007) confirmed that disrupting the temporal pole impairs semantic processing broadly. Patients with semantic dementia (which causes temporal pole atrophy) lose conceptual knowledge across all modalities. While the temporal pole is well-established for general semantic integration, its specific role in metaphor (as opposed to semantics broadly) is our interpretation — metaphor requires binding distant conceptual domains, which is the type of cross-domain integration the temporal pole supports.",
            verdict: "Strongly supported for semantic integration broadly. The specific link to metaphor (rather than general semantics) is our interpretation, but well-reasoned.",
          },
          {
            name: "Central Sulcus + Postcentral + Paracentral",
            hemisphere: "Bilateral",
            weightShare: "~24.4%",
            literatureSupport: "Moderate",
            analysis:
              "Motor and somatosensory regions. One explanation is embodied cognition — many metaphors reference bodily experience (\"grasping an idea,\" \"heavy heart\"), which may activate sensorimotor simulations. Desai et al. (2011) showed that action-related metaphors activate motor regions, though less strongly than literal action sentences. However, the large weight share seems disproportionate and may also reflect TRIBE v2's TTS pipeline producing different articulatory patterns.",
            verdict: "Partially supported. Embodied metaphor theory predicts some motor involvement, but the magnitude is larger than expected.",
          },
        ],
      },
      {
        label: "Literal-predictive regions",
        description: "Regions whose activation predicts literal text (negative classifier weights).",
        regions: [
          {
            name: "Occipital Pole",
            hemisphere: "Bilateral",
            weightShare: "43.1%",
            literatureSupport: "Strong",
            analysis:
              "This is by far the strongest literal-predictive region, accounting for nearly half of all literal classification weight. The occipital pole is primary visual cortex. This is highly consistent with the literature — concrete, literal language activates visual cortex more strongly than abstract or figurative language (Binder et al., 2005). When processing \"The cat sat on the mat,\" the brain generates stronger visual imagery than when processing \"Time is a thief.\" Visual and linguistic semantic representations are aligned at the border of visual cortex (Popham et al., 2021).",
            verdict: "Makes strong neuroscientific sense. This is one of the most well-established findings in concrete/abstract language neuroscience.",
          },
          {
            name: "Parahippocampal Gyrus",
            hemisphere: "LH",
            weightShare: "5.0%",
            literatureSupport: "Strong",
            analysis:
              "Supports scene construction and contextual/spatial processing (Epstein & Kanwisher, 1998). Literal sentences describe concrete, spatially situated events, which would engage scene-level representations more than abstract metaphors.",
            verdict: "Makes strong neuroscientific sense. Literal scenes activate the parahippocampal place area.",
          },
          {
            name: "Superior Parietal Gyrus",
            hemisphere: "RH",
            weightShare: "8.4%",
            literatureSupport: "Moderate",
            analysis:
              "Involved in spatial attention and visuospatial processing. Literal sentences with concrete spatial content would engage dorsal stream spatial processing more than figurative language.",
            verdict: "Moderately supported.",
          },
        ],
      },
    ],
    overallVerdict:
      "The most impressive result is the bilateral occipital pole dominance for literal language (43.1% of literal-predictive weight). This directly reflects the well-established finding that concrete/literal language engages visual cortex through mental imagery, while abstract/figurative language does not (Binder et al., 2005; Popham et al., 2021). The classifier essentially \"discovered\" this without being told anything about visual imagery. The metaphor-predictive regions partially align with the figurative language processing network: the temporal pole (semantic hub) and the inferior temporal gyrus (distant semantic retrieval) are well-established, and the superior frontal gyrus (novel meaning construction) is supported. The large OFC involvement (~26.9%) is not predicted by meta-analyses of figurative language and may reflect emotional/evaluative processing differences rather than metaphor comprehension per se.",
    references: [
      "Binder, J. R., et al. (2005). Distinct brain systems for processing concrete and abstract concepts. Journal of Cognitive Neuroscience, 17(6), 905-917.",
      "Desai, R. H., et al. (2011). The neural career of sensory-motor metaphors. Journal of Cognitive Neuroscience, 23(9), 2376-2386.",
      "Epstein, R., & Kanwisher, N. (1998). A cortical representation of the local visual environment. Nature, 392, 598-601.",
      "Patterson, K., et al. (2007). Where do you know what you know? Nature Reviews Neuroscience, 8(12), 976-987.",
      "Pobric, G., et al. (2007). Conceptual knowledge is underpinned by the temporal pole bilaterally: convergent evidence from rTMS. Cerebral Cortex, 17(10), 2461-2468.",
      "Popham, S. F., et al. (2021). Visual and linguistic representations aligned at the border of visual cortex. Nature Neuroscience, 24, 1628-1636.",
      "Rapp, A. M., et al. (2012). Neural correlates of metaphor processing. Neuropsychologia, 50(11), 2348-2360.",
      "Subramaniam, K., et al. (2013). Positively valenced stimuli facilitate creative novel metaphoric processes. Frontiers in Psychology, 4, 211.",
    ],
  },

  physics: {
    slug: "physics",
    title: "Brain Region Analysis — Real vs. Reversed Physics",
    subtitle: "86.0% CV accuracy, 0.946 AUC; 95% holdout accuracy",
    intro:
      "The classifier was 99.0% sparse — only 202 of 20,484 vertices had non-zero weights. This experiment used video input (V-JEPA2 encoder) rather than text, making the results free from TTS pipeline artifacts. Weights were mapped onto the Destrieux cortical atlas (fsaverage5).",
    sections: [
      {
        label: "Real-physics-predictive regions",
        description: "Regions whose activation predicts real (forward) physics videos (positive classifier weights).",
        regions: [
          {
            name: "Cingulate Cortex (mid-posterior + dorsal + marginal)",
            hemisphere: "RH",
            weightShare: "~23.7%",
            literatureSupport: "Strong",
            analysis:
              "This is the dominant real-physics-predictive region. The anterior and mid-cingulate cortex (ACC/MCC) functions as a forward model that predicts future states (Alexander & Brown, 2019). Limongi et al. (2013) showed that temporal prediction errors — the discrepancy between when an event was expected to occur and when it actually occurred — modulate coupling between the cingulate and insula. For real physics videos, the cingulate can successfully build a forward model: a ball falls, accelerates under gravity, bounces. In reversed videos, the forward model breaks down — objects spontaneously launch upward, fluids reassemble — which is why the cingulate activates more for real physics where predictions are coherent and sustained.",
            verdict: "Makes strong neuroscientific sense. The cingulate as a forward model for causal event prediction is well-documented.",
          },
          {
            name: "Superior Frontal Gyrus (mPFC)",
            hemisphere: "RH",
            weightShare: "5.0%",
            literatureSupport: "Strong",
            analysis:
              "Part of the mPFC, involved in predictive coding and maintaining internal models. Fischer et al. (2016) identified a network including premotor cortex and supplementary motor area that activates during intuitive physical reasoning. The mPFC likely supports high-level prediction and model-updating when watching coherent physical scenes.",
            verdict: "Makes strong neuroscientific sense. mPFC is involved in predictive processing and internal model maintenance.",
          },
          {
            name: "Posterior Lateral Fissure",
            hemisphere: "Bilateral",
            weightShare: "7.6%",
            literatureSupport: "Strong",
            analysis:
              "The posterior lateral fissure borders the superior temporal gyrus and the inferior parietal lobule, near the temporoparietal junction. This region is adjacent to motion-sensitive areas (MT+/V5) and areas involved in event structure processing. It would process the temporal dynamics and causal structure of physical events — when objects move in physically consistent ways, this region can extract meaningful event structure.",
            verdict: "Moderately to strongly supported. Temporal/parietal junction regions process event structure and motion.",
          },
          {
            name: "Inferior Temporal Sulcus + Middle Temporal Gyrus",
            hemisphere: "Bilateral + LH",
            weightShare: "~10.7%",
            literatureSupport: "Strong",
            analysis:
              "These temporal regions are involved in higher-order visual processing, including motion perception, object recognition, and event structure. The middle temporal gyrus (near MT+/V5) specifically processes visual motion. Real physics videos have coherent, physically plausible motion patterns that this region would process more efficiently.",
            verdict: "Makes strong neuroscientific sense. Temporal motion-processing regions preferentially encode coherent physical motion.",
          },
        ],
      },
      {
        label: "Reversed-physics-predictive regions",
        description: "Regions whose activation predicts time-reversed physics videos (negative classifier weights). These are the brain's \"error detectors.\"",
        regions: [
          {
            name: "Intraparietal Sulcus (IPS)",
            hemisphere: "LH",
            weightShare: "8.2%",
            literatureSupport: "Strong",
            analysis:
              "This is perhaps the most important finding. Schwettmann et al. (2019) showed that dorsal fronto-parietal cortex — including the IPS — encodes invariant representations of physical variables like mass, generalizing across different scenarios, materials, and motion patterns. Fischer et al. (2016) identified a broader \"physics engine\" network (primarily premotor cortex and supplementary motor area) that activates during intuitive physical reasoning. The IPS is part of this extended network. Here, the IPS predicts reversed physics. This is counterintuitive at first, but has a compelling explanation: when watching reversed videos, the brain's physics engine detects violations — objects moving in physically impossible ways — and activates more intensely as it tries to reconcile the visual input with its internal physical model. This is consistent with prediction error theory.",
            verdict: "Makes strong neuroscientific sense. The IPS (the brain's \"physics engine\") firing for reversed physics is consistent with prediction error — it fires harder when physics is wrong.",
          },
          {
            name: "Insula (inferior circular + short gyri + central)",
            hemisphere: "LH",
            weightShare: "~15.6%",
            literatureSupport: "Strong",
            analysis:
              "The insula is the brain's primary salience and prediction error hub. The anterior insula encodes risk prediction errors (Bossaerts, 2010) and signals deviations from expectations via bursts of beta oscillations (Haufler et al., 2022). Limongi et al. (2013) showed that temporal prediction errors specifically modulate cingulate-insular coupling. Reversed physics videos represent massive violations of temporal and physical expectations. Objects move at the wrong times, in the wrong directions, with impossible causal sequences.",
            verdict: "Makes strong neuroscientific sense. The insula as a prediction-error detector explains its strong reversed-physics activation perfectly.",
          },
          {
            name: "Parahippocampal Gyrus",
            hemisphere: "LH",
            weightShare: "8.5%",
            literatureSupport: "Moderate",
            analysis:
              "The parahippocampal gyrus encodes spatial layout and contextual associations (Epstein & Kanwisher, 1998). Research shows it is primarily engaged when processing scenes and spatial context — it responds strongly to congruent, meaningful scene contexts. Our interpretation is that reversed physics videos disrupt normal contextual processing: objects appear in impossible spatial configurations (liquid flying upward, objects launching off surfaces), which would alter the parahippocampal response compared to normal physics. However, calling it a \"violation detector\" would be an overstatement — its established function is encoding contextual associations, not detecting violations per se.",
            verdict: "The parahippocampal gyrus's role in contextual encoding is well-established. That it responds differently to reversed physics is our interpretation — plausible but not directly tested in the literature.",
          },
          {
            name: "Supramarginal Gyrus (TPJ)",
            hemisphere: "LH",
            weightShare: "4.1%",
            literatureSupport: "Strong",
            analysis:
              "Part of the temporoparietal junction (TPJ), the supramarginal gyrus is involved in temporal order judgments. Davis, Christie & Rorden (2009) showed that the TPJ activates specifically when making judgments about the temporal order of events. Reversed videos inherently violate temporal order — events happen backward — which would specifically engage this temporal-order processing region.",
            verdict: "Makes strong neuroscientific sense. The supramarginal gyrus processes temporal order, which is violated in reversed videos.",
          },
          {
            name: "Frontopolar Gyrus",
            hemisphere: "RH",
            weightShare: "6.7%",
            literatureSupport: "Moderate",
            analysis:
              "The frontopolar cortex (Brodmann area 10) is involved in monitoring and evaluating competing cognitive representations. When watching reversed physics, the brain simultaneously processes the visual input (what it sees) and the expected physics (what should happen), creating a conflict that engages the frontopolar cortex's conflict-monitoring function.",
            verdict: "Moderately supported. Frontopolar conflict monitoring is plausible but less directly established for physics perception.",
          },
        ],
      },
    ],
    overallVerdict:
      "The physics experiment's brain regions tell a coherent story about how the brain processes physical plausibility. Real physics activates regions associated with forward modeling — the cingulate cortex (which predicts future states), temporal motion areas (which process coherent motion), and the mPFC (which maintains internal models). Reversed physics activates regions associated with error detection — the insula (salience/prediction error), the intraparietal sulcus (physical variable encoding, responding to violations), the parahippocampal gyrus (contextual encoding disrupted by impossible spatial configurations), and the supramarginal gyrus (temporal order processing). The prediction-vs-error framing is our interpretation of the pattern, but each individual region's known function aligns with the direction of the finding.",
    references: [
      "Alexander, W. H., & Brown, J. W. (2019). The role of the anterior cingulate cortex in prediction error and signaling surprise. Topics in Cognitive Science, 11(1), 106-120.",
      "Bossaerts, P. (2010). Risk and risk prediction error signals in anterior insula. Brain Structure and Function, 214, 645-653.",
      "Davis, B., Christie, J., & Rorden, C. (2009). Temporal order judgments activate temporal parietal junction. Journal of Neuroscience, 29(10), 3182-3188.",
      "Epstein, R., & Kanwisher, N. (1998). A cortical representation of the local visual environment. Nature, 392, 598-601.",
      "Fischer, J., et al. (2016). Functional neuroanatomy of intuitive physical inference. PNAS, 113(34), E5072-E5081.",
      "Haufler, A. J., et al. (2022). Human anterior insula signals salience and deviations from expectations via bursts of beta oscillations. Journal of Neurophysiology, 128(1), 160-176.",
      "Limongi, R., et al. (2013). Temporal prediction errors modulate cingulate-insular coupling. NeuroImage, 71, 147-157.",
      "Schwettmann, S., et al. (2019). Invariant representations of mass in the human brain. eLife, 8, e46619.",
    ],
  },
}

export function getDiscussion(slug: string): ExperimentDiscussion | undefined {
  return discussions[slug]
}
