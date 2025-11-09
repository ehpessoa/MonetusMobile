
import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertCircle, Smartphone, Wifi, Loader2 } from 'lucide-react';
import { Peer, DataConnection } from 'peerjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  getSyncData: () => any;
  mergeSyncData: (data: any) => boolean;
}

type SyncStatus = 'idle' | 'connecting' | 'syncing' | 'success' | 'error';
type SyncMode = 'host' | 'join' | null;

const SyncModal: React.FC<Props> = ({ isOpen, onClose, getSyncData, mergeSyncData }) => {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [mode, setMode] = useState<SyncMode>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      resetSync();
    }
  }, [isOpen]);

  const resetSync = () => {
    connRef.current?.close();
    peerRef.current?.destroy();
    peerRef.current = null;
    connRef.current = null;
    setStatus('idle');
    setMode(null);
    setMyPeerId('');
    setTargetPeerId('');
    setErrorMsg('');
  };

  const initializePeer = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Generate a short 6-char ID for easier typing if possible, 
      // otherwise PeerJS generates a long UUID.
      // Trying to request a custom short ID. Might fail if taken.
      const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const peer = new Peer(shortId);

      peer.on('open', (id) => {
        setMyPeerId(id);
        resolve(id);
      });

      peer.on('error', (err) => {
        console.error("Peer error:", err);
        // If ID taken, try again with standard UUID
        if (err.type === 'unavailable-id') {
             const fallbackPeer = new Peer();
             fallbackPeer.on('open', (id) => {
                 setMyPeerId(id);
                 peerRef.current = fallbackPeer;
                 setupPeerListeners(fallbackPeer);
                 resolve(id);
             });
             return;
        }
        setErrorMsg('Erro na conexão P2P. Tente novamente.');
        setStatus('error');
        reject(err);
      });

      peerRef.current = peer;
      setupPeerListeners(peer);
    });
  };

  const setupPeerListeners = (peer: Peer) => {
      peer.on('connection', (conn) => {
          // HOST receives connection from GUEST
          connRef.current = conn;
          setStatus('connecting');
          setupConnectionListeners(conn, true);
      });
  }

  const setupConnectionListeners = (conn: DataConnection, isHost: boolean) => {
      conn.on('open', () => {
          setStatus('syncing');
          // If I am HOST, I initiate by sending my data first.
          if (isHost) {
              sendData(conn, { type: 'SYNC_REQUEST', payload: getSyncData() });
          }
      });

      conn.on('data', (data: any) => {
          handleIncomingData(conn, data, isHost);
      });

      conn.on('close', () => {
          // If we closed after success, fine. If unexpected, might be error.
          if (status !== 'success') {
             // setStatus('idle'); // Optionally reset or show disconnected
          }
      });

      conn.on('error', (err) => {
          console.error("Conn error:", err);
          setErrorMsg('Conexão interrompida.');
          setStatus('error');
      });
  }

  const handleIncomingData = (conn: DataConnection, data: any, isHost: boolean) => {
      if (data.type === 'SYNC_REQUEST') {
          // Host sent data to Guest. Guest merges, then sends back its NEW merged state.
          const success = mergeSyncData(data.payload);
          if (success) {
              // Send back my (now merged) data so host can also have everything.
              sendData(conn, { type: 'SYNC_RESPONSE', payload: getSyncData() });
              if (!isHost) setStatus('success'); // Guest is done after sending response
          } else {
              sendData(conn, { type: 'SYNC_ERROR', message: 'Falha ao processar dados no destino.' });
              setStatus('error');
              setErrorMsg('Falha ao processar dados recebidos.');
          }
      } else if (data.type === 'SYNC_RESPONSE') {
          // Guest sent back merged data. Host merges it. Sync complete.
          const success = mergeSyncData(data.payload);
          if (success) {
              setStatus('success');
              // Close connection after a moment to ensure guest received ACK if we wanted to send one, 
              // but for now just finishing is enough.
              setTimeout(() => conn.close(), 1000); 
          } else {
              setStatus('error');
              setErrorMsg('Falha ao finalizar sincronização no host.');
          }
      } else if (data.type === 'SYNC_ERROR') {
          setStatus('error');
          setErrorMsg(data.message || 'Erro remoto desconhecido.');
      }
  };

  const sendData = (conn: DataConnection, data: any) => {
      try {
          conn.send(data);
      } catch (e) {
          console.error("Send error", e);
          setStatus('error');
          setErrorMsg('Erro ao enviar dados.');
      }
  }

  const startHost = async () => {
      setStatus('connecting');
      setMode('host');
      try {
          await initializePeer();
          // Now waiting for connection...
      } catch (e) {
          // Error handled in initializePeer
      }
  };

  const startJoin = async () => {
      setMode('join');
      // Guest doesn't strictly need an ID, but PeerJS likes it.
      await initializePeer(); 
  };

  const connectToHost = () => {
      if (!peerRef.current || !targetPeerId) return;
      setStatus('connecting');
      try {
          const conn = peerRef.current.connect(targetPeerId.toUpperCase(), { reliable: true });
          connRef.current = conn;
          setupConnectionListeners(conn, false);
      } catch (e) {
           console.error("Connect error", e);
           setStatus('error');
           setErrorMsg('Não foi possível conectar a este código.');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw size={20} className={status === 'syncing' || status === 'connecting' ? 'animate-spin text-secondary' : ''} />
            Sincronizar Dados
          </h2>
          {status !== 'syncing' && status !== 'connecting' && (
              <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
          )}
        </div>

        <div className="p-6">
            {status === 'idle' && !mode && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center mb-6">
                        Conecte dois dispositivos na mesma rede para manter seus lançamentos atualizados em ambos.
                    </p>
                    <button 
                        onClick={startHost}
                        className="w-full py-4 bg-secondary/10 text-secondary rounded-2xl font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all border-2 border-secondary/20 hover:bg-secondary/20"
                    >
                        <ArrowUpFromLine size={24} />
                        <div>
                            <span className="block">Enviar Dados</span>
                            <span className="text-xs font-normal opacity-70 block">Este dispositivo inicia</span>
                        </div>
                    </button>
                    <button 
                        onClick={startJoin}
                        className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all border-2 border-emerald-100 hover:bg-emerald-100"
                    >
                        <ArrowDownToLine size={24} />
                         <div>
                            <span className="block">Receber Dados</span>
                            <span className="text-xs font-normal opacity-70 block">Este dispositivo conecta</span>
                        </div>
                    </button>
                </div>
            )}

            {mode === 'host' && status === 'connecting' && myPeerId && (
                <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center text-secondary animate-pulse">
                        <Wifi size={40} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Peça para o outro dispositivo conectar usando este código:</p>
                        <div className="text-4xl font-mono font-bold text-gray-900 tracking-wider bg-gray-100 py-4 rounded-2xl select-all">
                            {myPeerId}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Aguardando conexão...
                    </p>
                </div>
            )}

             {mode === 'join' && (status === 'idle' || status === 'connecting') && !connRef.current && (
                <div className="space-y-5 py-2">
                     <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                            <Smartphone size={32} />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Digite o código exibido no outro dispositivo:</p>
                     </div>
                     <input 
                         type="text"
                         value={targetPeerId}
                         onChange={(e) => setTargetPeerId(e.target.value.toUpperCase())}
                         placeholder="CÓDIGO"
                         className="w-full text-center text-3xl font-mono font-bold py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none tracking-wider uppercase"
                         maxLength={10}
                     />
                     <button
                        onClick={connectToHost}
                        disabled={!targetPeerId || status === 'connecting'}
                        className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                     >
                         {status === 'connecting' ? <Loader2 className="animate-spin" /> : 'Conectar & Sincronizar'}
                     </button>
                </div>
             )}

             {status === 'syncing' && (
                 <div className="py-8 text-center space-y-4">
                     <RefreshCw size={48} className="animate-spin text-secondary mx-auto opacity-50" />
                     <h3 className="text-xl font-semibold text-gray-700">Sincronizando...</h3>
                     <p className="text-gray-500">Não feche o aplicativo.</p>
                 </div>
             )}

             {status === 'success' && (
                 <div className="py-8 text-center space-y-4 animate-in zoom-in">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                         <CheckCircle2 size={48} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-900">Sucesso!</h3>
                     <p className="text-gray-600">Seus dados foram sincronizados com sucesso entre os dispositivos.</p>
                     <button onClick={onClose} className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold">
                         Fechar
                     </button>
                 </div>
             )}

             {status === 'error' && (
                 <div className="py-6 text-center space-y-4">
                     <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                         <AlertCircle size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">Erro na Sincronização</h3>
                     <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errorMsg}</p>
                     <button onClick={resetSync} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-semibold mt-2">
                         Tentar Novamente
                     </button>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

// Declare Peer globally if missing in TS (handled by importmap usually, but good fallback for clean standard TS setup without complex config)
declare global {
    interface Window {
        Peer: any;
    }
}

export default SyncModal;
