import { Scene } from 'phaser';

type ButtonHandler = () => void;

interface ButtonOptions {
	width?: number;
	height?: number;
	label?: string;
	backgroundColor?: number;
	hoverColor?: number;
	textColor?: string;
	fontFamily?: string;
	fontSize?: string;
	onClick?: ButtonHandler;
}

export default class Button extends Phaser.GameObjects.Container {
	private background: Phaser.GameObjects.Rectangle;
	private labelText: Phaser.GameObjects.Text;
	private onClick?: ButtonHandler;
	private baseColor: number;
	private hoverColor: number;
	private enabled = true;

	constructor(scene: Scene, x: number, y: number, options: ButtonOptions = {}) {
		super(scene, x, y);

		const {
			width = 160,
			height = 44,
			label = 'Button',
			backgroundColor = 0x2d2d2d,
			hoverColor = 0x3b3b3b,
			textColor = '#ffffff',
			fontFamily = 'Arial',
			fontSize = '18px',
			onClick
		} = options;

		this.baseColor = backgroundColor;
		this.hoverColor = hoverColor;
		this.onClick = onClick;

		this.background = scene.add.rectangle(0, 0, width, height, backgroundColor).setOrigin(0.5);
		this.labelText = scene.add.text(0, 0, label, {
			fontFamily,
			fontSize,
			color: textColor
		}).setOrigin(0.5);

		this.add([this.background, this.labelText]);
		this.setSize(width, height);

		this.background.setInteractive({ useHandCursor: true });
		this.background.on(Phaser.Input.Events.POINTER_OVER, () => {
			if (!this.enabled) {
				return;
			}
			this.background.setFillStyle(this.hoverColor);
		});
		this.background.on(Phaser.Input.Events.POINTER_OUT, () => {
			if (!this.enabled) {
				return;
			}
			this.background.setFillStyle(this.baseColor);
		});
		this.background.on(Phaser.Input.Events.POINTER_DOWN, () => {
			if (!this.enabled) {
				return;
			}
			this.onClick?.();
		});
	}

	setOnClick(handler?: ButtonHandler): this {
		this.onClick = handler;
		return this;
	}

	setLabel(label: string): this {
		this.labelText.setText(label);
		return this;
	}

	setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		this.background.setFillStyle(enabled ? this.baseColor : 0x1b1b1b);
		this.background.setInteractive({ useHandCursor: enabled });
		return this;
	}
}
