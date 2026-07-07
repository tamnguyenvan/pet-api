import { respondWithPetData, searchPets } from "@/lib/pet-api";

export async function GET(request: Request) {
	return respondWithPetData(request, "/api/v1/search", searchPets);
}
