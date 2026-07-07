export async function sha256Hex(value: string) {
	const data = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest("SHA-256", data);

	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

export function createApiKeySecret() {
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);
	const token = Array.from(bytes)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");

	return `pet_live_${token}`;
}

export function getApiKeyPrefix(secret: string) {
	return `${secret.slice(0, 12)}...${secret.slice(-4)}`;
}

export function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
