/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import esriId from '@arcgis/core/identity/IdentityManager';
import { Map as MapIcon, LogIn, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ fullName: string; username: string } | null>(null);
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    // Configuració OAuth real
    const info = new OAuthInfo({
      appId: "rzBf85tLezwnSUe3",
      popup: true,
      popupCallbackUrl: "https://admingepif.github.io/consultes-app/callback.html"
    });
    esriId.registerOAuthInfos([info]);

    // Comprovar si ja hi ha sessió
    esriId.checkSignInStatus(info.portalUrl + "/sharing").then((credential) => {
      setUser({ fullName: credential.userId, username: credential.userId });
    }).catch(() => {
      // No loguejat
    });

    if (mapDiv.current) {
      // Carreguem el WebMap específic de GEPIF
      const map = new WebMap({
        portalItem: {
          id: 'e3b361128f9b43f7bf182261df0329fa'
        }
      });

      const view = new MapView({
        container: mapDiv.current,
        map: map
      });

      view.when(() => {
        setSdkStatus('ready');
      }, (error: Error) => {
        console.error("Error carregant el mapa:", error);
        setSdkStatus('error');
      });

      return () => {
        if (view) {
          view.destroy();
        }
      };
    }
  }, []);

  const handleLogin = () => {
    esriId.getCredential(esriConfig.portalUrl + "/sharing").then((credential) => {
      setUser({ fullName: credential.userId, username: credential.userId });
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans bg-slate-50 text-slate-900">
      {/* Header Minimalista */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 border-b border-slate-700 shadow-lg z-20">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center">
            <MapIcon className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight uppercase">
            APP CONTROL <span className="text-blue-400">GEPIF WEB</span>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-800 py-1 px-3 rounded-full border border-slate-700">
              <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900"></div>
              <span className="text-xs font-semibold">{user.fullName}</span>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>LOG IN</span>
            </button>
          )}
        </div>
      </header>

      {/* Àrea del Mapa a Pantalla Completa */}
      <main className="flex-1 relative bg-slate-200">
        <div 
          ref={mapDiv} 
          className="w-full h-full"
        >
          {sdkStatus === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-30">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <Activity className="w-8 h-8 text-blue-500 animate-pulse mb-4" />
                <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">Carregant mapa GEPIF...</p>
              </motion.div>
            </div>
          )}
          {sdkStatus === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-30 p-8 text-center">
              <div>
                <p className="text-red-600 font-bold mb-2 text-sm">Error en carregar el mapa</p>
                <p className="text-[10px] text-red-500 uppercase tracking-tighter">Verifica l'ID o la sessió</p>
              </div>
            </div>
          )}
        </div>

        {/* Widgets Flotants Minimalistes */}
        <div className="absolute bottom-6 left-6 pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-300 shadow-xl pointer-events-auto">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${sdkStatus === 'ready' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">
                GEPIF STATUS: {sdkStatus === 'ready' ? 'ACTIVE' : 'CONNECTING'}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 text-right pointer-events-none z-10">
          <div className="bg-slate-900/80 text-white px-3 py-1.5 rounded-md text-[10px] border border-slate-700 shadow-lg backdrop-blur-sm">
            Portal ID: e3b36112...29fa
          </div>
        </div>
      </main>
    </div>
  );
}
