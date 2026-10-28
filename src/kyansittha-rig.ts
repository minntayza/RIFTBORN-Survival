import type Phaser from 'phaser';

export const KYANSITTHA_RIG_ASSETS = {
	body: { key: 'kyansittha-body-v2', url: '/assets/characters/kyansittha-body-v2.png' },
	legLeft: { key: 'kyansittha-leg-left-v2', url: '/assets/characters/kyansittha-leg-left-v2.png' },
	legRight: { key: 'kyansittha-leg-right-v2', url: '/assets/characters/kyansittha-leg-right-v2.png' },
	armLeft: { key: 'kyansittha-arm-left-v2', url: '/assets/characters/kyansittha-arm-left-v2.png' },
	armRight: { key: 'kyansittha-arm-right-v2', url: '/assets/characters/kyansittha-arm-right-v2.png' },
	spear: { key: 'kyansittha-spear-v2', url: '/assets/characters/kyansittha-spear-v2.png' }
} as const;

export type KyansitthaPart = 'legs' | 'body' | 'spear' | 'spearThrust';

const cachedImages = new Map<string, HTMLImageElement>();
function getImage(url: string): HTMLImageElement | undefined {
	if (typeof Image === 'undefined') return undefined;
	let img = cachedImages.get(url);
	if (!img) {
		img = new Image();
		img.src = url;
		cachedImages.set(url, img);
	}
	return img;
}

export function drawKyansittha(
	g: CanvasRenderingContext2D,
	time = 0,
	moving = false,
	attack = 0,
	aim = 0,
	flip = false
) {
	g.save();
	g.imageSmoothingEnabled = true;
	g.imageSmoothingQuality = 'high';
	if (flip) {
		g.scale(-1, 1);
	}

	const breathe = Math.sin(time * 3) * 1.5;
	const walkPhase = time * 12;
	const walkBob = moving ? Math.abs(Math.sin(walkPhase)) * 2 : 0;
	const legSwingL = moving ? Math.sin(walkPhase) * 0.35 : 0;
	const legSwingR = moving ? Math.sin(walkPhase + Math.PI) * 0.35 : 0;

	const bodyImg = getImage(KYANSITTHA_RIG_ASSETS.body.url);
	const legLImg = getImage(KYANSITTHA_RIG_ASSETS.legLeft.url);
	const legRImg = getImage(KYANSITTHA_RIG_ASSETS.legRight.url);
	const armLImg = getImage(KYANSITTHA_RIG_ASSETS.armLeft.url);
	const armRImg = getImage(KYANSITTHA_RIG_ASSETS.armRight.url);
	const spearImg = getImage(KYANSITTHA_RIG_ASSETS.spear.url);

	// 1. Legs
	if (legLImg?.complete && legLImg.naturalWidth) {
		g.save();
		g.translate(-14, 18 - walkBob);
		g.rotate(legSwingL);
		g.drawImage(legLImg, -14, 0, 28, 48);
		g.restore();
	}
	if (legRImg?.complete && legRImg.naturalWidth) {
		g.save();
		g.translate(14, 18 - walkBob);
		g.rotate(legSwingR);
		g.drawImage(legRImg, -14, 0, 28, 48);
		g.restore();
	}

	// 2. Fixed Body (Cape + Torso + Skirt + Head)
	if (bodyImg?.complete && bodyImg.naturalWidth) {
		g.drawImage(bodyImg, -46, -60 + breathe - walkBob, 92, 102);
	}

	// 3. Arms & Spear
	const progress = attack > 0 ? Math.min(1, attack) : 0;
	const thrust = attack > 0 ? Math.sin(progress * Math.PI) * 26 : 0;

	if (armLImg?.complete && armLImg.naturalWidth) {
		g.save();
		g.translate(-26, -10 + breathe);
		g.rotate(0.2 - thrust * 0.01);
		g.drawImage(armLImg, -10, 0, 24, 46);
		g.restore();
	}

	if (spearImg?.complete && spearImg.naturalWidth) {
		g.save();
		g.translate(22 + Math.cos(aim) * thrust, -4 + breathe + Math.sin(aim) * thrust);
		g.rotate(aim);
		g.drawImage(spearImg, -20, -18, 120, 36);
		g.restore();
	}

	if (armRImg?.complete && armRImg.naturalWidth) {
		g.save();
		g.translate(22 + Math.cos(aim) * (thrust * 0.5), -8 + breathe + Math.sin(aim) * (thrust * 0.5));
		g.rotate(aim * 0.4);
		g.drawImage(armRImg, -10, 0, 24, 46);
		g.restore();
	}

	g.restore();
}

export function createKyansitthaCanvas(part: KyansitthaPart, attack = 0): HTMLCanvasElement {
	const c = document.createElement('canvas');
	c.width = 128;
	c.height = 128;
	const g = c.getContext('2d')!;
	drawKyansittha(g, 0, false, attack, 0, false);
	return c;
}

export class KyansitthaRig {
	private bodySprite: Phaser.GameObjects.Image;
	private legLeftSprite: Phaser.GameObjects.Image;
	private legRightSprite: Phaser.GameObjects.Image;
	private armLeftSprite: Phaser.GameObjects.Image;
	private armRightSprite: Phaser.GameObjects.Image;
	private spearSprite: Phaser.GameObjects.Image;

	constructor(private scene: Phaser.Scene) {
		// Verify and ensure textures exist
		const ensure = (key: string, url: string) => {
			if (!scene.textures.exists(key)) {
				scene.textures.addBase64(key, url);
			}
		};
		ensure(KYANSITTHA_RIG_ASSETS.body.key, KYANSITTHA_RIG_ASSETS.body.url);
		ensure(KYANSITTHA_RIG_ASSETS.legLeft.key, KYANSITTHA_RIG_ASSETS.legLeft.url);
		ensure(KYANSITTHA_RIG_ASSETS.legRight.key, KYANSITTHA_RIG_ASSETS.legRight.url);
		ensure(KYANSITTHA_RIG_ASSETS.armLeft.key, KYANSITTHA_RIG_ASSETS.armLeft.url);
		ensure(KYANSITTHA_RIG_ASSETS.armRight.key, KYANSITTHA_RIG_ASSETS.armRight.url);
		ensure(KYANSITTHA_RIG_ASSETS.spear.key, KYANSITTHA_RIG_ASSETS.spear.url);

		this.legLeftSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.legLeft.key).setOrigin(0.5, 0.1);
		this.legRightSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.legRight.key).setOrigin(0.5, 0.1);
		this.bodySprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.body.key).setOrigin(0.5, 0.5);
		this.armLeftSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.armLeft.key).setOrigin(0.5, 0.15);
		this.spearSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.spear.key).setOrigin(0.18, 0.5);
		this.armRightSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.armRight.key).setOrigin(0.5, 0.15);
	}

	render(
		x: number,
		y: number,
		aim: number,
		time: number,
		moving: boolean,
		attack: number,
		_sequence: number,
		duration = 0.38
	) {
		const flip = Math.cos(aim) < 0;
		const breathe = Math.sin(time * 3) * 1.5;
		const walkPhase = time * 12;
		const walkBob = moving ? Math.abs(Math.sin(walkPhase)) * 2 : 0;
		const scale = 0.22;

		// 1. Moving Legs - Walk swing cycle
		const legSwingL = moving ? Math.sin(walkPhase) * 0.35 : 0;
		const legSwingR = moving ? Math.sin(walkPhase + Math.PI) * 0.35 : 0;
		const hipOffsetY = 16 - walkBob;
		const hipSpread = 12 * (flip ? -1 : 1);

		this.legLeftSprite
			.setPosition(x - hipSpread, y + hipOffsetY)
			.setScale(scale, scale)
			.setRotation(legSwingL * (flip ? -1 : 1))
			.setFlipX(flip)
			.setDepth(3.1)
			.setVisible(true);

		this.legRightSprite
			.setPosition(x + hipSpread, y + hipOffsetY)
			.setScale(scale, scale)
			.setRotation(legSwingR * (flip ? -1 : 1))
			.setFlipX(flip)
			.setDepth(3.11)
			.setVisible(true);

		// 2. Fixed Body (Head + Crown + Cape + Torso + Skirt)
		this.bodySprite
			.setPosition(x, y - 6 + breathe - walkBob)
			.setScale(scale, scale)
			.setFlipX(flip)
			.setDepth(3.15)
			.setVisible(true);

		// 3. Moving Arms & Spear with Dynamic Thrust
		const progress = duration > 0 ? Math.max(0, Math.min(1, 1 - (attack / duration))) : 0;
		let spearThrust = 0;
		if (attack > 0) {
			if (progress < 0.22) {
				// Windup chamber
				spearThrust = -12 * (progress / 0.22);
			} else if (progress < 0.62) {
				// Explosive thrust!
				const t = (progress - 0.22) / 0.4;
				spearThrust = -12 + 56 * Math.sin(t * Math.PI * 0.5);
			} else {
				// Recovery
				const t = (progress - 0.62) / 0.38;
				spearThrust = 44 * (1 - t);
			}
		}

		// Left Arm (off-hand guard)
		const armLSpread = (flip ? 22 : -22);
		this.armLeftSprite
			.setPosition(x + armLSpread, y - 10 + breathe - walkBob)
			.setScale(scale, scale)
			.setRotation(flip ? -0.2 : 0.2)
			.setFlipX(flip)
			.setDepth(3.18)
			.setVisible(true);

		// Spear thrust vector
		const thrustX = Math.cos(aim) * spearThrust;
		const thrustY = Math.sin(aim) * spearThrust;
		const spearGripX = x + (flip ? -14 : 14) + thrustX;
		const spearGripY = y - 4 + breathe - walkBob + thrustY;

		// Spear (aimed towards cursor)
		this.spearSprite
			.setPosition(spearGripX, spearGripY)
			.setScale(scale * 1.05, scale * 1.05)
			.setRotation(aim)
			.setFlipY(flip)
			.setDepth(3.22)
			.setVisible(true);

		// Right Arm (main hand following the spear)
		this.armRightSprite
			.setPosition(x + (flip ? -18 : 18) + thrustX * 0.45, y - 10 + breathe - walkBob + thrustY * 0.45)
			.setScale(scale, scale)
			.setRotation(aim * 0.4)
			.setFlipX(flip)
			.setDepth(3.24)
			.setVisible(true);
	}

	clear() {
		this.bodySprite.setVisible(false);
		this.legLeftSprite.setVisible(false);
		this.legRightSprite.setVisible(false);
		this.armLeftSprite.setVisible(false);
		this.armRightSprite.setVisible(false);
		this.spearSprite.setVisible(false);
	}

	campLayer(offset: number) {
		this.legLeftSprite.setDepth(3.1 + offset);
		this.legRightSprite.setDepth(3.11 + offset);
		this.bodySprite.setDepth(3.15 + offset);
		this.armLeftSprite.setDepth(3.18 + offset);
		this.spearSprite.setDepth(3.22 + offset);
		this.armRightSprite.setDepth(3.24 + offset);
	}
}
