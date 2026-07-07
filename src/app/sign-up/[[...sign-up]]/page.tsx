import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";

export const runtime = "edge";

export default function SignUpPage() {
	if (!isClerkConfigured) {
		return <AuthSetup title="Clerk sign-up is not configured" />;
	}

	return (
		<main className="grid min-h-screen place-items-center bg-[#f7fbff] px-5 py-16">
			<SignUp
				path="/sign-up"
				routing="path"
				signInUrl="/sign-in"
				forceRedirectUrl="/dashboard"
				fallbackRedirectUrl="/dashboard"
			/>
		</main>
	);
}

function AuthSetup({ title }: { title: string }) {
	return (
		<main className="grid min-h-screen place-items-center bg-[#f7fbff] px-5 py-16 text-[#102133]">
			<section className="max-w-xl rounded-[8px] border border-[#dbe7f3] bg-white p-6">
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="mt-3 leading-7 text-[#52677d]">
					Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to your environment, then restart the dev
					server.
				</p>
			</section>
		</main>
	);
}
