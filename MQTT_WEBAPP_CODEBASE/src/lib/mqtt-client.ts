import mqtt, { type MqttClient } from "mqtt";

export interface MqttConfig {
  host: string;
  port: number;
  path: string;
  ssl: boolean;
  username: string;
  password: string;
  clientId: string;
  baseTopic: string;
}

export const DEFAULT_CONFIG: MqttConfig = {
  host: "broker.emqx.io",
  port: 8083,
  path: "/mqtt",
  ssl: false,
  username: "",
  password: "",
  clientId: "smart-ac-" + Math.random().toString(16).slice(2, 8),
  baseTopic: "home/ac",
};

export function connectMqtt(cfg: MqttConfig): MqttClient {
  const proto = cfg.ssl ? "wss" : "ws";
  const url = `${proto}://${cfg.host}:${cfg.port}${cfg.path.startsWith("/") ? cfg.path : "/" + cfg.path}`;
  return mqtt.connect(url, {
    clientId: cfg.clientId,
    username: cfg.username || undefined,
    password: cfg.password || undefined,
    reconnectPeriod: 4000,
    connectTimeout: 8000,
    clean: true,
  });
}