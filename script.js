(() => {
  "use strict";
  const SERVICES = {
    subs: { name: "YouTube Subscribers", package: "1,000 Subscribers", price: 2000, qr: "assets/qr-subscribers-2000.png" },
    watch: { name: "YouTube Watch Time", package: "4,000 Watch Hours", price: 4000, qr: "assets/qr-watchtime-4000.png" },
    monetize: { name: "YouTube Monetization Channel", package: "Monetization Channel", price: 6500, qr: "assets/qr-monetization-6500.png" }
  };
  const WHATSAPP_NUMBER = "916207120625";
  const TELEGRAM_URL = "https://t.me/TrueCrazyMax";
  const modal = document.getElementById("orderModal");
  const form = document.getElementById("orderForm");
  const paymentPanel = document.getElementById("paymentPanel");
  const chosenPackage = document.getElementById("chosenPackage");
  const serviceKey = document.getElementById("serviceKey");
  const paymentQr = document.getElementById("paymentQr");
  const qrFallback = document.getElementById("qrFallback");
  const paymentTotal = document.getElementById("paymentTotal");
  const countdown = document.getElementById("countdown");
  const timerHelp = document.getElementById("timerHelp");
  const toast = document.getElementById("toast");
  let activeService = null, timer = null, secondsLeft = 300, orderReference = null;

  document.getElementById("year").textContent = new Date().getFullYear();
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => a.href = `https://wa.me/${WHATSAPP_NUMBER}`);
  document.querySelectorAll('a[href^="https://t.me/"]').forEach(a => a.href = TELEGRAM_URL);

  document.getElementById("menuToggle").addEventListener("click", () => {
    const nav = document.getElementById("navMenu");
    const open = nav.classList.toggle("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("#navMenu a").forEach(a => a.addEventListener("click", () => {
    document.getElementById("navMenu").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
  }));

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function openModal(key) {
    activeService = SERVICES[key];
    if (!activeService) return;
    orderReference = "CBH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    serviceKey.value = key;
    chosenPackage.innerHTML = `<b>${activeService.name}<small style="display:block;color:#9eacc1;font-size:10px;margin-top:5px">${activeService.package}</small></b><strong>₹${activeService.price.toLocaleString("en-IN")}</strong>`;
    paymentPanel.hidden = true;
    form.hidden = false;
    form.reset();
    qrFallback.hidden = true;
    paymentQr.hidden = false;
    paymentQr.onerror = () => { paymentQr.hidden = true; qrFallback.hidden = false; };
    paymentQr.onload = () => { paymentQr.hidden = false; qrFallback.hidden = true; };
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("customerName").focus({ preventScroll: true });
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    clearInterval(timer); timer = null;
  }
  document.querySelectorAll("[data-service]").forEach(button => button.addEventListener("click", () => openModal(button.dataset.service)));
  document.getElementById("closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  function startCountdown() {
    clearInterval(timer);
    secondsLeft = 300;
    renderCountdown();
    timerHelp.textContent = "Enter the transaction details after making the payment. The timer is a guide and does not verify payment.";
    timer = window.setInterval(() => {
      secondsLeft = Math.max(0, secondsLeft - 1);
      renderCountdown();
      if (secondsLeft === 0) {
        clearInterval(timer); timer = null;
        timerHelp.textContent = "The 5-minute timer has ended. You may still submit transaction details, but verify payment before proceeding.";
        showToast("Payment timer ended. Verify your payment details.");
      }
    }, 1000);
  }
  function renderCountdown() {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    countdown.textContent = `${mm}:${ss}`;
    countdown.classList.toggle("urgent", secondsLeft <= 60);
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.hidden = true;
    paymentPanel.hidden = false;
    paymentTotal.innerHTML = `₹${activeService.price.toLocaleString("en-IN")}<small>AMOUNT TO PAY</small>`;
    paymentQr.src = activeService.qr;
    paymentQr.alt = `QR code for ₹${activeService.price} — ${activeService.name}`;
    startCountdown();
    paymentPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("confirmOrder").addEventListener("click", () => {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const channel = document.getElementById("channelUrl").value.trim();
    const utr = document.getElementById("utrNumber").value.trim();
    const transactionId = document.getElementById("transactionId").value.trim();
    if (!name || !phone || !address || !channel) {
      showToast("Please complete your customer details first.");
      form.hidden = false; paymentPanel.hidden = true; form.reportValidity(); return;
    }
    if (!utr || !transactionId) {
      showToast("Please enter both UTR Number and Transaction ID.");
      (!utr ? document.getElementById("utrNumber") : document.getElementById("transactionId")).focus();
      return;
    }
    if (!/^https?:\/\/.+/i.test(channel)) {
      showToast("Please enter a valid YouTube channel URL.");
      return;
    }
    const message = [
      "NEW ORDER — CREATORBOOST HUB",
      `Order ID: ${orderReference}`,
      `Service: ${activeService.name}`,
      `Package: ${activeService.package}`,
      `Amount: ₹${activeService.price.toLocaleString("en-IN")}`,
      "",
      "CUSTOMER DETAILS",
      `Name: ${name}`,
      `Mobile: ${phone}`,
      `Address: ${address}`,
      `YouTube Channel: ${channel}`,
      "",
      "PAYMENT DETAILS",
      `UTR Number: ${utr}`,
      `Transaction ID: ${transactionId}`,
      "",
      "Please verify the payment before processing this order."
    ].join("\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    showToast(`Order ${orderReference} prepared for WhatsApp. Tap Send in WhatsApp to submit.`);
  });

  // Preload local QR assets so missing files are caught early.
  Object.values(SERVICES).forEach(service => {
    const img = new Image();
    img.src = service.qr;
    img.onerror = () => console.warn("QR asset not found:", service.qr);
  });
})();