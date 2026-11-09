import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, ExternalLink, HelpCircle, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeStep, setActiveStep] = useState<'options' | 'pwabuilder'>('options');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-rlnxi2zh7c5fq2m6fuuwrh-893725345255.us-east1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-100 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                <span>Instalar no Celular & Gerar APK</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                  Android & iOS
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Você pode instalar direto no celular como app ou gerar o arquivo <strong>.APK</strong> para distribuição.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('options')}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeStep === 'options'
                ? 'bg-amber-400 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. Instalação Direta (PWA App)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('pwabuilder')}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeStep === 'pwabuilder'
                ? 'bg-amber-400 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Gerar Arquivo .APK Oficial</span>
          </button>
        </div>

        {/* Tab 1: Instalação Rápida */}
        {activeStep === 'options' && (
          <div className="space-y-4">
            
            {/* Direct Install Button if supported */}
            {isInstallable && (
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Instalar Aplicativo Agora</span>
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1">
                    Seu navegador suporta instalação com 1 clique! O app aparecerá na gaveta de aplicativos com ícone próprio e sem barra de navegador.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    onClose();
                  }}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-bold transition shadow-md whitespace-nowrap cursor-pointer shrink-0"
                >
                  Instalar Agora no Aparelho
                </button>
              </div>
            )}

            {/* Android Chrome Instructions */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  A
                </span>
                <span>Como instalar no Celular Android (Chrome / Edge / Samsung Internet):</span>
              </div>
              <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>Abra o link do sistema no navegador do seu celular.</li>
                <li>Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito do navegador.</li>
                <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                <li>Pronto! O app é instalado como se fosse da Google Play Store, com ícone de bancada e modo tela cheia.</li>
              </ol>
            </div>

            {/* iOS Safari Instructions */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  B
                </span>
                <span>Como instalar no iPhone / iPad (Safari):</span>
              </div>
              <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>Abra o link no navegador <strong>Safari</strong> do iPhone.</li>
                <li>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima).</li>
                <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
              </ol>
            </div>

            {/* Copy Link box */}
            <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-[11px] text-neutral-500 block">Link de Acesso para abrir no celular:</span>
                <span className="font-mono text-neutral-300 truncate block text-[11px]">{currentUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition shrink-0 cursor-pointer"
              >
                {copiedUrl ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Gerar APK com PWABuilder ou Bubblewrap */}
        {activeStep === 'pwabuilder' && (
          <div className="space-y-4">
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-amber-950/30 border border-amber-500/30">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2 mb-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Como Gerar o Arquivo .APK Oficial</span>
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Como este aplicativo já é um <strong>PWA completo com Manifesto e Service Worker</strong>, você pode gerar um arquivo <strong>.APK instalável</strong> em menos de 2 minutos usando a ferramenta oficial da Microsoft e Google (<strong>PWABuilder</strong>).
              </p>
            </div>

            {/* Passo a passo */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Passo a Passo para Baixar o seu .APK:
              </h4>

              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong>Copie a URL da sua aplicação:</strong>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-[11px] bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 truncate max-w-sm font-mono block">
                        {currentUrl}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="px-2.5 py-1 text-[11px] rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 transition shrink-0 font-medium cursor-pointer"
                      >
                        {copiedUrl ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong>Acesse o PWABuilder (gratuito):</strong>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Abra o site <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-mono">pwabuilder.com</a>, cole a URL copiada e clique em <strong>Start</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong>Clique em "Package for Stores" e escolha Android:</strong>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Selecione <strong>Android</strong> e clique em <strong>Download Package</strong>. Ele gerará o pacote com o arquivo <strong>.APK instalável</strong> e o <strong>.AAB</strong> (se quiser publicar na Play Store).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong>Instale no Android:</strong>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Envie o arquivo <strong>.apk</strong> para o seu celular (por WhatsApp, e-mail ou cabo USB) e toque nele para instalar!
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 flex justify-end">
                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition shadow cursor-pointer"
                >
                  <span>Abrir PWABuilder para Gerar APK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Alternativa com Capacitor / Cordova */}
            <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800 text-xs text-neutral-400 space-y-1">
              <span className="font-semibold text-neutral-300 block">Outras opções para desenvolvedores:</span>
              <p className="text-[11px] leading-relaxed">
                Você também pode converter usando <strong>Capacitor</strong> (<code className="text-neutral-300 font-mono">npm install @capacitor/core @capacitor/android</code>) ou <strong>Bubblewrap CLI</strong> do Google para compilar o APK diretamente pelo Android Studio.
              </p>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
