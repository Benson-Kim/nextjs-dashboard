import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnDashboard = nextUrl.pathname.startsWith("/dashbaord");
			if (isOnDashboard) {
				if (isLoggedIn) return true;
				return false; // If not loged in redirect to login page
			} else if (isLoggedIn) {
				return Response.redirect(new URL("/dashboard", nextUrl));
			}
			return true;
		},
	},
	providers: [],
} satisfies NextAuthConfig;