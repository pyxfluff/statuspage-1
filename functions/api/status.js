// Copyright (c) 2024 iiPython

export async function onRequestGet(context) {
    return new Response(await context.env.statuspage_data.get("records"));
}
