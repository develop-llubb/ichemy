"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { BefePartnerInvitation } from "@/db/schema";

const statusLabels: Record<string, string> = {
  pending: "대기중",
  accepted: "수락됨",
  expired: "만료됨",
};

export function InviteList({
  invitations,
}: {
  invitations: BefePartnerInvitation[];
}) {
  const copyLink = (code: string) => {
    const url = `${window.location.origin}/partner-invite/${code}`;
    navigator.clipboard.writeText(url);
    toast("초대 링크가 복사되었습니다.");
  };

  if (invitations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 생성된 초대 링크가 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>메모</TableHead>
          <TableHead>코드</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>만료일</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>{inv.label || "-"}</TableCell>
            <TableCell className="font-mono text-xs">{inv.code}</TableCell>
            <TableCell>
              <Badge
                variant={inv.status === "accepted" ? "default" : "secondary"}
              >
                {statusLabels[inv.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {inv.expires_at
                ? new Date(inv.expires_at).toLocaleDateString("ko-KR")
                : "-"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(inv.created_at).toLocaleDateString("ko-KR")}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(inv.code)}
              >
                복사
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
