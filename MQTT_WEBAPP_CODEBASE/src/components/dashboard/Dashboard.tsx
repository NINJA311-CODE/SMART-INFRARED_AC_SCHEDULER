import { useEffect, useMemo, useRef, useState } from "react";
import type { MqttClient } from "mqtt";
import { connectMqtt, DEFAULT_CONFIG, type MqttConfig } from "@/lib/mqtt-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Power,
  PowerOff,
  Thermometer,
  Droplets,
  Settings2,
  Wifi,
  WifiOff,
  CalendarClock,
  Save,
  RefreshCw,
  Snowflake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ConnStatus = "disconnected" | "connecting" | "connected" | "error";

const TEMP_PRESETS = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const CFG_KEY = "smart-ac-mqtt-cfg";

export default function Dashboard() {
  const [cfg, setCfg] = useState<MqttConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    try {
      const raw = localStorage.getItem(CFG_KEY);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const [status, setStatus] = useState<ConnStatus>("disconnected");
  const clientRef = useRef<MqttClient | null>(null);

  // Live telemetry
  const [roomTemp, setRoomTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [acOn, setAcOn] = useState<boolean>(false);
  const [targetTemp, setTargetTemp] = useState<number>(22);
  const [mode, setMode] = useState<string>("Manual");

  // Schedule state
  const [schedStart, setSchedStart] = useState("22:00");
  const [schedEnd, setSchedEnd] = useState("07:00");
  const [schedTarget, setSchedTarget] = useState(22);
  const [schedEnabled, setSchedEnabled] = useState(true);

  const [eventDT, setEventDT] = useState("");
  const [eventTarget, setEventTarget] = useState(21);
  const [eventAutoOff, setEventAutoOff] = useState(3);
  const [eventArmed, setEventArmed] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<MqttConfig>(cfg);

  const locked = status !== "connected";

  const t = useMemo(
    () => ({
      state: `${cfg.baseTopic}/state`,
      status: `${cfg.baseTopic}/status`,
      cmd: `${cfg.baseTopic}/manual_cmd`,
      set: `${cfg.baseTopic}/manual_cmd`,
      schedule: `${cfg.baseTopic}/schedule_set`,
      event: `${cfg.baseTopic}/event_set`,
    }),
    [cfg.baseTopic],
  );

  // Connect / disconnect
  const disconnect = () => {
    const c = clientRef.current;
    if (c) {
      c.end(true);
      clientRef.current = null;
    }
    setStatus("disconnected");
  };

  const connect = () => {
    disconnect();
    setStatus("connecting");
    try {
      const c = connectMqtt(cfg);
      clientRef.current = c;
      c.on("connect", () => {
        setStatus("connected");
        toast.success("MQTT connected", { description: `${cfg.host}:${cfg.port}` });
        c.subscribe([t.status, t.state, `${cfg.baseTopic}/#`], (err) => {
          if (err) console.warn("subscribe error", err);
        });
      });
      c.on("reconnect", () => setStatus("connecting"));
      c.on("close", () => setStatus((s) => (s === "connected" ? "disconnected" : s)));
      c.on("error", (err) => {
        console.error("mqtt error", err);
        setStatus("error");
        toast.error("MQTT error", { description: String(err?.message ?? err) });
      });
      c.on("message", (topic, payload) => {
        const text = payload.toString();
        try {
          const j = JSON.parse(text);
          if (topic.endsWith("/status") || topic.endsWith("/state")) {
            if (typeof j.temp === "number") setRoomTemp(j.temp);
            else if (typeof j.temperature === "number") setRoomTemp(j.temperature);
            if (typeof j.hum === "number") setHumidity(j.hum);
            else if (typeof j.humidity === "number") setHumidity(j.humidity);
            if (typeof j.acOn === "boolean") setAcOn(j.acOn);
            else if (typeof j.on === "boolean") setAcOn(j.on);
            if (typeof j.setTemp === "number") setTargetTemp(j.setTemp);
            else if (typeof j.target === "number") setTargetTemp(j.target);
            else if (typeof j.targetTemp === "number") setTargetTemp(j.targetTemp);
            if (typeof j.mode === "string") setMode(j.mode);
          }
        } catch {
          /* non-json */
        }
      });
    } catch (e) {
      setStatus("error");
      toast.error("Connect failed", { description: String((e as Error).message) });
    }
  };

  useEffect(() => () => disconnect(), []);

  const publish = (topic: string, payload: unknown) => {
    const c = clientRef.current;
    if (!c || status !== "connected") return;
    const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
    c.publish(topic, msg, { qos: 1, retain: false }, (err) => {
      if (err) toast.error("Publish failed", { description: err.message });
    });
  };

  const turnOn = () => {
    publish(t.cmd, { power: true });
    setAcOn(true);
    setMode("Manual");
  };
  const turnOff = () => {
    publish(t.cmd, { power: false });
    setAcOn(false);
  };
  const setTemp = (v: number) => {
    publish(t.set, { temp: v });
    setTargetTemp(v);
    setMode("Manual");
  };
  const resumeSchedule = () => {
    publish(t.cmd, { resume_schedule: true });
    setMode("Schedule");
  };
  const saveSchedule = () => {
    const [sh, sm] = schedStart.split(":").map((n) => Number(n));
    const [eh, em] = schedEnd.split(":").map((n) => Number(n));
    publish(t.schedule, {
      sh: sh || 0,
      sm: sm || 0,
      eh: eh || 0,
      em: em || 0,
      tgt: schedTarget,
      en: schedEnabled,
    });
    toast.success("Schedule saved");
  };
  const saveEvent = () => {
    const dt = eventDT ? new Date(eventDT) : null;
    if (!dt || Number.isNaN(dt.getTime())) {
      toast.error("Please pick a date & time for the event");
      return;
    }
    publish(t.event, {
      en: eventArmed,
      y: dt.getFullYear(),
      mo: dt.getMonth() + 1,
      d: dt.getDate(),
      h: dt.getHours(),
      mi: dt.getMinutes(),
      t: eventTarget,
      off: eventAutoOff,
    });
    toast.success(eventArmed ? "Event armed" : "Event saved");
  };

  const saveCfg = () => {
    setCfg(draft);
    try {
      localStorage.setItem(CFG_KEY, JSON.stringify(draft));
    } catch {}
    setSheetOpen(false);
    setTimeout(connect, 50);
  };

  const statusMeta = {
    connected: { label: "Connected", cls: "bg-primary/15 text-primary border-primary/40 neon-glow" },
    connecting: { label: "Connecting…", cls: "bg-secondary/15 text-secondary border-secondary/40 animate-pulse" },
    disconnected: { label: "Disconnected", cls: "bg-muted text-muted-foreground border-border" },
    error: { label: "Error", cls: "bg-destructive/15 text-destructive border-destructive/40" },
  }[status];

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-primary/30 bg-card neon-glow">
            <Snowflake className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest neon-text" style={{ fontFamily: "Orbitron, sans-serif" }}>
              SMART CLIMATE AC
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              ESP32 · MQTT Control Console
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest",
              statusMeta.cls,
            )}
          >
            {status === "connected" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            MQTT · {statusMeta.label}
          </div>
          {status === "connected" ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={connect} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Connect
            </Button>
          )}
          <Sheet open={sheetOpen} onOpenChange={(o) => { setSheetOpen(o); if (o) setDraft(cfg); }}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="MQTT settings">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-l border-border/60 bg-card p-0 sm:max-w-md"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <div className="flex h-full flex-col">
                <SheetHeader className="space-y-1 border-b border-border/60 px-6 py-5 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Configuration
                  </p>
                  <SheetTitle
                    className="text-2xl font-bold text-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    HiveMQ Cloud
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    MQTT broker connection settings
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                  <BrokerField label="Host URL">
                    <Input
                      value={draft.host}
                      onChange={(e) => setDraft({ ...draft, host: e.target.value })}
                      className="h-12 rounded-lg border-border/60 bg-background/60 font-mono text-sm text-foreground focus-visible:border-secondary focus-visible:ring-secondary/30"
                      placeholder="broker.example.com"
                    />
                  </BrokerField>
                  <BrokerField label="Port">
                    <Input
                      type="number"
                      value={draft.port}
                      onChange={(e) => setDraft({ ...draft, port: Number(e.target.value) })}
                      className="h-12 rounded-lg border-border/60 bg-background/60 font-mono text-sm text-foreground focus-visible:border-secondary focus-visible:ring-secondary/30"
                    />
                  </BrokerField>
                  <BrokerField label="Web Username">
                    <Input
                      value={draft.username}
                      onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                      className="h-12 rounded-lg border-border/60 bg-background/60 font-mono text-sm text-foreground focus-visible:border-secondary focus-visible:ring-secondary/30"
                    />
                  </BrokerField>
                  <BrokerField label="Web Password">
                    <Input
                      type="password"
                      value={draft.password}
                      onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                      className="h-12 rounded-lg border-border/60 bg-background/60 font-mono text-sm text-foreground focus-visible:border-secondary focus-visible:ring-secondary/30"
                    />
                  </BrokerField>

                  <details className="group rounded-lg border border-border/40 bg-background/40 px-4 py-3 text-xs">
                    <summary className="cursor-pointer list-none font-semibold uppercase tracking-[0.2em] text-muted-foreground group-open:text-secondary">
                      Advanced
                    </summary>
                    <div className="mt-4 space-y-4">
                      <BrokerField label="WebSocket Path">
                        <Input
                          value={draft.path}
                          onChange={(e) => setDraft({ ...draft, path: e.target.value })}
                          className="h-11 rounded-lg border-border/60 bg-background/60 font-mono text-xs"
                        />
                      </BrokerField>
                      <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        <Checkbox
                          checked={draft.ssl}
                          onCheckedChange={(v) => setDraft({ ...draft, ssl: Boolean(v) })}
                        />
                          Use TLS (wss://)
                      </label>
                      <BrokerField label="Base Topic">
                        <Input
                          value={draft.baseTopic}
                          onChange={(e) => setDraft({ ...draft, baseTopic: e.target.value })}
                          className="h-11 rounded-lg border-border/60 bg-background/60 font-mono text-xs"
                        />
                      </BrokerField>
                      <BrokerField label="Client ID">
                        <Input
                          value={draft.clientId}
                          onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}
                          className="h-11 rounded-lg border-border/60 bg-background/60 font-mono text-xs"
                        />
                      </BrokerField>
                    </div>
                  </details>
                </div>

                <div className="border-t border-border/60 px-6 py-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="h-12 rounded-lg border border-border/60 bg-background/40 text-xs font-bold uppercase tracking-[0.2em] text-foreground transition hover:border-border hover:bg-background"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCfg}
                      className="h-12 rounded-lg border border-secondary bg-secondary text-xs font-bold uppercase tracking-[0.2em] text-background transition hover:bg-secondary/90"
                      style={{ boxShadow: "var(--teal-glow)" }}
                    >
                      Save & Connect
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Stored locally on this device in localStorage.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto mt-8 grid max-w-6xl gap-6">
        {/* Live metrics */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric
            icon={<Thermometer className="h-4 w-4" />}
            label="Room temperature"
            value={roomTemp != null ? `${roomTemp.toFixed(1)}°C` : "—"}
            accent="primary"
          />
          <Metric
            icon={<Droplets className="h-4 w-4" />}
            label="Humidity"
            value={humidity != null ? `${humidity.toFixed(0)}%` : "—"}
            accent="secondary"
          />
          <Metric
            label="AC status"
            value={
              <Badge
                className={cn(
                  "px-2.5 py-1 text-xs font-bold uppercase tracking-widest",
                  acOn
                    ? "bg-primary/15 text-primary border border-primary/50 neon-glow"
                    : "bg-muted text-muted-foreground border border-border",
                )}
              >
                {acOn ? "ON" : "OFF"}
              </Badge>
            }
          />
          <Metric label="AC set to" value={`${targetTemp}°C`} accent="primary" />
          <Metric label="Mode" value={mode} accent="secondary" />
        </section>

        {/* Controls */}
        <Card className="border-border bg-card p-6">
          <SectionHeader title="Controls" subtitle="Direct commands · publish to MQTT" locked={locked} />
          <div className="mt-5 grid gap-5 md:grid-cols-[auto_1fr]">
            <div className="flex gap-3">
              <ActionBtn locked={locked} onClick={turnOn} tone="primary">
                <Power className="mr-2 h-4 w-4" /> Turn on
              </ActionBtn>
              <ActionBtn locked={locked} onClick={turnOff} tone="ghost">
                <PowerOff className="mr-2 h-4 w-4" /> Turn off
              </ActionBtn>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {TEMP_PRESETS.map((v) => {
                const active = targetTemp === v;
                return (
                  <button
                    key={v}
                    disabled={locked}
                    onClick={() => setTemp(v)}
                    className={cn(
                      "rounded-md border px-3 py-3 text-center text-sm font-bold tracking-wider transition",
                      locked
                        ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50"
                        : active
                        ? "border-primary bg-primary/15 text-primary neon-glow"
                        : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary",
                    )}
                  >
                    {v}°C
                  </button>
                );
              })}
            </div>

          </div>
          <button
            disabled={locked}
            onClick={resumeSchedule}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-md border py-3 text-sm font-bold uppercase tracking-[0.2em] transition",
              locked
                ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50"
                : "border-secondary/60 bg-secondary/10 text-secondary hover:bg-secondary/20",
            )}
            style={!locked ? { boxShadow: "var(--teal-glow)" } : undefined}
          >
            <RefreshCw className="h-4 w-4" /> Resume schedule
          </button>
        </Card>

        {/* Scheduling */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card p-6">
            <SectionHeader
              title="Daily schedule"
              subtitle="Repeats every day at these times"
              locked={locked}
              icon={<CalendarClock className="h-4 w-4 text-primary" />}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <FieldRow label="Start time">
                <Input type="time" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} disabled={locked} />
              </FieldRow>
              <FieldRow label="End time">
                <Input type="time" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} disabled={locked} />
              </FieldRow>
              <FieldRow label="Target °C">
                <Input
                  type="number"
                  min={16}
                  max={30}
                  value={schedTarget}
                  onChange={(e) => setSchedTarget(Number(e.target.value))}
                  disabled={locked}
                />
              </FieldRow>
              <label className="mt-6 flex items-center gap-2 text-sm">
                <Checkbox
                  checked={schedEnabled}
                  onCheckedChange={(v) => setSchedEnabled(Boolean(v))}
                  disabled={locked}
                />
                <span className={locked ? "text-muted-foreground/60" : "text-foreground"}>Enabled</span>
              </label>
            </div>
            <ActionBtn locked={locked} onClick={saveSchedule} tone="primary" className="mt-5 w-full">
              <Save className="mr-2 h-4 w-4" /> Save schedule
            </ActionBtn>
          </Card>

          <Card className="border-border bg-card p-6">
            <SectionHeader
              title="One-time event"
              subtitle="Runs once at the specified moment"
              locked={locked}
              icon={<CalendarClock className="h-4 w-4 text-secondary" />}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FieldRow label="When (date & time)">
                  <Input
                    type="datetime-local"
                    value={eventDT}
                    onChange={(e) => setEventDT(e.target.value)}
                    disabled={locked}
                  />
                </FieldRow>
              </div>
              <FieldRow label="Target °C">
                <Input
                  type="number"
                  min={16}
                  max={30}
                  value={eventTarget}
                  onChange={(e) => setEventTarget(Number(e.target.value))}
                  disabled={locked}
                />
              </FieldRow>
              <FieldRow label="Auto-off (hours, 0 = off)">
                <Input
                  type="number"
                  min={0}
                  max={24}
                  value={eventAutoOff}
                  onChange={(e) => setEventAutoOff(Number(e.target.value))}
                  disabled={locked}
                />
              </FieldRow>
              <label className="col-span-2 mt-2 flex items-center gap-2 text-sm">
                <Checkbox
                  checked={eventArmed}
                  onCheckedChange={(v) => setEventArmed(Boolean(v))}
                  disabled={locked}
                />
                <span className={locked ? "text-muted-foreground/60" : "text-foreground"}>Armed</span>
              </label>
            </div>
            <ActionBtn locked={locked} onClick={saveEvent} tone="secondary" className="mt-5 w-full">
              <Save className="mr-2 h-4 w-4" /> Save event
            </ActionBtn>
          </Card>
        </div>

        {locked && (
          <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Controls locked · connect to MQTT broker to unlock
          </p>
        )}
      </main>

      <footer className="mx-auto mt-10 max-w-6xl border-t border-border/40 pt-5 text-center">
        <p className="text-[10px] font-medium uppercase leading-relaxed tracking-wider text-muted-foreground">
          *THIS IS JUST AN APP INTERFACE FOR ANYONE WANTING READY-MADE APPLICATION, IT DOES NOT WORK FOR YOUR AC UNLESS YOU CONNECT TO YOUR OWN MQTT BROKER WITH YOUR CREDENTIALS, IT WILL BE SAVED LOCALLY ON YOUR DEVICE
        </p>
        <p className="mt-2 text-[10px] font-medium tracking-wider text-muted-foreground">
          for suggestions&improvements contact: ninja030507030101@gmail.com
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">
          all rights reserved
        </p>
      </footer>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function BrokerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: "primary" | "secondary";
}) {
  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-bold tracking-wide",
          accent === "primary" && "neon-text",
          accent === "secondary" && "teal-text",
        )}
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        {value}
      </div>
    </Card>
  );
}

function SectionHeader({
  title,
  subtitle,
  locked,
  icon,
}: {
  title: string;
  subtitle?: string;
  locked?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <span
        className={cn(
          "rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
          locked
            ? "border-border bg-muted text-muted-foreground"
            : "border-primary/40 bg-primary/10 text-primary",
        )}
      >
        {locked ? "Locked" : "Live"}
      </span>
    </div>
  );
}

function ActionBtn({
  locked,
  onClick,
  tone,
  className,
  children,
}: {
  locked: boolean;
  onClick: () => void;
  tone: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
}) {
  const enabled =
    tone === "primary"
      ? "border border-primary bg-primary/15 text-primary hover:bg-primary/25 neon-glow"
      : tone === "secondary"
      ? "border border-secondary bg-secondary/15 text-secondary hover:bg-secondary/25"
      : "border border-border bg-background text-foreground hover:border-primary/50 hover:text-primary";
  return (
    <button
      disabled={locked}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] transition",
        locked ? "cursor-not-allowed border border-border bg-muted/40 text-muted-foreground/50" : enabled,
        className,
      )}
    >
      {children}
    </button>
  );
}