declare module 'next-auth/react' {
  export interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }

  export function useSession(): {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  export function signOut(options?: {}): Promise<void>;
}
