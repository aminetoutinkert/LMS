import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const { token, password } = result.data;

    // Find user with valid token
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.reset_token, token),
          gt(users.reset_token_expires, new Date())
        )
      );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
