// https://hexdocs.pm/phoenix/js/
import { useRouter } from 'next/router';
import type { SocketConnectOption } from 'phoenix';
import { Socket } from 'phoenix';
import React, { useEffect, useState } from 'react';

import config from 'configs/app';
import useShards from 'lib/hooks/useShards';

export const SocketContext = React.createContext<Socket | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  url?: string;
  options?: Partial<SocketConnectOption>;
}

export function SocketProvider({ children, options }: SocketProviderProps) {
  const [ socket, setSocket ] = useState<Socket | null>(null);
  const { shardId, defaultShardId, shards } = useShards();
  const router = useRouter();

  useEffect(() => {
    const shardIds = Object.keys(shards);

    if (!shardIds.length) {
      return;
    }
    const _sockets: Array<[string, Socket]> = [];
    shardIds.forEach(id => {
      const shardInfo = shards[id];
      const url = new URL(`${ config.api.socket }${ config.api.basePath }/socket/v2`);
      if (shardInfo?.apiHost) {
        url.host = shardInfo.apiHost;
      }
      const socketInstance = new Socket(url.toString(), options);
      socketInstance.connect();
      _sockets.push([ id, socketInstance ]);
    });

    const id = shardId ? shardId : defaultShardId;
    const connection = _sockets.find(elem => {
      return elem[0] === id;
    });
    if (connection) {
      setSocket(connection[1]);
    }
    const handleRouteChange = (urlString: string) => {
      const query = urlString.split('?')[1];
      const params = new URLSearchParams(query);
      const shard = params.get('shard') || '0';
      if (shard) {
        const connection = _sockets.find(elem => {
          return elem[0] === shardId;
        });

        if (!connection) {
          return;
        }
        setSocket(connection[1]);
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      _sockets.forEach(element => {
        element[1].disconnect();
        setSocket(null);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={ socket }>
      { children }
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
