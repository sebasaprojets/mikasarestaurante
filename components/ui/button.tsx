import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-3 whitespace-nowrap font-sans text-[0.72rem] font-medium uppercase tracking-[0.24em] transition-[color,background-color,border-color,opacity] duration-700 ease-[var(--ease-mikasa)] disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ouro text-sumi hover:bg-ouro-claro rounded-[var(--radius-xs)]",
        outline:
          "border border-line-strong text-washi hover:border-ouro hover:text-ouro-claro rounded-[var(--radius-xs)]",
        ghost: "text-washi hover:text-ouro-claro",
        link: "px-0 text-washi hover:text-ouro-claro after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-ouro after:transition-transform after:duration-700 after:ease-[var(--ease-mikasa)] hover:after:scale-x-100 after:scale-x-[0.35]",
      },
      size: {
        sm: "h-10 px-5",
        md: "h-12 px-7",
        lg: "h-14 px-9",
        icon: "size-11",
        none: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
