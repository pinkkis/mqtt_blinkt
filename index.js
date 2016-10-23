const Blinkt = require('blinktjs');
const mqtt = require('mqtt');

const blinkt = new Blinkt({defaultBrightness: 0.1, colorFormat: 'HSV'});
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1';

let timer = null;

// clear any old lights on startup
blinkt.off();

// connect to mqtt broker
const client = mqtt.connect(MQTT_BROKER_URL);

client.subscribe(['blinkt']);
console.info('connected and subscribed to "blinkt" channel');

client.on('message', (token, msg) => {
	let payload = JSON.parse(msg);

	console.info(`Received message on channel ${token}: ${msg.command}, ${msg.animation}, ${msg.duration}`);

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
	let i = 0;

	switch(animation) {
		case "rainbow":
			timer = setInterval(() => {
				i++;
				for (let p = 0; p < 8; p++) {
					blinkt.setPixel(p, ((p * 10) + (i * 5)) % 360, 100, 100);
				}
				blinkt.draw();
			}, 50);
			break;

		case "rotate":
			blinkt.setAll(255, 0, 0);
			blinkt.setPixel(3, 200, 255, 0);
			blinkt.draw();
			timer = setInterval(() => {
				blinkt.rotateLeft();
				blinkt.draw();
			}, 150);
			break;
	}

	setTimeout(() => {
		stopAnimation();
	}, duration || 5000);
}

function stopAnimation() {
	clearInterval(timer);
	blinkt.off();
}

