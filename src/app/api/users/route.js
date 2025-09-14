import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma-client"

export async function GET() {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)

}

export async function POST(req) {
    const data = await req.json()
    const newUser = await prisma.user.create({data})
    return NextResponse.json(newUser)
}