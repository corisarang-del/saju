import { adjustUserStars, getAdminStarUserProfile } from "@/services/admin/stars";
import { requireAdminOrRedirect } from "@/utils/auth/adminGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    email?: string;
    status?: string;
    balance?: string;
    message?: string;
  }>;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusMessage({
  status,
  balance,
  message,
}: {
  status?: string;
  balance?: string;
  message?: string;
}): string {
  if (status === "credit") {
    return `충전했어. 현재 잔액은 ${Number(balance ?? 0).toLocaleString("ko-KR")}개야.`;
  }

  if (status === "debit") {
    return `차감했어. 현재 잔액은 ${Number(balance ?? 0).toLocaleString("ko-KR")}개야.`;
  }

  if (status === "user-not-found") {
    return "해당 이메일의 유저를 찾지 못했어.";
  }

  if (status === "missing-email") {
    return "이메일을 입력해줘.";
  }

  if (status === "error") {
    return message ?? "처리 중 문제가 생겼어.";
  }

  return "";
}

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  await requireAdminOrRedirect(`/${locale}`);

  const email = query.email?.trim().toLowerCase() ?? "";
  const statusMessage = getStatusMessage(query);
  const profile = email ? await getAdminStarUserProfile(email) : null;

  return (
    <main className="min-h-[100dvh] bg-[#f7f3ea] px-4 py-8 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-2 border-b border-stone-200 pb-5">
          <p className="text-sm font-semibold text-purple-800">월간사주 Admin</p>
          <h1 className="text-2xl font-extrabold tracking-tight">별 잔액 관리</h1>
        </header>

        <Card className="border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>유저 검색</CardTitle>
            <CardDescription>이메일로 유저를 찾고 별 잔액을 확인해.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={`/${locale}/admin`} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="admin-email">이메일</Label>
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  defaultValue={email}
                  className="bg-white"
                />
              </div>
              <Button type="submit" className="self-end bg-purple-700 text-white hover:bg-purple-600">
                검색
              </Button>
            </form>
          </CardContent>
        </Card>

        {statusMessage && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-purple-900">
            {statusMessage}
          </div>
        )}

        {email && !profile && (
          <Card className="border-stone-200 bg-white">
            <CardContent className="py-6 text-sm text-slate-500">
              검색 결과가 없어.
            </CardContent>
          </Card>
        )}

        {profile && (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Card className="border-stone-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>{profile.email}</CardTitle>
                <CardDescription>유저 ID: {profile.id}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">현재 별</p>
                    <p className="mt-1 text-2xl font-extrabold">
                      {profile.balance.toLocaleString("ko-KR")}개
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">가입일</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(profile.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">최근 로그인</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(profile.lastSignInAt)}</p>
                  </div>
                </div>

                <section className="grid gap-3">
                  <h2 className="text-base font-bold">최근 거래 로그</h2>
                  <div className="overflow-hidden rounded-lg border border-stone-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 text-xs text-slate-500">
                        <tr>
                          <th className="px-3 py-2">일시</th>
                          <th className="px-3 py-2">유형</th>
                          <th className="px-3 py-2 text-right">변동</th>
                          <th className="px-3 py-2 text-right">잔액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {profile.transactions.length === 0 ? (
                          <tr>
                            <td className="px-3 py-5 text-center text-slate-500" colSpan={4}>
                              거래 로그가 없어.
                            </td>
                          </tr>
                        ) : (
                          profile.transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="px-3 py-2 text-slate-600">{formatDate(transaction.createdAt)}</td>
                              <td className="px-3 py-2">
                                {transaction.productType ?? transaction.type}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold">
                                {transaction.amount > 0 ? "+" : ""}
                                {transaction.amount.toLocaleString("ko-KR")}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {transaction.balanceAfter.toLocaleString("ko-KR")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>별 충전/차감</CardTitle>
                <CardDescription>실제 잔액을 바꾸고 거래 로그를 남겨.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={adjustUserStars} className="grid gap-4">
                  <input type="hidden" name="email" value={profile.email} />
                  <input type="hidden" name="locale" value={locale} />

                  <div className="grid gap-2">
                    <Label htmlFor="amount">수량</Label>
                    <Input id="amount" name="amount" inputMode="numeric" pattern="[0-9]*" placeholder="10000" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="submit"
                      name="mode"
                      value="credit"
                      className="bg-purple-700 text-white hover:bg-purple-600"
                    >
                      충전
                    </Button>
                    <Button
                      type="submit"
                      name="mode"
                      value="debit"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      차감
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
