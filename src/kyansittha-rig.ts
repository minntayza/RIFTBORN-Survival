import type Phaser from 'phaser';

export type KyansitthaPart = 'legs' | 'body' | 'spear' | 'spearThrust';

export function createKyansitthaCanvas(part: KyansitthaPart, attack = 0): HTMLCanvasElement {
	const c = document.createElement('canvas');
	c.width = 128;
	c.height = 128;
	const g = c.getContext('2d')!;
	g.imageSmoothingEnabled = true;
	g.imageSmoothingQuality = 'high';

	if (part === 'legs') {
		// Heavy armored greaves in royal emerald & gold
		g.fillStyle = '#1b3320';
		g.strokeStyle = '#080e19';
		g.lineWidth = 2.5;
		g.beginPath();
		g.roundRect(45, 76, 15, 38, 4);
		g.fill();
		g.stroke();
		g.beginPath();
		g.roundRect(68, 76, 15, 38, 4);
		g.fill();
		g.stroke();

		// Gold plated knee guards with engraved Bagan lion crest
		g.fillStyle = '#ffd700';
		g.strokeStyle = '#b8860b';
		g.lineWidth = 1.5;
		g.fillRect(47, 85, 11, 10);
		g.strokeRect(47, 85, 11, 10);
		g.fillRect(70, 85, 11, 10);
		g.strokeRect(70, 85, 11, 10);

		// Heavy gold sabatons / war boots (ရွှေခြေနင်း)
		g.fillStyle = '#b8860b';
		g.fillRect(43, 110, 19, 8);
		g.fillRect(66, 110, 19, 8);
		g.fillStyle = '#ffd700';
		g.fillRect(48, 110, 8, 3);
		g.fillRect(71, 110, 8, 3);
	} else if (part === 'body') {
		// Realistic ground contact shadow
		g.fillStyle = 'rgba(5, 10, 19, 0.4)';
		g.beginPath();
		g.ellipse(64, 118, 38, 7, 0, 0, Math.PI * 2);
		g.fill();

		// Royal Crimson Capelet flowing behind (တော်ဝင်ဝတ်ရုံနီ)
		const capeGrad = g.createLinearGradient(42, 42, 95, 96);
		capeGrad.addColorStop(0, '#d32f2f');
		capeGrad.addColorStop(0.6, '#b71c1c');
		capeGrad.addColorStop(1, '#5f0909');
		g.fillStyle = capeGrad;
		g.strokeStyle = '#080e19';
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(42, 42);
		g.lineTo(86, 42);
		g.lineTo(96, 96);
		g.lineTo(32, 96);
		g.closePath();
		g.fill();
		g.stroke();

		// Gold embroidery border on royal capelet
		g.strokeStyle = '#ffd700';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(34, 94);
		g.lineTo(94, 94);
		g.stroke();

		// Royal Emerald Longyi Skirt (မြကျောက်ရောင်ပုဆိုး)
		const skirtGrad = g.createLinearGradient(42, 66, 90, 94);
		skirtGrad.addColorStop(0, '#2e7d32');
		skirtGrad.addColorStop(1, '#1b4d21');
		g.fillStyle = skirtGrad;
		g.strokeStyle = '#080e19';
		g.lineWidth = 3;
		g.beginPath();
		g.moveTo(42, 66);
		g.lineTo(86, 66);
		g.lineTo(90, 94);
		g.lineTo(38, 94);
		g.closePath();
		g.fill();
		g.stroke();

		// Gold embroidery lines & royal sash
		g.strokeStyle = '#ffd700';
		g.lineWidth = 2;
		g.beginPath();
		g.moveTo(40, 78); g.lineTo(88, 78);
		g.moveTo(38, 88); g.lineTo(90, 88);
		g.stroke();

		// Torso / Golden Bagan Scaled Cuirass (စစ်ချပ်ဝတ်တန်ဆာ)
		const cuirassGrad = g.createLinearGradient(44, 38, 86, 68);
		cuirassGrad.addColorStop(0, '#2e7d32');
		cuirassGrad.addColorStop(0.5, '#ffd700');
		cuirassGrad.addColorStop(1, '#1b5e20');
		g.fillStyle = cuirassGrad;
		g.strokeStyle = '#080e19';
		g.lineWidth = 3;
		g.beginPath();
		g.moveTo(44, 38);
		g.lineTo(84, 38);
		g.lineTo(86, 68);
		g.lineTo(42, 68);
		g.closePath();
		g.fill();
		g.stroke();

		// Golden Lamellar Plate overlay with rivets
		g.fillStyle = '#ffd700';
		g.strokeStyle = '#b8860b';
		g.lineWidth = 1.5;
		g.fillRect(48, 42, 32, 22);
		g.strokeRect(48, 42, 32, 22);

		// Royal Singha Lion / Celestial Medallion (ခြင်္သေ့မင်းတံဆိပ်)
		g.fillStyle = '#00e676';
		g.beginPath();
		g.arc(64, 53, 5.5, 0, Math.PI * 2);
		g.fill();
		g.strokeStyle = '#ffd700';
		g.lineWidth = 1.5;
		g.stroke();
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(63, 51.5, 1.2, 0, Math.PI * 2);
		g.fill();

		// Chibi Head
		g.fillStyle = '#f5cba7';
		g.strokeStyle = '#080e19';
		g.lineWidth = 3;
		g.beginPath();
		g.arc(64, 25, 18, 0, Math.PI * 2);
		g.fill();
		g.stroke();

		// Bagan Crested Crown / Battle Helmet (မကိုဋ်သရဖူ)
		g.fillStyle = '#ffd700';
		g.strokeStyle = '#080e19';
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(45, 18);
		g.lineTo(83, 18);
		g.lineTo(80, 6);
		g.lineTo(64, -5);
		g.lineTo(48, 6);
		g.closePath();
		g.fill();
		g.stroke();

		// Emerald jewel in crown
		g.fillStyle = '#00e676';
		g.beginPath();
		g.arc(64, 6, 4.5, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(63, 5, 1.2, 0, Math.PI * 2);
		g.fill();

		// King Kyansittha's resolute, regal eyes
		g.fillStyle = '#1c1611';
		g.beginPath();
		g.ellipse(56, 24, 2.5, 3.5, 0, 0, Math.PI * 2);
		g.ellipse(72, 24, 2.5, 3.5, 0, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(57, 23, 1.2, 0, Math.PI * 2);
		g.arc(73, 23, 1.2, 0, Math.PI * 2);
		g.fill();

		// Iconic Bagan Royal Mustache (သမိုင်းဝင် နှုတ်ခမ်းမွေးတော်)
		g.strokeStyle = '#1c1611';
		g.lineWidth = 2.8;
		g.beginPath();
		g.moveTo(55, 30);
		g.quadraticCurveTo(64, 26, 73, 30);
		g.stroke();
	} else if (part === 'spear' || part === 'spearThrust') {
		// Arindama Spear (အရိန္ဒမာ လှံတော်)
		const isThrust = part === 'spearThrust';

		// Spear shaft (dark ironwood & Bagan teak)
		g.strokeStyle = '#3e2723';
		g.lineWidth = 5;
		g.beginPath();
		g.moveTo(6, 64);
		g.lineTo(96, 64);
		g.stroke();

		// Gold spiral wire wrapping & royal grip
		g.strokeStyle = '#ffd700';
		g.lineWidth = 2;
		for (let i = 20; i <= 68; i += 8) {
			g.beginPath();
			g.moveTo(i, 61); g.lineTo(i + 4, 67);
			g.stroke();
		}

		// Horsehair Scarlet Plume (သီရိခေတ္တရာ လှံအမွှေး)
		// Multi-layered waving crimson horsehair
		const plumeGrad = g.createLinearGradient(88, 56, 96, 72);
		plumeGrad.addColorStop(0, '#ff1744');
		plumeGrad.addColorStop(0.5, '#d50000');
		plumeGrad.addColorStop(1, '#8b0000');
		g.fillStyle = plumeGrad;
		g.beginPath();
		g.ellipse(92, 64, 8, 11, 0, 0, Math.PI * 2);
		g.fill();

		// Golden Spearhead Collar & Socket with Singha motifs
		g.fillStyle = '#ffd700';
		g.strokeStyle = '#b8860b';
		g.lineWidth = 1.5;
		g.fillRect(94, 60, 10, 8);
		g.strokeRect(94, 60, 10, 8);

		// Arindama Double-Edged Broad Leaf Blade (အရိန္ဒမာ ရတနာလှံသွား)
		const bladeGrad = g.createLinearGradient(104, 54, 126, 74);
		bladeGrad.addColorStop(0, '#ffffff');
		bladeGrad.addColorStop(0.5, isThrust ? '#e0f7fa' : '#eceff1');
		bladeGrad.addColorStop(1, '#90a4ae');
		g.fillStyle = bladeGrad;
		g.strokeStyle = '#ffd700';
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(104, 64);
		g.lineTo(110, 55);
		g.lineTo(127, 64);
		g.lineTo(110, 73);
		g.closePath();
		g.fill();
		g.stroke();

		// Center Fuller with Divine Emerald Lightning Core
		g.strokeStyle = isThrust ? '#ffffff' : '#00e5ff';
		g.lineWidth = isThrust ? 2.5 : 1.5;
		g.beginPath();
		g.moveTo(105, 64);
		g.lineTo(125, 64);
		g.stroke();

		// Specular glint on diamond tip
		g.fillStyle = '#ffffff';
		g.beginPath();
		g.arc(126, 64, isThrust ? 3.5 : 2, 0, Math.PI * 2);
		g.fill();

		// Thrust state: radiating electric sparks around blade tip
		if (isThrust) {
			g.strokeStyle = '#00e5ff';
			g.lineWidth = 1.5;
			g.beginPath();
			g.moveTo(127, 64); g.lineTo(132, 60);
			g.moveTo(127, 64); g.lineTo(133, 68);
			g.stroke();
		}
	}

	return c;
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
	const walkCycle = moving ? Math.sin(time * 12) * 8 : 0;
	const breathe = Math.sin(time * 3) * 1.5;

	// Legs
	const legsCanvas = createKyansitthaCanvas('legs');
	g.drawImage(legsCanvas, -64, -64 + breathe + walkCycle, 128, 128);

	// Body & Head
	const bodyCanvas = createKyansitthaCanvas('body');
	g.drawImage(bodyCanvas, -64, -64 + breathe, 128, 128);

	// Arindama Spear
	g.save();
	g.translate(18, breathe);
	g.rotate(aim * 0.35);
	const spearPart = attack > 0 ? 'spearThrust' : 'spear';
	const spearCanvas = createKyansitthaCanvas(spearPart, attack);
	g.drawImage(spearCanvas, -32, -64, 128, 128);
	g.restore();

	g.restore();
}

export class KyansitthaRig {
	private legsSprite: Phaser.GameObjects.Image;
	private bodySprite: Phaser.GameObjects.Image;
	private spearSprite: Phaser.GameObjects.Image;

	constructor(private scene: Phaser.Scene) {
		const legsKey = 'kyansittha-rig-legs';
		const bodyKey = 'kyansittha-rig-body';
		const spearKey = 'kyansittha-rig-spear';
		const spearThrustKey = 'kyansittha-rig-spear-thrust';

		if (!scene.textures.exists(legsKey)) {
			scene.textures.addCanvas(legsKey, createKyansitthaCanvas('legs'));
		}
		if (!scene.textures.exists(bodyKey)) {
			scene.textures.addCanvas(bodyKey, createKyansitthaCanvas('body'));
		}
		if (!scene.textures.exists(spearKey)) {
			scene.textures.addCanvas(spearKey, createKyansitthaCanvas('spear'));
		}
		if (!scene.textures.exists(spearThrustKey)) {
			scene.textures.addCanvas(spearThrustKey, createKyansitthaCanvas('spearThrust'));
		}

		this.legsSprite = scene.add.image(0, 0, legsKey).setOrigin(0.5, 0.5);
		this.bodySprite = scene.add.image(0, 0, bodyKey).setOrigin(0.5, 0.5);
		this.spearSprite = scene.add.image(0, 0, spearKey).setOrigin(0.25, 0.5);
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
		const walkCycle = moving ? Math.sin(time * 12) * 5 : 0;
		const breathe = Math.sin(time * 3) * 1.2;
		const scale = 0.65;

		// Attack animation progress (0.0 -> 1.0)
		const progress = duration > 0 ? Math.max(0, Math.min(1, 1 - (attack / duration))) : 0;
		let spearDist = 0;
		let bodyDist = 0;

		if (attack > 0) {
			if (progress < 0.22) {
				// Windup: Chamber spear backwards into stance
				const windup = progress / 0.22;
				spearDist = -12 * windup;
				bodyDist = -4 * windup;
				this.spearSprite.setTexture('kyansittha-rig-spear');
			} else if (progress < 0.6) {
				// Explosive Thrust & Body Lunge!
				const thrustT = (progress - 0.22) / 0.38;
				spearDist = -12 + (46 - (-12)) * Math.sin(thrustT * Math.PI * 0.5);
				bodyDist = -4 + 18 * Math.sin(thrustT * Math.PI * 0.5);
				this.spearSprite.setTexture('kyansittha-rig-spear-thrust');
			} else {
				// Smooth recovery back to neutral
				const recoverT = (progress - 0.6) / 0.4;
				spearDist = 46 * (1 - recoverT);
				bodyDist = 18 * (1 - recoverT);
				this.spearSprite.setTexture('kyansittha-rig-spear');
			}
		} else {
			this.spearSprite.setTexture('kyansittha-rig-spear');
		}

		// Body with dynamic forward lunge along aim
		const lungeX = Math.cos(aim) * bodyDist;
		const lungeY = Math.sin(aim) * bodyDist;

		// Legs
		this.legsSprite
			.setPosition(x + lungeX * 0.5, y + breathe + walkCycle + lungeY * 0.5)
			.setDisplaySize(128 * scale, 128 * scale)
			.setFlipX(flip)
			.setDepth(3.1);

		// Body & Royal Capelet
		this.bodySprite
			.setPosition(x + lungeX, y + breathe + lungeY)
			.setDisplaySize(128 * scale, 128 * scale)
			.setFlipX(flip)
			.setDepth(3.15);

		// Arindama Spear with dynamic forward extension along aim
		const spearBaseX = x + (flip ? -18 : 18) + Math.cos(aim) * (spearDist + bodyDist);
		const spearBaseY = y + breathe + Math.sin(aim) * (spearDist + bodyDist);

		this.spearSprite
			.setPosition(spearBaseX, spearBaseY)
			.setDisplaySize(135 * scale, 135 * scale)
			.setRotation(aim)
			.setFlipY(flip)
			.setDepth(3.22);
	}

	clear() {
		this.legsSprite.setVisible(false);
		this.bodySprite.setVisible(false);
		this.spearSprite.setVisible(false);
	}

	campLayer(offset: number) {
		this.legsSprite.setDepth(3.1 + offset);
		this.bodySprite.setDepth(3.15 + offset);
		this.spearSprite.setDepth(3.22 + offset);
	}
}
