import type { CivilizationDate, HierarchyInfo } from './calendar';
import { exportOrShareBlob, type ExportOutcome } from './mobile';

export interface IdentityCardData {
  readonly name: string;
  readonly birthDate: Date;
  readonly civDate: CivilizationDate;
  readonly hierarchy: HierarchyInfo;
  readonly archetype: string;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawObservatorySeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  accent: string,
  border: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // 8-ray geometric star (compass rose)
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const inner = i % 2 === 0 ? r * 0.2 : r * 0.35;
    const outer = i % 2 === 0 ? r * 0.72 : r * 0.56;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMoonVector(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fraction: number,
  waxing: boolean,
  ink: string,
  surface: string,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = ink;
  ctx.stroke();
  ctx.clip();

  if (fraction >= 0.99) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (fraction > 0.01) {
    ctx.fillStyle = ink;
    ctx.beginPath();
    // Lit half
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    ctx.arc(cx, cy, r, startAngle, endAngle, !waxing);
    const rx = Math.abs(1 - 2 * fraction) * r;
    const bulgeDir = fraction > 0.5 ? !waxing : waxing;
    ctx.ellipse(cx, cy, rx, r, 0, endAngle, startAngle, bulgeDir);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export async function exportIdentityCardPng(data: IdentityCardData): Promise<ExportOutcome> {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Tarayıcı 2B tuval bağlamı başlatılamadı.');
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const bg = rootStyle.getPropertyValue('--surface-raised').trim() || '#181B22';
  const panel = rootStyle.getPropertyValue('--surface').trim() || '#111317';
  const border = rootStyle.getPropertyValue('--border').trim() || '#2E3340';
  const ink = rootStyle.getPropertyValue('--ink').trim() || '#ECE7DC';
  const muted = rootStyle.getPropertyValue('--muted').trim() || '#A69E8E';
  const accent = rootStyle.getPropertyValue('--accent').trim() || '#D9A441';

  await document.fonts.ready;

  // Base plate
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Double hairline border
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, width - 72, height - 72);
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Corner brass ticks
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  const tickLen = 20;
  const corners: Array<[number, number, number, number]> = [
    [36, 36, 1, 1],
    [width - 36, 36, -1, 1],
    [36, height - 36, 1, -1],
    [width - 36, height - 36, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * tickLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * tickLen, y);
    ctx.stroke();
  }

  // Header left
  ctx.fillStyle = accent;
  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillText('MEDENİYET NÜFUS KÜTÜĞÜ BELGESİ', 96, 118);

  ctx.fillStyle = ink;
  ctx.font = '700 54px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(data.name.trim() || 'İsimsiz Yolcu', 96, 182);

  ctx.fillStyle = muted;
  ctx.font = '400 22px "Albert Sans", sans-serif';
  ctx.fillText(
    `Gregoryen Doğum: ${data.birthDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    96,
    222,
  );

  // Observatory seal right
  drawObservatorySeal(ctx, width - 156, 160, 56, accent, border);

  // Header divider
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(96, 256);
  ctx.lineTo(width - 96, 256);
  ctx.stroke();

  // Central date band
  ctx.fillStyle = panel;
  ctx.fillRect(96, 286, width - 192, 232);
  ctx.strokeStyle = border;
  ctx.strokeRect(96, 286, width - 192, 232);

  ctx.textAlign = 'center';
  ctx.fillStyle = muted;
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('MEDENİYET TAKVİMİ KOORDİNATI', width / 2, 330);

  const dateHeadline =
    data.civDate.civDay === 0
      ? (data.civDate.specialDay ?? data.civDate.monthName)
      : `${data.civDate.civDay} ${data.civDate.monthName}`;

  ctx.fillStyle = accent;
  ctx.font = '700 84px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(dateHeadline, width / 2, 418);

  ctx.fillStyle = ink;
  ctx.font = '500 28px "Albert Sans", sans-serif';
  ctx.fillText(
    `${data.civDate.civYear} Yılı  ·  ${data.civDate.weekday}`,
    width / 2,
    468,
  );

  // Moon phase readout inside band
  const moonLabel = `Doğum Ay Evresi: ${data.civDate.moonPhase.name} (${data.civDate.moonPhase.illumination})`;
  ctx.font = '400 18px "JetBrains Mono", monospace';
  const labelWidth = ctx.measureText(moonLabel).width;
  const moonX = width / 2 - labelWidth / 2 - 22;
  drawMoonVector(
    ctx,
    moonX,
    494,
    10,
    data.civDate.moonPhase.fraction,
    data.civDate.moonPhase.waxing,
    accent,
    bg,
  );
  ctx.fillStyle = muted;
  ctx.fillText(moonLabel, width / 2 + 12, 500);

  // 4 Cosmic coordinates row
  const colW = (width - 192 - 48) / 4;
  const coords = [
    { label: 'DÖNGÜ (4 YIL)', value: data.hierarchy.cycle.name, dot: data.hierarchy.cycle.hex },
    { label: 'NESİL (28 YIL)', value: `${data.hierarchy.generation} Nesli`, dot: null },
    { label: 'ÇAĞ (196 YIL)', value: `${data.hierarchy.age} Çağı`, dot: null },
    { label: 'BÜYÜK DEVİR', value: `${data.hierarchy.eon}. Eon`, dot: null },
  ];

  coords.forEach((item, idx) => {
    const x = 96 + idx * (colW + 16);
    const y = 548;
    ctx.fillStyle = panel;
    ctx.fillRect(x, y, colW, 118);
    ctx.strokeStyle = border;
    ctx.strokeRect(x, y, colW, 118);

    ctx.textAlign = 'center';
    ctx.fillStyle = muted;
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText(item.label, x + colW / 2, y + 40);

    ctx.fillStyle = ink;
    ctx.font = '600 24px "Albert Sans", sans-serif';
    ctx.fillText(item.value, x + colW / 2 + (item.dot ? 10 : 0), y + 84);

    if (item.dot) {
      const tw = ctx.measureText(item.value).width;
      ctx.fillStyle = item.dot;
      ctx.beginPath();
      ctx.arc(x + colW / 2 - tw / 2 - 4, y + 76, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Archetype inscription
  ctx.textAlign = 'left';
  ctx.fillStyle = accent;
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText('DOĞUM ENERJİSİ VE ARKETİP', 96, 720);

  ctx.fillStyle = ink;
  ctx.font = 'italic 400 28px "Cormorant Garamond", Georgia, serif';
  const lines = wrapText(ctx, `“${data.archetype}”`, width - 192);
  lines.slice(0, 3).forEach((line, idx) => {
    ctx.fillText(line, 96, 764 + idx * 38);
  });

  // Footer
  ctx.strokeStyle = border;
  ctx.beginPath();
  ctx.moveTo(96, 896);
  ctx.lineTo(width - 96, 896);
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MİLAT: M.Ö. 3200 YAZININ İCADI', 96, 932);
  ctx.textAlign = 'right';
  ctx.fillText('13 AY × 28 GÜN ASTRONOMİK ALMANAK', width - 96, 932);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('PNG görüntüsü oluşturulamadı.'));
    }, 'image/png');
  });

  const safeSlug = (data.name.trim() || 'medeniyet-kimligi')
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü]+/gi, '-')
    .replace(/^-|-$/g, '');
  const filename = `medeniyet-kimlik-${safeSlug}-${data.civDate.civYear}.png`;

  return exportOrShareBlob({
    blob,
    filename,
    mimeType: 'image/png',
    title: `${data.name.trim() || 'Medeniyet Kimliği'} — ${data.civDate.civYear}`,
    text: `${data.civDate.civDay === 0 ? data.civDate.specialDay : `${data.civDate.civDay} ${data.civDate.monthName}`} ${data.civDate.civYear}`,
  });
}
