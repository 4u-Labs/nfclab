# 📡 NFC Lab — Suíte Web de Diagnóstico & Gravação NFC

> **Leitor, Inspetor UID/Hexadecimal, Gravador Multi-Registro NDEF, Clonador e Gerador de Atalhos NFC direto no navegador via Web NFC API — 100% Client-Side, Bilíngue (PT/EN) e PWA.**

🔗 **Acessar Online:** [https://4u.ia.br/app/nfclab/](https://4u.ia.br/app/nfclab/)  
🏠 **Ecossistema 4u-Labs:** [https://4u.ia.br/loja/](https://4u.ia.br/loja/) · [Blog Técnico](https://4u-labs.github.io/) · [GitHub](https://github.com/4u-Labs)

---

## ✨ Recursos Principais

- 🔍 **Leitor & Diagnóstico Completo de Chips NFC:** Identifica UID / número de série, família do chip (NTAG213, NTAG215, NTAG216, Mifare Ultralight), tamanho do payload, status de bloqueio (RW/RO) e inspetor **Hexadecimal & ASCII**.
- ✍️ **Gravador Multi-Registro NDEF (10 Formatos):** Crie filas com múltiplos registros em uma única tag — **URL**, **Contato vCard**, **Rede Wi-Fi**, **Texto**, **Telefone**, **WhatsApp / SMS**, **E-mail**, **GPS / Localização**, **App Android (AAR)** e **MIME Customizado**, com medidor de capacidade em tempo real para NTAG213/215/216.
- 📦 **Gravação Contínua em Lote (Batch Mode):** Grave dezenas de cartões ou adesivos NFC em sequência com contador automático e histórico da sessão.
- ⚙️ **Ferramentas Avançadas:** Clonagem da última tag lida, formatação/limpeza NDEF, bloqueio permanente somente-leitura, backup/restauração de modelos em `.json` e gerador integrado de **QR Code** do mesmo payload.
- ⚡ **Atalhos Prontos (1 Toque):** Templates pré-configurados para Wi-Fi de balcão, atendimento no WhatsApp, perfil no Instagram, Cartão Executivo 4U, Webhooks (n8n/automação) e rota no Google Maps.
- 🌐 **Bilíngue (PT/EN) & PWA Instalável:** Interface responsiva sem anúncios, sem login, sem rastreamento e com Service Worker offline.

---

## 🛠️ Tecnologias & Compatibilidade

- **Web NFC API (`NDEFReader`)** — Leitura e gravação direta no **Google Chrome / Microsoft Edge para Android**.
- **JavaScript Vanilla + HTML5 + CSS3** + `qrcode.min.js`.
- **Progressive Web App (PWA)** com `manifest.json` e `sw.js`.

---

© 2026 **4U.IA.BR · 4u-Labs** — Fabiano Braga. Licenciado sob a licença MIT.
