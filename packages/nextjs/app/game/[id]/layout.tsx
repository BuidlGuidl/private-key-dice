"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import serverConfig from "~~/server.config";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const client = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || serverConfig.ably_api_key });

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={`gameUpdate:${params.id}`}>
        <main>{children}</main>
      </ChannelProvider>
    </AblyProvider>
  );
}
