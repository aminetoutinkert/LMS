import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = verifyEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const { token } = result.data;

    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verification_token, token),
          gt(users.verification_token_expires, new Date())
        )
      );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
