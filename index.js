const Blinkt = require('Blinktjs');
const mqtt = require('mqtt');

const blinkt = new Blinkt({defaultBrightness: 0.1, colorFormat: 'HSV'});
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1';

let timer = null, i = 0;

// clear any old lights on startup
blinkt.off();

// connect to mqtt broker
const client = mqtt.connect(MQTT_BROKER_URL);

client.subscribe(['blinkt']);

client.on('message', msg => {
	let payload = JSON.parse(msg);

	if (!payload.command) { return; }

	switch (payload.command) {
		case "stop":
			stopAnimation();
			break;

		case "play":
			playAnimation(payload.animation, payload.duration);
			break;

		default:
			// do nothing for now
	}
});


function playAnimation(animation, duration) {
	// ignores animation for now, as there is only one
	timer = setInterval(() => {
		i++;
		for (let p = 0; p < 8; p++) {
			blinkt.setPixel(p, ((p * 10) + (i * 5)) % 360, 100, 100);
		}
		blinkt.draw();
	}, 50);

	setTimeout(() => {
		stopAnimation();
	}, duration || 5000);

}

function stopAnimation() {
	clearInterval(timer);
	blinkt.off();
}

