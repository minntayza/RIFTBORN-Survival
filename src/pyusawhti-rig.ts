import type Phaser from 'phaser';

export const PYUSAWHTI_RIG_ASSETS = {
	body: { key: 'pyusawhti-body-v2', url: '/assets/characters/pyusawhti-body-v2.png' },
	legLeft: { key: 'pyusawhti-leg-left-v2', url: '/assets/characters/pyusawhti-leg-left-v2.png' },
	legRight: { key: 'pyusawhti-leg-right-v2', url: '/assets/characters/pyusawhti-leg-right-v2.png' },
	armLeft: { key: 'pyusawhti-arm-left-v2', url: '/assets/characters/pyusawhti-arm-left-v2.png' },
	armRight: { key: 'pyusawhti-arm-right-v2', url: '/assets/characters/pyusawhti-arm-right-v2.png' },
	bow: { key: 'pyusawhti-bow-v2', url: '/assets/characters/pyusawhti-bow-v2.png' }
} as const;

export type PyusawhtiPart = 'legs' | 'body' | 'bow' | 'bowIdle' | 'bowDraw' | 'bowRelease';

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

export function drawPyusawhti(
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

	const bodyImg = getImage(PYUSAWHTI_RIG_ASSETS.body.url);
	const legLImg = getImage(PYUSAWHTI_RIG_ASSETS.legLeft.url);
	const legRImg = getImage(PYUSAWHTI_RIG_ASSETS.legRight.url);
	const armLImg = getImage(PYUSAWHTI_RIG_ASSETS.armLeft.url);
	const armRImg = getImage(PYUSAWHTI_RIG_ASSETS.armRight.url);
	const bowImg = getImage(PYUSAWHTI_RIG_ASSETS.bow.url);

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

	// 2. Fixed Body (Head + Crown + Quiver + Torso + Skirt)
	if (bodyImg?.complete && bodyImg.naturalWidth) {
		g.drawImage(bodyImg, -46, -60 + breathe - walkBob, 92, 102);
	}

	// 3. Arms & Bow
	if (armRImg?.complete && armRImg.naturalWidth) {
		g.save();
		g.translate(18, -6 + breathe);
		g.rotate(aim * 0.3);
		g.drawImage(armRImg, -8, 0, 22, 42);
		g.restore();
	}

	if (bowImg?.complete && bowImg.naturalWidth) {
		g.save();
		g.translate(26 + Math.cos(aim) * 8, breathe + Math.sin(aim) * 8);
		g.rotate(aim);
		g.drawImage(bowImg, -15, -45, 30, 90);
		g.restore();
	}

	if (armLImg?.complete && armLImg.naturalWidth) {
		g.save();
		g.translate(-18, -6 + breathe);
		g.rotate(aim * 0.4);
		g.drawImage(armLImg, -8, 0, 22, 42);
		g.restore();
	}

	g.restore();
}

export function createPyusawhtiCanvas(part: PyusawhtiPart, attack = 0, aim = 0): HTMLCanvasElement {
	const c = document.createElement('canvas');
	c.width = 128;
	c.height = 128;
	const g = c.getContext('2d')!;
	drawPyusawhti(g, 0, false, attack, aim, false);
	return c;
}

export class PyusawhtiRig {
	private bodySprite: Phaser.GameObjects.Image;
	private legLeftSprite: Phaser.GameObjects.Image;
	private legRightSprite: Phaser.GameObjects.Image;
	private armLeftSprite: Phaser.GameObjects.Image;
	private armRightSprite: Phaser.GameObjects.Image;
	private bowSprite: Phaser.GameObjects.Image;

	constructor(private scene: Phaser.Scene) {
		const ensure = (key: string, url: string) => {
			if (!scene.textures.exists(key)) {
				scene.textures.addBase64(key, url);
			}
		};
		ensure(PYUSAWHTI_RIG_ASSETS.body.key, PYUSAWHTI_RIG_ASSETS.body.url);
		ensure(PYUSAWHTI_RIG_ASSETS.legLeft.key, PYUSAWHTI_RIG_ASSETS.legLeft.url);
		ensure(PYUSAWHTI_RIG_ASSETS.legRight.key, PYUSAWHTI_RIG_ASSETS.legRight.url);
		ensure(PYUSAWHTI_RIG_ASSETS.armLeft.key, PYUSAWHTI_RIG_ASSETS.armLeft.url);
		ensure(PYUSAWHTI_RIG_ASSETS.armRight.key, PYUSAWHTI_RIG_ASSETS.armRight.url);
		ensure(PYUSAWHTI_RIG_ASSETS.bow.key, PYUSAWHTI_RIG_ASSETS.bow.url);

		this.legLeftSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.legLeft.key).setOrigin(0.5, 0.1);
		this.legRightSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.legRight.key).setOrigin(0.5, 0.1);
		this.bodySprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.body.key).setOrigin(0.5, 0.5);
		this.armLeftSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.armLeft.key).setOrigin(0.5, 0.15);
		this.bowSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.bow.key).setOrigin(0.2, 0.5);
		this.armRightSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.armRight.key).setOrigin(0.5, 0.15);
	}

	render(
		x: number,
		y: number,
		aim: number,
		time: number,
		moving: boolean,
		attack: number,
		_sequence: number,
		duration = 0.28
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
		const hipSpread = 11 * (flip ? -1 : 1);

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

		// 2. Fixed Body (Head + Crown + Quiver + Torso + Skirt)
		this.bodySprite
			.setPosition(x, y - 6 + breathe - walkBob)
			.setScale(scale, scale)
			.setFlipX(flip)
			.setDepth(3.15)
			.setVisible(true);

		// 3. Moving Arms & Bow with Dynamic Draw / Release
		const progress = duration > 0 ? Math.max(0, Math.min(1, 1 - (attack / duration))) : 0;
		let drawDist = 0;
		if (attack > 0) {
			if (progress < 0.68) {
				// String draw
				drawDist = -14 * (progress / 0.68);
			} else {
				// Arrow release
				const t = (progress - 0.68) / 0.32;
				drawDist = 8 * Math.sin(t * Math.PI);
			}
		}

		// Bow extended towards target
		const bowX = x + (flip ? -18 : 18) + Math.cos(aim) * 12;
		const bowY = y - 4 + breathe - walkBob + Math.sin(aim) * 12;

		this.bowSprite
			.setPosition(bowX, bowY)
			.setScale(scale * 1.1, scale * 1.1)
			.setRotation(aim)
			.setFlipY(flip)
			.setDepth(3.22)
			.setVisible(true);

		// Left Arm (holding bow)
		this.armLeftSprite
			.setPosition(x + (flip ? -14 : 14), y - 8 + breathe - walkBob)
			.setScale(scale, scale)
			.setRotation(aim * 0.45)
			.setFlipX(flip)
			.setDepth(3.2)
			.setVisible(true);

		// Right Arm (drawing string)
		const drawX = Math.cos(aim) * drawDist;
		const drawY = Math.sin(aim) * drawDist;

		this.armRightSprite
			.setPosition(x + (flip ? 16 : -16) + drawX, y - 8 + breathe - walkBob + drawY)
			.setScale(scale, scale)
			.setRotation(aim * 0.25)
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
		this.bowSprite.setVisible(false);
	}

	campLayer(offset: number) {
		this.legLeftSprite.setDepth(3.1 + offset);
		this.legRightSprite.setDepth(3.11 + offset);
		this.bodySprite.setDepth(3.15 + offset);
		this.armLeftSprite.setDepth(3.2 + offset);
		this.bowSprite.setDepth(3.22 + offset);
		this.armRightSprite.setDepth(3.24 + offset);
	}
}
