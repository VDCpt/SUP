/**
 * ============================================================================
 * UNIFED - PROBATUM · SERVIÇO DE EXPORTAÇÃO UNIFICADO (SINGLETON)
 * ============================================================================
 * Ficheiro      : unifed_export_service.js
 * Versão        : 1.0.0-RTF-UNIFED-2026-0406
 * ============================================================================
 * OBJECTIVO:
 *   Centralizar a lógica de exportPDF e exportDOCX (actualmente fragmentada
 *   entre enrichment.js, script.js e unifed_triada_export.js) num único
 *   serviço Singleton que:
 *     1. Realiza a selagem criptográfica (Master Hash) de forma ATÓMICA antes
 *        de qualquer serialização de ficheiro.
 *     2. Previne chamadas concorrentes (lock optimista).
 *     3. Emite eventos UNIFEDEventBus.emit('UNIFED_EXPORT_READY') após
 *        registo dos renderers.
 *     4. Expõe interface pública congelada via Object.freeze().
 *
 * ARQUITECTURA:
 *   · ExportService.getInstance()     → instância única (Singleton)
 *   · instance.register(type, fn)     → regista renderer ('pdf' | 'docx' | 'custody')
 *   · instance.export(type)           → sela + serializa atomicamente
 *   · instance.status()               → diagnóstico sem mutação
 *
 * ELIMINAÇÃO DE DUPLICADOS:
 *   · window.exportPDF   (script.js L5291)    → delegado via register('pdf', fn)
 *   · window.exportDOCX  (enrichment.js L636) → delegado via register('docx', fn)
 *   · gerarAnexoCustodia (triada L79)         → delegado via register('custody', fn)
 *   Todos chamam instance.export(type) — a selagem ocorre uma única vez,
 *   atomicamente, independentemente do ponto de entrada.
 *
 * DEPENDÊNCIAS:
 *   · window.UNIFEDEventBus   (unifed_event_bus.js — carregado antes)
 *   · window.UNIFEDSystem     (script.js — disponível após UNIFED_CORE_READY)
 *
 * CONFORMIDADE: ISO/IEC 27037:2012 · DORA (UE) 2022/2554
 * ============================================================================
 */

'use strict';

window.UNIFEDExportService = (function _UNIFEDExportServiceIIFE() {

    // ── ESTADO INTERNO (não exposto) ─────────────────────────────────────────
    var _instance = null;

    var _state = {
        renderers: Object.create(null),  // { pdf: fn, docx: fn, custody: fn }
        locked:    false,                // lock de exportação em curso
        lastHash:  null,                 // último masterHash selado
        lastType:  null,                 // último tipo exportado
        exportCount: 0                   // contador de exportações (auditoria)
    };

    // ── TIPOS VÁLIDOS ────────────────────────────────────────────────────────
    var _VALID_TYPES = ['pdf', 'docx', 'custody'];

    // ── UTILITÁRIO INTERNO ───────────────────────────────────────────────────
    function _log(msg, level) {
        var _method = { warn: 'warn', error: 'error', success: 'info' }[level] || 'log';
        console[_method]('[' + new Date().toISOString() + '] [ExportService] ' + msg);
    }

    // ── SELAGEM ATÓMICA ──────────────────────────────────────────────────────
    /**
     * Executa a selagem criptográfica ANTES de qualquer serialização.
     * Chama UNIFEDSystem.generateForensicSeal() se disponível.
     * Valida que o hash resultante tem exactamente 64 caracteres hexadecimais.
     *
     * @returns {Promise<string>} masterHash validado (64 hex chars, uppercase)
     * @throws  {Error}          se UNIFEDSystem não inicializado ou hash inválido
     */
    async function _sealAtomically() {
        var sys = window.UNIFEDSystem;
        if (!sys) {
            throw new Error('UNIFEDSystem não inicializado. Aguardar UNIFED_CORE_READY.');
        }

        // Actualizar hash dinâmico se o motor forense estiver disponível
        if (typeof sys.generateForensicSeal === 'function') {
            try {
                await sys.generateForensicSeal();
                _log('generateForensicSeal() executado com sucesso.');
            } catch (sealErr) {
                _log('generateForensicSeal() falhou: ' + sealErr.message + '. Usando hash existente.', 'warn');
            }
        }

        var hash = sys.masterHash;

        // Validação estrita: SHA-256 = 64 caracteres hexadecimais
        if (typeof hash !== 'string' || !/^[0-9A-Fa-f]{64}$/.test(hash)) {
            throw new Error(
                'Master Hash inválido: ' +
                (hash ? '"' + hash.substring(0, 16) + '..." (' + hash.length + ' chars)' : 'null/undefined') +
                '. Carregue evidências antes de exportar.'
            );
        }

        _state.lastHash = hash.toUpperCase();
        _log('Selagem atómica concluída. Hash prefix: ' + _state.lastHash.substring(0, 12) + '...');
        return _state.lastHash;
    }

    // ── INSTÂNCIA SINGLETON ──────────────────────────────────────────────────
    function _createInstance() {

        /**
         * Regista um renderer para um tipo de exportação.
         * Deve ser chamado pelos módulos respectivos durante a inicialização.
         * Quando todos os tipos críticos (pdf + docx) estiverem registados,
         * emite 'UNIFED_EXPORT_READY' no EventBus.
         *
         * @param {'pdf'|'docx'|'custody'} type
         * @param {Function} rendererFn   - função async que recebe (masterHash: string)
         */
        function register(type, rendererFn) {
            if (_VALID_TYPES.indexOf(type) === -1) {
                throw new TypeError('[ExportService] Tipo inválido: "' + type + '". Aceites: ' + _VALID_TYPES.join(', '));
            }
            if (typeof rendererFn !== 'function') {
                throw new TypeError('[ExportService] rendererFn deve ser uma Function.');
            }
            _state.renderers[type] = rendererFn;
            _log('Renderer "' + type + '" registado.');

            // Emitir UNIFED_EXPORT_READY quando pdf + docx estiverem ambos registados
            if (_state.renderers['pdf'] && _state.renderers['docx']) {
                if (window.UNIFEDEventBus && !window.UNIFEDEventBus.hasResolved('UNIFED_EXPORT_READY')) {
                    window.UNIFEDEventBus.emit('UNIFED_EXPORT_READY', { types: Object.keys(_state.renderers) });
                    _log('UNIFED_EXPORT_READY emitido.', 'success');
                }
            }
        }

        /**
         * Exporta um documento do tipo especificado.
         * GARANTE:
         *   1. Selagem atómica antes da serialização.
         *   2. Apenas uma exportação em curso por vez (lock).
         *   3. O renderer recebe sempre o hash validado.
         *
         * @param {'pdf'|'docx'|'custody'} type
         * @returns {Promise<void>}
         */
        async function exportDocument(type) {
            if (_VALID_TYPES.indexOf(type) === -1) {
                throw new TypeError('[ExportService] Tipo inválido: "' + type + '".');
            }

            if (_state.locked) {
                _log('Exportação "' + type + '" rejeitada: outra exportação em curso.', 'warn');
                if (typeof window.showToast === 'function') {
                    window.showToast('Exportação em curso. Aguardar conclusão.', 'warn');
                }
                return;
            }

            if (!_state.renderers[type]) {
                throw new Error('[ExportService] Renderer não registado para tipo: "' + type + '".');
            }

            _state.locked = true;
            _log('Exportação "' + type + '" iniciada (lock adquirido).');

            try {
                // ── PASSO 1: Selagem atómica (DEVE ocorrer antes da serialização) ──
                var masterHash = await _sealAtomically();

                // ── PASSO 2: Invocar renderer com hash validado ───────────────────
                await _state.renderers[type](masterHash);

                _state.lastType = type;
                _state.exportCount++;
                _log('Exportação "' + type + '" concluída (total: ' + _state.exportCount + ').', 'success');

            } catch (err) {
                _log('Exportação "' + type + '" falhou: ' + err.message, 'error');
                if (typeof window.showToast === 'function') {
                    window.showToast('Erro na exportação: ' + err.message, 'error');
                }
                if (typeof window.logAudit === 'function') {
                    window.logAudit('❌ [ExportService] Falha em "' + type + '": ' + err.message, 'error');
                }
                throw err;

            } finally {
                _state.locked = false;
                _log('Lock "' + type + '" libertado.');
            }
        }

        /**
         * Devolve um snapshot de diagnóstico sem expor referências internas.
         * @returns {Object}
         */
        function status() {
            return Object.freeze({
                registeredTypes: Object.keys(_state.renderers).slice(),
                locked:          _state.locked,
                lastType:        _state.lastType,
                lastHashPrefix:  _state.lastHash ? _state.lastHash.substring(0, 12) + '...' : null,
                exportCount:     _state.exportCount
            });
        }

        return Object.freeze({
            register:       register,
            export:         exportDocument,
            status:         status
        });
    }

    // ── GETTER SINGLETON ─────────────────────────────────────────────────────
    function getInstance() {
        if (!_instance) {
            _instance = _createInstance();
            _log('Instância Singleton criada.');
        }
        return _instance;
    }

    // ── EXPOSIÇÃO PÚBLICA ────────────────────────────────────────────────────
    return Object.freeze({ getInstance: getInstance });

})();

// ── ADAPTADORES DE COMPATIBILIDADE ───────────────────────────────────────────
// Mantém window.exportPDF e window.exportDOCX funcionais para código legado
// que ainda os chame directamente, delegando para o ExportService.
// Os renderers reais são registados pelos módulos originais (script.js e
// enrichment.js) após UNIFED_CORE_READY, usando:
//
//   UNIFEDExportService.getInstance().register('pdf',  exportPDF_impl);
//   UNIFEDExportService.getInstance().register('docx', exportDOCX_impl);
//
// Estas linhas devem ser adicionadas ao final das definições originais.
// O adaptador abaixo garante retrocompatibilidade durante a transição.
(function _installCompatAdapters() {
    var _svc = window.UNIFEDExportService.getInstance();

    // Substituir window.exportPDF pelo adaptador de delegação
    window.exportPDF = async function _exportPDFAdapter() {
        try {
            await _svc.export('pdf');
        } catch (err) {
            console.error('[ExportService·Adapter] exportPDF falhou:', err);
        }
    };

    // Substituir window.exportDOCX pelo adaptador de delegação
    window.exportDOCX = async function _exportDOCXAdapter(xmlInject) {
        // xmlInject é passado pelo nexus.js — preservar para compatibilidade
        // O renderer deve inspeccionar window.UNIFEDSystem directamente
        // (o argumento xmlInject é descontinuado nesta arquitectura).
        if (xmlInject !== undefined) {
            console.warn('[ExportService·Adapter] Argumento xmlInject ignorado — usar UNIFEDSystem.xmlInject.');
        }
        try {
            await _svc.export('docx');
        } catch (err) {
            console.error('[ExportService·Adapter] exportDOCX falhou:', err);
        }
    };

    console.log('[ExportService] Adaptadores de compatibilidade instalados (window.exportPDF, window.exportDOCX).');
})();
