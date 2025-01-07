"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import serverConfig from "~~/server.config";

export default function Layout({ children }: { children: React.ReactNode }) {
  const client = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || serverConfig.ably_api_key });

  return (
    <>
      <AblyProvider client={client}>
        <ChannelProvider channelName="gameUpdate">
          <ChannelProvider channelName="playerUpdate">
            <ChannelProvider channelName="updateRound">
              <ChannelProvider channelName="startResumeGame">
                <main>{children}</main>
              </ChannelProvider>
            </ChannelProvider>
          </ChannelProvider>
        </ChannelProvider>
      </AblyProvider>
    </>
  );
}
