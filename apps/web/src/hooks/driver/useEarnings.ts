import { useCallback, useEffect, useState } from "react";

import {
  MOCK_TRANSACTIONS,
  MOCK_WEEKLY_EARNINGS,
  type EarningsDay,
  type TransactionRow,
} from "@/pages/driver/driverMock";

export type EarningsSummary = {
  weeklyTotal: number;
  baseFare: number;
  distanceBonus: number;
  tips: number;
  balance: number;
  nextPayoutDate: string;
  currency: string;
};

const POLL_MS = 30_000;

export function useEarnings() {
  const [days, setDays] = useState<EarningsDay[]>(MOCK_WEEKLY_EARNINGS);
  const [transactions, setTransactions] = useState<TransactionRow[]>(MOCK_TRANSACTIONS);
  const [summary, setSummary] = useState<EarningsSummary>(() => ({
    weeklyTotal: MOCK_WEEKLY_EARNINGS.reduce((a, d) => a + d.amount, 0),
    baseFare: 520,
    distanceBonus: 198,
    tips: 42,
    balance: 312.4,
    nextPayoutDate: "2026-04-22",
    currency: "MYR",
  }));
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: GET /driver/earnings/summary, /transactions
      await new Promise((r) => setTimeout(r, 150));
      setDays([...MOCK_WEEKLY_EARNINGS]);
      setTransactions([...MOCK_TRANSACTIONS]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { days, transactions, summary, loading, refresh };
}
