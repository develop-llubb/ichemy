import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCardIcon, UsersIcon, FileTextIcon } from "lucide-react";

export function PartnerStats({
  creditBalance,
  coupleCount,
  reportCount,
}: {
  creditBalance: number;
  coupleCount: number;
  reportCount: number;
}) {
  return (
    <div className="grid gap-4 px-4 sm:grid-cols-3 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">잔여 크레딧</CardTitle>
          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{creditBalance}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">초대한 커플</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coupleCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">생성된 리포트</CardTitle>
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{reportCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
