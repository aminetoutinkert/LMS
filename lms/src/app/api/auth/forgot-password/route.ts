import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const { email } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // Return 200 to prevent email enumeration
      return NextResponse.json(
        { message: "If an account exists, an email has been sent." },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        reset_token: token,
        reset_token_expires: expires,
      })
      .where(eq(users.id, user.id));

    // Todo: Send email
    // For now, log it
    console.log(`[DEV] Reset token for ${email}: ${token}`);

    return NextResponse.json(
      { message: "If an account exists, an email has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
