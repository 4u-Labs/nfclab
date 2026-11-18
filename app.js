/**
 * NFC Lab — Complete Web NFC Toolkit (app.js)
 * 4u-Labs · Open Source Web NFC Suite
 */

(() => {
  'use strict';

  // --- STATE ---
  let currentLang = 'pt';
  let activeTab = 'read';
  let readAbortController = null;
  let writeAbortController = null;
  let lastScannedPayload = null;
  let scanHistory = [];
  let recordsQueue = [];
  let batchCount = 0;

  const $ = (id) => document.getElementById(id);

  // --- TRANSLATIONS (PT / EN) ---
  const I18N = {
    pt: {
      brandSub: 'DIAGNÓSTICO & GRAVAÇÃO NFC · 4u-Labs',
      installApp: 'Instalar',
      nfcReady: 'Web NFC Ativo',
      nfcUnavailable: 'NFC Inativo / Requer Android',
      tabRead: 'Ler & Inspecionar',
      tabWrite: 'Gravar NDEF',
      tabTools: 'Ferramentas & Clone',
      tabTasks: 'Atalhos Rápidos',
      readTitle: 'Leitor & Diagnóstico de Chips NFC',
      readSub: 'Identifique o modelo do chip, número de série UID, memória livre e inspecione todos os registros NDEF gravados.',
      btnStartRead: 'Ativar Leitor NFC',
      radarHoldRead: 'Aproxime o cartão ou tag NFC da traseira do celular…',
      btnCancel: 'Cancelar',
      btnCloneTag: '📋 Clonar',
      btnExportJson: '💾 Exportar',
      lblChipFamily: 'Família do Chip:',
      lblPayloadSize: 'Tamanho dos Dados:',
      lblWriteStatus: 'Status de Gravação:',
      recordsTitle: 'Registros NDEF Decodificados',
      btnToggleHex: 'Ver Dados em Hexadecimal & ASCII',
      historyTitle: 'Histórico de Tags Lidas',
      btnClearHistory: 'Limpar',
      noHistory: 'Nenhuma tag lida nesta sessão.',
      writeTitle: 'Criador de Registros NDEF',
      writeSub: 'Selecione o tipo de dado que deseja gravar no chip plástico.',
      btnAddQueue: '➕ Adicionar Registro à Fila',
      queueTitle: 'Fila de Gravação da Tag',
      btnClear: 'Limpar Fila',
      meterTotal: 'Tamanho Total NDEF:',
      chkBatchMode: 'Gravação Contínua em Lote (Encoste vários cartões em sequência)',
      radarHoldWrite: 'Aproxime o cartão plástico NFC atrás do celular para gravar…',
      lblTagsWritten: 'Cartões Gravados:',
      btnWriteNow: 'Gravar no Chip NFC Agora',
      toolCloneTitle: 'Clonar Última Tag Lida',
      toolCloneSub: 'Replica exatamente os registros NDEF do cartão previamente lido em um novo chip virgem.',
      btnRunClone: 'Iniciar Clonagem',
      toolEraseTitle: 'Formatar / Apagar Chip',
      toolEraseSub: 'Grava um contêiner NDEF limpo e vazio, removendo todos os links, contatos e payloads anteriores.',
      btnRunErase: 'Apagar Conteúdo da Tag',
      toolLockTitle: 'Bloquear Chip (Somente Leitura)',
      toolLockSub: 'Trava os bits de gravação do hardware contra alterações futuras. Operação definitiva e irreversível!',
      btnRunLock: 'Bloquear Tag Permanente',
      toolQrTitle: 'Gerar QR Code do Payload',
      toolQrSub: 'Cria um QR Code escaneável com o mesmo link ou dados que você preparou para a tag física.',
      btnRunQr: 'Visualizar QR Code',
      profilesTitle: 'Backup & Modelos de Gravação',
      profilesSub: 'Exporte sua fila de dados em arquivo .json ou importe modelos salvos para gravar de novo.',
      btnExportProfile: 'Exportar Modelo (.json)',
      btnImportProfile: 'Importar Modelo (.json)',
      tasksTitle: 'Modelos Prontos & Atalhos Rápidos',
      tasksSub: 'Clique em um dos atalhos frequentes para carregar a configuração recomendada em 1 toque.',
      taskWifiBadge: '📶 Wi-Fi Balcão',
      taskWifiTitle: 'Wi-Fi Sem Senha',
      taskWifiDesc: 'Seus clientes ou visitas encostam o celular e conectam à internet na hora sem pedir senha.',
      taskWhatsappBadge: '💬 Atendimento',
      taskWhatsappTitle: 'Chamar no WhatsApp',
      taskWhatsappDesc: 'Tag para balcão, mesa ou estande que abre a conversa direta com sua empresa no WhatsApp.',
      taskInstaBadge: '📷 Social',
      taskInstaTitle: 'Abrir Instagram',
      taskInstaDesc: 'Abre o perfil do Instagram da sua marca direto no app do cliente.',
      taskVcardBadge: '✨ 3D Card',
      taskVcardTitle: 'Cartão Executivo 4U',
      taskVcardDesc: 'Configura o link direto para o seu Cartão Virtual 3D do ecossistema 4u.ia.br.',
      taskWebhookBadge: '⚡ Automação',
      taskWebhookTitle: 'Disparador de Webhook',
      taskWebhookDesc: 'Tag para automação residencial ou disparo de fluxos no n8n ao aproximar.',
      taskMapsBadge: '📍 Localização',
      taskMapsTitle: 'Como Chegar (Maps)',
      taskMapsDesc: 'Inicia a rota no Google Maps até o endereço da sua clínica, escritório ou loja.',
      btnQuickToEditor: '✏️ Abrir no Editor',
      btnQuickWriteNow: '📡 Gravar no Chip Agora',
      helpTitle: '📘 Guia Rápido — NFC Lab',
      help1: '1. Suporte no Navegador: A gravação e leitura direta funcionam através do Google Chrome ou Edge em celulares Android com o NFC ativado nas configurações do sistema.',
      help2: '2. Chips Compatíveis: Funciona com qualquer cartão, chaveiro ou tag padrão NFC Forum NDEF: NTAG213 (144 bytes), NTAG215 (504 bytes), NTAG216 (888 bytes), Mifare Ultralight, etc.',
      help3: '3. No iPhone (iOS): A Apple permite que o iPhone leia tags normalmente ao aproximar, mas restringe a gravação direta por navegadores. Grave suas tags com um aparelho Android e elas funcionarão perfeitamente em iPhones!',
      help4: '4. Dados 100% Clicáveis: Todos os dados do cartão (telefone, WhatsApp, e-mail e endereço com abertura direta do Google Maps) são interativos e clicáveis ao aproximar.',
      hubTitle: '🌐 4u-Labs — Aplicativos, Suporte e Comunidade',
      hubSub: 'Conheça o ecossistema 4u-Labs, acesse nossa loja de aplicativos web e acompanhe nossos projetos oficiais:',
      hubGroupInst: 'Institucional & Ecossistema (6)',
      hubGroupSocial: 'Comunidade, Código & Redes (8)',
      donateTitle: '♡ Apoie o desenvolvimento gratuito da 4u-Labs',
      donateSub: 'Nossos aplicativos são 100% livres de anúncios. Sua contribuição mantém os servidores ativos!',
      btnDonate: '♡ Apoiar com PayPal',
      qrModalTitle: '🏁 QR Code do Payload',
      footerGuide: 'Guia',
      footerPrivacy: 'Privacidade',
      footerTerms: 'Termos',
      footerDonate: '♡ Apoiar'
    },
    en: {
      brandSub: 'NFC DIAGNOSTICS & RECORDING · 4u-Labs',
      installApp: 'Install',
      nfcReady: 'Web NFC Ready',
      nfcUnavailable: 'NFC Inactive / Requires Android',
      tabRead: 'Read & Inspect',
      tabWrite: 'Write NDEF',
      tabTools: 'Tools & Clone',
      tabTasks: 'Quick Shortcuts',
      readTitle: 'NFC Chip Reader & Diagnostics',
      readSub: 'Identify chip model, serial UID, free memory, and inspect all stored NDEF records.',
      btnStartRead: 'Start NFC Reader',
      radarHoldRead: 'Hold NFC tag against the back of your phone…',
      btnCancel: 'Cancel',
      btnCloneTag: '📋 Clone',
      btnExportJson: '💾 Export',
      lblChipFamily: 'Chip Family:',
      lblPayloadSize: 'Payload Size:',
      lblWriteStatus: 'Write Status:',
      recordsTitle: 'Decoded NDEF Records',
      btnToggleHex: 'View Raw Hexadecimal & ASCII',
      historyTitle: 'Scanned Tags History',
      btnClearHistory: 'Clear',
      noHistory: 'No tags scanned in this session.',
      writeTitle: 'NDEF Record Composer',
      writeSub: 'Choose the data type you want to write to the physical NFC chip.',
      btnAddQueue: '➕ Add Record to Queue',
      queueTitle: 'Tag Writing Queue',
      btnClear: 'Clear Queue',
      meterTotal: 'Total NDEF Size:',
      chkBatchMode: 'Continuous Batch Writing (Tap multiple cards sequentially)',
      radarHoldWrite: 'Hold plastic NFC card behind phone to write…',
      lblTagsWritten: 'Cards Written:',
      btnWriteNow: 'Write to NFC Chip Now',
      toolCloneTitle: 'Clone Last Scanned Tag',
      toolCloneSub: 'Exact copy of NDEF records from previously read tag into a new blank chip.',
      btnRunClone: 'Start Cloning',
      toolEraseTitle: 'Format / Erase Chip',
      toolEraseSub: 'Writes an empty NDEF container, safely clearing all prior links and payloads.',
      btnRunErase: 'Erase Tag Content',
      toolLockTitle: 'Lock Chip (Read-Only)',
      toolLockSub: 'Permanently burns hardware lock bits against future changes. Irreversible operation!',
      btnRunLock: 'Lock Tag Permanently',
      toolQrTitle: 'Generate QR Code from Payload',
      toolQrSub: 'Creates a scannable QR Code containing the same data prepared for the physical tag.',
      btnRunQr: 'View QR Code',
      profilesTitle: 'Backup & Record Templates',
      profilesSub: 'Export your data queue as .json or import saved templates for repeat batch writes.',
      btnExportProfile: 'Export Template (.json)',
      btnImportProfile: 'Import Template (.json)',
      tasksTitle: 'Ready-Made Templates & Shortcuts',
      tasksSub: 'Click any frequent preset to configure recommended tag settings in 1 tap.',
      taskWifiBadge: '📶 Guest Wi-Fi',
      taskWifiTitle: 'Instant Wi-Fi Connection',
      taskWifiDesc: 'Customers or guests tap their phone and connect to Wi-Fi instantly without typing passwords.',
      taskWhatsappBadge: '💬 Support & Chat',
      taskWhatsappTitle: 'Open WhatsApp Chat',
      taskWhatsappDesc: 'Counter or desk tag that opens a direct chat with your business on WhatsApp.',
      taskInstaBadge: '📷 Social Media',
      taskInstaTitle: 'Open Instagram Profile',
      taskInstaDesc: 'Launches your brand’s Instagram profile directly on the user’s phone.',
      taskVcardBadge: '✨ 3D Card',
      taskVcardTitle: '4U Executive 3D Card',
      taskVcardDesc: 'Direct link to your interactive 3D Virtual Card from the 4u.ia.br ecosystem.',
      taskWebhookBadge: '⚡ Automation',
      taskWebhookTitle: 'Webhook Trigger',
      taskWebhookDesc: 'NFC tag for smart home automation or triggering n8n/webhook workflows on tap.',
      taskMapsBadge: '📍 Navigation (Maps)',
      taskMapsTitle: 'Directions (Google Maps)',
      taskMapsDesc: 'Starts GPS navigation in Google Maps directly to your store, office, or clinic.',
      btnQuickToEditor: '✏️ Open in Editor',
      btnQuickWriteNow: '📡 Write to Chip Now',
      helpTitle: '📘 Quick Guide — NFC Lab',
      help1: '1. Browser Support: Direct reading and writing work via Google Chrome or Edge on Android phones with NFC enabled in system settings.',
      help2: '2. Compatible Chips: Compatible with any NFC Forum NDEF card, fob, or sticker: NTAG213 (144 bytes), NTAG215 (504 bytes), NTAG216 (888 bytes), Mifare Ultralight, etc.',
      help3: '3. On iPhone (iOS): Apple allows iPhones to read tags natively on tap, but restricts browser writing. Write tags with Android and they will work seamlessly on iPhones!',
      help4: '4. 100% Clickable Data: All card contacts (phone, WhatsApp, email, social links, and physical address opening Google Maps directly) are fully interactive and clickable on tap.',
      hubTitle: '🌐 4u-Labs — Apps, Support & Community',
      hubSub: 'Explore the 4u-Labs ecosystem, visit our web store and follow official projects:',
      hubGroupInst: 'Institutional & Ecosystem (6)',
      hubGroupSocial: 'Community, Code & Social (8)',
      donateTitle: '♡ Support free development by 4u-Labs',
      donateSub: 'Our apps are 100% ad-free. Your contribution keeps our servers running!',
      btnDonate: '♡ Support with PayPal',
      qrModalTitle: '🏁 Payload QR Code',
      footerGuide: 'Guide',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms',
      footerDonate: '♡ Support'
    }
  };

  function setLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'pt';
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === currentLang);
    });
    const dict = I18N[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    updateCapacityMeter();
    localStorage.setItem('nfclab_lang', currentLang);
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(msg, duration = 3200) {
    const container = $('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  // --- HARDWARE COMPATIBILITY CHECK ---
  function checkWebNfcSupport() {
    const statusBadge = $('nfc-hardware-status');
    const isSupported = 'NDEFReader' in window;
    const isAndroid = /android/i.test(navigator.userAgent);

    if (isSupported) {
      statusBadge.className = 'nfc-hardware-badge';
      statusBadge.querySelector('.status-text').textContent = I18N[currentLang].nfcReady;
    } else {
      statusBadge.className = 'nfc-hardware-badge warning';
      statusBadge.querySelector('.status-text').textContent = I18N[currentLang].nfcUnavailable;
      statusBadge.title = isAndroid
        ? 'Abra este WebApp no Google Chrome ou Edge para ativar a Web NFC API.'
        : 'A gravação física de chips NFC no navegador requer celular Android com Google Chrome.';
    }
    return isSupported;
  }

  // --- NAVIGATION TABS ---
  function switchTab(tabId) {
    activeTab = tabId;
    stopAllNfcOperations();
    document.querySelectorAll('.tab-btn').forEach(b => {
      const isTarget = b.dataset.tab === tabId;
      b.classList.toggle('active', isTarget);
      b.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-pane').forEach(p => {
      p.hidden = p.id !== `pane-${tabId}`;
    });
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  // --- TAB 1: READ ENGINE ---
  function stopAllNfcOperations() {
    if (readAbortController) {
      readAbortController.abort();
      readAbortController = null;
    }
    if (writeAbortController) {
      writeAbortController.abort();
      writeAbortController = null;
    }
    $('read-radar').hidden = true;
    $('read-initial').hidden = false;
    $('write-radar').hidden = true;
    $('btn-start-write').hidden = false;
  }

  $('btn-cancel-read').onclick = stopAllNfcOperations;

  $('btn-start-read').onclick = async () => {
    if (!('NDEFReader' in window)) {
      showToast(currentLang === 'en'
        ? '⚠️ Web NFC is not available in this browser. Please open in Google Chrome on Android.'
        : '⚠️ Web NFC não suportado neste navegador. Abra no Google Chrome no Android.');
      return;
    }

    try {
      stopAllNfcOperations();
      readAbortController = new AbortController();
      const ndef = new NDEFReader();
      await ndef.scan({ signal: readAbortController.signal });

      $('read-initial').hidden = true;
      $('read-radar').hidden = false;
      showToast(currentLang === 'en' ? '📡 NFC Scanner ready! Hold tag to phone...' : '📡 Leitor NFC ativo! Aproxime a tag do celular...');

      ndef.onreadingerror = () => {
        showToast(currentLang === 'en' ? '⚠️ Read error: Tag signal lost or incompatible.' : '⚠️ Erro de leitura: Sinal da tag perdido ou incompatível.');
      };

      ndef.onreading = (event) => {
        handleNfcReadSuccess(event);
      };
    } catch (err) {
      stopAllNfcOperations();
      showToast(currentLang === 'en' ? `⚠️ Could not start scanner: ${err.message}` : `⚠️ Não foi possível iniciar o leitor: ${err.message}`);
    }
  };

  function handleNfcReadSuccess(event) {
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    stopAllNfcOperations();

    const serial = event.serialNumber || '04:XX:XX:XX:XX:XX';
    const formattedUid = serial.toUpperCase();
    const records = event.message?.records || [];

    // Parse decoded records
    const decodedList = [];
    let totalBytes = 0;
    const rawByteArrays = [];

    records.forEach((rec, idx) => {
      const type = rec.recordType;
      const media = rec.mediaType || '';
      let textContent = '';
      let extraInfo = `Record #${idx + 1} · Type: ${type}`;

      try {
        if (type === 'text') {
          const textDecoder = new TextDecoder(rec.encoding || 'utf-8');
          textContent = textDecoder.decode(rec.data);
          extraInfo += ` (lang: ${rec.lang || 'pt'})`;
        } else if (type === 'url') {
          const textDecoder = new TextDecoder();
          textContent = textDecoder.decode(rec.data);
        } else if (type === 'mime') {
          const textDecoder = new TextDecoder();
          textContent = textDecoder.decode(rec.data);
          extraInfo += ` · MIME: ${media}`;
        } else {
          const textDecoder = new TextDecoder();
          textContent = textDecoder.decode(rec.data);
        }

        if (rec.data) {
          const byteLen = rec.data.byteLength || 0;
          totalBytes += byteLen;
          rawByteArrays.push(new Uint8Array(rec.data.buffer || rec.data));
        }
      } catch (e) {
        textContent = '[Binary data / Payload não decodificado]';
      }

      decodedList.push({
        type,
        mediaType: media,
        content: textContent,
        extra: extraInfo
      });
    });

    // Determine Chip Model Heuristics
    let chipModel = 'NFC Tag (NDEF)';
    if (formattedUid.startsWith('04:')) {
      chipModel = totalBytes <= 144 ? 'NXP NTAG213' : totalBytes <= 504 ? 'NXP NTAG215' : 'NXP NTAG216';
    }

    lastScannedPayload = {
      uid: formattedUid,
      chipModel,
      totalBytes,
      records: decodedList,
      rawRecords: records,
      timestamp: new Date().toLocaleTimeString()
    };

    // Render Diagnostics Card
    $('res-chip-type').textContent = chipModel;
    $('res-uid').textContent = formattedUid;
    $('res-bytes').textContent = `${totalBytes} bytes (${decodedList.length} registro${decodedList.length === 1 ? '' : 's'})`;
    $('res-record-count').textContent = String(decodedList.length);
    $('scan-result-card').hidden = false;

    // Render Records Container
    const container = $('res-records-container');
    container.innerHTML = '';
    decodedList.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'record-card';
      const icon = rec.type === 'url' ? '🌐' : rec.type === 'text' ? '📝' : rec.mediaType.includes('vcard') ? '📇' : rec.mediaType.includes('wfa') ? '📶' : '📦';
      card.innerHTML = `
        <div class="record-top">
          <span class="record-type-tag">${icon} ${rec.type.toUpperCase()}${rec.mediaType ? ' (' + rec.mediaType + ')' : ''}</span>
        </div>
        <div class="record-content">${escapeHtml(rec.content)}</div>
        <div class="record-extra">${rec.extra}</div>
      `;
      container.appendChild(card);
    });

    // Generate Hex View
    renderHexViewer(rawByteArrays);

    // Save to History
    saveScanHistory(lastScannedPayload);
    showToast(currentLang === 'en' ? `✓ Tag detected! UID: ${formattedUid}` : `✓ Tag lida com sucesso! UID: ${formattedUid}`);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // --- HEX INSPECTOR ---
  function renderHexViewer(rawByteArrays) {
    const pre = $('hex-viewer-content');
    if (!pre) return;
    if (rawByteArrays.length === 0) {
      pre.textContent = '00000000:  00 00 00 00  ....';
      return;
    }

    let allBytes = [];
    rawByteArrays.forEach(arr => {
      allBytes.push(...arr);
    });

    let lines = [];
    for (let i = 0; i < allBytes.length; i += 16) {
      const slice = allBytes.slice(i, i + 16);
      const offset = i.toString(16).padStart(8, '0');
      const hex = slice.map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = slice.map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
      lines.push(`${offset}:  ${hex.padEnd(48, ' ')}  |${ascii}|`);
    }
    pre.textContent = lines.join('\n');
  }

  $('btn-toggle-hex').onclick = () => {
    const box = $('hex-viewer-box');
    box.hidden = !box.hidden;
  };

  $('btn-copy-uid').onclick = () => {
    const uid = $('res-uid').textContent;
    navigator.clipboard.writeText(uid).then(() => {
      showToast(currentLang === 'en' ? '✓ UID copied to clipboard!' : '✓ UID copiado para a área de transferência!');
    });
  };

  $('btn-export-json').onclick = () => {
    if (!lastScannedPayload) return;
    const blob = new Blob([JSON.stringify(lastScannedPayload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nfc-tag-${lastScannedPayload.uid.replace(/:/g, '')}.json`;
    a.click();
    showToast('✓ Arquivo JSON exportado!');
  };

  // --- HISTORY STORAGE ---
  function loadScanHistory() {
    try {
      scanHistory = JSON.parse(localStorage.getItem('nfclab_history') || '[]');
    } catch {
      scanHistory = [];
    }
    renderHistory();
  }

  function saveScanHistory(item) {
    scanHistory.unshift(item);
    if (scanHistory.length > 20) scanHistory.pop();
    localStorage.setItem('nfclab_history', JSON.stringify(scanHistory));
    renderHistory();
  }

  function renderHistory() {
    const container = $('history-container');
    if (!container) return;
    if (scanHistory.length === 0) {
      container.innerHTML = `<p class="empty-state">${I18N[currentLang].noHistory}</p>`;
      return;
    }
    container.innerHTML = '';
    scanHistory.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div>
          <strong>${item.chipModel}</strong> <small style="color:var(--ui-accent); font-family:var(--font-mono)">${item.uid}</small>
          <div style="font-size:11px; color:#94a3b8">${item.records.length} registro(s) · ${item.totalBytes} B</div>
        </div>
        <span style="font-size:11px; color:#64748b">${item.timestamp || ''}</span>
      `;
      div.onclick = () => {
        lastScannedPayload = item;
        handleNfcReadSuccess({ serialNumber: item.uid, message: { records: [] } });
      };
      container.appendChild(div);
    });
  }

  $('btn-clear-history').onclick = () => {
    scanHistory = [];
    localStorage.removeItem('nfclab_history');
    renderHistory();
    showToast('✓ Histórico limpo!');
  };

  // --- TAB 2: WRITE COMPOSER ENGINE ---
  let selectedRecordType = 'url';

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      selectedRecordType = btn.dataset.type;
      document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.form-group-pane').forEach(p => {
        p.hidden = p.id !== `pane-type-${selectedRecordType}`;
      });
    };
  });

  // Capacity Calculation
  function calculateQueueBytes() {
    const encoder = new TextEncoder();
    let total = 0;
    recordsQueue.forEach(item => {
      total += encoder.encode(item.payloadStr || '').length + 12; // 12 bytes header NDEF overhead
    });
    return total;
  }

  function updateCapacityMeter() {
    const bytes = calculateQueueBytes();
    $('meter-bytes').textContent = `${bytes} bytes`;
    const pct = Math.min(100, Math.round((bytes / 888) * 100));
    const fill = $('meter-bar-fill');
    fill.style.width = `${Math.max(6, pct)}%`;

    const b213 = document.querySelector('.badge-ntag213');
    const b215 = document.querySelector('.badge-ntag215');
    const b216 = document.querySelector('.badge-ntag216');

    if (b213) b213.classList.toggle('active', bytes <= 144);
    if (b215) b215.classList.toggle('active', bytes <= 504);
    if (b216) b216.classList.toggle('active', bytes <= 888);

    const hint = $('meter-hint-text');
    if (bytes === 0) {
      hint.textContent = currentLang === 'en'
        ? 'ℹ️ Add at least 1 record to calculate chip capacity.'
        : 'ℹ️ Adicione ao menos 1 registro para calcular a capacidade.';
    } else if (bytes <= 144) {
      hint.textContent = currentLang === 'en'
        ? '✓ Fits in any NFC chip: NTAG213 (144 B), NTAG215 (504 B) and NTAG216 (888 B).'
        : '✓ Cabe em qualquer chip NFC: NTAG213 (144 B), NTAG215 (504 B) e NTAG216 (888 B).';
    } else if (bytes <= 504) {
      hint.textContent = currentLang === 'en'
        ? '✓ Recommended: NTAG215 (504 B) or NTAG216 (888 B).'
        : '✓ Recomendado: cartão NTAG215 (504 B) ou NTAG216 (888 B).';
    } else if (bytes <= 888) {
      hint.textContent = currentLang === 'en'
        ? '⚠️ High density: requires NTAG216 (888 B).'
        : '⚠️ Alta densidade: requer cartão NTAG216 (888 B).';
    } else {
      hint.textContent = currentLang === 'en'
        ? '⚠️ Payload exceeds 888 B! Reduce record size.'
        : '⚠️ Dados excedem 888 B! Reduza o tamanho dos registros.';
    }
  }

  // Add Record to Queue
  $('btn-add-queue').onclick = () => {
    let newRecord = null;

    if (selectedRecordType === 'url') {
      const url = $('inp-url').value.trim();
      if (!url || url === 'https://') {
        showToast('⚠️ Digite uma URL válida.');
        return;
      }
      newRecord = {
        recordType: 'url',
        data: url,
        payloadStr: url,
        summary: `🌐 ${url}`
      };
    } else if (selectedRecordType === 'vcard') {
      const name = $('vcard-name').value.trim();
      const phone = $('vcard-phone').value.trim();
      const email = $('vcard-email').value.trim();
      const comp = $('vcard-company').value.trim();
      const site = $('vcard-site').value.trim();

      if (!name) {
        showToast('⚠️ Preencha ao menos o Nome para o vCard.');
        return;
      }

      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        comp ? `ORG:${comp}` : '',
        site ? `URL:${site}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n');

      newRecord = {
        recordType: 'mime',
        mediaType: 'text/vcard',
        data: new TextEncoder().encode(vcard),
        payloadStr: vcard,
        summary: `📇 vCard: ${name} (${phone || email})`
      };
    } else if (selectedRecordType === 'wifi') {
      const ssid = $('wifi-ssid').value.trim();
      const pass = $('wifi-pass').value.trim();
      const auth = $('wifi-auth').value;

      if (!ssid) {
        showToast('⚠️ Preencha o nome da rede (SSID).');
        return;
      }

      // Standard Wi-Fi URI representation recognized by modern smartphones
      const wifiStr = `WIFI:S:${ssid};T:${auth};P:${pass};;`;
      newRecord = {
        recordType: 'url',
        data: wifiStr,
        payloadStr: wifiStr,
        summary: `📶 Wi-Fi: ${ssid} (${auth})`
      };
    } else if (selectedRecordType === 'text') {
      const txt = $('inp-text').value.trim();
      if (!txt) {
        showToast('⚠️ Digite um texto.');
        return;
      }
      newRecord = {
        recordType: 'text',
        data: txt,
        payloadStr: txt,
        summary: `📝 ${txt.slice(0, 35)}…`
      };
    } else if (selectedRecordType === 'phone') {
      const ph = $('inp-phone').value.trim();
      if (!ph) {
        showToast('⚠️ Digite o número de telefone.');
        return;
      }
      const uri = `tel:${ph.replace(/\s+/g, '')}`;
      newRecord = {
        recordType: 'url',
        data: uri,
        payloadStr: uri,
        summary: `📞 Discagem: ${ph}`
      };
    } else if (selectedRecordType === 'sms') {
      const num = $('inp-sms-number').value.trim();
      const msg = $('inp-sms-body').value.trim();
      if (!num) {
        showToast('⚠️ Digite o número de telefone.');
        return;
      }
      const uri = `sms:${num}?body=${encodeURIComponent(msg)}`;
      newRecord = {
        recordType: 'url',
        data: uri,
        payloadStr: uri,
        summary: `💬 SMS/WhatsApp: ${num}`
      };
    } else if (selectedRecordType === 'email') {
      const to = $('inp-mail-to').value.trim();
      const sub = $('inp-mail-sub').value.trim();
      const body = $('inp-mail-body').value.trim();
      if (!to) {
        showToast('⚠️ Digite o e-mail de destino.');
        return;
      }
      const uri = `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
      newRecord = {
        recordType: 'url',
        data: uri,
        payloadStr: uri,
        summary: `✉️ E-mail para: ${to}`
      };
    } else if (selectedRecordType === 'geo') {
      const lat = $('inp-geo-lat').value.trim();
      const lng = $('inp-geo-lng').value.trim();
      if (!lat || !lng) {
        showToast('⚠️ Preencha Latitude e Longitude.');
        return;
      }
      const uri = `geo:${lat},${lng}?q=${lat},${lng}`;
      newRecord = {
        recordType: 'url',
        data: uri,
        payloadStr: uri,
        summary: `📍 GPS: ${lat}, ${lng}`
      };
    } else if (selectedRecordType === 'aar') {
      const pkg = $('inp-aar-pkg').value.trim();
      if (!pkg) {
        showToast('⚠️ Digite o Package Name do app.');
        return;
      }
      newRecord = {
        recordType: 'mime',
        mediaType: 'android.com:pkg',
        data: new TextEncoder().encode(pkg),
        payloadStr: pkg,
        summary: `📱 Android App: ${pkg}`
      };
    } else if (selectedRecordType === 'custom') {
      const mime = $('inp-mime-type').value.trim() || 'application/octet-stream';
      const body = $('inp-mime-body').value.trim();
      newRecord = {
        recordType: 'mime',
        mediaType: mime,
        data: new TextEncoder().encode(body),
        payloadStr: body,
        summary: `⚙️ MIME (${mime})`
      };
    }

    if (newRecord) {
      recordsQueue.push(newRecord);
      renderQueue();
      showToast('✓ Registro adicionado à fila!');
    }
  };

  function renderQueue() {
    const container = $('queue-list-container');
    $('queue-count').textContent = String(recordsQueue.length);
    container.innerHTML = '';

    if (recordsQueue.length === 0) {
      container.innerHTML = `<p class="empty-state">${currentLang === 'en' ? 'Queue is empty. Select a type and click "Add Record".' : 'A fila está vazia. Escolha um tipo e clique em "Adicionar Registro".'}</p>`;
      updateCapacityMeter();
      return;
    }

    recordsQueue.forEach((rec, idx) => {
      const row = document.createElement('div');
      row.className = 'queue-item';
      row.innerHTML = `
        <div class="queue-item-left">
          <span>${rec.summary}</span>
        </div>
        <button type="button" class="btn-remove-queue" title="Remover">✕</button>
      `;
      row.querySelector('.btn-remove-queue').onclick = () => {
        recordsQueue.splice(idx, 1);
        renderQueue();
      };
      container.appendChild(row);
    });

    updateCapacityMeter();
  }

  $('btn-clear-queue').onclick = () => {
    recordsQueue = [];
    renderQueue();
    showToast('✓ Fila esvaziada!');
  };

  // Initialize Default Queue with 1 sample URL
  recordsQueue.push({
    recordType: 'url',
    data: 'https://4u.ia.br/',
    payloadStr: 'https://4u.ia.br/',
    summary: '🌐 https://4u.ia.br/'
  });
  renderQueue();

  // WRITE NFC CHIP TRIGGER
  $('btn-cancel-write').onclick = stopAllNfcOperations;

  $('btn-start-write').onclick = async () => {
    if (!('NDEFReader' in window)) {
      showToast(currentLang === 'en' ? '⚠️ Web NFC is not available in this browser.' : '⚠️ Web NFC não suportado neste navegador.');
      return;
    }

    if (recordsQueue.length === 0) {
      showToast(currentLang === 'en' ? '⚠️ Add at least 1 record to the queue before writing.' : '⚠️ Adicione ao menos 1 registro à fila antes de gravar.');
      return;
    }

    const isBatch = $('chk-batch-mode').checked;
    batchCount = 0;
    $('batch-count-num').textContent = '0';
    $('batch-counter-box').hidden = !isBatch;

    try {
      stopAllNfcOperations();
      writeAbortController = new AbortController();
      const ndef = new NDEFReader();

      $('write-radar').hidden = false;
      $('btn-start-write').hidden = true;
      $('write-radar-status').textContent = I18N[currentLang].radarHoldWrite;

      const recordsToWrite = recordsQueue.map(r => ({
        recordType: r.recordType,
        mediaType: r.mediaType,
        data: r.data
      }));

      const doWrite = async () => {
        await ndef.write({ records: recordsToWrite }, { signal: writeAbortController.signal });
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
        batchCount++;
        $('batch-count-num').textContent = String(batchCount);
        showToast(currentLang === 'en' ? `✓ Tag successfully written! (#${batchCount})` : `✓ Chip gravado com sucesso! (#${batchCount})`);

        if (isBatch) {
          $('write-radar-status').textContent = currentLang === 'en'
            ? '✓ Card written! Hold next NFC tag to continue...'
            : '✓ Cartão gravado! Aproxime a próxima tag NFC para continuar…';
          // Ready for next card in loop
          await doWrite();
        } else {
          stopAllNfcOperations();
        }
      };

      await doWrite();
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast(`⚠️ Erro na gravação: ${err.message}`);
      }
      stopAllNfcOperations();
    }
  };

  // --- TAB 3: TOOLS (OUTROS) ---
  // 1. Clone
  $('btn-tool-clone').onclick = () => {
    if (!lastScannedPayload || lastScannedPayload.records.length === 0) {
      showToast('⚠️ Leia uma tag primeiro na aba "Ler" antes de clonar.');
      switchTab('read');
      return;
    }

    // Populate queue with scanned records
    recordsQueue = lastScannedPayload.records.map(r => ({
      recordType: r.type,
      mediaType: r.mediaType,
      data: r.content,
      payloadStr: r.content,
      summary: `${r.type.toUpperCase()}: ${r.content.slice(0, 30)}`
    }));

    renderQueue();
    switchTab('write');
    showToast('✓ Registros da tag clonados para a fila de gravação!');
  };

  if ($('btn-clone-scanned')) {
    $('btn-clone-scanned').onclick = $('btn-tool-clone').onclick;
  }

  // 2. Erase / Format
  $('btn-tool-erase').onclick = async () => {
    if (!('NDEFReader' in window)) {
      showToast('⚠️ Web NFC não suportado neste navegador.');
      return;
    }

    try {
      stopAllNfcOperations();
      writeAbortController = new AbortController();
      const ndef = new NDEFReader();
      showToast('🧹 Aproxime o chip NFC para apagar todos os dados…');
      await ndef.write({ records: [{ recordType: 'empty' }] }, { signal: writeAbortController.signal });
      if (navigator.vibrate) navigator.vibrate(100);
      showToast('✓ Chip NFC formatado e limpo com sucesso!');
    } catch (err) {
      showToast(`⚠️ Falha ao apagar: ${err.message}`);
    } finally {
      stopAllNfcOperations();
    }
  };

  // 3. Lock Chip (Read-Only)
  $('btn-tool-lock').onclick = () => {
    $('dialog-lock-confirm').showModal();
  };

  $('btn-execute-lock').onclick = async () => {
    $('dialog-lock-confirm').close();
    if (!('NDEFReader' in window)) {
      showToast('⚠️ Web NFC não suportado neste navegador.');
      return;
    }

    try {
      stopAllNfcOperations();
      writeAbortController = new AbortController();
      const ndef = new NDEFReader();
      showToast('🔒 Aproxime o cartão para aplicar o bloqueio permanente...');
      if ('makeReadOnly' in ndef) {
        await ndef.makeReadOnly({ signal: writeAbortController.signal });
      } else {
        await ndef.write({ records: [] }, { overwrite: true, signal: writeAbortController.signal });
      }
      if (navigator.vibrate) navigator.vibrate([150, 100, 150]);
      showToast('🔒 Cartão travado como Somente Leitura com sucesso!');
    } catch (err) {
      showToast(`⚠️ Falha ao travar: ${err.message}`);
    } finally {
      stopAllNfcOperations();
    }
  };

  // 4. QR Code Generator
  $('btn-tool-qr').onclick = () => {
    const primary = recordsQueue[0];
    if (!primary) {
      showToast('⚠️ Adicione ao menos 1 registro à fila para gerar QR Code.');
      return;
    }

    const payload = primary.data || primary.payloadStr || '';
    if (typeof qrcode === 'undefined') {
      showToast('⚠️ Biblioteca QR Code não carregada.');
      return;
    }

    try {
      const qr = qrcode(0, 'M');
      qr.addData(String(payload));
      qr.make();
      const canvas = $('qr-canvas');
      const ctx = canvas.getContext('2d');
      const count = qr.getModuleCount();
      const cellSize = Math.floor(canvas.width / count);
      const margin = Math.floor((canvas.width - count * cellSize) / 2);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0b0f15';

      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize, cellSize);
          }
        }
      }

      $('qr-payload-text').textContent = String(payload);
      $('dialog-qr').showModal();
    } catch (e) {
      showToast(`⚠️ Erro ao gerar QR: ${e.message}`);
    }
  };

  // Export / Import Profiles
  $('btn-export-profile').onclick = () => {
    const data = {
      app: 'NFC Lab',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      queue: recordsQueue
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nfc-lab-template-${Date.now()}.json`;
    a.click();
    showToast('✓ Modelo exportado!');
  };

  $('btn-import-profile').onclick = () => {
    $('inp-profile-file').click();
  };

  $('inp-profile-file').onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (Array.isArray(json.queue)) {
          recordsQueue = json.queue;
          renderQueue();
          switchTab('write');
          showToast('✓ Modelo importado com sucesso!');
        } else {
          showToast('⚠️ Arquivo de modelo inválido.');
        }
      } catch {
        showToast('⚠️ Erro ao ler JSON.');
      }
    };
    reader.readAsText(file);
  };

  // --- TAB 4: QUICK TASKS (ATALHOS) WIZARD ---
  let activeQuickType = null;

  function openQuickTaskWizard(type) {
    activeQuickType = type;
    const isEn = currentLang === 'en';
    const titleEl = $('quick-modal-title');
    const descEl = $('quick-modal-desc');
    const fieldsEl = $('quick-modal-fields');

    let title = '';
    let desc = '';
    let fieldsHtml = '';

    if (type === 'wifi') {
      title = isEn ? '📶 Configure Guest Wi-Fi Tag' : '📶 Configurar Tag Wi-Fi Balcão';
      desc = isEn
        ? 'Fill in your network name and password. When tapped, customer phones connect automatically without typing passwords.'
        : 'Preencha o nome da sua rede e a senha. Ao encostar, o celular do cliente conecta à internet sem precisar digitar a senha.';
      fieldsHtml = `
        <label class="field">
          <span>${isEn ? 'Network Name (SSID):' : 'Nome da Rede Wi-Fi (SSID):'}</span>
          <input type="text" id="qw-wifi-ssid" placeholder="Ex: MinhaLoja_5G" value="Visitas_Wi-Fi">
        </label>
        <div class="field-grid-2">
          <label class="field">
            <span>${isEn ? 'Wi-Fi Password:' : 'Senha da Rede:'}</span>
            <input type="text" id="qw-wifi-pass" placeholder="${isEn ? 'Network Password' : 'Senha de acesso'}" value="">
          </label>
          <label class="field">
            <span>${isEn ? 'Security:' : 'Segurança:'}</span>
            <select id="qw-wifi-auth" class="select-styled">
              <option value="WPA2">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">${isEn ? 'Open (No password)' : 'Aberta (Sem senha)'}</option>
            </select>
          </label>
        </div>
      `;
    } else if (type === 'whatsapp') {
      title = isEn ? '💬 Configure WhatsApp Tag' : '💬 Configurar Tag de WhatsApp';
      desc = isEn
        ? 'Ideal for counters, restaurant tables, and booths. Opens a direct chat with your business.'
        : 'Ideal para balcões, estandes e mesas. Abre a conversa direta com sua empresa no WhatsApp.';
      fieldsHtml = `
        <label class="field">
          <span>${isEn ? 'WhatsApp Number (with Country Code):' : 'WhatsApp com DDI e DDD:'}</span>
          <input type="tel" id="qw-wa-number" placeholder="+55 11 99999-9999" value="+55 ">
        </label>
        <label class="field">
          <span>${isEn ? 'Initial Pre-filled Message:' : 'Mensagem Inicial Pronta:'}</span>
          <input type="text" id="qw-wa-msg" value="${isEn ? 'Hello! I am contacting you via the NFC tag.' : 'Olá! Vim através da tag NFC do balcão.'}">
        </label>
      `;
    } else if (type === 'instagram') {
      title = isEn ? '📷 Configure Instagram Tag' : '📷 Configurar Tag do Instagram';
      desc = isEn
        ? 'Launches your brand’s Instagram profile directly on the visitor’s phone.'
        : 'Abre o perfil do Instagram da sua marca direto no aplicativo do visitante.';
      fieldsHtml = `
        <label class="field">
          <span>${isEn ? 'Instagram Username or URL:' : 'Usuário ou Link do Instagram:'}</span>
          <input type="text" id="qw-insta-user" placeholder="@fbr4g4 ou https://instagram.com/fbr4g4" value="@">
        </label>
      `;
    } else if (type === 'vcard-app') {
      title = isEn ? '✨ Configure 3D Virtual Card Tag' : '✨ Configurar Tag Cartão Executivo 3D';
      desc = isEn
        ? 'Direct link to your interactive 3D Virtual Card from 4u-Labs. Works on iPhone & Android with zero install.'
        : 'Link interativo para o seu Cartão Virtual 3D da 4u-Labs. Abre frente e verso com contatos em qualquer celular.';
      fieldsHtml = `
        <label class="field">
          <span>${isEn ? '3D Card Link (vCard App):' : 'Link do seu Cartão 3D (App vCard):'}</span>
          <input type="url" id="qw-vcard-url" placeholder="https://4u.ia.br/app/vcard/?d=..." value="https://4u.ia.br/app/vcard/">
        </label>
      `;
    } else if (type === 'webhook') {
      title = isEn ? '⚡ Configure Automation Webhook Tag' : '⚡ Configurar Tag de Automação (Webhook)';
      desc = isEn
        ? 'Trigger n8n workflows, Home Assistant routines, or cloud webhooks instantly on tap.'
        : 'Dispare fluxos no n8n, automações residenciais no Home Assistant ou webhooks ao aproximar.';
      fieldsHtml = `
        <label class="field">
          <span>${isEn ? 'Webhook URL (GET or POST):' : 'URL do Webhook (n8n / Home Assistant):'}</span>
          <input type="url" id="qw-webhook-url" placeholder="https://n8n.4u.ia.br/webhook/tag-trigger-01" value="https://n8n.4u.ia.br/webhook/">
        </label>
      `;
    } else if (type === 'maps') {
      title = isEn ? '📍 Configure Directions Tag (Maps)' : '📍 Configurar Tag Como Chegar (Maps)';
      desc = isEn
        ? 'Starts Google Maps turn-by-turn navigation directly to your store, clinic, or office.'
        : 'Inicia a rota no Google Maps até a sua clínica, escritório ou loja comercial.';
      fieldsHtml = `
        <label class="field">
          <span>${isEn ? 'Address or Google Maps Link:' : 'Endereço Comercial ou Link do Google Maps:'}</span>
          <input type="text" id="qw-maps-address" placeholder="Av. Paulista, 1000 - São Paulo" value="">
        </label>
      `;
    }

    titleEl.textContent = title;
    descEl.textContent = desc;
    fieldsEl.innerHTML = fieldsHtml;
    $('dialog-quick-task').showModal();
  }

  function compileQuickTaskRecord() {
    const type = activeQuickType;
    let newRecord = null;

    if (type === 'wifi') {
      const ssid = ($('qw-wifi-ssid')?.value || '').trim();
      const pass = ($('qw-wifi-pass')?.value || '').trim();
      const auth = $('qw-wifi-auth')?.value || 'WPA2';
      if (!ssid) {
        showToast(currentLang === 'en' ? '⚠️ Enter Wi-Fi network name (SSID).' : '⚠️ Preencha o nome da rede (SSID).');
        return null;
      }
      const wifiStr = `WIFI:S:${ssid};T:${auth};P:${pass};;`;
      newRecord = {
        recordType: 'url',
        data: wifiStr,
        payloadStr: wifiStr,
        summary: `📶 Wi-Fi: ${ssid} (${auth})`
      };
    } else if (type === 'whatsapp') {
      let num = ($('qw-wa-number')?.value || '').trim().replace(/[^\d+]/g, '');
      const msg = ($('qw-wa-msg')?.value || '').trim();
      if (!num || num.length < 8) {
        showToast(currentLang === 'en' ? '⚠️ Enter valid phone number with country and area code.' : '⚠️ Digite o número com DDI e DDD.');
        return null;
      }
      if (!num.startsWith('+') && !num.startsWith('55')) num = '55' + num;
      const cleanNum = num.replace('+', '');
      const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
      newRecord = {
        recordType: 'url',
        data: waUrl,
        payloadStr: waUrl,
        summary: `💬 WhatsApp: ${cleanNum}`
      };
    } else if (type === 'instagram') {
      let user = ($('qw-insta-user')?.value || '').trim();
      if (!user) {
        showToast(currentLang === 'en' ? '⚠️ Enter your Instagram username or link.' : '⚠️ Digite o perfil ou link do Instagram.');
        return null;
      }
      if (!user.startsWith('http')) {
        user = user.replace('@', '');
        user = `https://www.instagram.com/${user}/`;
      }
      newRecord = {
        recordType: 'url',
        data: user,
        payloadStr: user,
        summary: `📷 Instagram: ${user}`
      };
    } else if (type === 'vcard-app') {
      const url = ($('qw-vcard-url')?.value || '').trim();
      if (!url) {
        showToast(currentLang === 'en' ? '⚠️ Enter your 3D Card URL.' : '⚠️ Digite o link do seu cartão 3D.');
        return null;
      }
      newRecord = {
        recordType: 'url',
        data: url,
        payloadStr: url,
        summary: `✨ Cartão 3D: ${url}`
      };
    } else if (type === 'webhook') {
      const url = ($('qw-webhook-url')?.value || '').trim();
      if (!url) {
        showToast(currentLang === 'en' ? '⚠️ Enter webhook URL.' : '⚠️ Digite a URL do webhook.');
        return null;
      }
      newRecord = {
        recordType: 'url',
        data: url,
        payloadStr: url,
        summary: `⚡ Webhook: ${url}`
      };
    } else if (type === 'maps') {
      const addr = ($('qw-maps-address')?.value || '').trim();
      if (!addr) {
        showToast(currentLang === 'en' ? '⚠️ Enter an address or Google Maps link.' : '⚠️ Digite o endereço ou link.');
        return null;
      }
      const mapsUrl = addr.startsWith('http')
        ? addr
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
      newRecord = {
        recordType: 'url',
        data: mapsUrl,
        payloadStr: mapsUrl,
        summary: `📍 Maps: ${addr.slice(0, 30)}`
      };
    }

    return newRecord;
  }

  $('btn-quick-to-editor').onclick = () => {
    const rec = compileQuickTaskRecord();
    if (!rec) return;
    recordsQueue = [rec];
    renderQueue();
    $('dialog-quick-task').close();
    switchTab('write');
    showToast(currentLang === 'en' ? '✓ Shortcut loaded into Write Composer!' : '✓ Atalho carregado no editor de gravação!');
  };

  $('btn-quick-write-now').onclick = () => {
    const rec = compileQuickTaskRecord();
    if (!rec) return;
    recordsQueue = [rec];
    renderQueue();
    $('dialog-quick-task').close();
    switchTab('write');
    setTimeout(() => {
      $('btn-start-write')?.click();
    }, 120);
  };

  document.querySelectorAll('[data-quick]').forEach(btn => {
    btn.onclick = () => openQuickTaskWizard(btn.dataset.quick);
  });

  // --- MODALS & DIALOGS ---
  $('btn-open-help').onclick = () => $('dialog-help').showModal();
  $('btn-open-community').onclick = () => $('dialog-community').showModal();
  $('footer-btn-community').onclick = () => $('dialog-community').showModal();

  document.querySelectorAll('dialog').forEach(d => {
    d.querySelectorAll('[data-close]').forEach(c => {
      c.onclick = () => d.close();
    });
  });

  // --- PWA INSTALLATION STANDARD ---
  let deferredInstallPrompt = null;
  const pwaInstallBtn = $('btn-pwa-install');
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (pwaInstallBtn) {
    pwaInstallBtn.hidden = isStandalone;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (pwaInstallBtn && !isStandalone) pwaInstallBtn.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (pwaInstallBtn) pwaInstallBtn.hidden = true;
    showToast(currentLang === 'en' ? '✓ App installed!' : '✓ Aplicativo instalado com sucesso!');
  });

  pwaInstallBtn?.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        pwaInstallBtn.hidden = true;
      }
      deferredInstallPrompt = null;
    } else if (isIos) {
      showToast(
        currentLang === 'en'
          ? '📲 On iPhone/iPad: tap Share (⬆️) in Safari and select "Add to Home Screen".'
          : '📲 No iPhone/iPad: toque em Compartilhar (⬆️) no Safari e escolha "Adicionar à Tela de Início".'
      );
    } else {
      showToast(
        currentLang === 'en'
          ? '📲 To install: tap browser menu (⋮) and select "Install app" or "Add to Home screen".'
          : '📲 Para instalar: toque no menu (⋮) do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".'
      );
    }
  });

  // --- SERVICE WORKER REGISTRATION ---
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=1.2', { updateViaCache: 'none' }).catch(() => {});
    });
  }

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => setLanguage(btn.dataset.lang);
  });

  // Initialize
  const savedLang = localStorage.getItem('nfclab_lang') || 'pt';
  setLanguage(savedLang);
  checkWebNfcSupport();
  loadScanHistory();
})();
