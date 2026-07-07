import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "PetAPI Cloud | Cat and Dog APIs for Developers",
	description:
		"PetAPI Cloud is a developer-focused cat and dog API platform with pet images, breeds, facts, metadata, dashboards, and AI support.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const body = <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>;

	return (
		<html lang="en" data-scroll-behavior="smooth">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <ClerkProvider>{body}</ClerkProvider> : body}
		</html>
	);
}
