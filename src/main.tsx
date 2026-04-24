/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import './index.css';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import esriId from '@arcgis/core/identity/IdentityManager';
import esriConfig from '@arcgis/core/config';

// Elements del DOM
const loginBtn = document.getElementById('login-btn');
const authContainer = document.getElementById('auth-container');
const loader = document.getElementById('loader');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

// Configuració OAuth
const info = new OAuthInfo({
  appId: "rzBf85tLezwnSUe3",
  popup: true,
  popupCallbackUrl: "https://admingepif.github.io/consultes-app/callback.html"
});
esriId.registerOAuthInfos([info]);

// Funció per actualitzar l'estat d'usuari
function updateUIWithUser(userId: string) {
  if (authContainer) {
    authContainer.innerHTML = `
      <div class="flex items-center space-x-2 bg-slate-800 py-1 px-3 rounded-full border border-slate-700">
        <div class="w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900"></div>
        <span class="text-xs font-semibold text-white">${userId}</span>
      </div>
    `;
  }
}

// Comprovar sessió existent
esriId.checkSignInStatus(info.portalUrl + "/sharing")
  .then((credential) => {
    updateUIWithUser(credential.userId);
  })
  .catch(() => {
    // No està loguejat
  });

// Event login
loginBtn?.addEventListener('click', () => {
  esriId.getCredential(esriConfig.portalUrl + "/sharing").then((credential) => {
    updateUIWithUser(credential.userId);
  });
});

// Inicialitzar el Mapa
const map = new WebMap({
  portalItem: {
    id: 'e3b361128f9b43f7bf182261df0329fa'
  }
});

const view = new MapView({
  container: 'viewDiv',
  map: map
});

view.when(() => {
  // Amagar el loader
  if (loader) loader.style.display = 'none';
  
  // Actualitzar l'estat visual
  if (statusDot) {
    statusDot.classList.remove('bg-amber-500', 'animate-pulse');
    statusDot.classList.add('bg-green-500');
  }
  if (statusText) {
    statusText.innerText = 'GEPIF STATUS: ACTIVE';
  }
}).catch((error) => {
  console.error("Error carregant el mapa:", error);
  if (loader) {
    loader.innerHTML = `
      <div class="text-center p-8">
        <p class="text-red-600 font-bold mb-2 text-sm">Error en carregar el mapa</p>
        <p class="text-[10px] text-red-500 uppercase tracking-tighter">Verifica l'ID o la sessió</p>
      </div>
    `;
  }
});

