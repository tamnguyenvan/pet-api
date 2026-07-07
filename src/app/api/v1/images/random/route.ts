import { getRandomImage, respondWithPetData } from "@/lib/pet-api";

export const runtime = "edge";

export async function GET(request: Request) {
	return respondWithPetData(request, "/api/v1/images/random", getRandomImage);
}
