"use client";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Title } from "@/components/title";
import { useRouter } from "next/navigation";

type PageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  protected?: boolean;
};

export function PageLayout({
  title,
  description = "",
  children,
  className,
  contentClassName,
  protected: isProtected = true,
}: PageLayoutProps) {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433";

  useEffect(() => {
    if (!isProtected) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    const validate = async () => {
      try {
        const res = await fetch(`${API_BASE}/sessions/validate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          router.replace("/");
        }
      } catch {
        localStorage.removeItem("token");
        router.replace("/");
      }
    };
    validate();
  }, [isProtected, router]);

  return (
    <section
      className={cn(
        "w-full",
        className
      )}
    >
      <div className="mx-auto w-full p-6 md:p-10 space-y-6">
     
          <Title title={title} description={description} />
    
        <div className={cn(contentClassName)}>
          {children}
        </div>
      </div>
    </section>
  );
}
