function formatINR(amount) {
  return Number(amount).toLocaleString("en-IN");
}

function togglePriceDetails() {
  const d = document.getElementById("price-details");
  const c = document.getElementById("price-chevron");
  const expanded = d.style.maxHeight !== "0px";

  if (expanded) {
    d.style.maxHeight = "0px";
    d.style.opacity = "0";
    c.classList.add("rotate-180");
  } else {
    d.style.maxHeight = "160px";
    d.style.opacity = "1";
    c.classList.remove("rotate-180");
  }
}

(function initUPIPanel() {
  const upiRow = document.getElementById("upi-row");
  const upiPanel = document.getElementById("upi-panel");

  if (upiRow && upiPanel) {
    upiRow.addEventListener("click", () => {
      upiPanel.classList.toggle("open");
    });

    document.addEventListener("DOMContentLoaded", function () {
      upiPanel.classList.add("open");
    });
  }
})();

var itemData = {};

$(document).ready(function () {
  const $offer = $("#offerend-time");
  if ($offer.length) startTimer(500 - 120, $offer);

  $(".form-check").on("click", function () {
    $(".form-check").removeClass("active");
    $(this).addClass("active");
    updateActionButton();
  });

  const selected_verient = localStorage.getItem("selected_verient");
  itemData = selected_verient ? JSON.parse(selected_verient) : {};

  if (itemData && itemData.img1) $("#item_image").prop("src", itemData.img1);

  const name =
    (itemData?.name || "") +
    " " +
    (itemData?.color ? " (" + itemData.color + ")" : "") +
    (itemData?.size ? " (" + itemData.size + ")" : "") +
    (itemData?.storage ? " (" + itemData.storage + ")" : "");

  $("#product-title").html(name || "Item");

  const sp = itemData?.selling_price ?? 0;
  const mrp = itemData?.mrp ?? 0;

  $(".selling_price, .payable").html("₹" + formatINR(sp));
  $(".mrp").html("₹" + formatINR(mrp));

  const d = new Date();
  d.setDate(d.getDate() + 2);
  const el = document.getElementById("delivery-ddate");
  if (el) {
    el.innerText = `${d.getDate()} ${d.toLocaleString("en-US", {
      month: "short",
    })}, ${d.toLocaleString("en-US", { weekday: "short" })}`;
  }

  const checkedRadio = document.querySelector(
    '#upi-panel input[type="radio"]:checked'
  );
  if (checkedRadio) {
    const option = checkedRadio.closest(".form-check");
    if (option) {
      document
        .querySelectorAll(".form-check")
        .forEach((x) => x.classList.remove("active"));
      option.classList.add("active");
    }
  } else {
    const first = document.querySelector("#upi-panel .form-check");
    if (first) first.classList.add("active");
  }

  updateActionButton();
});

function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.text(minutes + "min " + seconds + "sec");

    if (--timer < 0) timer = duration;
  }, 1000);
}

const modalOverlay = document.getElementById("modalOverlay");
const qrModal = document.getElementById("qrModal");
const closeModalBtn = document.getElementById("closeModal");
const downloadQRBtn = document.getElementById("downloadQRBtn");

function openQRModal() {
  if (!modalOverlay || !qrModal) return;

  modalOverlay.classList.add("show");
  qrModal.classList.add("show");

  const loading = document.getElementById("qr-loading");
  const box = document.getElementById("qr-code");

  if (loading) loading.style.display = "flex";
  if (box) {
    box.innerHTML = "";
    box.classList.remove("ready");
  }

  requestAnimationFrame(() => {
    generateQR();
  });
}

function closeQRModal() {
  if (modalOverlay) modalOverlay.classList.remove("show");
  if (qrModal) qrModal.classList.remove("show");
}

if (modalOverlay) modalOverlay.addEventListener("click", closeQRModal);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeQRModal);
if (qrModal) qrModal.addEventListener("click", (e) => e.stopPropagation());

if (downloadQRBtn) {
  downloadQRBtn.addEventListener("click", function () {
    const box = document.getElementById("qr-code");
    if (!box) return;

    const srcCanvas = box.querySelector("canvas");
    const srcImg = box.querySelector("img");

    let qrCanvas = srcCanvas;

    if (!qrCanvas && srcImg && srcImg.src) {
      const temp = document.createElement("canvas");
      const ctx = temp.getContext("2d");
      const img = new Image();

      img.onload = function () {
        temp.width = img.width;
        temp.height = img.height;
        ctx.drawImage(img, 0, 0);
        downloadWithWhiteBg(temp);
      };

      img.src = srcImg.src;
      return;
    }

    if (!qrCanvas) return;
    downloadWithWhiteBg(qrCanvas);
  });
}

function downloadWithWhiteBg(qrCanvas) {
  const padding = 20;
  const size = qrCanvas.width;
  const finalSize = size + padding * 2;

  const out = document.createElement("canvas");
  out.width = finalSize;
  out.height = finalSize;

  const ctx = out.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, finalSize, finalSize);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrCanvas, padding, padding);

  const dataUrl = out.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "upi-qr.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function generateQR() {
  const loading = document.getElementById("qr-loading");
  const box = document.getElementById("qr-code");

  if (!box) return;

  if (loading) loading.style.display = "flex";
  box.innerHTML = "";
  box.classList.remove("ready");

  let amount = parseFloat(itemData?.selling_price || 0);
  if (isNaN(amount)) amount = 0;

  const txn = Math.floor(Math.random() * 9999999999);

  // Use upiData from info.json or fallback to paymentUrls.qr
  let upiId = "";
  if (typeof upiData !== "undefined" && upiData.upiId) {
    upiId = upiData.upiId;
  } else if (typeof paymentUrls !== "undefined" && paymentUrls.qr) {
    upiId = paymentUrls.qr;
  }

  const text = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=Flipkart&am=${amount}&cu=INR&tr=${txn}&tn=${txn}`;

  setTimeout(() => {
    new QRCode(box, {
      text,
      width: 230,
      height: 230,
      correctLevel: QRCode.CorrectLevel.H,
    });

    if (loading) loading.style.display = "none";
    box.classList.add("ready");
  }, 280);
}

function updateActionButton() {
  const active = document.querySelector(".form-check.active");
  const btn = document.getElementById("action-button");
  const amount = itemData?.selling_price || 0;

  if (!active || !btn) return;

  const type = active.getAttribute("pay-type");

  if (type === "qr_upi") {
    btn.innerHTML = "View QR Code";
    btn.onclick = () => openQRModal();
  } else {
    btn.innerHTML = `Pay ₹${amount}`;
    btn.onclick = () => payNow();
  }
}

document.addEventListener("DOMContentLoaded", updateActionButton);

let failTimer = null;

function showPaymentWaiting() {
  const ov = document.getElementById("paymentWaitingOverlay");
  if (!ov) return;
  ov.style.display = "block";

  failTimer = setTimeout(() => {
    ov.style.display = "none";
    const fail = document.getElementById("paymentFailedPopup");
    if (fail) fail.style.display = "block";
  }, 20000);
}

const tryAgainBtn = document.getElementById("tryAgainBtn");
if (tryAgainBtn) {
  tryAgainBtn.onclick = function () {
    const fail = document.getElementById("paymentFailedPopup");
    if (fail) fail.style.display = "none";
    if (failTimer) clearTimeout(failTimer);
  };
}

const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
if (cancelPaymentBtn) {
  cancelPaymentBtn.onclick = function () {
    const ov = document.getElementById("paymentWaitingOverlay");
    if (ov) ov.style.display = "none";
    if (failTimer) clearTimeout(failTimer);
  };
}

async function payNow() {
  var payType = $(".form-check.active").attr("pay-type");

  let redirect_url = "";

  switch (payType) {
    case "phonepe":
      if (typeof paymentUrls !== "undefined" && paymentUrls.phonepe) {
        showPaymentWaiting();
        window.location.href = paymentUrls.phonepe;
        return;
      }
      break;

    case "paytm":
      if (typeof paymentUrls !== "undefined" && paymentUrls.paytm) {
        redirect_url = paymentUrls.paytm;
      }
      break;

    case "qr_upi":
      openQRModal();
      return;
  }

  if (redirect_url) {
    showPaymentWaiting();
    setTimeout(() => {
      window.location.href = redirect_url;
    }, 200);
  }
}

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && ["u", "U", "s", "S", "c", "C", "p", "P"].includes(e.key))
    e.preventDefault();
  if (e.keyCode === 123) e.preventDefault();
});
document.addEventListener("dragstart", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());
