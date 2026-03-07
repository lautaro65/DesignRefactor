'use client'

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDictionary, hasLocale } from "./dictionaries";

export default function NotFound() {
  const { lang } = useParams<{ lang: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <p>404 - Not foundaa</p>
    </div>
  );
}