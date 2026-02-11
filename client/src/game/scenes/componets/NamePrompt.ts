import { Scene } from 'phaser';

type NamePromptCallback = (name: string) => void;

export default class NamePrompt extends Phaser.GameObjects.Container {
	private inputNode: HTMLInputElement;
	private submitHandler: (event: KeyboardEvent) => void;

	constructor(scene: Scene, onSubmit: NamePromptCallback) {
		super(scene, 0, 0);

		const { width, height } = scene.scale;

		const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0, 0);
		const title = scene.add.text(width / 2, height / 2 - 70, 'Ingresa tu nombre', {
			fontFamily: 'Arial',
			fontSize: '24px',
			color: '#ffffff'
		}).setOrigin(0.5, 0.5);

		const input = scene.add.dom(width / 2, height / 2, 'input',
			'width: 320px; padding: 10px 12px; border-radius: 6px; border: 1px solid #666; ' +
			'background: #111; color: #fff; font-size: 20px; outline: none; text-align: center;'
		);
		const inputNode = input.node as HTMLInputElement;
		inputNode.type = 'text';
		inputNode.placeholder = 'Tu nombre';
		inputNode.maxLength = 16;
		inputNode.autocomplete = 'off';

		const hint = scene.add.text(width / 2, height / 2 + 50, 'Presiona Enter', {
			fontFamily: 'Arial',
			fontSize: '16px',
			color: '#dddddd'
		}).setOrigin(0.5, 0.5);

		this.add([overlay, title, input, hint]);
		this.setSize(width, height);
		this.setScrollFactor(0, 0);
		this.setDepth(1000);

		this.inputNode = inputNode;

		const submit = () => {
			const name = this.inputNode.value.trim();
			if (!name) {
				return;
			}
			onSubmit(name);
		};

		this.submitHandler = (event: KeyboardEvent) => {
			if (event.key !== 'Enter') {
				return;
			}
			event.preventDefault();
			submit();
		};

		this.inputNode.addEventListener('keydown', this.submitHandler);
		scene.time.delayedCall(0, () => this.inputNode.focus());

		this.once(Phaser.GameObjects.Events.DESTROY, () => {
			this.inputNode.removeEventListener('keydown', this.submitHandler);
		});
	}
}
