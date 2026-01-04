import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("auth.login"); // Using existing translations for now just to prove it works, or simple text

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
         <h1 className="text-4xl font-bold">EduFlow LMS</h1>
         <p className="text-xl">
           Welcome / Bienvenue / مرحبا
         </p>
         <div className="flex gap-4">
            <a href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Login
            </a>
            <a href="/register" className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
              Register
            </a>
         </div>
      </main>
    </div>
  );
}
