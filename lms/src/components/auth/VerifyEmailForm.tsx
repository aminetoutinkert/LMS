"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/routing";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function VerifyEmailForm() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("error.missingToken"));
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || t("error.generic"));
        }
        setStatus("success");
      } catch (err: unknown) {
        setStatus("error");
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage(t("error.generic"));
        }
      }
    };

    verify();
  }, [token, t]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p>{t("verifying")}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-center text-green-600">{t("successMessage")}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-center text-destructive">{message}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild>
          <Link href="/login">{t("backToLogin")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
