import { AuthForm } from "@/components/features/auth/AuthForm";
import { getAuthErrorMessage } from "@/lib/auth/error-message";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = getAuthErrorMessage(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      <AuthForm errorMessage={errorMessage} />
    </div>
  );
}
