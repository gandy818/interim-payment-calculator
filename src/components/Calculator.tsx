"use client";

import { useMemo, useState } from "react";
import {
  Installment,
  calcAll,
  formatNumber,
  formatWon,
  parseDigits,
  summarize,
  todayISO,
} from "@/lib/interest";

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `row-${Date.now()}-${idCounter}`;
}

const SEED: Installment[] = [
  {
    id: nextId(),
    label: "1차 중도금",
    amount: 120_000_000,
    paidOn: "2025-03-15",
    ratePct: 4.6,
  },
  {
    id: nextId(),
    label: "2차 중도금",
    amount: 120_000_000,
    paidOn: "2025-09-15",
    ratePct: 4.6,
  },
  {
    id: nextId(),
    label: "3차 중도금",
    amount: 120_000_000,
    paidOn: "2026-03-15",
    ratePct: 4.8,
  },
];

export default function Calculator() {
  const [rows, setRows] = useState<Installment[]>(SEED);
  const [baseMode, setBaseMode] = useState<"today" | "custom">("today");
  const [customBase, setCustomBase] = useState<string>(todayISO());
  const [defaultRate, setDefaultRate] = useState<number>(4.6);

  const baseDate = baseMode === "today" ? todayISO() : customBase || todayISO();

  const results = useMemo(() => calcAll(rows, baseDate), [rows, baseDate]);
  const resultMap = useMemo(
    () => Object.fromEntries(results.map((r) => [r.id, r])),
    [results],
  );
  const summary = useMemo(() => summarize(rows, results), [rows, results]);

  function updateRow<K extends keyof Installment>(
    id: string,
    key: K,
    value: Installment[K],
  ) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: nextId(),
        label: `${prev.length + 1}차 중도금`,
        amount: 0,
        paidOn: todayISO(),
        ratePct: defaultRate,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="w-full max-w-220 mx-auto px-5 sm:px-8 pb-24">
      {/* Hero */}
      <header className="pt-14 sm:pt-20 pb-10 border-b border-line">
        <p className="text-[13px] text-gold mb-3">중도금 계산기</p>
        <h1 className="font-[family-name:var(--font-serif-kr)] text-[28px] sm:text-[36px] leading-[1.35] text-ink max-w-[13ch] sm:max-w-[24ch]">
          중도금 대출, 이자는 얼마나 쌓일까요?
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft max-w-[52ch]">
          회차별 중도금 대출원금과 납부일, 적용 이자율을 입력하면 기준일까지
          쌓이는 이자를 회차별로 계산해 총액을 보여드립니다. 은행 대출 상품이나
          후취/선납 조건에 따라 실제 금액과는 차이가 있을 수 있습니다.
        </p>
        <div className="mt-6 inline-block border border-line bg-paper-raised px-4 py-3 text-[13px] text-ink-soft tabular">
          이자 = 대출원금 × 연이자율 × (경과일수 ÷ 365)
        </div>
      </header>

      {/* Settings */}
      <section className="py-8 border-b border-line grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[13px] text-ink-soft mb-2">계산 기준일</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 text-[14px] cursor-pointer">
              <input
                type="radio"
                name="baseMode"
                checked={baseMode === "today"}
                onChange={() => setBaseMode("today")}
                className="accent-[var(--color-ink)]"
              />
              오늘 ({todayISO()})
            </label>
            <label className="flex items-center gap-2 text-[14px] cursor-pointer">
              <input
                type="radio"
                name="baseMode"
                checked={baseMode === "custom"}
                onChange={() => setBaseMode("custom")}
                className="accent-[var(--color-ink)]"
              />
              직접 입력 (예: 잔금 예정일)
            </label>
            {baseMode === "custom" && (
              <input
                type="date"
                value={customBase}
                onChange={(e) => setCustomBase(e.target.value)}
                className="border border-line bg-paper-raised px-2 py-1 text-[14px] outline-none focus:border-line-strong"
              />
            )}
          </div>
        </div>
        <div>
          <p className="text-[13px] text-ink-soft mb-2">
            새 회차 기본 연이자율
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              value={defaultRate}
              onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
              className="w-24 border border-line bg-paper-raised px-2 py-1 text-[14px] tabular outline-none focus:border-line-strong"
            />
            <span className="text-[14px] text-ink-soft">%</span>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] text-ink">중도금 납부 내역</h2>
          <span className="text-[13px] text-ink-soft tabular">
            {rows.length}개 회차
          </span>
        </div>

        <div className="overflow-x-auto border border-line-strong">
          <table className="w-full min-w-[720px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line-strong text-left text-[13px] text-ink-soft">
                <th className="py-2.5 px-3 font-normal w-[15%]">회차</th>
                <th className="py-2.5 px-3 font-normal w-[15%]">납부일</th>
                <th className="py-2.5 px-3 font-normal text-right w-[18%]">
                  대출원금
                </th>
                <th className="py-2.5 px-3 font-normal text-right w-[12%]">
                  연이자율
                </th>
                <th className="py-2.5 px-3 font-normal text-right w-[10%]">
                  경과일
                </th>
                <th className="py-2.5 px-3 font-normal text-right w-[16%]">
                  이자금액
                </th>
                <th className="py-2.5 px-2 w-[6%]" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const r = resultMap[row.id];
                return (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="p-1.5">
                      <input
                        value={row.label}
                        onChange={(e) =>
                          updateRow(row.id, "label", e.target.value)
                        }
                        className="w-full bg-transparent px-1.5 py-1.5 outline-none focus:bg-paper-raised"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="date"
                        value={row.paidOn}
                        onChange={(e) =>
                          updateRow(row.id, "paidOn", e.target.value)
                        }
                        className="w-full bg-transparent px-1.5 py-1.5 outline-none focus:bg-paper-raised tabular"
                      />
                    </td>
                    <td className="p-1.5">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          inputMode="numeric"
                          value={formatNumber(row.amount)}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "amount",
                              parseDigits(e.target.value),
                            )
                          }
                          className="w-full bg-transparent px-1.5 py-1.5 text-right outline-none focus:bg-paper-raised tabular"
                        />
                        <span className="text-ink-soft">원</span>
                      </div>
                    </td>
                    <td className="p-1.5">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={row.ratePct}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "ratePct",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-16 bg-transparent px-1.5 py-1.5 text-right outline-none focus:bg-paper-raised tabular"
                        />
                        <span className="text-ink-soft">%</span>
                      </div>
                    </td>
                    <td className="p-1.5 text-right text-ink-soft tabular pr-3">
                      {r ? `${formatNumber(r.days)}일` : "-"}
                    </td>
                    <td className="p-1.5 text-right tabular pr-3 text-ink">
                      {r ? formatWon(r.interest) : "-"}
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        onClick={() => removeRow(row.id)}
                        aria-label={`${row.label} 삭제`}
                        className="text-ink-soft hover:text-red text-[13px] px-2 py-1 cursor-pointer"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-ink-soft text-[14px]"
                  >
                    아직 입력된 회차가 없습니다. 아래에서 회차를 추가해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={addRow}
          className="mt-3 border border-line px-4 py-2 text-[14px] text-ink hover:border-line-strong cursor-pointer"
        >
          + 회차 추가
        </button>
      </section>

      {/* Summary */}
      <section className="py-8 border-t border-line-strong">
        <div className="flex flex-col gap-3 sm:items-end">
          <SummaryLine
            label="총 대출원금"
            value={formatWon(summary.totalPrincipal)}
          />
          <SummaryLine
            label={`총 누적이자 (${baseDate} 기준)`}
            value={formatWon(summary.totalInterest)}
            emphasize
          />
          <div className="w-full sm:w-[360px] border-t border-line-strong pt-3 flex items-baseline justify-between">
            <span className="text-[15px] text-ink">총 상환예정액</span>
            <span className="text-[22px] font-[family-name:var(--font-serif-kr)] text-ink tabular">
              {formatWon(summary.totalDue)}
            </span>
          </div>
        </div>
      </section>

      <footer className="pt-4 pb-10 text-[12.5px] leading-[1.8] text-ink-soft border-t border-line">
        <p>
          본 계산기는 회차별 대출원금에 단리(單利) 방식을 적용한 추정치입니다.
          실제 집단대출 상품은 월할 계산, 거치·상환 조건, 중도상환수수료 등에
          따라 결과가 달라질 수 있으니 참고용으로만 사용해주세요.
        </p>
      </footer>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="w-full sm:w-[360px] flex items-baseline justify-between">
      <span className="text-[14px] text-ink-soft">{label}</span>
      <span
        className={`tabular text-[16px] ${
          emphasize ? "text-gold" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
