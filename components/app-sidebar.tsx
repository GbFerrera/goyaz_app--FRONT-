"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import {
  IconLayoutDashboard,
  IconUsers,
  IconShoppingCart,
  IconLogout,
  IconLayoutKanban,
  IconUserCheck
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/" || pathname === "/login") {
    return null;
  }
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token"); 
    }
    router.replace("/");
  };
  const links = [
     {
      label: "Administradores",
      href: "/admins",
      icon: (
        <IconUserCheck className="h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Clientes",
      href: "/clients",
      icon: (
        <IconUsers className="h-5 w-5 flex-shrink-0" />
      ),
    },
   
    {
      label: "Vendas",
      href: "/sales",
      icon: (
        <IconShoppingCart className="h-5 w-5 flex-shrink-0" />
      ),
    }, {
      label: "Kanban",
      href: "/kanban",
      icon: (
        <IconLayoutKanban className="h-5 w-5 flex-shrink-0" />
      ), 
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 relative overflow-hidden">
        {/* Imagem de Fundo com Opacidade */}
        {open && (
          <div className="absolute bottom-0 right-10 pointer-events-none flex items-end justify-end opacity-[0.08] select-none translate-x-1/4 translate-y-1/4">
            <Image 
              src="/icon-white.png" 
              alt="Background Icon" 
              width={350} 
              height={350}
              className="object-contain"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Sair",
              href: "/",
              onClick: handleLogout,
              icon: (
                <IconLogout className="h-5 w-5 flex-shrink-0" />
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex flex-col items-center justify-center text-sm py-1 relative z-20 w-full"
    >
      <Image 
        src="/logo.png" 
        alt="Goyaz" 
        width={280} 
        height={60}
        className="h-12 w-auto flex-shrink-0"
        priority
      />
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex items-center justify-center text-sm py-1 relative z-20 w-full"
    >
      <Image 
        src="/icon.png" 
        alt="Goyaz" 
        width={79} 
        height={79}
        className=" flex-shrink-0"
        priority
      />
    </Link>
  );
};
