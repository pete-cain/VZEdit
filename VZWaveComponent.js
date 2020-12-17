import {
	Component,
	html
} from "https://unpkg.com/htm/preact/standalone.module.js";
import { createRef } from "https://unpkg.com/preact?module";

const WAVEFORM_NAMES = [
	"sine",
	"saw I",
	"saw II",
	"saw III",
	"saw IV",
	"saw V",
	"noise I",
	"noise II",
];

const osc = function (i, waveform, extWave1, volume, frequenz, modtype) {
	let output = 0;
	let wf = Math.cos(i) * (waveform / 8);
	if (waveform === 7) wf = Math.random();
	if (waveform === 6) wf = Math.random() * 2 * Math.PI;

	let j = i * frequenz;

	switch (modtype) {
		case 0:
			output = (Math.cos(j + wf) * volume + extWave1) / 2;
			break;
		case 1:
			output = Math.cos(j + wf) * volume * extWave1;
			break;
		case 2:
			output = Math.cos(j + wf + extWave1 * 10) * volume;
			break;
		default:
			break;
	}
	return output;
};

export class VZWaveComponent extends Component {
	constructor({ waveform = 0 }) {
		super();
		this.canvasRef = createRef();
		this.state = {
			waveform,
			name: WAVEFORM_NAMES[waveform]
		};
	}
	onWaveUp() {
		const idx = (this.state.waveform + 8 + 1) % 8;

		this.setState({
			waveform: idx,
			name: WAVEFORM_NAMES[idx]
		});
	}
	onWaveDown() {
		const idx = (this.state.waveform + 8 - 1) % 8;

		this.setState({
			waveform: idx,
			name: WAVEFORM_NAMES[idx]
		});
	}

	renderOsc() {
		const canvas = this.canvasRef.current;
		const context = this.canvasRef.current.getContext("2d");

		var cheight = canvas.height;
		var cwidth = canvas.width;
		var freq = Math.PI / (cwidth / 2);
		var zoom = 2;

		context.beginPath();
		context.fillStyle = "#c0c0c0";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.moveTo(0, cheight / 2);

		for (let i = 0; i <= 2 * Math.PI * zoom; i = i + freq * zoom) {
			let osc1wave = osc(i, this.waveform, 0, 1.8, 1, 0);
			context.lineTo(
				(1 / (freq * zoom)) * i,
				cheight / 2 + osc1wave * (cheight / 2)
			);
		}
		context.lineWidth = 2;
		context.stroke();
	}

	componentDidMount() {
		this.renderOsc();
	}

	componentDidUpdate() {
		this.renderOsc();
		this.props.onChange(this.state.waveform, this.state.name);
	}

	render() {
		return html`<div><img
				type="image"
				class="waveBtn"
				src="left.jpg"
				onclick=${() => this.onWaveDown()}
			/>
			<canvas
				ref=${this.canvasRef}
				width=${70}
				height=${30}
				border="none"
				onclick=${() => this.onWaveUp()}
			></canvas>
			<img
				type="image"
				class="waveBtn"
				src="right.jpg"
				onclick=${() => this.onWaveUp()}
			/>
			<span>${WAVEFORM_NAMES[this.state.waveform]}</span>
			</div>`;
	}
}
