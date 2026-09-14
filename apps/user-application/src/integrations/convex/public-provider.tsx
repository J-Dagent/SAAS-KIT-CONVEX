import { useEffect, useState, type ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getPublicConvexConfig } from "@/config/convex";

export function PublicConvexProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const { convexUrl } = getPublicConvexConfig();
    return new ConvexReactClient(convexUrl);
  });

  useEffect(() => () => void client.close(), [client]);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
