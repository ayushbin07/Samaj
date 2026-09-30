"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import { RegisterForm } from "@/components/register-form"
import { Spinner } from "@/components/ui"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-bold text-xl text-[var(--color-text-primary)] hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm">
            <Play className="size-4 fill-current" aria-hidden="true" />
          </div>
          <span>Samaj</span>
        </Link>
        <Suspense
          fallback={
            <div className="h-72 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
