import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Invitation = {
  id: string;
  code: string;
  label: string | null;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  profile_nickname: string | null;
  couple_id: string | null;
};

const statusLabels: Record<string, string> = {
  pending: "대기중",
  accepted: "수락됨",
  expired: "만료됨",
};

export function CouplesTable({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 초대한 커플이 없습니다. 초대 링크를 생성해보세요.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>메모</TableHead>
          <TableHead>코드</TableHead>
          <TableHead>사용자</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>커플 매칭</TableHead>
          <TableHead>생성일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>{inv.label || "-"}</TableCell>
            <TableCell className="font-mono text-xs">{inv.code}</TableCell>
            <TableCell>{inv.profile_nickname || "-"}</TableCell>
            <TableCell>
              <Badge
                variant={inv.status === "accepted" ? "default" : "secondary"}
              >
                {statusLabels[inv.status]}
              </Badge>
            </TableCell>
            <TableCell>{inv.couple_id ? "완료" : "-"}</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(inv.created_at).toLocaleDateString("ko-KR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
