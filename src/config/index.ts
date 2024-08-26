import mqtt from 'mqtt';
let client: mqtt.MqttClient;

export async function configureMQTTServer(): Promise<void> {
  const mqttUrl = process.env.MQTTURL!;
  client = mqtt.connect(mqttUrl);

  client.on('connect', () => {
    console.log('MQTT client connected from configuration side');
  });

  client.on('error', (err) => {
    console.error('MQTT Error from configuration side:', err);
  });
}
export { client };
