"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
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

const INTERVAL_OPTIONS = [3, 4, 5, 6, 7, 8];

// "2025-03-15" + 6개월 → "2025-09-15"
// 1월 31일 + 1개월처럼 없는 날짜는 그 달의 마지막 날로 맞춤
function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const total = m - 1 + months;
  const year = y + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const DEFAULT_INTERVAL = 6; // 예시 데이터의 기본 납부 간격(개월)
const DEFAULT_AMOUNT = 120_000_000; // 회차별 기본 대출원금

// [수정] 날짜를 인자로 받고, id를 고정값으로 → 같은 날짜면 항상 같은 결과
function makeSeed(start: string): Installment[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `seed-${i}`,
    label: `${i + 1}차 중도금`,
    amount: DEFAULT_AMOUNT,
    paidOn: addMonths(start, DEFAULT_INTERVAL * i),
    ratePct: 4.6,
  }));
}

// [수정] 오늘 날짜를 브라우저에서만 읽기 위한 구독 함수 (변경 알림은 필요 없음)
const noopSubscribe = () => () => {};

export default function Calculator() {
  // [수정] 서버(빌드)에서는 "", 브라우저에서는 실제 오늘 날짜
  const today = useSyncExternalStore(noopSubscribe, todayISO, () => "");

  // [수정] 사용자가 아직 아무것도 안 건드렸으면 null → 오늘 기준 예시 데이터 표시
  const [editedRows, setEditedRows] = useState<Installment[] | null>(null);
  const [endDate, setEndDate] = useState<string>(""); // 비어 있으면 오늘 기준
  const [defaultRate, setDefaultRate] = useState<number>(4.6);
  const [defaultAmount, setDefaultAmount] = useState<number>(DEFAULT_AMOUNT);
  const [intervalMonths, setIntervalMonths] = useState<number | null>(
    DEFAULT_INTERVAL,
  );

  const seedRows = useMemo(() => (today ? makeSeed(today) : []), [today]);
  const rows = editedRows ?? seedRows;

  // 기존 setRows(prev => ...) 코드를 그대로 쓸 수 있게 감싼 함수
  function setRows(updater: (prev: Installment[]) => Installment[]) {
    setEditedRows((prev) => updater(prev ?? seedRows));
  }

  const lastPaidOn = rows[rows.length - 1]?.paidOn ?? "";
  const autoEndDate =
    lastPaidOn && intervalMonths
      ? addMonths(lastPaidOn, intervalMonths)
      : lastPaidOn;
  const baseDate = endDate || autoEndDate || today;

  const results = useMemo(
    () => (baseDate ? calcAll(rows, baseDate) : []),
    [rows, baseDate],
  );
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
        amount: defaultAmount,
        paidOn:
          intervalMonths && prev.length > 0 && prev[prev.length - 1].paidOn
            ? addMonths(prev[prev.length - 1].paidOn, intervalMonths)
            : today || todayISO(),
        ratePct: defaultRate,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function applyInterval(months: number) {
    setIntervalMonths(months);
    setRows((prev) => {
      const start = prev[0]?.paidOn;
      if (!start) return prev; // 1회차 날짜가 비어 있으면 아무것도 안 함
      return prev.map((r, i) => ({
        ...r,
        paidOn: addMonths(start, months * i),
      }));
    });
  }

  function changeStartDate(value: string) {
    if (!value) return; // [수정] 날짜를 지웠을 때 "" 로 계산되어 NaN 나오는 것 방지
    setRows((prev) =>
      prev.map((r, i) => {
        if (i === 0) return { ...r, paidOn: value };
        if (!intervalMonths) return r;
        return { ...r, paidOn: addMonths(value, intervalMonths * i) };
      }),
    );
  }

  function changeAmount(value: number) {
    setDefaultAmount(value);
    setRows((prev) => prev.map((r) => ({ ...r, amount: value })));
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
      <section className="py-8 border-b border-line grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[13px] text-ink-soft mb-2">1회차 중도금 납부일</p>
          <input
            type="date"
            value={rows[0]?.paidOn ?? ""}
            onChange={(e) => changeStartDate(e.target.value)}
            disabled={rows.length === 0}
            className="border border-line bg-paper-raised px-2 py-1 text-[14px] outline-none focus:border-line-strong tabular"
          />
        </div>
        <div>
          <p className="text-[13px] text-ink-soft mb-2">회차별 대출원금</p>
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              value={formatNumber(defaultAmount)}
              onChange={(e) => changeAmount(parseDigits(e.target.value))}
              className="w-36 border border-line bg-paper-raised px-2 py-1 text-[14px] text-right tabular outline-none focus:border-line-strong"
            />
            <span className="text-[14px] text-ink-soft">원</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft break-keep">
            모든 회차에 같은 금액이 들어가요. 회차마다 다르면 표에서 직접
            고쳐주세요.
          </p>
        </div>
        <div>
          <p className="text-[13px] text-ink-soft mb-2">잔금(입주) 예정일</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate || autoEndDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-line bg-paper-raised px-2 py-1 text-[14px] outline-none focus:border-line-strong tabular"
            />
            {endDate && (
              <button
                onClick={() => setEndDate("")}
                className="text-[12.5px] text-ink-soft hover:text-ink cursor-pointer"
              >
                되돌리기
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft break-keep">
            {endDate
              ? "이 날짜까지 쌓인 이자를 계산해요."
              : "마지막 회차 납부일에서 납부 간격만큼 지난 날로 계산해요. 실제 잔금일로 바꿀 수 있어요."}
          </p>
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

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-ink-soft mr-1">납부 간격</span>
          {INTERVAL_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => applyInterval(m)}
              className={`border px-3 py-1.5 text-[13px] cursor-pointer tabular ${
                intervalMonths === m
                  ? "border-ink bg-ink text-paper-raised"
                  : "border-line text-ink hover:border-line-strong"
              }`}
            >
              {m}개월
            </button>
          ))}
          <span className="text-[12.5px] text-ink-soft basis-full sm:basis-auto sm:ml-2">
            1회차 납부일을 기준으로 이후 회차 날짜를 채웁니다. 채운 뒤에도 직접
            수정할 수 있어요.
          </span>
        </div>

        <div className="overflow-x-auto border border-line-strong">
          <table className="w-full min-w-180 border-collapse text-[14px]">
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
              {rows.length === 0 && today && (
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
            label={baseDate ? `총 누적이자 (${baseDate} 기준)` : "총 누적이자"}
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
