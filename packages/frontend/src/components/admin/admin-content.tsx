"use client";

import { motion } from "framer-motion";
import { AnimatedPageContainer } from "@/components/admin/animations";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminContentProps {
  children: React.ReactNode;
}

export function AdminContent({ children }: AdminContentProps) {
  return (
    <>
      <motion.header
        className="h-16 flex shrink-0 items-center gap-2 border-b bg-background px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1" />
      </motion.header>

      <AnimatedPageContainer className="flex-1 p-6">
        {children}
      </AnimatedPageContainer>
    </>
  );
}