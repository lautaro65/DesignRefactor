import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";

export default async function NotFoundPage({ params }: PageProps<'/[lang]/[...not-found]'>) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <p>404</p>
    </div>
  );
}
