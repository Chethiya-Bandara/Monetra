export interface Transaction {
  id: string;
  text: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}