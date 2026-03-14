import { AxiomDefinition, NarrativeIntent } from '../../types';

export interface GenrePreset {
  id: string;
  name: string;
  intent: NarrativeIntent;
  axioms: AxiomDefinition;
  style: string;
  lodge?: string;
  pillars?: string[];
  spark?: string;
}

export const GENRE_PRESETS: GenrePreset[] = [
  {
    id: 'litrpg',
    name: 'LitRPG / GameLit',
    intent: 'Epic',
    axioms: {
      currency: 'XP / Levels',
      secondaryCurrency: 'Loot',
      friction: 'System Constraints',
      penalty: 'Durability Loss',
      recoveryRate: 0.5,
      isTransactional: true
    },
    style: 'Analytical, progression-focused',
    lodge: 'The protagonist reaches Level 100 and transcends the System constraints.',
    pillars: [
      "The System is absolute and governs all physical laws.",
      "Death is permanent, but resurrection is a high-tier myth.",
      "Stats are visible but often misleading."
    ],
    spark: "The blue screen flickered into existence before my eyes, obscuring the charging goblin. [System Initializing...]"
  },
  {
    id: 'cultivation',
    name: 'Xianxia / Cultivation',
    intent: 'Epic',
    axioms: {
      currency: 'Qi / Essence',
      secondaryCurrency: 'Spirit Stones',
      friction: 'Tribulation',
      penalty: 'Qi Deviation',
      recoveryRate: 0.4,
      isTransactional: false
    },
    style: 'Philosophical, grand-scale',
    lodge: 'The protagonist forms their Immortal Core and avenges their fallen sect.',
    pillars: [
      "The strong devour the weak; mercy is a luxury for the dead.",
      "Heaven is indifferent; one must struggle against fate.",
      "Alchemy and formations are as deadly as any blade."
    ],
    spark: "The elder's palm struck my chest, shattering my dantian. 'Trash,' he spat, as I tumbled into the abyss of the Forbidden Peak."
  },
  {
    id: 'shifter',
    name: 'Shifter Romance',
    intent: 'Gritty',
    axioms: {
      currency: 'Pack Bond',
      secondaryCurrency: 'Instinct',
      friction: 'Silver / Territory',
      penalty: 'Feral Drift',
      recoveryRate: 0.7,
      isTransactional: false
    },
    style: 'Visceral, emotional',
    lodge: 'The protagonist finds their fated mate and secures the pack\'s future against the hunters.',
    pillars: [
      "The Moon governs the shift; it cannot be denied.",
      "The Alpha's word is law, but the heart follows its own path.",
      "Humans are unaware of the war in the shadows."
    ],
    spark: "The scent of pine and wet fur hit me before I saw him. His eyes weren't human—they were a predatory gold, locked onto mine."
  },
  {
    id: 'thriller',
    name: 'Psychological Thriller',
    intent: 'Clinical',
    axioms: {
      currency: 'Trust',
      secondaryCurrency: 'Clues',
      friction: 'Paranoia',
      penalty: 'Gaslighting',
      recoveryRate: 0.3,
      isTransactional: true
    },
    style: 'Tense, claustrophobic',
    lodge: 'The protagonist uncovers the truth behind the disappearance, even if it destroys their own sanity.',
    pillars: [
      "Everyone has a secret they would kill to keep.",
      "The narrator is unreliable; memory is a construct.",
      "The threat is closer than it appears."
    ],
    spark: "I found the note tucked under my pillow. It was my own handwriting, but I didn't remember writing it: 'Don't trust the man in the mirror.'"
  },
  {
    id: 'grimdark',
    name: 'Grimdark Fantasy',
    intent: 'Gritty',
    axioms: {
      currency: 'Blood',
      secondaryCurrency: 'Steel',
      friction: 'Moral Decay',
      penalty: 'Corruption',
      recoveryRate: 0.2,
      isTransactional: true
    },
    style: 'Bleak, visceral',
    lodge: 'The protagonist survives the siege, though they have lost every shred of their humanity to do so.',
    pillars: [
      "There are no heroes, only survivors and the dead.",
      "Magic is a parasite that eats the soul.",
      "The gods are either dead or malicious."
    ],
    spark: "The mud was thick with the copper tang of a thousand men's worth of blood. I gripped my notched sword, waiting for the next wave."
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    intent: 'Clinical',
    axioms: {
      currency: 'Credits',
      secondaryCurrency: 'Chrome',
      friction: 'Corporate Heat',
      penalty: 'System Anomaly',
      recoveryRate: 0.3,
      isTransactional: true
    },
    style: 'Technical, neon-noir',
    lodge: 'The protagonist successfully executes the heist and disappears into the digital sprawl.',
    pillars: [
      "High tech, low life.",
      "The corporations own the air you breathe.",
      "Your body is just hardware; your mind is just data."
    ],
    spark: "The neural link hissed as it slotted into my neck. Static flared, then the city's data-stream flooded my vision in neon violet."
  },
  {
    id: 'fantasy',
    name: 'High Fantasy',
    intent: 'Epic',
    axioms: {
      currency: 'Mana',
      secondaryCurrency: 'Gold',
      friction: 'The Blight',
      penalty: 'Exile',
      recoveryRate: 0.6,
      isTransactional: false
    },
    style: 'Elevated, mythic',
    lodge: 'The Dark Lord is defeated and the ancient kingdom is restored to its former glory.',
    pillars: [
      "Magic is a gift from the stars, rare and powerful.",
      "Prophecy is a double-edged sword.",
      "The ancient ruins hold the key to the future."
    ],
    spark: "The dragon's shadow swept over the valley, a silent promise of fire. I reached for the hilt of the Star-Blade, feeling its cold pulse."
  },
  {
    id: 'noir',
    name: 'Noir',
    intent: 'Gritty',
    axioms: {
      currency: 'Evidence',
      secondaryCurrency: 'Cash',
      friction: 'Corruption',
      penalty: 'Suspicion',
      recoveryRate: 0.2,
      isTransactional: true
    },
    style: 'Hard-boiled, cynical',
    lodge: 'The case is closed, but the cost was the only thing the protagonist had left to lose.',
    pillars: [
      "The rain never washes away the filth of this city.",
      "Justice is a commodity, and I'm broke.",
      "The dame walked in with trouble written in her eyes."
    ],
    spark: "The office smelled of stale smoke and cheap bourbon. When she walked in, I knew my quiet night was over."
  }
];
