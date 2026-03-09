

// ─── Wave oscillator ────────────────────────────────────────────────────────

interface WaveOptions {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

let waveValue = 0;

class Wave {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;

  constructor(options: WaveOptions = {}) {
    this.phase = options.phase ?? 0;
    this.offset = options.offset ?? 0;
    this.frequency = options.frequency ?? 0.001;
    this.amplitude = options.amplitude ?? 1;
  }

  update() {
    this.phase += this.frequency;
    waveValue = this.offset + Math.sin(this.phase) * this.amplitude;
    return waveValue;
  }

  value() {
    return waveValue;
  }
}

// ─── Spring-physics node ─────────────────────────────────────────────────────

class SpringNode {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CONFIG = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

// ─── Trail line ──────────────────────────────────────────────────────────────

interface LineOptions {
  spring: number;
}

class TrailLine {
  spring: number;
  friction: number;
  nodes: SpringNode[];

  constructor(options: LineOptions) {
    this.spring = options.spring + 0.1 * Math.random() - 0.05;
    this.friction = CONFIG.friction + 0.01 * Math.random() - 0.005;
    this.nodes = Array.from({ length: CONFIG.size }, () => {
      const n = new SpringNode();
      n.x = pos.x;
      n.y = pos.y;
      return n;
    });
  }

  update() {
    let e = this.spring;
    const head = this.nodes[0];
    if (head) {
      head.vx += (pos.x - head.x) * e;
      head.vy += (pos.y - head.y) * e;
    }

    for (let i = 0; i < this.nodes.length; i++) {
      const t = this.nodes[i];
      if (!t) continue;
      if (i > 0) {
        const prev = this.nodes[i - 1];
        if (prev) {
          t.vx += (prev.x - t.x) * e;
          t.vy += (prev.y - t.y) * e;
          t.vx += prev.vx * CONFIG.dampening;
          t.vy += prev.vy * CONFIG.dampening;
        }
      }
      t.vx *= this.friction;
      t.vy *= this.friction;
      t.x += t.vx;
      t.y += t.vy;
      e *= CONFIG.tension;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // @ts-ignore
    let n = this.nodes[0].x;
    // @ts-ignore
    let i = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(n, i);

    for (let a = 1; a < this.nodes.length - 2; a++) {
      const e = this.nodes[a];
      const t = this.nodes[a + 1];
      if (!e || !t) continue;
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }

    const last = this.nodes[this.nodes.length - 2];
    const end = this.nodes[this.nodes.length - 1];
    if (last && end) {
      ctx.quadraticCurveTo(last.x, last.y, end.x, end.y);
    }
    ctx.stroke();
    ctx.closePath();
  }
}

// ─── State ───────────────────────────────────────────────────────────────────

let ctx: (CanvasRenderingContext2D & { running?: boolean; frame?: number }) | null = null;
let wave: Wave | null = null;
let lines: TrailLine[] = [];
const pos = { x: 0, y: 0 };

// ─── Render loop ─────────────────────────────────────────────────────────────

function render() {
  if (!ctx?.running || !wave) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `hsla(${Math.round(wave.update())},100%,50%,0.025)`;
  ctx.lineWidth = 10;
  for (const line of lines) {
    line.update();
    line.draw(ctx);
  }
  ctx.frame = (ctx.frame ?? 0) + 1;
  window.requestAnimationFrame(render);
}

function spawnLines() {
  lines = Array.from(
    { length: CONFIG.trails },
    (_, i) => new TrailLine({ spring: 0.45 + (i / CONFIG.trails) * 0.025 })
  );
}

function resizeCanvas() {
  if (!ctx) return;
  ctx.canvas.width = window.innerWidth - 20;
  ctx.canvas.height = window.innerHeight;
}

// ─── Mouse / touch handlers ──────────────────────────────────────────────────

function onMove(e: MouseEvent | TouchEvent) {
  if ("touches" in e) {
    // @ts-ignore
    pos.x = e.touches[0].pageX;
    // @ts-ignore
    pos.y = e.touches[0].pageY;
  } else {
    pos.x = e.clientX;
    pos.y = e.clientY;
  }
  e.preventDefault();
}

function onTouchSingle(e: TouchEvent) {
  if (e.touches.length === 1) {
    // @ts-ignore
    pos.x = e.touches[0].pageX;
    // @ts-ignore
    pos.y = e.touches[0].pageY;
  }
}

function onFirstInteraction(e: MouseEvent | TouchEvent) {
  document.removeEventListener("mousemove", onFirstInteraction as EventListener);
  document.removeEventListener("touchstart", onFirstInteraction as EventListener);
  document.addEventListener("mousemove", onMove as EventListener);
  document.addEventListener("touchmove", onMove as EventListener, { passive: false });
  document.addEventListener("touchstart", onTouchSingle as EventListener);
  onMove(e as MouseEvent);
  spawnLines();
  render();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function renderCanvas() {
  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;

  ctx = canvas.getContext("2d") as typeof ctx;
  if (!ctx) return;

  ctx.running = true;
  ctx.frame = 1;

  wave = new Wave({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });

  document.addEventListener("mousemove", onFirstInteraction as EventListener);
  document.addEventListener("touchstart", onFirstInteraction as EventListener);
  document.body.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("focus", () => {
    if (ctx && !ctx.running) {
      ctx.running = true;
      render();
    }
  });
  window.addEventListener("blur", () => {
    if (ctx) ctx.running = true;
  });

  resizeCanvas();
}

export function stopCanvas() {
  if (ctx) ctx.running = false;
}
