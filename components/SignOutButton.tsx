

"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"; // if using shadcn

export default function SignOutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/signin" })}>
      Sign Out
    </Button>
  );
}
