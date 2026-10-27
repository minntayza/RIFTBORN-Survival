import type Phaser from 'phaser';

export type PyusawhtiPart = 'legs' | 'body' | 'bow' | 'bowIdle' | 'bowDraw' | 'bowRelease';

export function createPyusawhtiCanvas(part: PyusawhtiPart, attack = 0, aim = 0): HTMLCanvasElement {
	const c = document.createElement('canvas');
	c.width = 128;
	c.height = 128;
	const g = c.getContext('2d')!;
	g.imageSmoothingEnabled = true;
	g.imageSmoothingQuality = 'high';

	if (part === 'legs') {
		// Walking legs in royal crimson & gold longyi
		g.fillStyle = '#996515';
		g.strokeStyle = '#080e19';
		g.lineWidth = 2.5;
		g.beginPath();
		g.roundRect(46, 75, 14, 38, 5);
		g.fill();
		g.stroke();
		g.beginPath();
		g.roundRect(68, 75, 14, 38, 5);
		g.fill();
		g.stroke();

		// Realistic Gold embroidery / silk brocade patterns
		g.strokeStyle = '#ffd700';
		g.lineWidth = 2;
		g.strokeRect(48, 88, 10, 12);
		g.strokeRect(70, 88, 10, 12);
		g.fillStyle = '#d4af37';
		g.fillRect(50, 91, 6, 6);
		g.fillRect(72, 91, 6, 6);

		// Royal Myanmar sandals (ရွှေခြေနင်း)
		g.fillStyle = '#1b2838';
		g.fillRect(43, 110, 20, 8);
		g.fillRect(65, 110, 20, 8);
		g.fillStyle = '#ffd700';
		g.fillRect(49, 110, 6, 3);
		g.fillRect(71, 110, 6, 3);
	} else if (part === 'body') {
		// Realistic ground contact shadow
		g.fillStyle = 'rgba(5, 10, 19, 0.4)';
		g.beginPath();
		g.ellipse(64, 118, 38, 7, 0, 0, Math.PI * 2);
		g.fill();

		// Quiver on back with fletched arrows (ကျည်တောက်)
		g.save();
		g.translate(76, 42);
		g.rotate(-0.35);

		// Quiver leather body
		const quiverGrad = g.createLinearGradient(-8, -25, 8, 20);
		quiverGrad.addColorStop(0, '#8d5b2d');
		quiverGrad.addColorStop(1, '#4e3012');
		g.fillStyle = quiverGrad;
		g.strokeStyle = '#080e19';
		g.lineWidth = 2.5;
		g.fillRect(-8, -26, 16, 46);
		g.strokeRect(-8, -26, 16, 46);

		// Gold filigree bands & dragon rivets
		g.fillStyle = '#ffd700';
		g.strokeStyle = '#996515';
		g.lineWidth = 1;
		g.fillRect(-9, -19, 18, 6);
		g.strokeRect(-9, -19, 18, 6);
		g.fillRect(-9, 4, 18, 6);
		g.strokeRect(-9, 4, 18, 6);
		g.restore();

		// Realistic Arrow shafts & fletching protruding from quiver
		g.save();
		g.translate(76, 42);
		g.rotate(-0.35);
		for (let i = -1; i <= 1; i++) {
			const offX = i * 4;
			const shaftH = 14 + Math.abs(i) * 3;
			// Bamboo shaft
			g.fillStyle = '#d7ccc8';
			g.fillRect(offX - 1, -26 - shaftH, 2.5, shaftH);
			// Scarlet and gold peacock fletching
			g.fillStyle = '#d32f2f';
			g.beginPath();
			g.moveTo(offX, -26 - shaftH);
			g.lineTo(offX - 3, -26 - shaftH - 7);
			g.lineTo(offX, -26 - shaftH - 5);
			g.lineTo(offX + 3, -26 - shaftH - 7);
			g.closePath();
			g.fill();
			g.fillStyle = '#ffd700';
			g.fillRect(offX - 1, -26 - shaftH - 4, 2, 2);
		}
		g.restore();

		// Royal longyi skirt with ornate gold pleats
		g.fillStyle = '#b8860b';
		g.strokeStyle = '#080e19';
		g.lineWidth = 3;
		g.beginPath();
		g.moveTo(42, 65);
		g.lineTo(86, 65);
		g.lineTo(92, 92);
		g.lineTo(36, 92);
		g.closePath();
		g.fill();
		g.stroke();

		// Gold sash trim & flowing emerald silk knots
		g.strokeStyle = '#ffd700';
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(38, 76); g.lineTo(90, 76);
		g.moveTo(36, 88); g.lineTo(92, 88);
		g.stroke();

		// Diagonal leather quiver strap across chest
		g.strokeStyle = '#3e2723';
		g.lineWidth = 4;
		g.beginPath();
		g.moveTo(48, 38);
		g.lineTo(82, 68);
		g.stroke();
		g.strokeStyle = '#ffd700';
		g.lineWidth = 1.5;
		g.strokeRect(62, 50, 6, 7);

		// Torso / Golden Bagan Lamellar Cuirass
		const chestGrad = g.createLinearGradient(46, 38, 82, 68);
		chestGrad.addColorStop(0, '#ffd700');
		chestGrad.addColorStop(0.5, '#daa520');
		chestGrad.addColorStop(1, '#b8860b');
		g.fillStyle = chestGrad;
		g.strokeStyle = '#080e19';
		g.lineWidth = 3;
		g.beginPath();
		g.moveTo(46, 38);
		g.lineTo(82, 38);
		g.lineTo(84, 68);
		g.lineTo(44, 68);
		g.closePath();
		g.fill();
		g.stroke();

		// Royal Solar Dragon Medallion on chest
		g.fillStyle = '#ffd700';
		g.beginPath();
		g.arc(64, 53, 9.5, 0, Math.PI * 2);
		g.fill();
		g.strokeStyle = '#795548';
		g.lineWidth = 1.5;
		g.stroke();
		// Ruby solar center
		g.fillStyle = '#d32f2f';
		g.beginPath();
		g.arc(64, 53, 4.5, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(63, 51.5, 1.2, 0, Math.PI * 2);
		g.fill();

		// Heroic Chibi Head
		g.fillStyle = '#f5cba7';
		g.strokeStyle = '#080e19';
		g.lineWidth = 3;
		g.beginPath();
		g.arc(64, 25, 18, 0, Math.PI * 2);
		g.fill();
		g.stroke();

		// Bagan Golden Crown (မကိုဋ်သရဖူ) with royal spires
		g.fillStyle = '#ffd700';
		g.strokeStyle = '#080e19';
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(47, 18);
		g.lineTo(81, 18);
		g.lineTo(77, 8);
		g.lineTo(64, -3);
		g.lineTo(51, 8);
		g.closePath();
		g.fill();
		g.stroke();

		// Ruby gems on crown
		g.fillStyle = '#d32f2f';
		g.beginPath();
		g.arc(64, 7, 4, 0, Math.PI * 2);
		g.arc(56, 12, 2.5, 0, Math.PI * 2);
		g.arc(72, 12, 2.5, 0, Math.PI * 2);
		g.fill();

		// Heroic Archer Eyes - sharp, concentrated gaze
		g.fillStyle = '#1c1611';
		g.beginPath();
		g.ellipse(57, 24, 2.5, 3.5, 0, 0, Math.PI * 2);
		g.ellipse(71, 24, 2.5, 3.5, 0, 0, Math.PI * 2);
		g.fill();
		// White eye sparkles
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(58, 23, 1.2, 0, Math.PI * 2);
		g.arc(72, 23, 1.2, 0, Math.PI * 2);
		g.fill();

		// Determined archer smile
		g.strokeStyle = '#8d502a';
		g.lineWidth = 1.5;
		g.beginPath();
		g.arc(64, 30, 4, 0.2, Math.PI - 0.2);
		g.stroke();
	} else if (part === 'bow' || part === 'bowIdle') {
		// Aung Zeya Bow (အောင်ဇေယျလေး) - Rest/Idle State
		const bowGrad = g.createLinearGradient(40, 10, 80, 64);
		bowGrad.addColorStop(0, '#ffd700');
		bowGrad.addColorStop(0.5, '#b8860b');
		bowGrad.addColorStop(1, '#8d5b2d');

		// Bow belly & back
		g.strokeStyle = bowGrad;
		g.lineWidth = 5;
		g.beginPath();
		g.moveTo(38, 12);
		g.bezierCurveTo(78, 26, 78, 102, 38, 116);
		g.stroke();

		// Golden leaf filigree trim
		g.strokeStyle = '#fff59d';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(41, 20);
		g.bezierCurveTo(74, 34, 74, 94, 41, 108);
		g.stroke();

		// Emerald jewel nocks at both tips
		g.fillStyle = '#00e676';
		g.strokeStyle = '#ffd700';
		g.lineWidth = 1.5;
		g.beginPath();
		g.arc(38, 12, 4.5, 0, Math.PI * 2);
		g.arc(38, 116, 4.5, 0, Math.PI * 2);
		g.fill();
		g.stroke();

		// Relaxed Bowstring (straight taut line)
		g.strokeStyle = '#ffffff';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(38, 12);
		g.lineTo(58, 64);
		g.lineTo(38, 116);
		g.stroke();

		// Bow grip wrap (dark leather handle)
		g.fillStyle = '#3e2723';
		g.fillRect(66, 58, 9, 12);
		g.strokeStyle = '#ffd700';
		g.lineWidth = 1;
		g.strokeRect(66, 58, 9, 12);
	} else if (part === 'bowDraw') {
		// Aung Zeya Bow - Full Draw State
		const bowGrad = g.createLinearGradient(30, 8, 90, 64);
		bowGrad.addColorStop(0, '#ffe082');
		bowGrad.addColorStop(0.5, '#ffd700');
		bowGrad.addColorStop(1, '#8d5b2d');

		g.strokeStyle = bowGrad;
		g.lineWidth = 5.5;
		g.beginPath();
		// Deeply curved limbs pulled back
		g.moveTo(34, 18);
		g.bezierCurveTo(86, 32, 86, 96, 34, 110);
		g.stroke();

		// Golden glowing inlay
		g.strokeStyle = '#ffffff';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(37, 24);
		g.bezierCurveTo(82, 38, 82, 90, 37, 104);
		g.stroke();

		// Emerald tips
		g.fillStyle = '#00e676';
		g.beginPath();
		g.arc(34, 18, 5, 0, Math.PI * 2);
		g.arc(34, 110, 5, 0, Math.PI * 2);
		g.fill();

		// Taut Bowstring drawn back deep to anchor point (x = 22, y = 64)
		const drawX = 22;
		g.strokeStyle = '#ffffff';
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(34, 18);
		g.lineTo(drawX, 64);
		g.lineTo(34, 110);
		g.stroke();

		// Drawing Archer Hand / Three-finger grip on the string
		g.fillStyle = '#ffd700';
		g.fillRect(drawX - 5, 60, 6, 8);
		g.fillStyle = '#f5cba7';
		g.fillRect(drawX - 2, 61, 4, 6);

		// NOCKED ARROW - Heavy Golden War Arrow resting on shelf
		g.strokeStyle = '#ffd700';
		g.lineWidth = 3.5;
		g.beginPath();
		g.moveTo(drawX, 64);
		g.lineTo(108, 64);
		g.stroke();

		// Arrow core gleam
		g.strokeStyle = '#ffffff';
		g.lineWidth = 1.5;
		g.beginPath();
		g.moveTo(drawX + 8, 64);
		g.lineTo(106, 64);
		g.stroke();

		// Scarlet peacock fletching near nock
		g.fillStyle = '#d32f2f';
		g.beginPath();
		g.moveTo(drawX + 4, 64);
		g.lineTo(drawX + 16, 58);
		g.lineTo(drawX + 12, 64);
		g.lineTo(drawX + 16, 70);
		g.closePath();
		g.fill();

		// Razor-sharp Bodkin Arrowhead with diamond tip
		g.fillStyle = '#ffffff';
		g.strokeStyle = '#ffd700';
		g.lineWidth = 1.5;
		g.beginPath();
		g.moveTo(108, 59);
		g.lineTo(122, 64);
		g.lineTo(108, 69);
		g.lineTo(105, 64);
		g.closePath();
		g.fill();
		g.stroke();

		// Blinding light glint on arrowhead tip
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(122, 64, 2.5, 0, Math.PI * 2);
		g.fill();
	} else if (part === 'bowRelease') {
		// Aung Zeya Bow - Release / Recoil State
		g.strokeStyle = '#ffd700';
		g.lineWidth = 5;
		g.beginPath();
		g.moveTo(42, 10);
		g.bezierCurveTo(74, 28, 74, 100, 42, 118);
		g.stroke();

		// Emerald tips
		g.fillStyle = '#00e676';
		g.beginPath();
		g.arc(42, 10, 4.5, 0, Math.PI * 2);
		g.arc(42, 118, 4.5, 0, Math.PI * 2);
		g.fill();

		// Snapped forward bowstring with multiple harmonic blur lines
		g.strokeStyle = 'rgba(255, 255, 255, 0.45)';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(42, 10);
		g.lineTo(66, 64);
		g.lineTo(42, 118);
		g.stroke();

		g.strokeStyle = '#ffffff';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(42, 10);
		g.lineTo(56, 64);
		g.lineTo(42, 118);
		g.stroke();

		// Air burst ring at arrow launch
		g.strokeStyle = '#fff59d';
		g.lineWidth = 2;
		g.beginPath();
		g.ellipse(82, 64, 6, 12, 0, 0, Math.PI * 2);
		g.stroke();
	}

	return c;
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
	const walkCycle = moving ? Math.sin(time * 12) * 8 : 0;
	const breathe = Math.sin(time * 3) * 1.5;

	// Legs
	const legsCanvas = createPyusawhtiCanvas('legs');
	g.drawImage(legsCanvas, -64, -64 + breathe + walkCycle, 128, 128);

	// Body & Head
	const bodyCanvas = createPyusawhtiCanvas('body');
	g.drawImage(bodyCanvas, -64, -64 + breathe, 128, 128);

	// Bow & Arrow with realistic draw/idle switch
	g.save();
	g.translate(22, breathe);
	g.rotate(aim * 0.4);
	const bowPart = attack > 0 ? 'bowDraw' : 'bowIdle';
	const bowCanvas = createPyusawhtiCanvas(bowPart, attack);
	g.drawImage(bowCanvas, -32, -64, 128, 128);
	g.restore();

	g.restore();
}

export class PyusawhtiRig {
	private legsSprite: Phaser.GameObjects.Image;
	private bodySprite: Phaser.GameObjects.Image;
	private bowSprite: Phaser.GameObjects.Image;

	constructor(private scene: Phaser.Scene) {
		const legsKey = 'pyusawhti-rig-legs';
		const bodyKey = 'pyusawhti-rig-body';
		const bowIdleKey = 'pyusawhti-rig-bow-idle';
		const bowDrawKey = 'pyusawhti-rig-bow-draw';
		const bowReleaseKey = 'pyusawhti-rig-bow-release';

		if (!scene.textures.exists(legsKey)) {
			scene.textures.addCanvas(legsKey, createPyusawhtiCanvas('legs'));
		}
		if (!scene.textures.exists(bodyKey)) {
			scene.textures.addCanvas(bodyKey, createPyusawhtiCanvas('body'));
		}
		if (!scene.textures.exists(bowIdleKey)) {
			scene.textures.addCanvas(bowIdleKey, createPyusawhtiCanvas('bowIdle'));
		}
		if (!scene.textures.exists(bowDrawKey)) {
			scene.textures.addCanvas(bowDrawKey, createPyusawhtiCanvas('bowDraw'));
		}
		if (!scene.textures.exists(bowReleaseKey)) {
			scene.textures.addCanvas(bowReleaseKey, createPyusawhtiCanvas('bowRelease'));
		}

		this.legsSprite = scene.add.image(0, 0, legsKey).setOrigin(0.5, 0.5);
		this.bodySprite = scene.add.image(0, 0, bodyKey).setOrigin(0.5, 0.5);
		this.bowSprite = scene.add.image(0, 0, bowIdleKey).setOrigin(0.35, 0.5);
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
		const walkCycle = moving ? Math.sin(time * 12) * 5 : 0;
		const breathe = Math.sin(time * 3) * 1.2;
		const scale = 0.62;

		// Calculate attack progress curve
		const progress = duration > 0 ? Math.max(0, Math.min(1, 1 - (attack / duration))) : 0;
		let bodyLean = 0;
		let bowOffsetAim = 0;

		if (attack > 0) {
			if (progress < 0.68) {
				// Archer drawing the bowstring back towards cheek
				this.bowSprite.setTexture('pyusawhti-rig-bow-draw');
				const drawFactor = progress / 0.68;
				bowOffsetAim = -10 * drawFactor;
				bodyLean = -4 * drawFactor;
			} else {
				// Arrow released! String snaps forward with recoil kick
				this.bowSprite.setTexture('pyusawhti-rig-bow-release');
				const releaseFactor = (progress - 0.68) / 0.32;
				bowOffsetAim = Math.sin(releaseFactor * Math.PI) * 9;
				bodyLean = Math.sin(releaseFactor * Math.PI) * 2;
			}
		} else {
			this.bowSprite.setTexture('pyusawhti-rig-bow-idle');
		}

		// Legs
		this.legsSprite
			.setPosition(x + (flip ? -bodyLean : bodyLean), y + breathe + walkCycle)
			.setDisplaySize(128 * scale, 128 * scale)
			.setFlipX(flip)
			.setDepth(3.1);

		// Body
		this.bodySprite
			.setPosition(x + (flip ? -bodyLean : bodyLean), y + breathe)
			.setDisplaySize(128 * scale, 128 * scale)
			.setFlipX(flip)
			.setDepth(3.15);

		// Bow with dynamic aim recoil offset
		const bowBaseX = x + (flip ? -16 : 16) + Math.cos(aim) * bowOffsetAim;
		const bowBaseY = y + breathe + Math.sin(aim) * bowOffsetAim;

		this.bowSprite
			.setPosition(bowBaseX, bowBaseY)
			.setDisplaySize(128 * scale, 128 * scale)
			.setRotation(aim)
			.setFlipY(flip)
			.setDepth(3.2);
	}

	clear() {
		this.legsSprite.setVisible(false);
		this.bodySprite.setVisible(false);
		this.bowSprite.setVisible(false);
	}

	campLayer(offset: number) {
		this.legsSprite.setDepth(3.1 + offset);
		this.bodySprite.setDepth(3.15 + offset);
		this.bowSprite.setDepth(3.2 + offset);
	}
}
