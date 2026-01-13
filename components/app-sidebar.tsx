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
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
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
      className="font-normal flex space-x-3 items-center text-sm py-1 relative z-20"
    >
      <Image 
        src="/logo.png" 
        alt="Reserva Legal" 
        width={40} 
        height={40}
        className="flex-shrink-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-white text-3xl"
      >
        Goyaz

        <p className="text-[10px] text-white/70 font-medium tracking-wider uppercase">Regularização fundiária e ambiental</p>
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex items-center text-sm py-1 relative z-20"
    >
      <Image 
        src="/logo.png" 
        alt="Reserva Legal" 
        width={40} 
        height={40}
        className="flex-shrink-0"
      />
    </Link>
  );
};
