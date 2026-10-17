type RobotRecord = {
  name: string;
  art: string;
  role: string;
  description: string;
};

const ROBOTS: RobotRecord[] = [
  { name: 'Iron Commander', art: 'iron-commander', role: 'COMMAND UNIT', description: 'A plated field officer coordinates nearby machines through its beacon. Disrupt its signal before the formation locks onto you.' },
  { name: 'Rogue Trooper', art: 'rogue-trooper', role: 'RANGED UNIT', description: 'An abandoned infantry frame still follows its last firing order. Its steady aim makes open ground a dangerous place to linger.' },
  { name: 'Scrap Bot', art: 'scrap-bot', role: 'SCAVENGER UNIT', description: 'Built from mismatched parts, this little salvage machine slips through wreckage to reach anything left unguarded.' },
  { name: 'Cyber Scout', art: 'cyber-scout', role: 'RECON UNIT', description: 'A lightweight sensor rig maps movement ahead of the pack. Its quick passes make it hard to pin down.' },
  { name: 'Chem-Spitter', art: 'chem-spitter', role: 'HAZARD UNIT', description: 'A leaking reagent tank sprays corrosive fluid across the route. Watch the ground and keep moving when its valves flare.' },
  { name: 'Steel Enforcer', art: 'steel-enforcer', role: 'ARMOURED UNIT', description: 'Reinforced plating turns aside glancing hits while its heavy frame steadily closes the gap.' },
  { name: 'Giga-Mech', art: 'giga-mech', role: 'HEAVY UNIT', description: 'An industrial assault platform built to clear barricades. Its weighty wind-ups leave a brief opening to evade.' },
  { name: 'Mech-Hunter', art: 'mech-hunter', role: 'PURSUIT UNIT', description: 'A gold-plated interceptor tracks its target with crackling sensors, then lunges in a fast, punishing burst.' },
  { name: 'Warlord Kaiser', art: 'warlord-kaiser', role: 'ELITE COMMAND', description: 'This decorated war machine carries an energized blade and never yields the front line. Draw out its strike, then counter.' },
  { name: 'Bio-Titan', art: 'bio-titan', role: 'BIO-ENGINEERED', description: 'A walking reactor wrapped in living armor. Its pulsing core powers the growths along its limbs—keep your distance when it glows.' },
  { name: 'Toxic Alchemist', art: 'toxic-alchemist', role: 'SUPPORT UNIT', description: 'A sealed field chemist turns unstable compounds into battlefield hazards. The green canisters reveal when it is preparing a throw.' },
  { name: 'Void Drone', art: 'void-drone', role: 'VOID UNIT', description: 'A silent aerial hunter phases through the smoke and marks targets with a violet beam. Break line of sight when its eye begins to charge.' },
];

export function robotGuide() {
  return `<div class="robot-bestiary">${ROBOTS.map((robot, index) => `<article class="robot-card robot-card-${index + 1}"><div class="robot-art"><img src="/assets/robot-guide/${robot.art}.webp" alt="${robot.name}" loading="lazy"></div><small>UNIT / ${robot.role}</small><h3>${robot.name}</h3><p>${robot.description}</p></article>`).join('')}</div>`;
}
