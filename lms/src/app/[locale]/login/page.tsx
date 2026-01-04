import { LoginForm } from "@/components/auth/LoginForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-muted/40">
      <LoginForm />
    </div>
  );
}
