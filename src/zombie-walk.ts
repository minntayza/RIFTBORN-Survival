import type {EnemyId} from './config';
export const WALK_FRAMES=24;
export const WALK_PROFILES={
 basic:{stride:1.7,arms:5,feet:7,drag:.45,turn:5},
 runner:{stride:3.8,arms:7,feet:10,drag:0,turn:9},
 spitter:{stride:1.4,arms:2,feet:5,drag:.3,turn:4},
 armoured:{stride:1.3,arms:2,feet:5,drag:0,turn:3.5},
 brute:{stride:1.6,arms:3,feet:6,drag:.2,turn:3},
 elite:{stride:1.8,arms:3.5,feet:7,drag:0,turn:5},
 rifle:{stride:1.4,arms:0,feet:5,drag:0,turn:5},
 commander:{stride:1.6,arms:2,feet:6,drag:0,turn:4},
 boss:{stride:1.5,arms:2.5,feet:6,drag:.35,turn:3}
} satisfies Partial<Record<EnemyId,{stride:number;arms:number;feet:number;drag:number;turn:number}>>;
export type WalkingZombie=keyof typeof WALK_PROFILES;
