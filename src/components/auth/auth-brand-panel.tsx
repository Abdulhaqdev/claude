"use client";

import { motion } from "framer-motion";
import { Command, Package, Users, Warehouse, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "ERP",
    description: "Products, sales, invoices & finance in one flow",
  },
  {
    icon: Users,
    title: "CRM",
    description: "Leads, deals & customer relationships",
  },
  {
    icon: Warehouse,
    title: "WMS",
    description: "Inventory, transfers & warehouse ops",
  },
];

const stats = [
  { value: "3-in-1", label: "Unified platform" },
  { value: "Real-time", label: "Inventory sync" },
  { value: "Multi-tenant", label: "Team workspaces" },
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#0a0a12] p-12 text-white lg:flex">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-violet-600/25 blur-[100px]" />
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
          <Command className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight">Nexus</span>
          <p className="text-xs text-white/50">Wholesale Platform</p>
        </div>
      </motion.div>

      <div className="relative space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Built for clothing wholesale
          </div>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
            Run your wholesale
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-white to-violet-300 bg-clip-text text-transparent">
              business from one place.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
            ERP, CRM, and Warehouse Management unified in a single premium platform
            designed for modern wholesale teams.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="space-y-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
              className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/[0.05]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-0.5 text-sm text-white/45">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex gap-8 border-t border-white/[0.06] pt-8"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </motion.div> */}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative text-sm text-white/30"
      >
        © {new Date().getFullYear()} Nexus Platform. All rights reserved.
      </motion.p>
    </div>
  );
}
