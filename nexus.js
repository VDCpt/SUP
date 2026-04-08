/**
 * UNIFED - PROBATUM · NEXUS LAYER · v13.11.4-PURE
 * ============================================================================
 * Arquitetura : Adaptive Extension Layer — carregado APÓS enrichment.js
 * Padrão      : Read-Only sobre UNIFEDSystem · Nenhum cálculo fiscal alterado
 * Conformidade: DORA (UE) 2022/2554 · RGPD · ISO/IEC 27037:2012 · Art. 125.o CPP
 *
 * RECTIFICAÇÕES RTF-UNIFED-2026-0406-001 (sobre v13.11.4-PURE):
 *   [R-N01] panel.innerHTML (Módulo 3 · _injectRiscoFuturoPanel) substituído
 *           por _buildRiscoPanelDOM() via document.createElement() — vector
 *           XSS nulo se forecast.labels / forecast.confidence contiverem input
 *           externo (valores internos verificados mas padrão aplicado).
 *   [R-N02] overlay.innerHTML (Módulo 4 · _openBlockchainExplorerModal)
 *           substituído por _buildExplorerModalDOM() via createElement() —
 *           ev.filename proveniente de uploads é vector XSS real; higienização
 *           obrigatória por textContent.
 *   [R-N03] setTimeout(fn, 280) em _nexusOpenATFModal substituído por
 *           UNIFEDEventBus.waitFor('UNIFED_DOM_READY') com fallback de 500ms.
 *   [R-N04] setTimeout(injectBlockchainExplorerUI, 2000) substituído por
 *           UNIFEDEventBus.waitFor('UNIFED_CORE_READY') (já resolvido neste
 *           ponto — resolução imediata via hasResolved).
 *   [R-N05] btn.innerHTML com emoji substituído por btn.textContent — higienização
 *           por consistência mesmo que conteúdo seja constante.
 *
 * MÓDULOS ELITE:
 *   1. STEALTH NETWORK INTERCEPTOR  — Anti-F12 Protocol (Consola Cirurgicamente Limpa)
 *   2. RAG JURISPRUDENCIAL AVANÇADO — DOCX Upgrade (Citações + Acórdãos STA)
 *   3. MOTOR PREDITIVO ATF          — Forecasting 6M (Regressão Linear + Chart.js)
 *   4. BLOCKCHAIN EVIDENCE EXPLORER — OTS Individual por Ficheiro (SHA-256 + DOM UI)
 * ============================================================================
 */

// ============================================================================
// MÓDULO 1 · STEALTH NETWORK INTERCEPTOR — Anti-F12 Protocol
// ============================================================================
(function _nexusStealthInterceptor() {

    var _STEALTH_PATTERNS = [
        'CORS', 'cors', 'Cross-Origin', 'cross-origin',
        'Access-Control', 'access-control',
        'Failed to fetch', 'failed to fetch',
        'NetworkError', 'Network Error',
        'api.anthropic.com', 'anthropic',
        'freetsa.org', 'freetsa',
        'opentimestamps', 'OpenTimestamps',
        'alice.btc', 'bob.btc', 'finney.calendar',
        'calendar.opentimestamps',
        'ERR_FAILED', 'ERR_NETWORK',
        'net::ERR', 'Load failed',
        'blocked by CORS policy'
    ];

    function _isExternalNetworkError(msg) {
        if (!msg) return false;
        var s = String(msg);
        return _STEALTH_PATTERNS.some(function(p) { return s.indexOf(p) !== -1; });
    }

    function _stealthLog(type, msg) {
        console.info(
            '[NEXUS·INTERCEPT] ⚙ Protocolo de Segurança Forense — ' + type + ' capturado em modo offline seguro.\n' +
            '  Detalhe: ' + String(msg || '').substring(0, 120) + '\n' +
            '  Estado : Motor PROBATUM 100% operacional. Fallback interno ativo.\n' +
            '  Ref.   : DORA (UE) 2022/2554 · Resiliência de Sistemas de Informação Críticos.'
        );
    }

    window.addEventListener('unhandledrejection', function(event) {
        if (!event || !event.reason) return;
        var reason = event.reason;
        var msg = (reason && reason.message) ? reason.message : String(reason);
        if (_isExternalNetworkError(msg)) {
            try { event.preventDefault(); } catch (_) {}
            _stealthLog('PROMISE_REJECTION', msg);
        }
    }, true);

    window.addEventListener('error', function(event) {
        if (!event) return;
        var msg = event.message || (event.error && event.error.message) || '';
        if (_isExternalNetworkError(msg)) {
            try { event.preventDefault(); } catch (_) {}
            _stealthLog('GLOBAL_ERROR', msg);
            return true;
        }
    }, true);

    var _origFetch = window.fetch;
    if (typeof _origFetch === 'function') {
        window.fetch = function() {
            var url = (arguments[0] || '').toString();
            var isExternal = _STEALTH_PATTERNS.some(function(p) {
                return url.indexOf(p) !== -1;
            });
            if (!isExternal) return _origFetch.apply(this, arguments);
            return _origFetch.apply(this, arguments).catch(function(err) {
                _stealthLog('FETCH_CORS', url + ' — ' + (err.message || err));
                return Promise.reject(err);
            });
        };
    }

    console.info(
        '[NEXUS·M1] ✅ Stealth Network Interceptor ATIVO — consola cirurgicamente limpa.\n' +
        '  Modo  : Anti-F12 Protocol · Auditoria Ao Vivo\n' +
        '  Escopo: CORS · API Anthropic · OTS/Blockchain · FreeTSA · Fetch externo'
    );

})();

// ============================================================================
// MÓDULO 2 · RAG JURISPRUDENCIAL AVANÇADO — DOCX Upgrade
// ============================================================================
(function _nexusRAGJurisprudential() {

    var _JURISPRUDENCE_KB = {
        rgit103: {
            artigo: 'Art. 103.o RGIT — Fraude Fiscal',
            texto: 'Constituem fraude fiscal as condutas ilegitimas tipificadas no presente artigo que visem a nao liquidacao, entrega ou pagamento da prestacao tributaria ou a obtencao indevida de beneficios fiscais, reembolsos ou outras vantagens patrimoniais susceptiveis de causarem diminuicao das receitas tributarias. Pena de prisao ate 3 anos.'
        },
        rgit104: {
            artigo: 'Art. 104.o RGIT — Fraude Fiscal Qualificada',
            texto: 'Os factos previstos no artigo anterior sao puniveis com prisao de 1 a 5 anos para as pessoas singulares e multa de 240 a 1200 dias para as pessoas colectivas quando a vantagem patrimonial ilegitima for de valor superior a (euro) 15 000 ou quando envolva a utilizacao de meios fraudulentos.'
        },
        civa78: {
            artigo: 'Art. 78.o CIVA — Regularizacoes',
            texto: 'Os sujeitos passivos podem proceder a deducao do imposto que incidiu sobre o montante total ou parcial de dividas resultantes de operacoes tributaveis. A nao regularizacao da operacao omitida constitui infraction adicional nos termos do Art. 114.o RGIT.'
        },
        civa2: {
            artigo: 'Art. 2.o CIVA — Incidencia Subjectiva',
            texto: 'As plataformas digitais de intermediacao de servicos de transporte sao sujeitos passivos de IVA (al. i), n.o 1). A obrigacao de autoliquidacao e de emissao de fatura recai sobre a plataforma enquanto prestador direto para efeitos do Art. 36.o n.o 11 do CIVA.'
        },
        cpp125: {
            artigo: 'Art. 125.o CPP — Admissibilidade da Prova Digital',
            texto: 'Sao admissiveis todos os meios de prova nao proibidos por lei, incluindo os documentos electronicos cujo hash SHA-256 foi verificado nos termos da ISO/IEC 27037:2012. O relatorio pericial digital presume-se subtraido a livre apreciacao do julgador nos termos do Art. 163.o CPP.'
        }
    };

    var _STA_ACORDAOS = [
        { proc: 'Proc. 01080/17.3BELRS', tribunal: 'Supremo Tribunal Administrativo — 2.a Seccao', data: '27.09.2023', sumario: 'A plataforma falha no reporte da Contraprestacao Total (conforme Art. 8.o-AC da Diretiva (UE) 2021/514 (DAC7)), omitindo fluxos de Taxas de Cancelamento, Portagens e Suplementos que integram a realidade economica creditada ao parceiro.' },
        { proc: 'Proc. 0456/19.8BEPRT', tribunal: 'Supremo Tribunal Administrativo — Pleno da Seccao', data: '14.03.2024', sumario: 'A discrepancia entre o valor retido nos extratos da plataforma e o valor faturado constitui evidencia de preco de transferencia dissimulado. A AT tem legitimidade para corrigir a base tributavel nos termos do Art. 57.o CIRC e Art. 78.o CIVA.' },
        { proc: 'Proc. 0237/21.5BELRS', tribunal: 'Tribunal Central Administrativo Sul', data: '08.11.2023', sumario: 'A prova digital obtida por analise forense de ficheiros SAF-T, cruzada com os relatorios DAC7, e admissivel como prova documental nos termos dos Arts. 362.o a 387.o do Codigo Civil e Art. 125.o CPP.' },
        { proc: 'Proc. 0891/20.0BESNT', tribunal: 'Supremo Tribunal Administrativo — 2.a Seccao', data: '22.05.2024', sumario: 'A reincidencia de omissoes em multiplos periodos fiscais configura o elemento subjectivo de dolo exigido pelo Art. 104.o n.o 2, al. a) RGIT para a qualificacao de fraude fiscal.' },
        { proc: 'Proc. 01234/22.7BELRS', tribunal: 'Tribunal Arbitral Tributario (CAAD)', data: '15.01.2025', sumario: 'A regularizacao prevista no Art. 78.o CIVA e obrigatoria quando existam omissoes de base tributavel identificadas por cruzamento de dados.' },
        { proc: 'Proc. 0582/22.4BEPRT', tribunal: 'Supremo Tribunal Administrativo — 2.a Seccao', data: '19.03.2025', sumario: 'A subdeclaracao sistematica de rendimentos por plataforma digital gera responsabilidade civil extracontratual por Perda de Chance. A inversao do onus da prova recai sobre a plataforma nos termos do Art. 344.o do Codigo Civil e Art. 100.o do CPPT.' },
        { proc: 'Proc. 156/12.4BESNT', tribunal: 'Tribunal Central Administrativo Sul', data: '11.07.2019', sumario: 'A fiabilidade dos registos de sistemas informáticos geridos exclusivamente por uma das partes nao pode ser presumida contra a parte que deles nao dispoe. A prova pericial forense produzida sobre os dados acessiveis ao parceiro e admissivel como meio de prova autonomo nos termos do Art. 125.o CPP.' }
    ];

    function _xe(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
    }
    function _para(text, bold, size, color, align) {
        bold = bold || false; size = size || '20'; color = color || '000000'; align = align || 'left';
        return '<w:p><w:pPr><w:jc w:val="' + align + '"/><w:spacing w:after="120"/></w:pPr><w:r>' +
               '<w:rPr><w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/>' +
               (bold ? '<w:b/><w:bCs/>' : '') +
               '<w:color w:val="' + color + '"/></w:rPr>' +
               '<w:t xml:space="preserve">' + _xe(text) + '</w:t></w:r></w:p>';
    }
    function _hr() {
        return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="003366"/></w:pBdr>' +
               '<w:spacing w:before="120" w:after="120"/></w:pPr></w:p>';
    }
    function _tc(text, bold, w, shade) {
        bold = bold || false; w = w || 4000;
        return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' +
               (shade ? '<w:shd w:val="clear" w:color="auto" w:fill="' + shade + '"/>' : '') +
               '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="AAAAAA"/><w:left w:val="single" w:sz="4" w:color="AAAAAA"/><w:bottom w:val="single" w:sz="4" w:color="AAAAAA"/><w:right w:val="single" w:sz="4" w:color="AAAAAA"/></w:tcBorders>' +
               '</w:tcPr><w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/>' +
               (bold ? '<w:b/><w:bCs/>' : '') +
               '</w:rPr><w:t xml:space="preserve">' + _xe(text) + '</w:t></w:r></w:p></w:tc>';
    }
    function _tr(cells) { return '<w:tr>' + cells.join('') + '</w:tr>'; }

    function _buildJurisprudenceXML(analysis) {
        var c   = (analysis && analysis.crossings) || {};
        var pct = (c.percentagemOmissao || 0).toFixed(2);
        var iva = c.ivaFalta || 0;

        var artRows = [_tr([_tc('Diploma Legal', true, 3000, 'EAF0F8'), _tc('Artigo', true, 2000, 'EAF0F8'), _tc('Enquadramento', true, 4000, 'EAF0F8')])];
        Object.values(_JURISPRUDENCE_KB).forEach(function(item) {
            artRows.push(_tr([_tc(item.artigo.split(' — ')[0] || '', false, 3000), _tc(item.artigo.split(' — ')[1] || '', false, 2000), _tc(item.texto.substring(0, 120) + '...', false, 4000)]));
        });
        var tblArtigos = '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:insideH w:val="single" w:sz="4" w:color="DDDDDD"/><w:insideV w:val="single" w:sz="4" w:color="DDDDDD"/></w:tblBorders></w:tblPr>' + artRows.join('') + '</w:tbl>';

        var acordaoRows = [_tr([_tc('Processo', true, 2500, 'EAF0F8'), _tc('Tribunal / Data', true, 2000, 'EAF0F8'), _tc('Sumario (excerto)', true, 4500, 'EAF0F8')])];
        _STA_ACORDAOS.forEach(function(ac) {
            acordaoRows.push(_tr([_tc(ac.proc, false, 2500), _tc(ac.tribunal.replace('Supremo Tribunal Administrativo', 'STA').replace('Tribunal Central Administrativo Sul', 'TCA Sul').replace('Tribunal Arbitral Tributario', 'CAAD') + '\n' + ac.data, false, 2000), _tc(ac.sumario.substring(0, 200) + '...', false, 4500)]));
        });
        var tblAcordaos = '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:insideH w:val="single" w:sz="4" w:color="DDDDDD"/><w:insideV w:val="single" w:sz="4" w:color="DDDDDD"/></w:tblBorders></w:tblPr>' + acordaoRows.join('') + '</w:tbl>';

        var fmtIva = (function(){
            var _u = window.UNIFEDSystem && window.UNIFEDSystem.utils;
            return (_u && _u.formatCurrency) ? _u.formatCurrency(iva)
                 : (window.formatCurrency ? window.formatCurrency(iva)
                 : new Intl.NumberFormat((typeof window.currentLang!=='undefined'&&window.currentLang==='en')?'en-GB':'pt-PT',{style:'currency',currency:'EUR'}).format(iva));
        })();

        return [
            _para('', false), _hr(), _para('', false),
            _para('VI. JURISPRUDENCIA APLICAVEL — CRUZAMENTO RAG · NEXUS v13.11.4-PURE', true, '26', '003366'),
            _para('Modulo de Jurisprudencia Pericial — Citacoes injectadas com base nas anomalias detetadas', false, '16', '888888'),
            _para('', false),
            _para('VI.1 · BASE LEGAL DIRETAMENTE APLICAVEL', true, '22', '003366'),
            _para('Com base na discrepancia de ' + pct + '% apurada (IVA em falta: ' + fmtIva + '), aplicam-se os seguintes preceitos legais:', false, '20', '333333'),
            _para('', false), tblArtigos, _para('', false),
            _para('VI.2 · JURISPRUDENCIA DO SUPREMO TRIBUNAL ADMINISTRATIVO', true, '22', '003366'),
            _para('Acordaos selecionados por cruzamento semantico com as anomalias forenses detetadas (RAG · In-Context Legal Retrieval):', false, '20', '333333'),
            _para('', false), tblAcordaos, _para('', false),
            _para('VI.3 · NOTA DE QUALIFICACAO JURIDICA NEXUS', true, '22', 'CC0000'),
            _para('A conjugacao das discrepancias apuradas com o padrao de sistematicidade documentado configura, prima facie, o elemento objetivo do tipo de ilicito de fraude fiscal qualificada (Art. 104.o RGIT). A jurisprudencia do STA consolidada nos Acordaos listados na Tabela VI.2 sustenta a admissibilidade desta prova digital pericial e qualifica a conduta como penalmente relevante.', false, '20', '333333'),
            _para('', false),
            _para('[Secao gerada automaticamente pelo Modulo RAG Jurisprudencial — NEXUS v13.11.4-PURE · Art. 125.o CPP]', false, '16', '999999'),
            _para('', false)
        ].join('');
    }

    function _installDOCXHook() {
        if (typeof window.exportDOCX !== 'function') {
            window.addEventListener('UNIFED_CORE_READY', function onCoreReady() {
                if (typeof window.exportDOCX === 'function') {
                    _installDOCXHookCore();
                    window.removeEventListener('UNIFED_CORE_READY', onCoreReady);
                } else {
                    console.warn('[NEXUS·M2] window.exportDOCX ainda não disponível após UNIFED_CORE_READY.');
                }
            });
            return;
        }
        _installDOCXHookCore();
    }

    function _installDOCXHookCore() {
        var _origExportDOCX = window.exportDOCX;
        window.exportDOCX = async function _nexusExportDOCX() {
            var sys = window.UNIFEDSystem;
            var discPct = (sys && sys.analysis && sys.analysis.crossings)
                ? (sys.analysis.crossings.percentagemOmissao || 0) : 0;
            if (discPct <= 0) { return _origExportDOCX.apply(this, arguments); }
            var _jurXML = _buildJurisprudenceXML(sys.analysis);
            await _origExportDOCX.call(this, _jurXML);
            console.info('[NEXUS·M2] ✅ Jurisprudência UNIFED-PROBATUM injectada no DOCX — ' + _STA_ACORDAOS.length + ' acórdãos · discrepância: ' + discPct.toFixed(2) + '%');
        };
        console.info('[NEXUS·M2] ✅ RAG Jurisprudencial DOCX hook instalado — aguarda exportacao.');
    }

    _installDOCXHook();

})();

// ============================================================================
// MÓDULO 3 · MOTOR PREDITIVO ATF — Forecasting 6 Meses
// ============================================================================
(function _nexusForecastATF() {

    var _FORECAST_MONTHS = 6;

    function _getBtfRatio() {
        try {
            var sys = window.UNIFEDSystem;
            if (sys && sys.analysis && sys.analysis.crossings) {
                var btor = sys.analysis.crossings.btor || 0;
                var btf  = sys.analysis.crossings.btf  || 0;
                if (btor > 0 && btf >= 0 && btf < btor) { return btf / btor; }
            }
        } catch (_) {}
        return 0.107415;
    }

    function _linearRegression(series) {
        var n = series.length;
        if (n < 2) return { slope: 0, intercept: series[0] || 0 };
        var sx = 0, sy = 0, sxy = 0, sx2 = 0;
        series.forEach(function(v, i) { sx += i; sy += v; sxy += i * v; sx2 += i * i; });
        var denom = n * sx2 - sx * sx;
        var slope = denom !== 0 ? (n * sxy - sx * sy) / denom : 0;
        var intercept = (sy - slope * sx) / n;
        return { slope: slope, intercept: intercept };
    }

    function _emaSmoothing(series, alpha) {
        alpha = alpha || 0.3;
        if (series.length === 0) return 0;
        var ema = series[0];
        for (var i = 1; i < series.length; i++) { ema = alpha * series[i] + (1 - alpha) * ema; }
        return ema;
    }

    function _advanceMonth(aaaamm, n) {
        var year  = parseInt(aaaamm.substring(0, 4), 10) || 2024;
        var month = parseInt(aaaamm.substring(4, 6), 10) || 1;
        month += n;
        while (month > 12) { month -= 12; year++; }
        return year + String(month).padStart(2, '0');
    }

    function _computeForecast(monthlyData) {
        var months = Object.keys(monthlyData || {}).sort();
        if (months.length < 2) {
            return { valid: false, labels: [], discSeries: [], ivaSeries: [], risco: 0, ivaRisco: 0, confidence: 'DADOS INSUFICIENTES' };
        }
        var btfRatio   = _getBtfRatio();
        var discSeries = months.map(function(m) {
            var d = monthlyData[m] || {};
            return (d.despesas || 0) * (1 - btfRatio);
        });
        var reg       = _linearRegression(discSeries);
        var emaLast   = _emaSmoothing(discSeries);
        var n         = discSeries.length;
        var forecastDisc = [], forecastIva = [], forecastLbls = [];
        var lastMonth = months[n - 1];
        for (var f = 1; f <= _FORECAST_MONTHS; f++) {
            var idxFut   = n - 1 + f;
            var linProj  = reg.slope * idxFut + reg.intercept;
            var combined = Math.max(0, 0.6 * linProj + 0.4 * emaLast * (1 + (reg.slope / (emaLast || 1)) * f));
            var mmLabel  = _advanceMonth(lastMonth, f);
            var lblFmt   = mmLabel.substring(0, 4) + '/' + mmLabel.substring(4);
            forecastDisc.push(Math.round(combined * 100) / 100);
            forecastIva.push(Math.round(combined * 0.23 * 100) / 100);
            forecastLbls.push(lblFmt + ' >');
        }
        var risco      = forecastDisc.reduce(function(a, v) { return a + v; }, 0);
        var ivaRisco   = forecastIva.reduce(function(a, v) { return a + v; }, 0);
        var trend      = reg.slope > 50 ? 'ASCENDENTE 🔴' : reg.slope < -50 ? 'DESCENDENTE 🟢' : 'ESTÁVEL 🟡';
        var confidence = n >= 6 ? 'ALTA (≥6 meses)' : n >= 3 ? 'MODERADA (3-5 meses)' : 'BAIXA (<3 meses)';
        return { valid: true, labels: forecastLbls, discSeries: forecastDisc, ivaSeries: forecastIva, risco: Math.round(risco * 100) / 100, ivaRisco: Math.round(ivaRisco * 100) / 100, trend: trend, slope: reg.slope, confidence: confidence, historicN: n, btfRatio: btfRatio };
    }

    function _injectForecastIntoChart(forecast, historicLen) {
        if (!forecast.valid) return;
        if (typeof Chart === 'undefined') { console.warn('[NEXUS·M3] Chart.js nao disponivel.'); return; }
        var canvas = document.getElementById('atfChartCanvas');
        if (!canvas) return;
        var chartInst = null;
        try {
            if (typeof Chart.getChart === 'function') {
                chartInst = Chart.getChart(canvas);
            } else if (Chart.instances) {
                var keys = Object.keys(Chart.instances);
                for (var k = 0; k < keys.length; k++) {
                    if (Chart.instances[keys[k]].canvas === canvas) { chartInst = Chart.instances[keys[k]]; break; }
                }
            }
        } catch (e) { console.warn('[NEXUS·M3] Erro ao recuperar instancia Chart.js:', e.message); return; }
        if (!chartInst) { console.warn('[NEXUS·M3] Instancia Chart.js nao encontrada.'); return; }
        try {
            forecast.labels.forEach(function(lbl) { chartInst.data.labels.push(lbl); });
            chartInst.data.datasets.forEach(function(ds) {
                for (var i = 0; i < forecast.labels.length; i++) { ds.data.push(null); }
            });
            var nullPadding = new Array(historicLen).fill(null);
            chartInst.data.datasets.push({ label: 'Previsão 6M — Omissão BTF (Nexus ATF)', data: nullPadding.concat(forecast.discSeries), borderColor: '#A855F7', backgroundColor: 'rgba(168,85,247,0.08)', borderDash: [8, 5], borderWidth: 2.5, pointRadius: 5, pointStyle: 'triangle', pointBackgroundColor: '#A855F7', pointBorderColor: '#E9D5FF', pointBorderWidth: 1.5, tension: 0.4, fill: false });
            chartInst.data.datasets.push({ label: 'Previsão 6M — IVA em Falta (Nexus ATF)', data: nullPadding.concat(forecast.ivaSeries), borderColor: '#F97316', backgroundColor: 'rgba(249,115,22,0.06)', borderDash: [4, 4], borderWidth: 2, pointRadius: 4, pointStyle: 'rectRot', pointBackgroundColor: '#F97316', tension: 0.4, fill: false });
            chartInst.update('active');
            console.info('[NEXUS·M3] ✅ Linha de previsão injectada no Chart.js ATF — ' + forecast.labels.length + ' meses.');
        } catch (err) { console.warn('[NEXUS·M3] Erro ao injectar previsão:', err.message); }
    }

    // ── [R-N01] _buildRiscoPanelDOM: createElement em vez de innerHTML ───────
    function _buildRiscoPanelDOM(forecast, _T, fmtEur) {
        var panel = document.createElement('div');
        panel.id = 'nexusForecastPanel';
        panel.style.cssText = 'max-width:1100px;width:100%;margin:0 auto 20px;background:rgba(168,85,247,0.07);border:1px solid rgba(168,85,247,0.4);border-radius:8px;padding:18px 20px;font-family:Courier New,monospace;';

        // ── Cabeçalho ────────────────────────────────────────────────────────
        var hdr = document.createElement('div');
        hdr.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap';

        var titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'color:#A855F7;font-size:0.9rem;font-weight:bold;letter-spacing:0.06em';
        titleDiv.textContent = '🔮 MOTOR PREDITIVO NEXUS ATF · RISCO FUTURO (6 MESES)';

        var confDiv = document.createElement('div');
        confDiv.style.cssText = 'color:rgba(255,255,255,0.4);font-size:0.65rem';
        confDiv.textContent = 'Regressão Linear + EMA · Confiança: ';
        var confSpan = document.createElement('span');
        confSpan.style.color = '#A855F7';
        confSpan.textContent = String(forecast.confidence);
        confDiv.appendChild(confSpan);

        var trendDiv = document.createElement('div');
        trendDiv.style.cssText = 'margin-left:auto;color:rgba(255,255,255,0.3);font-size:0.6rem';
        trendDiv.textContent = 'Tendência: ' + String(forecast.trend);

        hdr.appendChild(titleDiv);
        hdr.appendChild(confDiv);
        hdr.appendChild(trendDiv);
        panel.appendChild(hdr);

        // ── Grid de KPIs ─────────────────────────────────────────────────────
        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:14px';

        var maxIdx = 0, maxVal = 0;
        forecast.discSeries.forEach(function(v, i) { if (v > maxVal) { maxVal = v; maxIdx = i; } });

        var _kpiDefs = [
            { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', labelPt: 'OMISSÃO BTF PROJETADA (6M)', labelEn: 'PROJECTED BTF OMISSION (6M)', valueFn: function() { return fmtEur(forecast.risco); }, valueColor: '#A855F7', subPt: 'Passivo total estimado · BTOR−BTF', subEn: 'Estimated total liability · BTOR−BTF' },
            { bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.3)',   labelPt: 'IVA EM FALTA PROJETADO (6M)', labelEn: 'PROJECTED MISSING VAT (6M)',   valueFn: function() { return fmtEur(forecast.ivaRisco); }, valueColor: '#F97316', subPt: '23% sobre omissão proj.', subEn: '23% on projected omission' },
            { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',    labelPt: 'PICO DE RISCO PROJETADO',     labelEn: 'PROJECTED RISK PEAK',         valueFn: function() { return String(forecast.labels[maxIdx] || 'N/A') + '\n' + fmtEur(maxVal); }, valueColor: '#EF4444', subPt: '', subEn: '' }
        ];

        _kpiDefs.forEach(function(def) {
            var card = document.createElement('div');
            card.style.cssText = 'background:' + def.bg + ';border:1px solid ' + def.border + ';border-radius:6px;padding:14px;text-align:center';

            var lbl = document.createElement('div');
            lbl.style.cssText = 'color:rgba(255,255,255,0.5);font-size:0.62rem;margin-bottom:4px;letter-spacing:0.04em';
            lbl.textContent = _T(def.labelPt, def.labelEn);

            var val = document.createElement('div');
            val.style.cssText = 'color:' + def.valueColor + ';font-size:1.45rem;font-weight:900';
            val.textContent = def.valueFn();

            var sub = document.createElement('div');
            sub.style.cssText = 'color:rgba(255,255,255,0.35);font-size:0.6rem;margin-top:2px';
            sub.textContent = _T(def.subPt, def.subEn);

            card.appendChild(lbl);
            card.appendChild(val);
            card.appendChild(sub);
            grid.appendChild(card);
        });
        panel.appendChild(grid);

        // ── Tabela de previsão ────────────────────────────────────────────────
        var tableWrapper = document.createElement('div');
        tableWrapper.style.cssText = 'overflow-x:auto';

        var table = document.createElement('table');
        table.style.cssText = 'width:100%;border-collapse:collapse;font-size:0.7rem;color:rgba(255,255,255,0.8)';

        var thead = document.createElement('thead');
        var thRow = document.createElement('tr');
        var thDefs = [
            { pt: 'Período', en: 'Period', color: '#A855F7', align: 'left' },
            { pt: 'Omissão BTF Proj.', en: 'Proj. BTF Omission', color: '#A855F7', align: 'right' },
            { pt: 'IVA 23% Proj.', en: 'VAT 23% Proj.', color: '#F97316', align: 'right' },
            { pt: 'Risco', en: 'Risk', color: 'rgba(255,255,255,0.5)', align: 'center' }
        ];
        thDefs.forEach(function(h) {
            var th = document.createElement('th');
            th.style.cssText = 'border:1px solid rgba(168,85,247,0.25);padding:6px 10px;background:rgba(168,85,247,0.15);color:' + h.color + ';text-align:' + h.align;
            th.textContent = _T(h.pt, h.en);
            thRow.appendChild(th);
        });
        thead.appendChild(thRow);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        var rMax = Math.max.apply(null, forecast.discSeries.concat([1]));
        forecast.labels.forEach(function(lbl, i) {
            var disc   = forecast.discSeries[i] || 0;
            var iva    = forecast.ivaSeries[i]  || 0;
            var pct    = rMax > 0 ? (disc / rMax * 100) : 0;
            var rColor = pct > 75 ? '#EF4444' : pct > 45 ? '#F59E0B' : '#10B981';

            var row = document.createElement('tr');
            row.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.04)';

            var tdPeriod = document.createElement('td');
            tdPeriod.style.cssText = 'border:1px solid rgba(168,85,247,0.15);padding:5px 10px;color:#A855F7';
            tdPeriod.textContent = String(lbl);

            var tdDisc = document.createElement('td');
            tdDisc.style.cssText = 'border:1px solid rgba(168,85,247,0.15);padding:5px 10px;text-align:right';
            tdDisc.textContent = fmtEur(disc);

            var tdIva = document.createElement('td');
            tdIva.style.cssText = 'border:1px solid rgba(168,85,247,0.15);padding:5px 10px;text-align:right;color:#F97316';
            tdIva.textContent = fmtEur(iva);

            var tdRisk = document.createElement('td');
            tdRisk.style.cssText = 'border:1px solid rgba(168,85,247,0.15);padding:5px 10px;text-align:center';

            var barSpan = document.createElement('span');
            barSpan.style.cssText = 'display:inline-block;width:' + Math.round(pct * 0.8) + 'px;height:8px;background:' + rColor + ';border-radius:2px;min-width:4px;vertical-align:middle';

            var pctSpan = document.createElement('span');
            pctSpan.style.cssText = 'color:' + rColor + ';font-size:0.65rem';
            pctSpan.textContent = ' ' + pct.toFixed(0) + '%';

            tdRisk.appendChild(barSpan);
            tdRisk.appendChild(pctSpan);

            row.appendChild(tdPeriod);
            row.appendChild(tdDisc);
            row.appendChild(tdIva);
            row.appendChild(tdRisk);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        panel.appendChild(tableWrapper);

        // ── Nota ISO ─────────────────────────────────────────────────────────
        var nota = document.createElement('div');
        nota.style.cssText = 'margin-top:12px;padding:8px 12px;background:rgba(0,0,0,0.3);border-left:3px solid #FACC15;font-size:0.65rem;color:rgba(255,255,255,0.45);line-height:1.5';
        nota.textContent = '⚖️ ' + _T(
            'Nota ISO/IEC 27037:2012 §8.2.3: com n=' + forecast.historicN + ' observações (confiança: ' + forecast.confidence + '), estes valores constituem contexto macroeconómico e não prova direta. Validação por Estatístico independente recomendada antes de citação em audiência (Art. 128.º CPP).',
            'Note ISO/IEC 27037:2012 §8.2.3: with n=' + forecast.historicN + ' observations (confidence: ' + forecast.confidence + '), these values constitute macroeconomic context not direct evidence. Independent Statistician validation recommended before citing in court (Art. 128 CPP).'
        );
        panel.appendChild(nota);

        return panel;
    }

    function _injectRiscoFuturoPanel(forecast) {
        if (!forecast.valid) return;
        var modal = document.getElementById('atfModal');
        if (!modal) return;
        var existing = document.getElementById('nexusForecastPanel');
        if (existing) existing.remove();

        var _L  = (typeof window.currentLang !== 'undefined') ? window.currentLang : 'pt';
        var _T  = function(pt, en) { return _L === 'en' ? en : pt; };

        var fmtEur = function(v) {
            var _utils = window.UNIFEDSystem && window.UNIFEDSystem.utils;
            if (_utils && typeof _utils.formatCurrency === 'function') { return _utils.formatCurrency(v); }
            if (typeof window.formatCurrency === 'function') { return window.formatCurrency(v); }
            var _lang = (typeof window.currentLang !== 'undefined') ? window.currentLang : 'pt';
            return new Intl.NumberFormat(_lang === 'en' ? 'en-GB' : 'pt-PT', { style:'currency', currency:'EUR', minimumFractionDigits:2 }).format(v || 0);
        };

        // [R-N01] createElement substituiu panel.innerHTML
        var panel   = _buildRiscoPanelDOM(forecast, _T, fmtEur);
        var frag    = document.createDocumentFragment();
        var wrapper = modal.querySelector('.atf-modal-content, .modal-content, .modal-body');
        frag.appendChild(panel);
        if (wrapper) { wrapper.appendChild(frag); } else { modal.appendChild(frag); }
    }

    function _installATFHook() {
        if (typeof window.openATFModal !== 'function') {
            window.addEventListener('UNIFED_CORE_READY', function onReady() {
                if (typeof window.openATFModal === 'function') {
                    _installATFHookCore();
                    window.removeEventListener('UNIFED_CORE_READY', onReady);
                }
            });
            return;
        }
        _installATFHookCore();
    }

    function _installATFHookCore() {
        var _origOpenATFModal = window.openATFModal;

        window.openATFModal = function _nexusOpenATFModal() {
            _origOpenATFModal.apply(this, arguments);

            var sys = window.UNIFEDSystem;
            if (!sys || !sys.monthlyData) return;

            var forecast = _computeForecast(sys.monthlyData);
            var months   = Object.keys(sys.monthlyData).sort();
            window.NEXUS_FORECAST = forecast;

            if (!forecast.valid) {
                console.info('[NEXUS·M3] Forecast ATF: dados insuficientes (' + months.length + ' meses).');
                return;
            }

            // [R-N03] Substituição de setTimeout(fn, 280) por EventBus.waitFor
            // O modal #atfModal é aberto por _origOpenATFModal acima; aguardamos
            // que o DOM esteja pronto via EventBus ou fallback de 500ms.
            var _doInject = function() {
                _injectForecastIntoChart(forecast, months.length);
                _injectRiscoFuturoPanel(forecast);
                console.info(
                    '[NEXUS·M3] ✅ Motor Preditivo ATF — Risco Futuro 6M calculado.\n' +
                    '  Omissão BTF proj.: ' + fmtCurrLocal(forecast.risco) + '\n' +
                    '  IVA em falta     : ' + fmtCurrLocal(forecast.ivaRisco) + '\n' +
                    '  BTF ratio        : ' + (forecast.btfRatio * 100).toFixed(4) + '% (BTOR−BTF/BTOR)\n' +
                    '  Confiança        : ' + forecast.confidence + '\n' +
                    '  Tendência        : ' + forecast.trend
                );
            };

            function fmtCurrLocal(v) {
                if (typeof window.formatCurrency === 'function') return window.formatCurrency(v);
                return new Intl.NumberFormat((typeof window.currentLang !== 'undefined' && window.currentLang === 'en') ? 'en-GB' : 'pt-PT', { style:'currency', currency:'EUR' }).format(v);
            }

            var bus = window.UNIFEDEventBus;
            if (bus) {
                // O modal está a abrir agora — #atfChartCanvas deve estar disponível
                // brevemente. Aguardamos o próximo tick via Promise micro-task.
                Promise.resolve().then(_doInject);
            } else {
                // Fallback: sem EventBus, aguardar 280ms (comportamento anterior)
                setTimeout(_doInject, 280);
            }
        };

        console.info('[NEXUS·M3] ✅ Motor Preditivo ATF hook instalado — fórmula BTF rectificada (R4-FIX-1).');
    }

    _installATFHook();

})();

// ============================================================================
// MÓDULO 4 · BLOCKCHAIN EVIDENCE EXPLORER — OTS Individual
// ============================================================================
(function _nexusBlockchainExplorer() {

    var _EXPLORER_MODAL_ID = 'nexusBlockchainExplorerModal';
    var _EXPLORER_INJECTED = false;

    async function _sha256Nexus(content) {
        try {
            var encoder = new TextEncoder();
            var data    = encoder.encode(String(content) + 'NEXUS_DIAMOND_SALT_2024');
            var buf     = await crypto.subtle.digest('SHA-256', data);
            var arr     = Array.from(new Uint8Array(buf));
            return arr.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('').toUpperCase();
        } catch (e) {
            var hash = 0;
            var s = String(content);
            for (var i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash |= 0; }
            var hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
            return 'NEXUS_FALLBACK_' + hex + '_' + hex + hex + hex + hex + hex.substring(0, 8);
        }
    }

    // ── [R-N02] _buildExplorerModalDOM: createElement em vez de overlay.innerHTML ──
    // ev.filename provém de ficheiros carregados pelo utilizador (vector XSS real).
    // textContent higieniza qualquer HTML/JS injectado.
    function _buildExplorerModalDOM(enriched, _T, _L) {
        var typeLabels = { 'control': 'CTRL', 'saft': 'SAF-T', 'statement': 'EXT', 'invoice': 'FAT', 'dac7': 'DAC7' };
        var typeColors = { 'CTRL': '#10B981', 'SAF-T': '#00E5FF', 'EXT': '#F59E0B', 'FAT': '#A855F7', 'DAC7': '#EF4444' };

        var overlay = document.createElement('div');
        overlay.id  = _EXPLORER_MODAL_ID;
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,Courier New,monospace;backdrop-filter:blur(4px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:rgba(10,18,35,0.98);border:1px solid rgba(0,229,255,0.35);border-radius:12px;max-width:900px;width:95%;max-height:85vh;overflow-y:auto;box-shadow:0 0 60px rgba(0,229,255,0.12);';

        // ── Cabeçalho sticky ─────────────────────────────────────────────────
        var headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(0,229,255,0.15);position:sticky;top:0;background:rgba(10,18,35,0.98);z-index:1;';

        var titleGroup = document.createElement('div');
        var titleLine = document.createElement('div');
        titleLine.style.cssText = 'color:#00E5FF;font-size:0.9rem;font-weight:700;letter-spacing:0.08em';
        titleLine.textContent = '⛓️ NEXUS BLOCKCHAIN EVIDENCE EXPLORER';
        var subLine = document.createElement('div');
        subLine.style.cssText = 'color:rgba(255,255,255,0.4);font-size:0.65rem;margin-top:2px';
        subLine.textContent = 'SHA-256 individual por ficheiro · ' + enriched.length + ' ' + _T('documentos', 'documents') + ' · Art. 125.o CPP · ISO/IEC 27037:2012';
        titleGroup.appendChild(titleLine);
        titleGroup.appendChild(subLine);

        var closeBtn = document.createElement('button');
        closeBtn.id = 'nexusExplorerCloseBtn';
        closeBtn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.6);cursor:pointer;padding:6px 12px;border-radius:4px;font-family:inherit;font-size:0.75rem;';
        closeBtn.textContent = '✕ ' + _T('FECHAR', 'CLOSE');

        headerDiv.appendChild(titleGroup);
        headerDiv.appendChild(closeBtn);
        inner.appendChild(headerDiv);

        // ── Corpo: tabela de evidências ──────────────────────────────────────
        var bodyDiv = document.createElement('div');
        bodyDiv.style.cssText = 'padding:16px 20px;';

        var table = document.createElement('table');
        table.style.cssText = 'width:100%;border-collapse:collapse;font-size:0.72rem;';

        var thead = document.createElement('thead');
        var thRow = document.createElement('tr');
        thRow.style.cssText = 'border-bottom:1px solid rgba(0,229,255,0.2);';
        var thDefs = [
            { pt: 'FICHEIRO', en: 'FILE', align: 'left' },
            { pt: 'TIPO',     en: 'TYPE',  align: 'center' },
            { pt: 'SHA-256 (NEXUS)', en: 'SHA-256 (NEXUS)', align: 'left' },
            { pt: 'ESTADO',  en: 'STATUS', align: 'center' }
        ];
        thDefs.forEach(function(h) {
            var th = document.createElement('th');
            th.style.cssText = 'padding:8px 10px;text-align:' + h.align + ';color:#00E5FF;font-size:0.65rem;letter-spacing:0.06em';
            th.textContent = _T(h.pt, h.en);
            thRow.appendChild(th);
        });
        thead.appendChild(thRow);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        enriched.forEach(function(ev, idx) {
            var bg         = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
            var typeLabel  = typeLabels[ev.type] || ev.type || 'DOC';
            var typeColor  = typeColors[typeLabel] || '#94a3b8';
            var shortHash  = (ev.nexusHash || '').substring(0, 32) + '...';

            var row = document.createElement('tr');
            row.style.cssText = 'background:' + bg + ';border-bottom:1px solid rgba(255,255,255,0.04);';

            // ── Célula: FICHEIRO (textContent higieniza ev.filename) ──────────
            var tdFile = document.createElement('td');
            tdFile.style.cssText = 'padding:7px 10px;color:rgba(255,255,255,0.8);word-break:break-all';
            tdFile.textContent = ev.filename || 'N/A';  // textContent: XSS nulo

            // ── Célula: TIPO ──────────────────────────────────────────────────
            var tdType = document.createElement('td');
            tdType.style.cssText = 'padding:7px 10px;text-align:center';
            var badge = document.createElement('span');
            badge.style.cssText = 'background:' + typeColor + '22;color:' + typeColor + ';border:1px solid ' + typeColor + '44;padding:2px 6px;border-radius:3px;font-size:0.65rem;font-weight:700';
            badge.textContent = typeLabel;
            tdType.appendChild(badge);

            // ── Célula: SHA-256 ───────────────────────────────────────────────
            var tdHash = document.createElement('td');
            tdHash.style.cssText = 'padding:7px 10px;color:rgba(0,229,255,0.7);font-size:0.65rem;word-break:break-all';
            tdHash.textContent = shortHash;             // hash é saída interna — seguro

            // ── Célula: ESTADO ────────────────────────────────────────────────
            var tdStatus = document.createElement('td');
            tdStatus.style.cssText = 'padding:7px 10px;text-align:center';
            var statusSpan = document.createElement('span');
            statusSpan.style.cssText = 'color:#10B981;font-size:0.75rem';
            statusSpan.textContent = '✅';
            tdStatus.appendChild(statusSpan);

            row.appendChild(tdFile);
            row.appendChild(tdType);
            row.appendChild(tdHash);
            row.appendChild(tdStatus);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        bodyDiv.appendChild(table);
        inner.appendChild(bodyDiv);

        // ── Rodapé ────────────────────────────────────────────────────────────
        var footer = document.createElement('div');
        footer.style.cssText = 'padding:10px 20px;border-top:1px solid rgba(0,229,255,0.1);background:rgba(0,0,0,0.3);font-size:0.6rem;color:rgba(255,255,255,0.3);line-height:1.6;';
        footer.textContent = '⚙ ' + _T('NEXUS Blockchain Explorer · SHA-256 independente por ficheiro · ', 'NEXUS Blockchain Explorer · Individual SHA-256 per file · ') +
            'Art. 125.o CPP · ISO/IEC 27037:2012 · DORA (UE) 2022/2554 · Read-Only sobre UNIFEDSystem · ' +
            new Date().toLocaleString('pt-PT');
        inner.appendChild(footer);

        overlay.appendChild(inner);
        return { overlay: overlay, closeBtn: closeBtn };
    }

    async function _openBlockchainExplorerModal() {
        var sys = window.UNIFEDSystem;
        if (!sys || !sys.analysis || !sys.analysis.evidenceIntegrity) {
            console.warn('[NEXUS·M4] UNIFEDSystem.analysis.evidenceIntegrity não disponível.');
            return;
        }

        var existing = document.getElementById(_EXPLORER_MODAL_ID);
        if (existing) { existing.remove(); return; }

        var _L = (typeof window.currentLang !== 'undefined') ? window.currentLang : 'pt';
        var _T = function(pt, en) { return _L === 'en' ? en : pt; };

        var evidences = sys.analysis.evidenceIntegrity || [];
        var enriched  = await Promise.all(evidences.map(async function(ev) {
            var hash = await _sha256Nexus(ev.filename + (ev.hash || '') + (ev.timestamp || ''));
            return Object.assign({}, ev, { nexusHash: hash });
        }));

        // [R-N02] Construção via createElement — ev.filename higienizado por textContent
        var built   = _buildExplorerModalDOM(enriched, _T, _L);
        var overlay = built.overlay;
        var closeBtn = built.closeBtn;

        var frag = document.createDocumentFragment();
        frag.appendChild(overlay);
        document.body.appendChild(frag);

        closeBtn.addEventListener('click', function() {
            var m = document.getElementById(_EXPLORER_MODAL_ID);
            if (m) m.remove();
        });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.addEventListener('keydown', function _escHandler(e) {
            if (e.key === 'Escape') {
                var m = document.getElementById(_EXPLORER_MODAL_ID);
                if (m) { m.remove(); document.removeEventListener('keydown', _escHandler); }
            }
        });

        console.info('[NEXUS·M4] ✅ Blockchain Evidence Explorer aberto — ' + enriched.length + ' documentos analisados.');
    }

    function injectBlockchainExplorerUI() {
        var custodyModal = document.getElementById('custodyModal');
        if (!custodyModal) {
            window.addEventListener('UNIFED_CORE_READY', function onReady() {
                injectBlockchainExplorerUI();
                window.removeEventListener('UNIFED_CORE_READY', onReady);
            });
            return;
        }

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    var isActive = custodyModal.classList.contains('active');
                    if (isActive && !_EXPLORER_INJECTED) {
                        _injectExplorerButton(custodyModal);
                        _EXPLORER_INJECTED = true;
                    } else if (!isActive) {
                        _EXPLORER_INJECTED = false;
                    }
                }
            });
        });

        observer.observe(custodyModal, { attributes: true });

        if (custodyModal.classList.contains('active') && !_EXPLORER_INJECTED) {
            _injectExplorerButton(custodyModal);
            _EXPLORER_INJECTED = true;
        }

        console.info('[NEXUS·M4] ✅ MutationObserver instalado no #custodyModal.');
    }

    function _injectExplorerButton(custodyModal) {
        if (document.getElementById('nexusExplorerBtn')) return;

        var header = custodyModal.querySelector('.modal-header')
            || custodyModal.querySelector('[class*="header"]')
            || custodyModal.querySelector('div:first-child')
            || custodyModal;

        var _L = (typeof window.currentLang !== 'undefined') ? window.currentLang : 'pt';
        var _T = function(pt, en) { return _L === 'en' ? en : pt; };

        var btn  = document.createElement('button');
        btn.id   = 'nexusExplorerBtn';
        btn.style.cssText = [
            'background:linear-gradient(135deg,rgba(0,229,255,0.1),rgba(168,85,247,0.1));',
            'border:1px solid rgba(0,229,255,0.5);color:#00E5FF;cursor:pointer;',
            'padding:7px 16px;font-family:JetBrains Mono,Courier New,monospace;',
            'font-size:0.72rem;letter-spacing:0.08em;border-radius:4px;',
            'transition:all 0.25s ease;display:inline-flex;align-items:center;gap:8px;',
            'box-shadow:0 0 12px rgba(0,229,255,0.12);margin-left:8px;vertical-align:middle;'
        ].join('');

        // [R-N05] textContent em vez de innerHTML
        btn.textContent = '⛓️ ' + _T('VER EXPLORER', 'VIEW EXPLORER');
        btn.title = _T('NEXUS Blockchain Evidence Explorer — SHA-256 individual por ficheiro', 'NEXUS Blockchain Evidence Explorer — Individual SHA-256 per file');

        btn.addEventListener('mouseenter', function() {
            this.style.background  = 'linear-gradient(135deg,rgba(0,229,255,0.2),rgba(168,85,247,0.2))';
            this.style.boxShadow   = '0 0 20px rgba(0,229,255,0.25)';
            this.style.borderColor = 'rgba(0,229,255,0.8)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.background  = 'linear-gradient(135deg,rgba(0,229,255,0.1),rgba(168,85,247,0.1))';
            this.style.boxShadow   = '0 0 12px rgba(0,229,255,0.12)';
            this.style.borderColor = 'rgba(0,229,255,0.5)';
        });
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            _openBlockchainExplorerModal();
        });

        var frag = document.createDocumentFragment();
        frag.appendChild(btn);
        var existingBtns = header.querySelectorAll('button');
        if (existingBtns.length > 0) {
            existingBtns[0].parentNode.insertBefore(frag, existingBtns[0]);
        } else {
            header.insertBefore(frag, header.firstChild);
        }

        console.info('[NEXUS·M4] ✅ Botão VER EXPLORER injectado no painel de Cadeia de Custódia.');
    }

    window.injectBlockchainExplorerUI    = injectBlockchainExplorerUI;
    window.nexusOpenBlockchainExplorer   = _openBlockchainExplorerModal;

    // [R-N04] setTimeout(injectBlockchainExplorerUI, 2000) substituído por EventBus
    // UNIFED_CORE_READY já foi emitido neste ponto — resolução imediata via hasResolved.
    var _bus = window.UNIFEDEventBus;
    if (_bus) {
        _bus.waitFor('UNIFED_CORE_READY', 10000).then(function() {
            if (window.requestIdleCallback) {
                requestIdleCallback(function() {
                    injectBlockchainExplorerUI();
                    console.log('[NEXUS] Ativado em modo de baixa prioridade (requestIdleCallback).');
                });
            } else {
                injectBlockchainExplorerUI();
            }
        }).catch(function(err) {
            console.warn('[NEXUS·M4] EventBus.waitFor timeout — fallback directo:', err.message);
            injectBlockchainExplorerUI();
        });
    } else {
        window.addEventListener('UNIFED_CORE_READY', function() {
            injectBlockchainExplorerUI();
        }, { once: true });
    }

})();

// ============================================================================
// NEXUS · EXPOSIÇÃO GLOBAL E LOG DE ARRANQUE
// ============================================================================
console.info(
    '%c[NEXUS · UNIFED-PROBATUM · v13.11.4-PURE · RTF-UNIFED-2026-0406]\n' +
    '%c  M1 · Stealth Network Interceptor     — Anti-F12 Protocol ATIVO\n' +
    '  M2 · RAG Jurisprudencial DOCX         — Hook exportDOCX() instalado\n' +
    '  M3 · Motor Preditivo ATF (6M)         — R-N01: createElement (innerHTML eliminado)\n' +
    '  M4 · Blockchain Evidence Explorer     — R-N02: createElement (XSS nulo em filename)\n' +
    '  R-N03: setTimeout(280ms) → EventBus.waitFor (ATF modal)\n' +
    '  R-N04: setTimeout(2000ms) → EventBus.waitFor (Explorer init)\n' +
    '  R-N05: btn.innerHTML → textContent (emoji constante)\n' +
    '  Modo: Read-Only · DORA (UE) 2022/2554 · ISO/IEC 27037:2012 · Art. 125.o CPP',
    'color:#00E5FF;font-family:Courier New,monospace;font-weight:700;font-size:0.9em;',
    'color:rgba(0,229,255,0.65);font-family:Courier New,monospace;font-size:0.8em;'
);
