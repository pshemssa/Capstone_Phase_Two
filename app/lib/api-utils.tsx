import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "../generated/prisma/runtime/client";

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    return NextResponse.json(
      { 
        error: firstError?.message || "Validation error",
        details: error.issues 
      },
      { status: 400 }
    );
  }

  // Prisma known errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as PrismaClientKnownRequestError;

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      const target = (prismaError.meta?.target as string[]) || [];
      return NextResponse.json(
        { error: `${target.join(", ")} already exists` },
        { status: 409 }
      );
    }

    // Record not found
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Foreign key constraint
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "Related record not found" },
        { status: 400 }
      );
    }
  // Prisma validation errors
  if (typeof error === "object" && error !== null && (error as any)?.name === "PrismaClientValidationError") {
    return NextResponse.json(
      { error: "Invalid data provided" },
      { status: 400 }
    );
  }
    ;
  }

  // Generic error
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    { 
      success: true,
      ...(message && { message }),
      data 
    },
    { status }
  );
}