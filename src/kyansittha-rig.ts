import type Phaser from 'phaser';

export const KYANSITTHA_RIG_ASSETS = {
	body: { key: 'kyansittha-body-v2', url: '/assets/characters/kyansittha-body-v2.png' },
	legLeft: { key: 'kyansittha-leg-left-v2', url: '/assets/characters/kyansittha-leg-left-v2.png' },
	legRight: { key: 'kyansittha-leg-right-v2', url: '/assets/characters/kyansittha-leg-right-v2.png' },
	portrait: { key: 'kyansittha-portrait-v2', url: '/assets/characters/kyansittha-portrait-v2.png' }
} as const;

export type KyansitthaPart = 'legs' | 'body';

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

	const breathe = Math.sin(time * 3) * 1.0;
	const walkPhase = time * 12;
	const walkBob = moving ? Math.abs(Math.sin(walkPhase)) * 1.5 : 0;
	const legSwingL = moving ? Math.sin(walkPhase) * 0.35 : 0;
	const legSwingR = moving ? Math.sin(walkPhase + Math.PI) * 0.35 : 0;

	const bodyImg = getImage(KYANSITTHA_RIG_ASSETS.body.url);
	const legLImg = getImage(KYANSITTHA_RIG_ASSETS.legLeft.url);
	const legRImg = getImage(KYANSITTHA_RIG_ASSETS.legRight.url);

	// 1. Moving Legs
	if (legLImg?.complete && legLImg.naturalWidth) {
		g.save();
		g.translate(-6, 8 - walkBob);
		g.rotate(legSwingL);
		g.drawImage(legLImg, -7, 0, 15, 27);
		g.restore();
	}
	if (legRImg?.complete && legRImg.naturalWidth) {
		g.save();
		g.translate(6, 8 - walkBob);
		g.rotate(legSwingR);
		g.drawImage(legRImg, -7, 0, 15, 27);
		g.restore();
	}

	// 2. Upper Body with Arms & Spear (Dynamic thrust lunge on attack)
	const progress = attack > 0 ? Math.min(1, attack) : 0;
	const thrust = attack > 0 ? Math.sin(progress * Math.PI) * 16 : 0;
	const thrustX = Math.cos(aim) * thrust;
	const thrustY = Math.sin(aim) * thrust;

	if (bodyImg?.complete && bodyImg.naturalWidth) {
		g.save();
		g.translate(thrustX, -6 + breathe - walkBob + thrustY);
		g.drawImage(bodyImg, -24, -30, 48, 55);
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
	private spearFx: Phaser.GameObjects.Graphics;

	constructor(private scene: Phaser.Scene) {
		const ensure = (key: string, url: string) => {
			if (!scene.textures.exists(key)) {
				scene.textures.addBase64(key, url);
			}
		};
		ensure(KYANSITTHA_RIG_ASSETS.body.key, KYANSITTHA_RIG_ASSETS.body.url);
		ensure(KYANSITTHA_RIG_ASSETS.legLeft.key, KYANSITTHA_RIG_ASSETS.legLeft.url);
		ensure(KYANSITTHA_RIG_ASSETS.legRight.key, KYANSITTHA_RIG_ASSETS.legRight.url);

		this.legLeftSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.legLeft.key).setOrigin(0.5, 0.12);
		this.legRightSprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.legRight.key).setOrigin(0.5, 0.12);
		this.bodySprite = scene.add.image(0, 0, KYANSITTHA_RIG_ASSETS.body.key).setOrigin(0.5, 0.46);
		this.spearFx = scene.add.graphics().setDepth(3.3);
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
		const breathe = Math.sin(time * 3) * 0.9;
		const walkPhase = time * 12;
		const walkBob = moving ? Math.abs(Math.sin(walkPhase)) * 1.5 : 0;
		// Standardized scale matching 78px hero height
		const scale = 0.068;

		// 1. Moving Legs - Walk swing cycle
		const legSwingL = moving ? Math.sin(walkPhase) * 0.35 : 0;
		const legSwingR = moving ? Math.sin(walkPhase + Math.PI) * 0.35 : 0;
		const hipOffsetY = 10 - walkBob;
		const hipSpread = 4.5 * (flip ? -1 : 1);

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

		// 2. Dynamic Spear Thrust & Attack Lunge
		const progress = duration > 0 ? Math.max(0, Math.min(1, 1 - (attack / duration))) : 0;
		let thrust = 0;
		if (attack > 0) {
			if (progress < 0.22) {
				// Windup
				thrust = -4 * (progress / 0.22);
			} else if (progress < 0.65) {
				// Explosive lunge thrust
				const t = (progress - 0.22) / 0.43;
				thrust = -4 + 20 * Math.sin(t * Math.PI * 0.5);
			} else {
				// Recovery
				const t = (progress - 0.65) / 0.35;
				thrust = 16 * (1 - t);
			}
		}

		const thrustX = Math.cos(aim) * thrust;
		const thrustY = Math.sin(aim) * thrust;

		// 3. Crisp Upper Body with Crown, Cape, Armor & Arindama Spear
		this.bodySprite
			.setPosition(x + thrustX, y - 6 + breathe - walkBob + thrustY)
			.setScale(scale, scale)
			.setFlipX(flip)
			.setDepth(3.2)
			.setVisible(true);

		// 4. Spear Thrust Energy VFX
		this.spearFx.clear();
		if (attack > 0 && progress >= 0.22 && progress <= 0.75) {
			const spearTipX = x + thrustX + Math.cos(aim) * 32;
			const spearTipY = y + thrustY + Math.sin(aim) * 32;
			const intensity = Math.sin((progress - 0.22) / 0.53 * Math.PI);

			this.spearFx.lineStyle(3, 0xffd54f, intensity * 0.9);
			this.spearFx.lineBetween(
				spearTipX - Math.cos(aim) * 16,
				spearTipY - Math.sin(aim) * 16,
				spearTipX + Math.cos(aim) * 18,
				spearTipY + Math.sin(aim) * 18
			);

			this.spearFx.lineStyle(1.5, 0x00e5ff, intensity);
			this.spearFx.lineBetween(
				spearTipX - Math.cos(aim) * 10,
				spearTipY - Math.sin(aim) * 10,
				spearTipX + Math.cos(aim) * 22,
				spearTipY + Math.sin(aim) * 22
			);

			this.spearFx.fillStyle(0xffffff, intensity);
			this.spearFx.fillCircle(spearTipX + Math.cos(aim) * 20, spearTipY + Math.sin(aim) * 20, 3.5);
		}
	}

	clear() {
		this.bodySprite.setVisible(false);
		this.legLeftSprite.setVisible(false);
		this.legRightSprite.setVisible(false);
		this.spearFx.clear();
	}

	campLayer(offset: number) {
		this.legLeftSprite.setDepth(3.1 + offset);
		this.legRightSprite.setDepth(3.11 + offset);
		this.bodySprite.setDepth(3.2 + offset);
		this.spearFx.setDepth(3.3 + offset);
	}
}
