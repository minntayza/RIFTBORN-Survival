import type Phaser from 'phaser';

export const PYUSAWHTI_RIG_ASSETS = {
	body: { key: 'pyusawhti-body-v2', url: '/assets/characters/pyusawhti-body-v2.png' },
	legLeft: { key: 'pyusawhti-leg-left-v2', url: '/assets/characters/pyusawhti-leg-left-v2.png' },
	legRight: { key: 'pyusawhti-leg-right-v2', url: '/assets/characters/pyusawhti-leg-right-v2.png' },
	portrait: { key: 'pyusawhti-portrait-v2', url: '/assets/characters/pyusawhti-portrait-v2.png' }
} as const;

export type PyusawhtiPart = 'legs' | 'body';

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

	const breathe = Math.sin(time * 3) * 1.0;
	const walkPhase = time * 12;
	const walkBob = moving ? Math.abs(Math.sin(walkPhase)) * 1.5 : 0;
	const legSwingL = moving ? Math.sin(walkPhase) * 0.35 : 0;
	const legSwingR = moving ? Math.sin(walkPhase + Math.PI) * 0.35 : 0;

	const bodyImg = getImage(PYUSAWHTI_RIG_ASSETS.body.url);
	const legLImg = getImage(PYUSAWHTI_RIG_ASSETS.legLeft.url);
	const legRImg = getImage(PYUSAWHTI_RIG_ASSETS.legRight.url);

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

	// 2. Upper Body with Arms & Bow (Dynamic recoil on shot)
	const progress = attack > 0 ? Math.min(1, attack) : 0;
	const drawDist = attack > 0 ? (progress < 0.68 ? -5 * (progress / 0.68) : 3 * Math.sin((progress - 0.68) / 0.32 * Math.PI)) : 0;
	const drawX = Math.cos(aim) * drawDist;
	const drawY = Math.sin(aim) * drawDist;

	if (bodyImg?.complete && bodyImg.naturalWidth) {
		g.save();
		g.translate(drawX, -6 + breathe - walkBob + drawY);
		g.drawImage(bodyImg, -28, -26, 56, 52);
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
	private arrowFx: Phaser.GameObjects.Graphics;

	constructor(private scene: Phaser.Scene) {
		const ensure = (key: string, url: string) => {
			if (!scene.textures.exists(key)) {
				scene.textures.addBase64(key, url);
			}
		};
		ensure(PYUSAWHTI_RIG_ASSETS.body.key, PYUSAWHTI_RIG_ASSETS.body.url);
		ensure(PYUSAWHTI_RIG_ASSETS.legLeft.key, PYUSAWHTI_RIG_ASSETS.legLeft.url);
		ensure(PYUSAWHTI_RIG_ASSETS.legRight.key, PYUSAWHTI_RIG_ASSETS.legRight.url);

		this.legLeftSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.legLeft.key).setOrigin(0.5, 0.12);
		this.legRightSprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.legRight.key).setOrigin(0.5, 0.12);
		this.bodySprite = scene.add.image(0, 0, PYUSAWHTI_RIG_ASSETS.body.key).setOrigin(0.5, 0.46);
		this.arrowFx = scene.add.graphics().setDepth(3.3);
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

		// 2. Dynamic Bow Draw & Shot Recoil
		const progress = duration > 0 ? Math.max(0, Math.min(1, 1 - (attack / duration))) : 0;
		let drawDist = 0;
		if (attack > 0) {
			if (progress < 0.65) {
				// Bow draw back
				drawDist = -5 * (progress / 0.65);
			} else {
				// Arrow release kick
				const t = (progress - 0.65) / 0.35;
				drawDist = 3 * Math.sin(t * Math.PI);
			}
		}

		const drawX = Math.cos(aim) * drawDist;
		const drawY = Math.sin(aim) * drawDist;

		// 3. Crisp Upper Body with Circlet, Quiver, Sash, Torso & Sacred Bow
		this.bodySprite
			.setPosition(x + drawX, y - 6 + breathe - walkBob + drawY)
			.setScale(scale, scale)
			.setFlipX(flip)
			.setDepth(3.2)
			.setVisible(true);

		// 4. Solar Arrow VFX on Attack
		this.arrowFx.clear();
		if (attack > 0) {
			const bowTipX = x + drawX + Math.cos(aim) * 20;
			const bowTipY = y + drawY + Math.sin(aim) * 20;

			if (progress < 0.65) {
				// Gathering golden solar energy
				const charge = progress / 0.65;
				this.arrowFx.fillStyle(0xffd54f, charge * 0.9);
				this.arrowFx.fillCircle(bowTipX, bowTipY, 2.5 * charge);
				this.arrowFx.lineStyle(1.5, 0xffeb3b, charge * 0.7);
				this.arrowFx.strokeCircle(bowTipX, bowTipY, 4.5 * charge);
			} else {
				// Loose blazing arrow beam
				const intensity = Math.sin((progress - 0.65) / 0.35 * Math.PI);
				this.arrowFx.lineStyle(2.5, 0xffd54f, intensity * 0.95);
				this.arrowFx.lineBetween(
					bowTipX,
					bowTipY,
					bowTipX + Math.cos(aim) * 28,
					bowTipY + Math.sin(aim) * 28
				);
				this.arrowFx.lineStyle(1.2, 0xffffff, intensity);
				this.arrowFx.lineBetween(
					bowTipX + Math.cos(aim) * 8,
					bowTipY + Math.sin(aim) * 8,
					bowTipX + Math.cos(aim) * 30,
					bowTipY + Math.sin(aim) * 30
				);
				this.arrowFx.fillStyle(0xfff59d, intensity);
				this.arrowFx.fillCircle(bowTipX + Math.cos(aim) * 28, bowTipY + Math.sin(aim) * 28, 2.8);
			}
		}
	}

	clear() {
		this.bodySprite.setVisible(false);
		this.legLeftSprite.setVisible(false);
		this.legRightSprite.setVisible(false);
		this.arrowFx.clear();
	}

	campLayer(offset: number) {
		this.legLeftSprite.setDepth(3.1 + offset);
		this.legRightSprite.setDepth(3.11 + offset);
		this.bodySprite.setDepth(3.2 + offset);
		this.arrowFx.setDepth(3.3 + offset);
	}
}
