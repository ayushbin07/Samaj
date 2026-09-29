"use client"

import { Suspense } from "react"
import Link from "next/link"
import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-bold text-xl text-[var(--color-text-primary)] hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <div className="flex size-9 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-black font-black shadow-md">
            ▶
          </div>
          <span>VideoTube</span>
        </Link>
        <Suspense
          fallback={
            <div className="h-72 flex items-center justify-center">
              <div className="size-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
