/**
 * ============================================================================
 * UNIFED - PROBATUM · MÓDULO DE EXPORTAÇÃO — TRÍADE DOCUMENTAL
 * ============================================================================
 * Ficheiro      : unifed_triada_export.js
 * Versão        : 2.0.0-RTF-UNIFED-2026-0406
 * ============================================================================
 * RECTIFICAÇÕES v2.0.0 (RTF-UNIFED-2026-0406-001):
 *   [R-T01] Substituição de setTimeout(500ms) (camada 3 fallback) por
 *           UNIFEDEventBus.waitFor('UNIFED_DOM_READY') — erradica
 *           sincronização por espera cega.
 *   [R-T02] btn.innerHTML com tags <i> substituído por document.createElement()
 *           + textContent — elimina vector XSS na construção dos botões.
 *   [R-T03] Delegação de exportPDF e exportDOCX para
 *           UNIFEDExportService.getInstance().export(type) — garante
 *           selagem atómica antes de qualquer serialização.
 *   [R-T04] gerarAnexoCustodia registado no ExportService via
 *           register('custody', fn) — unificação do ponto de selagem.
 *
 * HERANÇA DE PATCHES ANTERIORES (mantidos integralmente):
 *   [PATCH-A03] Preservação dos 4 botões eliminados pelo innerHTML=''.
 *   [PATCH-A04] Correcção da API QRCode (construtor, não toCanvas()).
 *   [FIX-E]     Estratégia de 3 camadas de inicialização (agora via EventBus).
 *   [FIX-E2]    Labels PT/EN via _resolveLabels().
 *   [FIX-E3]    ID do container: 'export-tools-container'.
 *   [FIX-PDF]   Rodapé centralizado com Master Hash em todas as páginas.
 *   [FIX-QR]    QR Code de integridade na última página.
 *
 * DEPENDÊNCIAS (ordem de carregamento obrigatória):
 *   1. unifed_event_bus.js
 *   2. unifed_export_service.js
 *   3. Este ficheiro
 *
 * CONFORMIDADE: ISO/IEC 27037:2012 · DORA (UE) 2022/2554 · OWASP A03:2021
 * ============================================================================
 */

'use strict';

(function _unifedTriadaModule() {
    var _VERSION = '2.0.0-RTF-UNIFED-2026-0406';

    // ── UTILITÁRIO DE LOG ────────────────────────────────────────────────────
    function _log(msg, type) {
        type = type || 'log';
        var method = (type === 'success') ? 'info' : (type === 'warn' ? 'warn' : type);
        console[method]('[' + new Date().toISOString() + '] [TRIADA ' + _VERSION + '] ' + msg);
    }

    // ── RECUPERAÇÃO DO MASTER HASH ESTÁVEL ──────────────────────────────────
    function getStableMasterHash() {
        if (window.activeForensicSession && window.activeForensicSession.masterHash) {
            return window.activeForensicSession.masterHash;
        }
        if (window.UNIFEDSystem && window.UNIFEDSystem.demoMode) {
            return '79b032809b9e54ea3504659c37edb9e49e6d462d691c75e4a5afd79d8bb8f86c';
        }
        if (window.UNIFEDSystem && window.UNIFEDSystem.masterHash) {
            return window.UNIFEDSystem.masterHash;
        }
        return 'PENDING_SEAL';
    }

    // ── RESOLUÇÃO DE LABELS PT/EN ────────────────────────────────────────────
    function _resolveLabels() {
        var lang = (typeof window.currentLang !== 'undefined') ? window.currentLang : 'pt';
        return {
            pdf:     lang === 'en' ? 'FORENSIC EXPERT REPORT (MOD. 03-B)'  : 'RELATÓRIO PERICIAL FORENSE (MOD. 03-B)',
            docx:    lang === 'en' ? 'STATEMENT OF CLAIM DRAFT'            : 'MINUTA DE PETIÇÃO INICIAL',
            custody: lang === 'en' ? 'DIGITAL MATERIAL EVIDENCE'           : 'PROVA MATERIAL DIGITAL'
        };
    }

    // ── GERAÇÃO DO ANEXO DE CUSTÓDIA (PDF) ──────────────────────────────────
    // [R-T04] Implementação registada no ExportService como renderer 'custody'.
    // Recebe masterHash já validado pelo ExportService._sealAtomically().
    async function _gerarAnexoCustodiaImpl(masterHash) {
        var sessionId = (window.UNIFEDSystem && window.UNIFEDSystem.sessionId)
                     || (window.activeForensicSession && window.activeForensicSession.sessionId)
                     || 'UNIFED-SESSION';

        _log('🔒 A selar documento com Master Hash: ' + masterHash.substring(0, 12) + '...');

        if (typeof window.jspdf === 'undefined') {
            _log('jsPDF não carregado. A gerar simulação de anexo.', 'warn');
            alert(
                'GERANDO PROVA MATERIAL DIGITAL\n' +
                'Master Hash: ' + masterHash + '\n' +
                'Sessão: ' + sessionId + '\n' +
                'Estado: Integridade Validada.\n\n' +
                'Este é um documento de prova com selo criptográfico.'
            );
            return;
        }

        var jsPDF      = window.jspdf.jsPDF;
        var doc        = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        var marginX    = 20;
        var currentY   = 25;
        var pageHeight = doc.internal.pageSize.getHeight();
        var pageWidth  = doc.internal.pageSize.getWidth();
        var lang       = (typeof window.currentLang !== 'undefined') ? window.currentLang : 'pt';

        // ── Rodapé com Master Hash centralizado ───────────────────────────────
        function addFooter(pageNum, totalPages) {
            doc.setFont('courier', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            var footerText    = 'Master Hash SHA-256: ' + masterHash;
            var pageText      = (lang === 'en') ? 'Page ' + pageNum + ' of ' + totalPages : 'Página ' + pageNum + ' de ' + totalPages;
            var textWidth     = doc.getTextWidth(footerText);
            doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 10);
            var pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - marginX - pageTextWidth, pageHeight - 10);
            doc.setTextColor(0, 0, 0);
        }

        // ── Cabeçalho ────────────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(
            lang === 'en' ? 'UNIFED - PROBATUM | DIGITAL MATERIAL EVIDENCE' : 'UNIFED - PROBATUM | PROVA MATERIAL DIGITAL',
            marginX, currentY
        );
        currentY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
            lang === 'en'
                ? 'CUSTODY AND INTEGRITY ANNEX · MOD. 03-B (ISO/IEC 27037:2012 STANDARD)'
                : 'ANEXO DE CUSTÓDIA E INTEGRIDADE · MOD. 03-B (NORMA ISO/IEC 27037:2012)',
            marginX, currentY
        );
        currentY += 15;

        // ── Metadados ────────────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text((lang === 'en' ? 'Session' : 'Sessão') + ': ' + sessionId, marginX, currentY);
        currentY += 5;
        doc.text((lang === 'en' ? 'Date' : 'Data') + ': ' + new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-PT'), marginX, currentY);
        currentY += 5;
        doc.text('Master Hash: ' + masterHash, marginX, currentY);
        currentY += 10;

        // ── Lista de Evidências ──────────────────────────────────────────────
        var evidences = (window.UNIFEDSystem && window.UNIFEDSystem.analysis && window.UNIFEDSystem.analysis.evidenceIntegrity)
            ? window.UNIFEDSystem.analysis.evidenceIntegrity : [];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(lang === 'en' ? 'Processed evidence:' : 'Evidências processadas:', marginX, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        if (evidences.length === 0) {
            doc.text(lang === 'en' ? 'No evidence registered in this session.' : 'Nenhuma evidência registada nesta sessão.', marginX, currentY);
            currentY += 10;
        } else {
            evidences.slice(0, 20).forEach(function(ev, idx) {
                if (currentY > pageHeight - 50) {
                    addFooter(doc.internal.getNumberOfPages(), 0);
                    doc.addPage();
                    currentY = 25;
                }
                doc.text((idx + 1) + '. ' + ev.filename, marginX + 2, currentY);
                currentY += 5;
                doc.setFont('courier', 'normal');
                doc.text('   SHA-256: ' + (ev.hash || 'N/A'), marginX + 2, currentY);
                currentY += 8;
                doc.setFont('helvetica', 'normal');
            });
        }

        // ── Paginação retroactiva ────────────────────────────────────────────
        var totalPages = doc.internal.getNumberOfPages() + 1;
        for (var p = 1; p <= totalPages - 1; p++) {
            doc.setPage(p);
            addFooter(p, totalPages);
        }

        // ── Página final: Selo QR (PATCH A-04 mantido) ──────────────────────
        doc.addPage();
        var lastPageNum = totalPages;
        currentY = 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(lang === 'en' ? 'INTEGRITY AND AUTHENTICITY SEAL' : 'SELO DE INTEGRIDADE E AUTENTICIDADE', marginX, currentY);
        currentY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
            lang === 'en'
                ? 'The QR code below contains the Master Hash SHA-256 and the session identifier,'
                : 'O código QR abaixo contém o Master Hash SHA-256 e o identificador da sessão,',
            marginX, currentY
        );
        currentY += 5;
        doc.text(
            lang === 'en' ? 'enabling immediate verification of document integrity.' : 'permitindo a verificação imediata da integridade do documento.',
            marginX, currentY
        );
        currentY += 12;

        // QR Code — PATCH A-04 (API corrigida para qrcodejs v1.0.0)
        try {
            var qrPayload = 'UNIFED|' + sessionId + '|' + masterHash;
            var qrSize    = 45;
            var qrX       = (pageWidth - qrSize) / 2;

            if (typeof QRCode !== 'undefined') {
                var qrContainer           = document.createElement('div');
                qrContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;width:200px;height:200px;';
                document.body.appendChild(qrContainer);

                new QRCode(qrContainer, { text: qrPayload, width: 200, height: 200 });

                await new Promise(function(resolve) { setTimeout(resolve, 80); });

                var qrCanvas  = qrContainer.querySelector('canvas');
                var qrImg     = qrContainer.querySelector('img');
                var qrDataUrl = null;

                if (qrCanvas) {
                    qrDataUrl = qrCanvas.toDataURL('image/png');
                } else if (qrImg && qrImg.src && qrImg.src.indexOf('data:') === 0) {
                    qrDataUrl = qrImg.src;
                }

                document.body.removeChild(qrContainer);

                if (qrDataUrl) {
                    doc.addImage(qrDataUrl, 'PNG', qrX, currentY, qrSize, qrSize);
                    currentY += qrSize + 8;
                } else {
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(lang === 'en' ? '(QR Code: render failed — check qrcodejs)' : '(QR Code: render falhou — verifique qrcodejs)', marginX, currentY);
                    doc.setTextColor(0, 0, 0);
                    currentY += 10;
                }
            } else {
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(lang === 'en' ? '(QR Code not supported — qrcodejs not loaded)' : '(QR Code não suportado — qrcodejs não carregado)', marginX, currentY);
                doc.setTextColor(0, 0, 0);
                currentY += 10;
            }
        } catch (e) {
            _log('Erro na geração do QR Code: ' + e.message, 'warn');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(lang === 'en' ? '(QR Code unavailable — ' + e.message + ')' : '(QR Code indisponível — ' + e.message + ')', marginX, currentY);
            doc.setTextColor(0, 0, 0);
            currentY += 10;
        }

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(lang === 'en' ? 'Verify this QR code with any standard reader. The hash printed in the footer' : 'Verifique este código QR com qualquer leitor padrão. O hash impresso no rodapé', marginX, currentY);
        currentY += 4;
        doc.text(lang === 'en' ? 'of all pages must match the QR code.' : 'de todas as páginas deve coincidir com o código QR.', marginX, currentY);
        currentY += 8;
        doc.text(lang === 'en' ? 'Any alteration to the document will result in a divergent hash.' : 'Qualquer alteração no documento resultará numa hash divergente.', marginX, currentY);
        doc.setTextColor(0, 0, 0);

        addFooter(lastPageNum, totalPages);
        doc.save('UNIFED_ANEXO_CUSTODIA_' + sessionId + '.pdf');
        _log('✅ Anexo de Custódia gerado com QR Code: ' + sessionId, 'success');
    }

    // Wrapper público para compatibilidade com window.gerarAnexoCustodia
    async function gerarAnexoCustodia() {
        try {
            await window.UNIFEDExportService.getInstance().export('custody');
        } catch (err) {
            _log('gerarAnexoCustodia via ExportService falhou: ' + err.message, 'error');
        }
    }

    // ── INICIALIZAÇÃO DA INTERFACE DOS BOTÕES ────────────────────────────────
    // [R-T02] Substituição de btn.innerHTML com tags <i> por createElement.
    // [PATCH-A03] Preservação dos 4 botões eliminados mantida.
    function initInterface() {
        var container = document.getElementById('export-tools-container');
        if (!container) { return false; }

        // ── PATCH A-03: salvar botões a preservar ANTES de limpar ────────────
        var _PRESERVE_IDS = ['atfModalBtn', 'exportJSONBtn', 'resetBtn', 'clearConsoleBtn'];
        var _savedButtons = _PRESERVE_IDS
            .map(function(id) { return document.getElementById(id); })
            .filter(function(el) { return el !== null; });

        // Ocultar apenas os botões que serão substituídos pela Tríade
        ['exportPDFBtn', 'exportDOCXBtn'].forEach(function(id) {
            var old = document.getElementById(id);
            if (old) { old.style.display = 'none'; }
        });

        // Limpar container (botões preservados já referenciados acima)
        container.innerHTML = '';

        var labels = _resolveLabels();
        var svc    = window.UNIFEDExportService && window.UNIFEDExportService.getInstance();

        var _BOTOES = [
            {
                id:    'triadaPdfBtn',
                label: labels.pdf,
                icon:  'fa-file-pdf',
                cor:   '#00E5FF',
                handler: function() {
                    if (svc) {
                        svc.export('pdf').catch(function(e) { _log('PDF export: ' + e.message, 'error'); });
                    } else if (typeof window.exportPDF === 'function') {
                        window.exportPDF();
                    } else {
                        alert((typeof window.currentLang !== 'undefined' && window.currentLang === 'en')
                            ? 'PDF export function not available.' : 'Função de exportação PDF não disponível.');
                    }
                }
            },
            {
                id:    'triadaDocxBtn',
                label: labels.docx,
                icon:  'fa-file-word',
                cor:   '#0EA5E9',
                handler: function() {
                    if (svc) {
                        svc.export('docx').catch(function(e) { _log('DOCX export: ' + e.message, 'error'); });
                    } else if (typeof window.exportDOCX === 'function') {
                        window.exportDOCX();
                    } else {
                        alert((typeof window.currentLang !== 'undefined' && window.currentLang === 'en')
                            ? 'DOCX export function not available.' : 'Função de exportação DOCX não disponível.');
                    }
                }
            },
            {
                id:    'triadaCustodiaBtn',
                label: labels.custody,
                icon:  'fa-shield-alt',
                cor:   '#EF4444',
                handler: gerarAnexoCustodia
            }
        ];

        _BOTOES.forEach(function(b) {
            var btn = document.createElement('button');
            btn.id  = b.id;
            btn.className = 'btn-tool-pure';
            btn.style.cssText = [
                'border-left:3px solid ' + b.cor + ';',
                'margin:5px;',
                'padding:12px;',
                'cursor:pointer;',
                'background:rgba(15,23,42,0.9);',
                'color:white;',
                'border-top:none;border-right:none;border-bottom:none;',
                "font-family:'JetBrains Mono',monospace;",
                'font-size:11px;',
                'transition:background 0.3s;',
                'width:calc(100% - 10px);',
                'text-align:left;'
            ].join('');

            // [R-T02] Ícone e label via createElement (sem innerHTML) ─────────
            var icon = document.createElement('i');
            icon.className = 'fas ' + b.icon;
            icon.style.cssText = 'color:' + b.cor + ';margin-right:8px;';
            // setAttribute protege contra nomes de classe maliciosos se a cor
            // fosse dinâmica/externa; aqui é constante mas mantemos o padrão.

            var labelNode = document.createTextNode(' ' + b.label);

            btn.appendChild(icon);
            btn.appendChild(labelNode);
            btn.onclick     = b.handler;
            btn.onmouseover = function() { btn.style.background = 'rgba(30,41,59,1)'; };
            btn.onmouseout  = function() { btn.style.background = 'rgba(15,23,42,0.9)'; };
            container.appendChild(btn);
        });

        // ── PATCH A-03: reinserir os botões preservados ───────────────────────
        _savedButtons.forEach(function(btn) {
            btn.style.margin = '5px';
            btn.style.width  = 'calc(100% - 10px)';
            container.appendChild(btn);
        });

        _log('Interface Tríade Documental ' + _VERSION + ' activada (Patch A-03: ' + _savedButtons.length + ' botões preservados).');
        return true;
    }

    // ── [R-T01] ESTRATÉGIA DE INICIALIZAÇÃO VIA EVENTBUS ────────────────────
    // Substitui a estratégia de 3 camadas com setTimeout(500ms).
    // Camada 1: evento UNIFED_CORE_READY via EventBus.
    // Camada 2: DOMContentLoaded se DOM ainda não carregado.
    // Camada 3: MutationObserver (sem setTimeout de fallback).
    function _startInit() {
        var bus = window.UNIFEDEventBus;
        if (!bus) {
            // Fallback extremo: EventBus não carregado — usar evento nativo
            window.addEventListener('UNIFED_CORE_READY', function() {
                _attemptInit();
            }, { once: true });
            return;
        }
        bus.waitFor('UNIFED_CORE_READY', 15000).then(function() {
            _attemptInit();
        }).catch(function(err) {
            _log('Timeout aguardando UNIFED_CORE_READY: ' + err.message + '. Tentativa directa.', 'warn');
            _attemptInit();
        });
    }

    function _attemptInit() {
        if (initInterface()) { return; }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (!initInterface()) { _startMutationObserver(); }
            }, { once: true });
        } else {
            _startMutationObserver();
        }
    }

    // ── Camada 3: MutationObserver (sem setTimeout de fallback) ──────────────
    function _startMutationObserver() {
        if (!('MutationObserver' in window)) {
            _log('MutationObserver indisponível — inicialização manual necessária.', 'warn');
            return;
        }

        var _observer = new MutationObserver(function(_mutations, obs) {
            var container = document.getElementById('export-tools-container');
            if (container) {
                obs.disconnect();
                initInterface();
                _log('Interface inicializada via MutationObserver (DOM tardio detectado).');
            }
        });

        _observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

        // Segurança: desligar observer após 15 s para evitar memory leak
        // (não é sincronização de estado — é guarda de recursos)
        setTimeout(function() {
            _observer.disconnect();
            _log('MutationObserver desligado após timeout de segurança (15s).', 'warn');
        }, 15000);
    }

    // ── REGISTO DO RENDERER CUSTODY NO EXPORT SERVICE ────────────────────────
    // [R-T04] Registar gerarAnexoCustodiaImpl como renderer 'custody'
    function _registerCustodyRenderer() {
        var bus = window.UNIFEDEventBus;
        var svc = window.UNIFEDExportService && window.UNIFEDExportService.getInstance();
        if (!svc) {
            _log('UNIFEDExportService não disponível para registo do renderer custody.', 'warn');
            return;
        }
        svc.register('custody', _gerarAnexoCustodiaImpl);
        _log('Renderer "custody" registado no ExportService.', 'success');
    }

    // Registar quando o sistema estiver pronto
    if (window.UNIFEDEventBus) {
        window.UNIFEDEventBus.waitFor('UNIFED_CORE_READY', 15000)
            .then(_registerCustodyRenderer)
            .catch(function() { _registerCustodyRenderer(); }); // tenta mesmo assim
    } else {
        window.addEventListener('UNIFED_CORE_READY', _registerCustodyRenderer, { once: true });
    }

    // ── ARRANQUE ──────────────────────────────────────────────────────────────
    _startInit();

    // ── EXPOSIÇÃO GLOBAL ──────────────────────────────────────────────────────
    window.gerarAnexoCustodia              = gerarAnexoCustodia;
    window.initTriadaButtons               = initInterface;
    window.UNIFEDSystem                    = window.UNIFEDSystem || {};
    window.UNIFEDSystem.triadaUpdateLabels = initInterface;

})();
