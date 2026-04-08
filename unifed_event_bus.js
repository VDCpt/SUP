/**
 * ============================================================================
 * UNIFED - PROBATUM · EVENT BUS CENTRALIZADO
 * ============================================================================
 * Ficheiro      : unifed_event_bus.js
 * Versão        : 1.0.0-RTF-UNIFED-2026-0406
 * ============================================================================
 * OBJECTIVO:
 *   Substituir TODOS os padrões setTimeout() usados para sincronização de
 *   estado entre módulos (script_injection.js, nexus.js, unifed_triada_export.js).
 *   Expõe um barramento de eventos publish/subscribe que:
 *     · Devolve Promises resolvidas quando o evento ocorre (waitFor).
 *     · Recorda eventos já emitidos (idempotente — re-subscritores recebem
 *       resolução imediata para eventos passados).
 *     · Rejeita com timeout configurável (padrão: 10 000 ms).
 *
 * EVENTOS PADRÃO DO SISTEMA:
 *   'UNIFED_CORE_READY'       — UNIFEDSystem inicializado (emitido por script.js)
 *   'UNIFED_DOM_READY'        — #pureDashboard injectado no DOM
 *   'UNIFED_EVIDENCE_LOADED'  — evidências carregadas e masterHash selado
 *   'UNIFED_EXPORT_READY'     — ExportService registado (pdf + docx)
 *
 * CONFORMIDADE: ISO/IEC 27037:2012 · DORA (UE) 2022/2554
 * ============================================================================
 */

'use strict';

window.UNIFEDEventBus = (function _UNIFEDEventBusIIFE() {

    /** @type {Object.<string, Function[]>} */
    var _handlers = Object.create(null);

    /**
     * Conjunto de eventos já emitidos. Permite resolução imediata de
     * waitFor() para subscritores tardios sem corrida de estado.
     * @type {Set<string>}
     */
    var _resolved = new Set();

    /**
     * Dados associados ao último emit de cada evento.
     * @type {Object.<string, *>}
     */
    var _resolvedData = Object.create(null);

    /**
     * Filas de Promises pendentes por evento.
     * @type {Object.<string, Array<{resolve: Function, timer: number}>>}
     */
    var _pending = Object.create(null);

    // ── UTILITÁRIO INTERNO ──────────────────────────────────────────────────
    function _log(msg) {
        console.log('[' + new Date().toISOString() + '] [UNIFEDEventBus] ' + msg);
    }

    // ── API PÚBLICA ──────────────────────────────────────────────────────────

    /**
     * Subscreve um handler a um evento. Chamado para CADA ocorrência.
     * @param {string}   event
     * @param {Function} handler
     */
    function on(event, handler) {
        if (typeof event !== 'string' || typeof handler !== 'function') {
            throw new TypeError('[UNIFEDEventBus] on() requer string e Function.');
        }
        if (!_handlers[event]) { _handlers[event] = []; }
        _handlers[event].push(handler);
    }

    /**
     * Subscreve um handler que é chamado uma única vez.
     * Se o evento já foi emitido, o handler é chamado de imediato de forma
     * assíncrona (microtask) para evitar re-entrância.
     * @param {string}   event
     * @param {Function} handler
     */
    function once(event, handler) {
        if (typeof event !== 'string' || typeof handler !== 'function') {
            throw new TypeError('[UNIFEDEventBus] once() requer string e Function.');
        }
        if (_resolved.has(event)) {
            var data = _resolvedData[event];
            Promise.resolve().then(function() { handler(data); });
            return;
        }
        function _wrapper(d) {
            off(event, _wrapper);
            handler(d);
        }
        on(event, _wrapper);
    }

    /**
     * Remove um handler previamente registado.
     * @param {string}   event
     * @param {Function} handler
     */
    function off(event, handler) {
        if (_handlers[event]) {
            _handlers[event] = _handlers[event].filter(function(h) { return h !== handler; });
        }
    }

    /**
     * Emite um evento, notificando todos os handlers registados.
     * Marca o evento como resolvido para futuros waitFor().
     * @param {string} event
     * @param {*}      [data]
     */
    function emit(event, data) {
        if (typeof event !== 'string') {
            throw new TypeError('[UNIFEDEventBus] emit() requer string.');
        }
        _resolved.add(event);
        _resolvedData[event] = data;

        // Notificar handlers subscritos
        var handlers = (_handlers[event] || []).slice(); // cópia — handlers podem chamar off()
        handlers.forEach(function(h) {
            try { h(data); } catch (err) {
                console.error('[UNIFEDEventBus] Erro no handler de "' + event + '":', err);
            }
        });

        // Resolver Promises pendentes
        if (_pending[event]) {
            _pending[event].forEach(function(entry) {
                clearTimeout(entry.timer);
                entry.resolve(data);
            });
            delete _pending[event];
        }

        _log('emit("' + event + '") — ' + (_handlers[event] ? _handlers[event].length : 0) + ' handlers notificados.');
    }

    /**
     * Devolve uma Promise que resolve quando o evento for emitido.
     * Se o evento já foi emitido, resolve de imediato.
     * Rejeita após timeoutMs milissegundos (padrão: 10 000).
     *
     * SUBSTITUI: await new Promise(r => setTimeout(r, N))
     * USO:        await UNIFEDEventBus.waitFor('UNIFED_DOM_READY', 8000)
     *
     * @param {string} event
     * @param {number} [timeoutMs=10000]
     * @returns {Promise<*>}
     */
    function waitFor(event, timeoutMs) {
        if (typeof event !== 'string') {
            return Promise.reject(new TypeError('[UNIFEDEventBus] waitFor() requer string.'));
        }
        if (_resolved.has(event)) {
            return Promise.resolve(_resolvedData[event]);
        }
        var _ms = (typeof timeoutMs === 'number' && timeoutMs > 0) ? timeoutMs : 10000;
        return new Promise(function(resolve, reject) {
            if (!_pending[event]) { _pending[event] = []; }
            var timer = setTimeout(function() {
                var idx = (_pending[event] || []).findIndex(function(e) { return e.resolve === resolve; });
                if (idx !== -1 && _pending[event]) { _pending[event].splice(idx, 1); }
                reject(new Error('[UNIFEDEventBus] Timeout (' + _ms + 'ms) aguardando evento: "' + event + '"'));
            }, _ms);
            _pending[event].push({ resolve: resolve, timer: timer });
        });
    }

    /**
     * Devolve true se o evento já foi emitido pelo menos uma vez.
     * @param {string} event
     * @returns {boolean}
     */
    function hasResolved(event) {
        return _resolved.has(event);
    }

    /**
     * Devolve snapshot de diagnóstico — não expõe referências internas.
     * @returns {Object}
     */
    function diagnostics() {
        var snap = Object.create(null);
        snap.resolvedEvents  = Array.from(_resolved);
        snap.pendingEvents   = Object.keys(_pending);
        snap.subscribedEvents = Object.keys(_handlers).reduce(function(acc, k) {
            acc[k] = _handlers[k].length;
            return acc;
        }, Object.create(null));
        return snap;
    }

    // ── EXPOSIÇÃO: interface pública congelada ───────────────────────────────
    return Object.freeze({
        on:           on,
        once:         once,
        off:          off,
        emit:         emit,
        waitFor:      waitFor,
        hasResolved:  hasResolved,
        diagnostics:  diagnostics
    });

})();

// ── COMPATIBILIDADE: reemitir evento legado window.dispatchEvent ──────────────
// Script.js emite: new CustomEvent('UNIFED_CORE_READY')
// O EventBus monitoriza o evento nativo e propaga internamente.
(function _bridgeLegacyEvents() {
    var _LEGACY_EVENTS = ['UNIFED_CORE_READY'];
    _LEGACY_EVENTS.forEach(function(evtName) {
        window.addEventListener(evtName, function(e) {
            if (!window.UNIFEDEventBus.hasResolved(evtName)) {
                window.UNIFEDEventBus.emit(evtName, e && e.detail ? e.detail : undefined);
            }
        }, { once: true });
    });
    console.log('[UNIFEDEventBus] Bridge de eventos legados instalada para: ' + _LEGACY_EVENTS.join(', ') + '.');
})();
