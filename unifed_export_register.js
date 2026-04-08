/**
 * ============================================================================
 * UNIFED - PROBATUM · REGISTO DE RENDERERS NO EXPORT SERVICE
 * ============================================================================
 * Ficheiro      : unifed_export_register.js
 * Versão        : 1.0.0-RTF-UNIFED-2026-0406
 * ============================================================================
 * OBJECTIVO:
 *   Ficheiro de orquestração NÃO INVASIVO que regista as implementações
 *   existentes de exportPDF (script.js) e exportDOCX (enrichment.js) como
 *   renderers do UNIFEDExportService sem modificar os ficheiros originais.
 *
 *   Desta forma:
 *     · script.js e enrichment.js permanecem intactos (0 linhas alteradas).
 *     · O UNIFEDExportService torna-se o ponto único de selagem atómica.
 *     · O nexus.js wrap de window.exportDOCX (Módulo 2 RAG) continua a
 *       funcionar porque o adaptador de compatibilidade em unifed_export_service.js
 *       preserva window.exportDOCX como alias para ExportService.export('docx').
 *
 * ORDEM DE CARREGAMENTO OBRIGATÓRIA NO HTML:
 *   1. unifed_event_bus.js
 *   2. unifed_export_service.js
 *   3. enrichment.js           ← define exportDOCX + window.exportDOCX
 *   4. script.js               ← define exportPDF; emite UNIFED_CORE_READY
 *   5. script_injection.js
 *   6. nexus.js                ← wraps window.exportDOCX (RAG)
 *   7. unifed_triada_export.js ← regista renderer 'custody'
 *   8. unifed_export_register.js ← este ficheiro (último da cadeia)
 *
 * ARQUITECTURA DE REGISTO:
 *
 *   window.exportPDF (script.js L5291)
 *     → capturada por _captureAndRegisterPDF()
 *     → registada como renderer 'pdf' no ExportService
 *     → window.exportPDF substituída pelo adaptador ExportService.export('pdf')
 *
 *   window.exportDOCX (enrichment.js L636, wrappada pelo nexus.js RAG)
 *     → capturada por _captureAndRegisterDOCX()
 *     → registada como renderer 'docx' no ExportService
 *     → window.exportDOCX substituída pelo adaptador ExportService.export('docx')
 *
 * NOTA SOBRE generateForensicSeal:
 *   A implementação original de exportPDF (script.js L5298-5302) contém uma
 *   chamada interna a UNIFEDSystem.generateForensicSeal(). Esta chamada torna-se
 *   uma operação idempotente após o ExportService._sealAtomically() ter
 *   executado o mesmo método. O hash resultante é idêntico — não existe
 *   duplicação de estado. A chamada interna pode ser removida numa refactorização
 *   futura de script.js, mas não é obrigatória para a correcção actual.
 *
 * CONFORMIDADE: ISO/IEC 27037:2012 · DORA (UE) 2022/2554
 * ============================================================================
 */

'use strict';

(function _unifedExportRegister() {

    var _VERSION = '1.0.0-RTF-UNIFED-2026-0406';

    function _log(msg, level) {
        var method = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log';
        console[method]('[' + new Date().toISOString() + '] [ExportRegister ' + _VERSION + '] ' + msg);
    }

    // ── VALIDAÇÕES DE PRÉ-CONDIÇÕES ──────────────────────────────────────────
    function _assertDeps() {
        if (!window.UNIFEDExportService) {
            throw new Error('UNIFEDExportService não carregado. Verificar ordem de scripts no HTML.');
        }
        if (!window.UNIFEDEventBus) {
            throw new Error('UNIFEDEventBus não carregado. Verificar ordem de scripts no HTML.');
        }
    }

    // ── WRAPPER DO RENDERER PDF ──────────────────────────────────────────────
    /**
     * Renderer PDF para ExportService.
     * Recebe masterHash já validado — ExportService._sealAtomically() já o
     * actualizou em UNIFEDSystem.masterHash antes desta chamada.
     *
     * A função exportPDF original lê UNIFEDSystem.masterHash directamente,
     * pelo que o hash já está correcto no momento da invocação.
     *
     * @param {string} masterHash — SHA-256 de 64 hex chars validado pelo Service
     */
    async function _pdfRenderer(masterHash) {
        // Garantia explícita de consistência: forçar o hash validado no sistema
        // antes de invocar exportPDF, que o lê de UNIFEDSystem.masterHash.
        if (window.UNIFEDSystem && masterHash) {
            window.UNIFEDSystem.masterHash = masterHash;
            if (window.activeForensicSession) {
                window.activeForensicSession.masterHash = masterHash;
            }
        }

        // Invocar a implementação original de exportPDF (script.js)
        // Nota: a chamada interna a generateForensicSeal() dentro de exportPDF
        // é idempotente — hash já actualizado acima.
        if (typeof window._exportPDF_original === 'function') {
            await window._exportPDF_original();
        } else {
            throw new Error('_exportPDF_original não disponível. Registo falhou.');
        }
    }

    // ── WRAPPER DO RENDERER DOCX ─────────────────────────────────────────────
    /**
     * Renderer DOCX para ExportService.
     * window.exportDOCX pode ter sido wrappado pelo nexus.js (RAG).
     * O ExportService.export('docx') chama este renderer que, por sua vez,
     * invoca a cadeia completa: ExportService → _docxRenderer → nexus_wrap → enrichment.
     *
     * @param {string} masterHash — SHA-256 de 64 hex chars validado pelo Service
     */
    async function _docxRenderer(masterHash) {
        if (window.UNIFEDSystem && masterHash) {
            window.UNIFEDSystem.masterHash = masterHash;
            if (window.activeForensicSession) {
                window.activeForensicSession.masterHash = masterHash;
            }
        }

        // Invocar a implementação original de exportDOCX (enrichment.js),
        // possivelmente wrappada pelo nexus.js RAG.
        if (typeof window._exportDOCX_original === 'function') {
            await window._exportDOCX_original();
        } else {
            throw new Error('_exportDOCX_original não disponível. Registo falhou.');
        }
    }

    // ── CAPTURA E REGISTO — PDF ──────────────────────────────────────────────
    function _captureAndRegisterPDF() {
        var svc = window.UNIFEDExportService.getInstance();

        if (typeof window.exportPDF !== 'function') {
            _log('window.exportPDF ainda não definida. A aguardar...', 'warn');
            return false;
        }

        // Preservar a implementação original (pode ser o adaptador do Service
        // se já foi instalado; desambiguar)
        if (!window._exportPDF_original) {
            // Se já é o adaptador, não capturar — seria recursão infinita
            var fnStr = window.exportPDF.toString();
            if (fnStr.indexOf('_exportPDF_original') !== -1 || fnStr.indexOf('ExportService') !== -1) {
                _log('window.exportPDF já é um adaptador — a usar implementação interna.', 'warn');
                // Tentar recuperar do contexto de script.js via nome interno
                // Se não disponível, o registo não pode proceder de forma segura
                _log('AVISO: Certifique-se que unifed_export_register.js é carregado ANTES de unifed_export_service.js instalar adaptadores, OU após script.js mas antes da substituição final.', 'warn');
                return false;
            }
            window._exportPDF_original = window.exportPDF;
            _log('exportPDF original capturada e guardada em window._exportPDF_original.');
        }

        svc.register('pdf', _pdfRenderer);
        _log('Renderer "pdf" registado no ExportService.', 'log');
        return true;
    }

    // ── CAPTURA E REGISTO — DOCX ─────────────────────────────────────────────
    function _captureAndRegisterDOCX() {
        var svc = window.UNIFEDExportService.getInstance();

        if (typeof window.exportDOCX !== 'function') {
            _log('window.exportDOCX ainda não definida. A aguardar...', 'warn');
            return false;
        }

        if (!window._exportDOCX_original) {
            var fnStr = window.exportDOCX.toString();
            if (fnStr.indexOf('_exportDOCX_original') !== -1 || fnStr.indexOf('ExportService') !== -1) {
                _log('window.exportDOCX já é um adaptador — captura ignorada.', 'warn');
                return false;
            }
            window._exportDOCX_original = window.exportDOCX;
            _log('exportDOCX original capturada e guardada em window._exportDOCX_original.');
        }

        svc.register('docx', _docxRenderer);
        _log('Renderer "docx" registado no ExportService.', 'log');
        return true;
    }

    // ── INSTALAÇÃO DOS ADAPTADORES DE DELEGAÇÃO FINAIS ───────────────────────
    /**
     * Após o registo, substituir window.exportPDF e window.exportDOCX pelos
     * adaptadores que delegam para ExportService.export(type).
     * Isto fecha o ciclo: qualquer chamada directa a window.exportPDF passa
     * pelo lock, pela selagem atómica e pelo renderer registado.
     *
     * O nexus.js (RAG) wrappou window.exportDOCX antes deste passo.
     * O adaptador aqui instalado passa a ser o ponto de entrada final,
     * invocando ExportService.export('docx'), que chama _docxRenderer(),
     * que chama window._exportDOCX_original() (= o wrap do nexus.js),
     * que chama a implementação de enrichment.js.
     *
     * Cadeia completa (docx):
     *   UI button click
     *   → window.exportDOCX()     ← adaptador ExportService
     *   → ExportService.export('docx')
     *   → _sealAtomically()       ← hash validado
     *   → _docxRenderer()
     *   → window._exportDOCX_original()  ← nexus.js wrap
     *   → enrichment.js exportDOCX()     ← implementação original
     */
    function _installFinalAdapters() {
        var svc = window.UNIFEDExportService.getInstance();

        window.exportPDF = async function _exportPDFAdapter_Final() {
            try {
                await svc.export('pdf');
            } catch (err) {
                console.error('[ExportRegister] exportPDF final falhou:', err);
            }
        };

        window.exportDOCX = async function _exportDOCXAdapter_Final(xmlInject) {
            if (xmlInject !== undefined) {
                console.warn('[ExportRegister] Argumento xmlInject em exportDOCX ignorado — usar UNIFEDSystem directamente.');
            }
            try {
                await svc.export('docx');
            } catch (err) {
                console.error('[ExportRegister] exportDOCX final falhou:', err);
            }
        };

        _log('Adaptadores finais instalados (window.exportPDF, window.exportDOCX → ExportService).');
    }

    // ── PONTO DE ENTRADA PRINCIPAL ───────────────────────────────────────────
    function _init() {
        try {
            _assertDeps();
        } catch (err) {
            _log('Dependências não satisfeitas: ' + err.message, 'error');
            return;
        }

        var bus = window.UNIFEDEventBus;

        // Aguardar UNIFED_CORE_READY (script.js emite este evento após inicialização
        // do UNIFEDSystem). Neste ponto, exportPDF e exportDOCX já estão definidas.
        bus.waitFor('UNIFED_CORE_READY', 15000).then(function() {

            // Pequena pausa de microtask para garantir que nexus.js instalou o
            // seu wrap de exportDOCX (nexus.js é carregado após script.js).
            return Promise.resolve();

        }).then(function() {

            var pdfOk  = _captureAndRegisterPDF();
            var docxOk = _captureAndRegisterDOCX();

            if (pdfOk && docxOk) {
                _installFinalAdapters();
                _log('✅ Registo completo — PDF + DOCX + CUSTODY registados no ExportService.', 'log');

                // Diagnóstico de estado
                var status = window.UNIFEDExportService.getInstance().status();
                _log('ExportService.status(): ' + JSON.stringify(status));

            } else {
                // Tentar via MutationObserver se funções ainda não disponíveis
                _log('Funções não disponíveis após UNIFED_CORE_READY — iniciando observação.', 'warn');
                _startObserver();
            }

        }).catch(function(err) {
            _log('Timeout aguardando UNIFED_CORE_READY: ' + err.message, 'warn');
            // Tentativa directa
            var pdfOk  = _captureAndRegisterPDF();
            var docxOk = _captureAndRegisterDOCX();
            if (pdfOk && docxOk) { _installFinalAdapters(); }
        });
    }

    // ── FALLBACK: verificação periódica via rAF ──────────────────────────────
    function _startObserver() {
        var _attempts = 0;
        var _MAX_ATTEMPTS = 20;

        function _check() {
            _attempts++;
            if (_attempts > _MAX_ATTEMPTS) {
                _log('Limite de tentativas atingido (' + _MAX_ATTEMPTS + '). Registo não concluído.', 'error');
                return;
            }
            var pdfOk  = _captureAndRegisterPDF();
            var docxOk = _captureAndRegisterDOCX();
            if (pdfOk && docxOk) {
                _installFinalAdapters();
                _log('✅ Registo concluído via observer (tentativa ' + _attempts + ').', 'log');
            } else {
                setTimeout(_check, 500);
            }
        }
        _check();
    }

    // ── ARRANQUE ─────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init, { once: true });
    } else {
        _init();
    }

})();
