import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "auth.forgotPassword" });
  return {
    title: t("title"),
  };
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ForgotPasswordForm />
    </div>
  );
}
