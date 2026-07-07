import Link from "next/link";
import {
	Activity,
	ArrowRight,
	BarChart3,
	BookOpen,
	Bot,
	CheckCircle2,
	CircleGauge,
	Cloud,
	Code2,
	Database,
	FileText,
	Gauge,
	ImageIcon,
	KeyRound,
	LifeBuoy,
	LockKeyhole,
	MessageCircleQuestion,
	PawPrint,
	Search,
	ShieldCheck,
	Sparkles,
	Users,
	Zap,
} from "lucide-react";
import FaqAccordion from "./components/faq-accordion";
import SupportChat from "./components/support-chat";

const stats = [
	{ label: "Platform uptime", value: "99.98%", icon: Activity },
	{ label: "API requests served", value: "412M+", icon: Zap },
	{ label: "Developer accounts", value: "38k+", icon: Users },
	{ label: "Pet data categories", value: "24", icon: Database },
];

const features = [
	{
		title: "Cat and dog images",
		description: "Production-ready image URLs with species, breed, orientation, and safety metadata.",
		icon: ImageIcon,
	},
	{
		title: "Breed information",
		description: "Normalized breed profiles with temperament, size, origin, care notes, and aliases.",
		icon: PawPrint,
	},
	{
		title: "Random pet facts",
		description: "Lightweight facts endpoint for onboarding flows, games, education apps, and chat products.",
		icon: Sparkles,
	},
	{
		title: "Search and filtering",
		description: "Filter by species, breed, age group, coat, source, tags, and freshness windows.",
		icon: Search,
	},
	{
		title: "REST API access",
		description: "Simple JSON endpoints that work from any stack, CLI, backend job, or frontend prototype.",
		icon: Code2,
	},
	{
		title: "API keys and limits",
		description: "Scoped keys, environment labels, per-plan quotas, and clear 429 responses for rate limits.",
		icon: KeyRound,
	},
	{
		title: "Fast response time",
		description: "Edge-cached lookups keep common pet data and image metadata responsive across regions.",
		icon: Gauge,
	},
	{
		title: "Hosted infrastructure",
		description: "Managed ingestion, monitoring, backups, and support workflows without extra operations work.",
		icon: Cloud,
	},
];

const endpointExamples = [
	"GET /v1/images/random?species=dog&breed=shiba-inu",
	"GET /v1/breeds?species=cat&size=medium",
	"GET /v1/facts/random?species=dog",
	"GET /v1/search?query=calm%20family%20cat",
];

const userDashboardItems = [
	"Account overview",
	"API key management",
	"Usage analytics",
	"Billing and subscription status",
	"Request logs",
	"Documentation access",
	"Support chat history",
];

const adminDashboardItems = [
	"Manage users",
	"Manage subscriptions",
	"View API usage",
	"Monitor support questions",
	"Manage documentation",
	"Upload or edit knowledge base documents",
	"Re-index documents for RAG",
	"Review AI assistant answer quality",
];

const saasFeatures = [
	{ label: "Authentication", icon: LockKeyhole },
	{ label: "User profiles", icon: Users },
	{ label: "Teams and organizations", icon: Users },
	{ label: "Role-based access control", icon: ShieldCheck },
	{ label: "Subscription plans", icon: CheckCircle2 },
	{ label: "Billing management", icon: FileText },
	{ label: "API rate limits", icon: CircleGauge },
	{ label: "Usage tracking", icon: BarChart3 },
	{ label: "Email notifications", icon: MessageCircleQuestion },
	{ label: "Admin controls", icon: ShieldCheck },
];

const howItWorks = [
	{ step: "Sign up", icon: Users },
	{ step: "Get API key", icon: KeyRound },
	{ step: "Call the API", icon: Code2 },
	{ step: "Track usage", icon: BarChart3 },
	{ step: "Ask AI assistant", icon: Bot },
];

const plans = [
	{
		name: "Free",
		price: "$0",
		description: "For prototypes, hackathons, and weekend builds.",
		requests: "10,000 requests/month",
		support: "Community support",
		assistant: "AI assistant for docs questions",
		features: ["One API key", "Basic dashboard", "Public documentation", "Standard rate limits"],
	},
	{
		name: "Pro",
		price: "$29",
		description: "For production apps that need higher limits.",
		requests: "500,000 requests/month",
		support: "Priority email support",
		assistant: "AI assistant with account-aware guidance",
		features: ["Five API keys", "Usage analytics", "Request logs", "Billing portal"],
		featured: true,
	},
	{
		name: "Business",
		price: "Custom",
		description: "For teams, marketplaces, and high-volume products.",
		requests: "Custom request limits",
		support: "Dedicated support channel",
		assistant: "AI assistant with admin review tools",
		features: ["Team roles", "SLA options", "Custom data workflows", "Admin dashboard"],
	},
];

const faqs = [
	{
		question: "How do API keys work?",
		answer:
			"Each account can create environment-specific API keys from the dashboard. Keys are sent with the Authorization header and can be rotated or revoked at any time.",
	},
	{
		question: "What happens when I hit a rate limit?",
		answer:
			"PetAPI Cloud returns a clear 429 response with limit, reset, and retry metadata so your application can back off safely.",
	},
	{
		question: "Where does the pet data come from?",
		answer:
			"Data is normalized from licensed public datasets, partner sources, and curated internal records before it is enriched with metadata and quality checks.",
	},
	{
		question: "Can billing be managed from the dashboard?",
		answer:
			"Yes. Users can view plan status, invoices, payment details, usage, and upgrade paths from the billing area.",
	},
	{
		question: "How does the RAG support assistant work?",
		answer:
			"The assistant retrieves relevant documentation and support snippets from the knowledge base, sends those snippets to the configured AI provider, and cites the source material used for the answer.",
	},
	{
		question: "Can admins upload support documents?",
		answer:
			"Admins can upload or edit documentation, re-index the vector store, monitor support questions, and review assistant answer quality.",
	},
];

const petThumbnails = [
	{
		label: "Golden retriever API image",
		url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=420&q=80",
	},
	{
		label: "Orange cat API image",
		url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=420&q=80",
	},
	{
		label: "Dog portrait API image",
		url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=420&q=80",
	},
];

const apiResponse = `{
  "id": "pet_img_9a41",
  "species": "dog",
  "breed": "shiba inu",
  "image_url": "https://cdn.petapi.cloud/dogs/shiba-9931.jpg",
  "metadata": {
    "width": 1600,
    "height": 1067,
    "tags": ["alert", "outdoor", "family-friendly"]
  },
  "latency_ms": 42
}`;

export default function Home() {
	return (
		<main className="min-h-screen overflow-hidden bg-[#f7fbff] text-[#102133]">
			<header className="sticky top-0 z-40 border-b border-[#dbe7f3] bg-white/92 backdrop-blur">
				<nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8" aria-label="Primary">
					<a className="flex items-center gap-3 font-semibold" href="#top" aria-label="PetAPI Cloud home">
						<span className="grid size-10 place-items-center rounded-[8px] bg-[#1e7f86] text-sm font-bold text-white">
							PA
						</span>
						<span>PetAPI Cloud</span>
					</a>
					<div className="hidden items-center gap-7 text-sm font-medium text-[#40566d] md:flex">
						<a className="hover:text-[#1e7f86]" href="#features">
							Features
						</a>
						<a className="hover:text-[#1e7f86]" href="#developer-experience">
							Docs
						</a>
						<a className="hover:text-[#1e7f86]" href="#pricing">
							Pricing
						</a>
						<a className="hover:text-[#1e7f86]" href="#faq">
							FAQ
						</a>
					</div>
					<div className="flex items-center gap-2">
						<Link
							className="hidden rounded-[8px] px-3 py-2 text-sm font-semibold text-[#40566d] transition hover:text-[#1e7f86] sm:inline-flex"
							href="/sign-in"
						>
							Log in
						</Link>
						<Link
							className="inline-flex items-center gap-2 rounded-[8px] bg-[#102133] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1e7f86]"
							href="/sign-up"
						>
							Sign up
							<ArrowRight className="size-4" aria-hidden="true" />
						</Link>
					</div>
				</nav>
			</header>

			<section id="top" className="relative border-b border-[#dbe7f3] bg-white">
				<div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
					<div className="reveal-soft">
						<p className="mb-5 inline-flex rounded-[8px] border border-[#b9e1e1] bg-[#edfafa] px-3 py-1 text-sm font-semibold text-[#1e7f86]">
							Reliable cat and dog data for product teams
						</p>
						<h1 className="max-w-4xl text-5xl font-bold leading-[1.04] text-[#102133] sm:text-6xl lg:text-7xl">
							Fast Cat/Dog APIs for developers who need clean pet data.
						</h1>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-[#52677d]">
							PetAPI Cloud serves pet images, breeds, facts, metadata, search, and usage tooling through
							simple APIs backed by a SaaS dashboard and AI support assistant.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Link
								className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#e85d4f] px-6 py-3 text-center font-semibold text-white shadow-[0_12px_30px_rgba(232,93,79,0.28)] transition hover:-translate-y-0.5 hover:bg-[#d84c40]"
								href="/sign-up"
							>
								Sign up free
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
							<a
								className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#b7c8d9] bg-white px-6 py-3 text-center font-semibold text-[#102133] transition hover:-translate-y-0.5 hover:border-[#1e7f86] hover:text-[#1e7f86]"
								href="#developer-experience"
							>
								<BookOpen className="size-4" aria-hidden="true" />
								View Docs
							</a>
							<Link
								className="rounded-[8px] border border-transparent px-6 py-3 text-center font-semibold text-[#40566d] transition hover:text-[#1e7f86]"
								href="/sign-in"
							>
								Log in
							</Link>
						</div>
						<div className="mt-8 flex flex-wrap gap-3 text-sm text-[#52677d]">
							<span className="inline-flex items-center gap-2 rounded-[8px] border border-[#dbe7f3] bg-[#f7fbff] px-3 py-2">
								<Code2 className="size-4 text-[#1e7f86]" aria-hidden="true" />
								REST JSON API
							</span>
							<span className="inline-flex items-center gap-2 rounded-[8px] border border-[#dbe7f3] bg-[#f7fbff] px-3 py-2">
								<KeyRound className="size-4 text-[#1e7f86]" aria-hidden="true" />
								API key auth
							</span>
							<span className="inline-flex items-center gap-2 rounded-[8px] border border-[#dbe7f3] bg-[#f7fbff] px-3 py-2">
								<Bot className="size-4 text-[#1e7f86]" aria-hidden="true" />
								RAG support
							</span>
						</div>
					</div>

					<div className="reveal-soft reveal-soft-delay-1 rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-3 shadow-[0_24px_70px_rgba(16,33,51,0.14)]">
						<div className="rounded-[8px] border border-[#dbe7f3] bg-[#102133] p-4 text-white">
							<div className="mb-4 flex items-center justify-between gap-4">
								<div>
									<p className="text-sm font-semibold text-[#9fe5df]">API response preview</p>
									<p className="text-xs text-[#b7c8d9]">GET /v1/images/random</p>
								</div>
								<span className="rounded-[8px] bg-[#1e7f86] px-3 py-1 text-xs font-semibold">200 OK</span>
							</div>
							<pre className="overflow-x-auto rounded-[8px] bg-[#07131f] p-4 text-xs leading-6 text-[#d7e6f4]">
								<code>{apiResponse}</code>
							</pre>
						</div>
						<div className="grid grid-cols-3 gap-3 pt-3">
							{petThumbnails.map((pet) => (
								<div
									key={pet.label}
									aria-label={pet.label}
									role="img"
									className="h-24 rounded-[8px] bg-cover bg-center sm:h-32"
									style={{ backgroundImage: `url(${pet.url})` }}
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="bg-[#f7fbff] px-5 py-10 sm:px-8" aria-label="Social proof">
				<div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{stats.map((stat) => (
						<div key={stat.label} className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,33,51,0.08)]">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-3xl font-bold text-[#102133]">{stat.value}</p>
									<p className="mt-2 text-sm font-medium text-[#52677d]">{stat.label}</p>
								</div>
								<span className="grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
									<stat.icon className="size-5" aria-hidden="true" />
								</span>
							</div>
						</div>
					))}
				</div>
			</section>

			<section id="features" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="max-w-3xl">
						<p className="text-sm font-bold uppercase text-[#1e7f86]">Platform features</p>
						<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
							Everything developers expect from a pet data platform.
						</h2>
						<p className="mt-5 text-lg leading-8 text-[#52677d]">
							Ship pet-powered products without maintaining image pipelines, breed tables, API keys, or
							support documentation from scratch.
						</p>
					</div>
					<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature) => (
							<article key={feature.title} className="group rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#b7c8d9] hover:bg-white hover:shadow-[0_18px_45px_rgba(16,33,51,0.08)]">
								<div className="mb-5 grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86] ring-1 ring-[#b9e1e1] transition duration-300 group-hover:bg-[#1e7f86] group-hover:text-white">
									<feature.icon className="size-5" aria-hidden="true" />
								</div>
								<h3 className="text-lg font-bold">{feature.title}</h3>
								<p className="mt-3 text-sm leading-6 text-[#52677d]">{feature.description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section id="ai-assistant" className="border-y border-[#dbe7f3] bg-[#edfafa] px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
					<div>
						<p className="text-sm font-bold uppercase text-[#1e7f86]">AI support assistant</p>
						<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
							Support answers grounded in your product docs.
						</h2>
						<p className="mt-5 text-lg leading-8 text-[#40566d]">
							The floating chat bubble lets users ask about pricing, API usage, account setup, billing,
							troubleshooting, and documentation. The assistant retrieves relevant knowledge base chunks,
							answers with the configured AI provider, and cites the content used.
						</p>
					</div>
					<div className="rounded-[8px] border border-[#b9e1e1] bg-white p-5 shadow-[0_18px_50px_rgba(30,127,134,0.16)]">
						<div className="mb-5 flex items-center justify-between">
							<div>
								<p className="font-bold">PetAPI Assistant</p>
								<p className="text-sm text-[#52677d]">Retrieved from docs, pricing, and support KB</p>
							</div>
							<span className="inline-flex items-center gap-1 rounded-[8px] bg-[#e8f6f7] px-3 py-1 text-xs font-bold text-[#1e7f86]">
								<Bot className="size-3.5" aria-hidden="true" />
								RAG
							</span>
						</div>
						<div className="space-y-3">
							<div className="max-w-[85%] rounded-[8px] bg-[#f1f6fb] p-4 text-sm leading-6 text-[#40566d]">
								How do I authenticate image requests from a production backend?
							</div>
							<div className="ml-auto max-w-[88%] rounded-[8px] bg-[#102133] p-4 text-sm leading-6 text-white">
								Use a server-side API key in the Authorization header, label it by environment, and rotate it
								from the dashboard if it is exposed. Sources: API Authentication, Key Management.
							</div>
							<div className="grid gap-3 sm:grid-cols-3">
								{["Docs", "Billing", "Troubleshooting"].map((item) => (
									<div key={item} className="rounded-[8px] border border-[#dbe7f3] p-3 text-sm font-semibold transition hover:border-[#1e7f86]">
										{item}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="developer-experience" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
					<div>
						<p className="text-sm font-bold uppercase text-[#1e7f86]">Developer experience</p>
						<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
							Clear endpoints, predictable JSON, SDK-ready shapes.
						</h2>
						<p className="mt-5 text-lg leading-8 text-[#52677d]">
							PetAPI Cloud keeps integration details boring: REST endpoints, bearer tokens, typed response
							shapes, pagination, request IDs, and examples that move cleanly into SDKs.
						</p>
						<div className="mt-8 space-y-3">
							{endpointExamples.map((endpoint) => (
								<code
									key={endpoint}
									className="block rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] px-4 py-3 text-sm text-[#102133]"
								>
									{endpoint}
								</code>
							))}
						</div>
					</div>
					<div className="rounded-[8px] border border-[#dbe7f3] bg-[#102133] p-5 text-white">
						<div className="flex items-center justify-between border-b border-white/10 pb-4">
							<p className="font-bold">API Docs Preview</p>
							<span className="rounded-[8px] bg-white/10 px-3 py-1 text-xs font-semibold">Bearer key</span>
						</div>
						<div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
							<div className="space-y-2 text-sm text-[#b7c8d9]">
								<p className="flex items-center gap-2 rounded-[8px] bg-white/10 p-3 text-white">
									<ImageIcon className="size-4" aria-hidden="true" />
									Images
								</p>
								<p className="flex items-center gap-2 rounded-[8px] p-3">
									<PawPrint className="size-4" aria-hidden="true" />
									Breeds
								</p>
								<p className="flex items-center gap-2 rounded-[8px] p-3">
									<Sparkles className="size-4" aria-hidden="true" />
									Facts
								</p>
								<p className="flex items-center gap-2 rounded-[8px] p-3">
									<Search className="size-4" aria-hidden="true" />
									Search
								</p>
								<p className="flex items-center gap-2 rounded-[8px] p-3">
									<LifeBuoy className="size-4" aria-hidden="true" />
									Errors
								</p>
							</div>
							<div className="rounded-[8px] bg-[#07131f] p-4">
								<p className="text-sm font-semibold text-[#9fe5df]">JavaScript</p>
								<pre className="mt-3 overflow-x-auto text-xs leading-6 text-[#d7e6f4]">
									<code>{`const res = await fetch(
  "https://api.petapi.cloud/v1/images/random?species=cat",
  {
    headers: {
      Authorization: \`Bearer \${process.env.PETAPI_KEY}\`,
    },
  }
);

const pet = await res.json();`}</code>
								</pre>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-[#f7fbff] px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
					<DashboardPreview
						eyebrow="User dashboard"
						title="Self-serve usage, billing, docs, and support history."
						items={userDashboardItems}
						accent="#e85d4f"
					/>
					<DashboardPreview
						eyebrow="Admin dashboard"
						title="Operate subscriptions, documents, RAG indexing, and answer quality."
						items={adminDashboardItems}
						accent="#1e7f86"
					/>
				</div>
			</section>

			<section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
						<div>
							<p className="text-sm font-bold uppercase text-[#1e7f86]">SaaS core</p>
							<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
								Built around the controls teams already need.
							</h2>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{saasFeatures.map((feature) => (
								<div key={feature.label} className="flex items-center gap-3 rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4 font-semibold transition duration-300 hover:-translate-y-0.5 hover:border-[#b7c8d9] hover:bg-white">
									<span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
										<feature.icon className="size-4" aria-hidden="true" />
									</span>
									{feature.label}
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="pricing" className="border-y border-[#dbe7f3] bg-[#f7fbff] px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="mx-auto max-w-3xl text-center">
						<p className="text-sm font-bold uppercase text-[#1e7f86]">Pricing</p>
						<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Start free, scale when traffic grows.</h2>
						<p className="mt-5 text-lg leading-8 text-[#52677d]">
							Every plan includes dashboard access, API documentation, usage visibility, and the support
							assistant.
						</p>
					</div>
					<div className="mt-10 grid gap-5 lg:grid-cols-3">
						{plans.map((plan) => (
							<article
								key={plan.name}
								className={`rounded-[8px] border bg-white p-6 ${
									plan.featured
										? "border-[#e85d4f] shadow-[0_20px_60px_rgba(232,93,79,0.18)]"
										: "border-[#dbe7f3]"
								}`}
							>
								<div className="flex items-start justify-between gap-4">
									<div>
										<h3 className="text-2xl font-bold">{plan.name}</h3>
										<p className="mt-2 text-sm leading-6 text-[#52677d]">{plan.description}</p>
									</div>
									{plan.featured ? (
										<span className="rounded-[8px] bg-[#ffeceb] px-3 py-1 text-xs font-bold text-[#d84c40]">
											Popular
										</span>
									) : null}
								</div>
								<p className="mt-6 text-4xl font-bold">
									{plan.price}
									{plan.price.startsWith("$") ? <span className="text-base font-medium text-[#52677d]">/mo</span> : null}
								</p>
								<div className="mt-6 space-y-3 text-sm text-[#40566d]">
									<p className="font-semibold text-[#102133]">{plan.requests}</p>
									<p>{plan.support}</p>
									<p>{plan.assistant}</p>
								</div>
								<ul className="mt-6 space-y-3 text-sm text-[#40566d]">
									{plan.features.map((feature) => (
										<li key={feature} className="flex gap-2">
											<span className="mt-2 size-1.5 rounded-full bg-[#1e7f86]" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
								<a
									className={`mt-6 flex items-center justify-center gap-2 rounded-[8px] px-5 py-3 text-center font-semibold transition ${
										plan.featured
											? "bg-[#e85d4f] text-white hover:-translate-y-0.5 hover:bg-[#d84c40]"
											: "border border-[#b7c8d9] text-[#102133] hover:-translate-y-0.5 hover:border-[#1e7f86] hover:text-[#1e7f86]"
									}`}
									href="#final-cta"
								>
									Choose {plan.name}
									<ArrowRight className="size-4" aria-hidden="true" />
								</a>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="max-w-3xl">
						<p className="text-sm font-bold uppercase text-[#1e7f86]">How it works</p>
						<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
							From sign-up to production calls in minutes.
						</h2>
					</div>
					<div className="mt-10 grid gap-4 md:grid-cols-5">
						{howItWorks.map((item, index) => (
							<div key={item.step} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(16,33,51,0.08)]">
								<div className="mb-5 grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
									<item.icon className="size-5" aria-hidden="true" />
								</div>
								<p className="text-sm font-bold text-[#1e7f86]">Step {index + 1}</p>
								<p className="mt-4 text-lg font-bold">{item.step}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="faq" className="bg-[#f7fbff] px-5 py-16 sm:px-8 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
					<div>
						<p className="text-sm font-bold uppercase text-[#1e7f86]">FAQ</p>
						<h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Common questions, answered clearly.</h2>
						<p className="mt-5 text-lg leading-8 text-[#52677d]">
							Short answers for integration, billing, data quality, and AI support workflows.
						</p>
					</div>
					<FaqAccordion faqs={faqs} />
				</div>
			</section>

			<section id="final-cta" className="bg-[#102133] px-5 py-16 text-white sm:px-8 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
					<div>
						<p className="text-sm font-bold uppercase text-[#9fe5df]">Ready to build?</p>
						<h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
							Add reliable pet data and support workflows to your product.
						</h2>
						<p className="mt-5 max-w-2xl text-lg leading-8 text-[#c3d4e3]">
							Start with a free key, test the endpoints, then scale into usage tracking, billing, team roles,
							and AI-assisted support.
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
						<a className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#e85d4f] px-6 py-3 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#d84c40]" href="#pricing">
							Start Building
							<ArrowRight className="size-4" aria-hidden="true" />
						</a>
						<a className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/25 px-6 py-3 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10" href="#developer-experience">
							<BookOpen className="size-4" aria-hidden="true" />
							View Docs
						</a>
					</div>
				</div>
			</section>

			<footer className="border-t border-[#dbe7f3] bg-white px-5 py-12 sm:px-8">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
					<div>
						<a className="flex items-center gap-3 font-semibold" href="#top" aria-label="PetAPI Cloud home">
							<span className="grid size-10 place-items-center rounded-[8px] bg-[#1e7f86] text-white">
								<PawPrint className="size-5" aria-hidden="true" />
							</span>
							<span>PetAPI Cloud</span>
						</a>
						<p className="mt-4 max-w-sm text-sm leading-6 text-[#52677d]">
							Cat and dog data APIs with dashboards, usage controls, and grounded AI support for production teams.
						</p>
						<div className="mt-5 inline-flex items-center gap-2 rounded-[8px] border border-[#dbe7f3] bg-[#f7fbff] px-3 py-2 text-sm font-semibold text-[#40566d]">
							<span className="size-2 rounded-full bg-[#1e7f86]" />
							All systems operational
						</div>
					</div>
					<FooterColumn
						title="Product"
						links={[
							{ label: "Features", href: "#features" },
							{ label: "API docs", href: "#developer-experience" },
							{ label: "Pricing", href: "#pricing" },
							{ label: "AI support", href: "#ai-assistant" },
						]}
					/>
					<FooterColumn
						title="Platform"
						links={[
							{ label: "Dashboard", href: "/dashboard" },
							{ label: "Admin", href: "/admin" },
							{ label: "Sign in", href: "/sign-in" },
							{ label: "Create account", href: "/sign-up" },
						]}
					/>
					<FooterColumn
						title="Company"
						links={[
							{ label: "Security", href: "#features" },
							{ label: "Support", href: "#faq" },
							{ label: "Terms", href: "#final-cta" },
							{ label: "Privacy", href: "#final-cta" },
						]}
					/>
				</div>
				<div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-[#e7eef6] pt-6 text-sm text-[#52677d] sm:flex-row sm:items-center sm:justify-between">
					<p>&copy; 2026 PetAPI Cloud. All rights reserved.</p>
					<p>Built for reliable pet data, clean APIs, and support workflows.</p>
				</div>
			</footer>

			<SupportChat />
		</main>
	);
}

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
	return (
		<div>
			<h2 className="text-sm font-bold uppercase text-[#102133]">{title}</h2>
			<ul className="mt-4 space-y-3 text-sm text-[#52677d]">
				{links.map((link) => (
					<li key={link.label}>
						{link.href.startsWith("/") ? (
							<Link className="transition hover:text-[#1e7f86]" href={link.href}>
								{link.label}
							</Link>
						) : (
							<a className="transition hover:text-[#1e7f86]" href={link.href}>
								{link.label}
							</a>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

function DashboardPreview({
	eyebrow,
	title,
	items,
	accent,
}: {
	eyebrow: string;
	title: string;
	items: string[];
	accent: string;
}) {
	return (
		<article className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-[0_18px_50px_rgba(16,33,51,0.08)]">
			<p className="text-sm font-bold uppercase" style={{ color: accent }}>
				{eyebrow}
			</p>
			<h2 className="mt-3 text-3xl font-bold leading-tight">{title}</h2>
			<div className="mt-6 rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="h-3 w-24 rounded-full" style={{ backgroundColor: accent }} />
					<div className="flex gap-2">
						<span className="size-3 rounded-full bg-[#dbe7f3]" />
						<span className="size-3 rounded-full bg-[#dbe7f3]" />
						<span className="size-3 rounded-full bg-[#dbe7f3]" />
					</div>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					{items.map((item) => (
						<div key={item} className="rounded-[8px] border border-[#dbe7f3] bg-white p-3 text-sm font-semibold text-[#40566d]">
							{item}
						</div>
					))}
				</div>
			</div>
		</article>
	);
}
