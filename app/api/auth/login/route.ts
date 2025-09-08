import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Simulate user authentication (in real app, check against database)
    const validUsers = [
      { id: "1", email: "demo@voicegen.com", password: "demo123", name: "Demo User" },
      { id: "2", email: "user@example.com", password: "password", name: "Test User" },
    ]

    const user = validUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create user session data (excluding password)
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
    }

    // In a real app, you'd create a JWT token or session
    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: "Login successful",
    })

    // Set a simple session cookie (in production, use secure JWT)
    response.cookies.set("voicegen-session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
