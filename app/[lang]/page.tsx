import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";
import { ModeToggle } from "@/components/modeToggle";
export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <p>{dict.hello}</p>
      <ModeToggle />
    </div>
  );
}