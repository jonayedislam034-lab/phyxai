const BOOKS = {
  BPT: [
    ['Anatomy', "BD Chaurasia · Gray's · Moore · Cunningham · Netter"], ['Physiology', 'Guyton & Hall · Sembulingam · Ganong'], ['Biochemistry', "Harper's · Satyanarayana · Lippincott"], ['Psychology', 'Morgan & King · Mohsin'], ['Sociology', 'Clement · Shankar Rao'], ['Pathology', 'Robbins · Harsh Mohan'], ['Microbiology', 'Ananthanarayan · Apurba Sastry'], ['Pharmacology', 'Tripathi · Padmaja Udaykumar'], ['Exercise Therapy', 'Kisner & Colby · Dena Gardiner'], ['Electrotherapy', "Clayton's · Low & Reed · Jagmohan Singh"], ['Biomechanics & Kinesiology', 'Norkin & Levangie · Susan Hall · Donald Neumann'], ['Orthopaedics', "Apley's · Maheshwari · Campbell's"], ['General Medicine', "Davidson's · Harrison's"], ['General Surgery', "Bailey & Love · SRB's"], ['Neurology', 'Adams & Victor · Cash'], ['Orthopaedic Physiotherapy', "Magee · Tidy's"], ['Neurological Physiotherapy', "O'Sullivan · Shumway-Cook · Brunnstrom"], ['Cardiopulmonary Physiotherapy', "Hillegass · Cash's"], ['Community-Based Rehabilitation', 'WHO · K. Park'], ['Research Methodology', 'Kothari · Mahajan']
  ],
  MPT: [
    ['Musculoskeletal', 'Magee · Maitland · Mulligan · Kaltenborn · Brotzman'], ['Sports', 'Brukner & Khan · Roald Bahr'], ['Neurological', "O'Sullivan · Shumway-Cook · Brunnstrom · Bobath"], ['Cardiopulmonary', 'Hillegass · ACSM · Frownfelter'], ['Pediatric', "Campbell's · Tecklin"], ['Geriatric', 'Guccione'], ["Women's Health", 'Polden & Mantle'], ['Manual Therapy', 'Maitland · Mulligan · Kaltenborn · Cyriax'], ['Rehabilitation', "DeLisa · Braddom · O'Sullivan"], ['Evidence-Based Practice', 'Fletcher'], ['Biomechanics', 'Neumann · Norkin · Hall']
  ]
};

const GAIT_PATTERNS = [
  { name: 'Antalgic', cue: 'Shortened stance on a painful limb', cause: 'Pain avoidance; consider musculoskeletal injury or inflammation.' },
  { name: 'Trendelenburg', cue: 'Contralateral pelvic drop in stance', cause: 'Hip abductor weakness or pain.' },
  { name: 'Waddling', cue: 'Bilateral trunk sway and pelvic drop', cause: 'Bilateral hip abductor weakness or myopathy.' },
  { name: 'Steppage', cue: 'Exaggerated hip and knee flexion', cause: 'Foot drop; often dorsiflexor weakness or neuropathy.' },
  { name: 'Hemiplegic', cue: 'Stiff extended limb with circumduction', cause: 'Upper motor neuron lesion, commonly post-stroke.' },
  { name: 'Spastic', cue: 'Stiff, scissoring or toe-first pattern', cause: 'Upper motor neuron spasticity.' },
  { name: 'Scissor', cue: 'Thighs cross in swing', cause: 'Adductor spasticity, often cerebral palsy.' },
  { name: 'Parkinsonian', cue: 'Short shuffling steps with reduced arm swing', cause: 'Parkinsonism or basal ganglia dysfunction.' },
  { name: 'Ataxic', cue: 'Wide base with irregular trajectory', cause: 'Cerebellar dysfunction.' },
  { name: 'Sensory Ataxic', cue: 'High stepping with visual dependence', cause: 'Impaired proprioception/peripheral neuropathy.' },
  { name: 'Choreiform', cue: 'Unpredictable flowing movements', cause: 'Basal ganglia disorder.' },
  { name: 'Dystonic', cue: 'Sustained twisting postures', cause: 'Dystonia or extrapyramidal disorder.' },
  { name: 'Apraxic (Magnetic)', cue: 'Feet appear stuck to floor', cause: 'Frontal gait disorder or normal pressure hydrocephalus.' },
  { name: 'Festinating', cue: 'Accelerating short forward steps', cause: 'Parkinsonism.' },
  { name: 'Diplegic', cue: 'Bilateral stiff, adducted lower limbs', cause: 'Spastic diplegic cerebral palsy.' },
  { name: 'Neuropathic', cue: 'Foot slap or high-stepping pattern', cause: 'Peripheral neuropathy.' },
  { name: 'Equinus', cue: 'Persistent plantarflexion / toe-first contact', cause: 'Calf tightness or plantarflexor spasticity.' },
  { name: 'Calcaneal', cue: 'Excessive heel contact', cause: 'Plantarflexor weakness.' },
  { name: 'Crouch', cue: 'Excessive knee and hip flexion in stance', cause: 'Hamstring tightness, weakness, or cerebral palsy.' },
  { name: 'Vaulting', cue: 'Rise on contralateral forefoot during swing', cause: 'Compensation for inadequate swing clearance.' },
  { name: 'Circumduction', cue: 'Leg arcs outward during swing', cause: 'Reduced knee flexion or limb clearance.' },
  { name: 'Gluteus Maximus', cue: 'Posterior trunk lean in stance', cause: 'Hip extensor weakness.' },
  { name: 'Gluteus Medius', cue: 'Lateral trunk lean toward stance limb', cause: 'Hip abductor weakness.' },
  { name: 'Toe Walking', cue: 'Forefoot contact through gait cycle', cause: 'Calf tightness, sensory habit, or neurological cause.' },
  { name: 'Limping', cue: 'Observable asymmetry in stance/step timing', cause: 'Pain, weakness, or mechanical limitation.' }
];

const FALLBACK_NEWS = [
  { source: 'Clinical research', title: 'How AI is reshaping the path from research signal to bedside decision', description: 'A practical lens on using machine intelligence carefully alongside evidence and clinical expertise.', link: 'https://www.nature.com/subjects/medical-research' },
  { source: 'Digital health', title: 'The promise—and responsibility—of intelligent clinical tools', description: 'Why transparent design, validation, and clinician oversight matter in health technology.', link: 'https://www.who.int/teams/digital-health-and-innovation' },
  { source: 'Rehabilitation science', title: 'Measuring movement: what wearable and vision-based tools can add', description: 'New methods are making functional assessment more continuous, accessible, and meaningful.', link: 'https://pubmed.ncbi.nlm.nih.gov/?term=rehabilitation+technology' }
];
