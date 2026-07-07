import { getRandomFact, respondWithPetData } from "@/lib/pet-api";

export async function GET(request: Request) {
	return respondWithPetData(request, "/api/v1/facts/random", getRandomFact);
}
