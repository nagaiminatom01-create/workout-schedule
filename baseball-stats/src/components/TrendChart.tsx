import type { TrendPoint } from "@/lib/stats";

interface TrendChartProps {
  title: string;
  unit: string;
  points: TrendPoint[];
  /** 値が小さいほど良い指標（防御率など） */
  lowerIsBetter?: boolean;
  /** Y軸の固定レンジ（未指定時はデータから自動算出） */
  valueRange?: { min: number; max: number };
  emptyMessage?: string;
}

const CHART_WIDTH = 360;
const CHART_HEIGHT = 180;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };

export function TrendChart({
  title,
  unit,
  points,
  lowerIsBetter = false,
  valueRange,
  emptyMessage = "推移を表示する試合データがありません",
}: TrendChartProps) {
  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const validPoints = points.filter((p) => p.value !== null) as Array<
    TrendPoint & { value: number }
  >;

  const hasData = validPoints.length > 0;

  let yMin: number;
  let yMax: number;

  if (valueRange) {
    yMin = valueRange.min;
    yMax = valueRange.max;
  } else if (hasData) {
    const values = validPoints.map((p) => p.value);
    yMin = Math.min(...values);
    yMax = Math.max(...values);
    const padding = (yMax - yMin) * 0.15 || 0.1;
    yMin = Math.max(0, yMin - padding);
    yMax = yMax + padding;
    if (yMin === yMax) {
      yMin = Math.max(0, yMin - 0.5);
      yMax = yMax + 0.5;
    }
  } else {
    yMin = 0;
    yMax = lowerIsBetter ? 9 : 1;
  }

  const yRange = yMax - yMin || 1;

  function toX(index: number, total: number): number {
    if (total <= 1) return PAD.left + plotW / 2;
    return PAD.left + (index / (total - 1)) * plotW;
  }

  function toY(value: number): number {
    return PAD.top + plotH - ((value - yMin) / yRange) * plotH;
  }

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => {
    return yMin + (yRange * i) / yTicks;
  });

  const linePath =
    validPoints.length >= 2
      ? validPoints
          .map((p, i) => {
            const origIndex = points.findIndex((pt) => pt.id === p.id);
            const x = toX(origIndex, points.length);
            const y = toY(p.value);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  const areaPath =
    validPoints.length >= 2
      ? `${linePath} L ${toX(points.findIndex((pt) => pt.id === validPoints[validPoints.length - 1].id), points.length)} ${PAD.top + plotH} L ${toX(points.findIndex((pt) => pt.id === validPoints[0].id), points.length)} ${PAD.top + plotH} Z`
      : "";

  return (
    <section className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-slate-900/80 via-zinc-900/90 to-emerald-950/30 p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-wide text-emerald-200/90 uppercase">
          {title}
        </h3>
        <span className="text-xs text-zinc-500">{unit}</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="mx-auto w-full max-w-lg"
          role="img"
          aria-label={title}
        >
          {/* 背景グリッド */}
          {tickValues.map((tick) => {
            const y = toY(tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={PAD.left + plotW}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-500 text-[9px]"
                >
                  {tick.toFixed(lowerIsBetter ? 1 : 3)}
                </text>
              </g>
            );
          })}

          {/* X軸 */}
          <line
            x1={PAD.left}
            y1={PAD.top + plotH}
            x2={PAD.left + plotW}
            y2={PAD.top + plotH}
            stroke="rgba(255,255,255,0.12)"
          />

          {/* X軸ラベル */}
          {points.map((p, i) => (
            <text
              key={p.id}
              x={toX(i, points.length)}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-zinc-500 text-[9px]"
            >
              {p.label}
            </text>
          ))}

          {hasData ? (
            <>
              {areaPath && (
                <path d={areaPath} fill="url(#chartGradient)" opacity={0.35} />
              )}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {validPoints.map((p) => {
                const origIndex = points.findIndex((pt) => pt.id === p.id);
                const x = toX(origIndex, points.length);
                const y = toY(p.value);
                return (
                  <g key={p.id}>
                    <circle cx={x} cy={y} r={5} fill="#10b981" stroke="#064e3b" strokeWidth={2} />
                    <title>
                      {p.label}: {p.displayValue}
                    </title>
                  </g>
                );
              })}
            </>
          ) : (
            <text
              x={CHART_WIDTH / 2}
              y={CHART_HEIGHT / 2}
              textAnchor="middle"
              className="fill-zinc-600 text-[11px]"
            >
              {emptyMessage}
            </text>
          )}

          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!hasData && points.length > 0 && (
        <p className="mt-2 text-center text-xs text-zinc-600">
          打数0など算出できない試合はグラフから除外されています
        </p>
      )}
    </section>
  );
}
