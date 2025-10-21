import { LayoutList, Scissors, Shield, UsersRound } from "lucide-react";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Agendamentos",
    url: "#",
    icon: LayoutList,
  },
  {
    title: "Serviços",
    url: "#",
    icon: Scissors,
  },
  {
    title: "Funcionários",
    url: "#",
    icon: UsersRound,
  },
];

const items2 = [
  {
    title: "Adiministradores",
    url: "#",
    icon: Shield,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="">
            <Image
              src="/assets/header-logo.svg"
              alt="BarberFy Logo"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Barbearia</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupLabel>Segurança</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items2.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <div className="text-muted-foreground mt-4 h-13 text-center text-xs">
          &copy; © 2025 BarberFy - Todos os direitos reservados.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
