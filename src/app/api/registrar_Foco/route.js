import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma-client"

export async function GET() {
    
    const registros = await prisma.registro.findMany()
    return NextResponse.json(registros)

}

export async function POST(req) {
    const data = await req.json()
    const newRegistro = await prisma.registro.create({data})
    return NextResponse.json(newRegistro)
}