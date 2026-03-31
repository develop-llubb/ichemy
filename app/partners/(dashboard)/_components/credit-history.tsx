import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { BefePartnerCreditTransaction } from "@/db/schema";

const typeLabels: Record<string, string> = {
  purchase: "구매",
  deduction: "사용",
  refund: "환불",
  adjustment: "조정",
};

export function CreditHistory({
  transactions,
}: {
  transactions: BefePartnerCreditTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">거래 내역이 없습니다.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>유형</TableHead>
          <TableHead>수량</TableHead>
          <TableHead>잔액</TableHead>
          <TableHead>설명</TableHead>
          <TableHead>일시</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <Badge
                variant={tx.amount > 0 ? "default" : "secondary"}
              >
                {typeLabels[tx.type]}
              </Badge>
            </TableCell>
            <TableCell
              className={tx.amount > 0 ? "text-green-600" : "text-red-600"}
            >
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
            </TableCell>
            <TableCell>{tx.balance_after}</TableCell>
            <TableCell className="text-sm">{tx.description || "-"}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(tx.created_at).toLocaleString("ko-KR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
