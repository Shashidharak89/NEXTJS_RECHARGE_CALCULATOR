import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect.js";

export async function GET(req) {
    try {
        await dbConnect();
        return NextResponse.json({ loading: false }, { status: 200 });

    } catch (err) {

        return NextResponse.json({ loading: true }, { status: 400 });

    }

}