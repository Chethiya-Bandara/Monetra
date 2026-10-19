import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

interface SummaryCardsProps { balance: number; income: number; expense: number; }

export default function SummaryCards({ balance, income, expense }: SummaryCardsProps) {
  const format = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cards = [
    { label: "Total Balance", value: balance, icon: Wallet, tone: "balance", prefix: "" },
    { label: "Total Income", value: income, icon: ArrowUpRight, tone: "income", prefix: "+" },
    { label: "Total Expenses", value: expense, icon: ArrowDownRight, tone: "expense", prefix: "-" },
  ];
  return <div className="summary-grid">{cards.map(({ label, value, icon: Icon, tone, prefix }) => (
    <div className={`summary-card summary-${tone}`} key={label}>
      <div className="summary-icon"><Icon size={22} /></div>
      <div><p>{label}</p><h3>{prefix}Rs.{format(value)}</h3></div>
    </div>
  ))}</div>;
}
