import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "auth.verifyEmail" });
  return {
    title: t("title"),
  };
}

export default function VerifyEmailPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <VerifyEmailForm />
    </div>
  );
}
