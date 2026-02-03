import { NextResponse } from "next/server";
import { getWaitTimes } from "@/lib/data-service";

export async function GET() {
    try {
        const data = await getWaitTimes();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching wait times:", error);
        return NextResponse.json(
            { error: "Failed to fetch wait times" },
            { status: 500 }
        );
    }
}
