import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Replace these with your actual credentials
        const validUsername = process.env.AUTH_USERNAME;
        const validPassword = process.env.AUTH_PASSWORD;

        if (credentials.username === validUsername && credentials.password === validPassword) {
          return { id: 1, name: "Admin" };
        } else {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
});