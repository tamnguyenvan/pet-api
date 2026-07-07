import { NextResponse } from "next/server";
import { logUsageEvent, validatePetApiKey } from "./api-keys";

const images = [
	{
		id: "pet_img_9a41",
		species: "dog",
		breed: "shiba inu",
		image_url: "https://cdn.petapi.cloud/dogs/shiba-9931.jpg",
		metadata: { width: 1600, height: 1067, tags: ["alert", "outdoor", "family-friendly"] },
	},
	{
		id: "pet_img_31bf",
		species: "cat",
		breed: "maine coon",
		image_url: "https://cdn.petapi.cloud/cats/maine-coon-3182.jpg",
		metadata: { width: 1400, height: 933, tags: ["long-hair", "indoor", "gentle"] },
	},
];

const breeds = [
	{ species: "dog", slug: "shiba-inu", name: "Shiba Inu", temperament: ["alert", "loyal", "independent"], origin: "Japan", size: "small-medium" },
	{ species: "cat", slug: "maine-coon", name: "Maine Coon", temperament: ["gentle", "social", "adaptable"], origin: "United States", size: "large" },
	{ species: "dog", slug: "golden-retriever", name: "Golden Retriever", temperament: ["friendly", "reliable", "active"], origin: "Scotland", size: "large" },
];

const facts = [
	{ species: "cat", fact: "Cats have a specialized collarbone that helps them squeeze through narrow spaces." },
	{ species: "dog", fact: "Dogs can learn hundreds of words and gestures with consistent training." },
	{ species: "dog", fact: "A dog's nose print is unique, similar to a human fingerprint." },
];

export async function respondWithPetData<T>(request: Request, endpoint: string, payloadFactory: (url: URL) => T) {
	const startedAt = Date.now();
	const validation = await validatePetApiKey(request);
	const requestId = crypto.randomUUID();

	if (!validation.ok) {
		return validation.response;
	}

	const payload = payloadFactory(new URL(request.url));
	const latencyMs = Date.now() - startedAt;

	await logUsageEvent({
		apiKey: validation.demo ? null : validation.apiKey,
		endpoint,
		method: request.method,
		statusCode: 200,
		latencyMs,
		requestId,
		metadata: { demo: validation.demo },
	});

	return NextResponse.json(
		{
			data: payload,
			meta: {
				request_id: requestId,
				latency_ms: latencyMs,
				mode: validation.demo ? "demo" : "live",
			},
		},
		{
			headers: {
				"x-request-id": requestId,
			},
		},
	);
}

export function getRandomImage(url: URL) {
	const species = url.searchParams.get("species");
	const breed = url.searchParams.get("breed");
	const candidates = images.filter((image) => (!species || image.species === species) && (!breed || image.breed.replace(/\s+/g, "-") === breed));

	return candidates[0] ?? images[0];
}

export function getBreeds(url: URL) {
	const species = url.searchParams.get("species");
	const size = url.searchParams.get("size");

	return breeds.filter((breed) => (!species || breed.species === species) && (!size || breed.size === size));
}

export function getRandomFact(url: URL) {
	const species = url.searchParams.get("species");
	const candidates = facts.filter((fact) => !species || fact.species === species);

	return candidates[0] ?? facts[0];
}

export function searchPets(url: URL) {
	const query = (url.searchParams.get("query") ?? "").toLowerCase();

	return {
		images: images.filter((image) => `${image.species} ${image.breed} ${image.metadata.tags.join(" ")}`.toLowerCase().includes(query)),
		breeds: breeds.filter((breed) => `${breed.species} ${breed.name} ${breed.temperament.join(" ")}`.toLowerCase().includes(query)),
		facts: facts.filter((fact) => `${fact.species} ${fact.fact}`.toLowerCase().includes(query)),
	};
}
