import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Simulate checking if user already exists
    const existingUsers = ["demo@voicegen.com", "user@example.com"]
    if (existingUsers.includes(email)) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user (in real app, save to database)
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
    }

    // Create user session data
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    }

    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: "Account created successfully",
    })

    // Set session cookie
    response.cookies.set("voicegen-session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
