
const ACCESS_PASSWORD = "danilo123";
const ACCESS_SESSION_KEY = "calculadora3d_authenticated";

const loginGate = document.getElementById("loginGate");
const appContent = document.getElementById("appContent");
const loginForm = document.getElementById("loginForm");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");
const lockButton = document.getElementById("lockButton");

function unlockApp() {
  sessionStorage.setItem(ACCESS_SESSION_KEY, "1");
  loginGate.hidden = true;
  appContent.classList.remove("app-locked");
  appContent.setAttribute("aria-hidden", "false");
  document.body.classList.remove("login-open");
}

function lockApp() {
  sessionStorage.removeItem(ACCESS_SESSION_KEY);
  loginPassword.value = "";
  loginPassword.type = "password";
  togglePassword.textContent = "Mostrar";
  loginError.hidden = true;
  loginGate.hidden = false;
  appContent.classList.add("app-locked");
  appContent.setAttribute("aria-hidden", "true");
  document.body.classList.add("login-open");

  window.setTimeout(() => loginPassword.focus(), 50);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (loginPassword.value === ACCESS_PASSWORD) {
    unlockApp();
    return;
  }

  loginError.hidden = false;
  loginPassword.select();
});

loginPassword.addEventListener("input", () => {
  loginError.hidden = true;
});

togglePassword.addEventListener("click", () => {
  const isPassword = loginPassword.type === "password";
  loginPassword.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
  togglePassword.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
});

lockButton.addEventListener("click", lockApp);

if (sessionStorage.getItem(ACCESS_SESSION_KEY) === "1") {
  unlockApp();
} else {
  document.body.classList.add("login-open");
  window.setTimeout(() => loginPassword.focus(), 50);
}


const form = document.getElementById("pricingForm");
const result = document.getElementById("result");
const formError = document.getElementById("formError");
const partsContainer = document.getElementById("partsContainer");
const addPartButton = document.getElementById("addPartButton");
const partsSummaryList = document.getElementById("partsSummaryList");

const PRINTER_WATTS = 200;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const numberBR = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

function money(value) {
  return currency.format(value);
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function parseMaskedNumber(value) {
  const normalized = String(value || "0")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function maskedValueOf(id) {
  return parseMaskedNumber(document.getElementById(id).value);
}

function integerValue(input) {
  const digits = String(input.value || "").replace(/\D/g, "");
  const parsed = Number.parseInt(digits || "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function applyDecimalMask(input) {
  const digits = input.value.replace(/\D/g, "");
  const value = Number(digits || "0") / 100;

  input.value = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function applyIntegerMask(input) {
  input.value = input.value.replace(/\D/g, "");
}

function applyMinutesMask(input) {
  const value = input.value.replace(/\D/g, "");

  if (value === "") {
    input.value = "";
    return;
  }

  let minutes = Number.parseInt(value, 10);
  if (!Number.isFinite(minutes)) minutes = 0;
  if (minutes > 59) minutes = 59;

  input.value = String(minutes);
}

function bindInputMasks(scope = document) {
  scope.querySelectorAll(".money-mask, .percent-mask").forEach((input) => {
    if (input.dataset.maskBound === "1") return;
    input.dataset.maskBound = "1";
    input.addEventListener("input", () => applyDecimalMask(input));
  });

  scope.querySelectorAll(".integer-mask").forEach((input) => {
    if (input.dataset.maskBound === "1") return;
    input.dataset.maskBound = "1";
    input.addEventListener("input", () => applyIntegerMask(input));
  });

  scope.querySelectorAll(".minutes-mask").forEach((input) => {
    if (input.dataset.maskBound === "1") return;
    input.dataset.maskBound = "1";
    input.addEventListener("input", () => applyMinutesMask(input));
  });
}

function formatDuration(totalMinutes, useDays = false) {
  const roundedMinutes = Math.max(0, Math.round(totalMinutes));

  if (useDays && roundedMinutes >= 1440) {
    const days = Math.floor(roundedMinutes / 1440);
    const remainingAfterDays = roundedMinutes % 1440;
    const hours = Math.floor(remainingAfterDays / 60);
    const minutes = remainingAfterDays % 60;

    const dayLabel = days === 1 ? "dia" : "dias";
    return `${days} ${dayLabel} ${hours}h ${String(minutes).padStart(2, "0")}min`;
  }

  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

function createPart(partNumber, values = {}) {
  const row = document.createElement("div");
  row.className = "print-part";

  const gramsValue = Number.isFinite(values.grams) ? values.grams : "";
  const hoursValue = Number.isFinite(values.hours) ? values.hours : "";
  const minutesValue = Number.isFinite(values.minutes) ? values.minutes : "";

  row.innerHTML = `
    <label class="part-field part-name-field">
      <span>Nome da parte</span>
      <input
        type="text"
        class="part-name"
        value="${escapeHtml(values.name || `Parte ${partNumber}`)}"
        autocomplete="off"
      />
    </label>

    <label class="part-field part-grams-field">
      <span>Filamento</span>
      <div class="input-suffix">
        <input
          type="text"
          class="part-grams integer-mask"
          inputmode="numeric"
          value="${gramsValue}"
          placeholder="0"
          autocomplete="off"
        />
        <span>g</span>
      </div>
    </label>

    <label class="part-field">
      <span>Horas</span>
      <div class="input-suffix">
        <input
          type="text"
          class="part-hours integer-mask"
          inputmode="numeric"
          value="${hoursValue}"
          placeholder="0"
          autocomplete="off"
        />
        <span>h</span>
      </div>
    </label>

    <label class="part-field">
      <span>Minutos</span>
      <div class="input-suffix">
        <input
          type="text"
          class="part-minutes minutes-mask"
          inputmode="numeric"
          value="${minutesValue}"
          placeholder="0"
          autocomplete="off"
        />
        <span>min</span>
      </div>
    </label>

    <button type="button" class="remove-part" title="Remover parte" aria-label="Remover parte">×</button>
  `;

  row.querySelector(".remove-part").addEventListener("click", () => {
    row.remove();
    updateRemoveButtons();
  });

  partsContainer.appendChild(row);
  bindInputMasks(row);
  updateRemoveButtons();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateRemoveButtons() {
  const parts = [...partsContainer.querySelectorAll(".print-part")];
  parts.forEach((part) => {
    part.querySelector(".remove-part").hidden = parts.length === 1;
  });
}

function getParts() {
  return [...partsContainer.querySelectorAll(".print-part")].map((part, index) => {
    const nameInput = part.querySelector(".part-name");
    const gramsInput = part.querySelector(".part-grams");
    const hoursInput = part.querySelector(".part-hours");
    const minutesInput = part.querySelector(".part-minutes");

    const defaultName = `Parte ${index + 1}`;
    const name = nameInput.value.trim() || defaultName;
    const grams = integerValue(gramsInput);
    const hours = integerValue(hoursInput);
    const minutes = Math.min(59, integerValue(minutesInput));
    const totalMinutes = (hours * 60) + minutes;

    return {
      name,
      grams,
      hours,
      minutes,
      totalMinutes
    };
  });
}

function renderPartsSummary(parts, totalMinutes) {
  partsSummaryList.innerHTML = "";

  parts.forEach((part) => {
    const item = document.createElement("div");
    const name = document.createElement("dt");
    const details = document.createElement("dd");

    name.textContent = part.name;
    details.textContent = `${part.grams.toLocaleString("pt-BR")} g • ${formatDuration(part.totalMinutes)}`;

    item.appendChild(name);
    item.appendChild(details);
    partsSummaryList.appendChild(item);
  });

  setText("rPartsTotal", formatDuration(totalMinutes, true));
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
  result.hidden = true;
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetParts() {
  partsContainer.innerHTML = "";
  createPart(1);
}

addPartButton.addEventListener("click", () => {
  const nextNumber = partsContainer.querySelectorAll(".print-part").length + 1;
  createPart(nextNumber);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.hidden = true;

  const filamentKgPrice = maskedValueOf("filamentKgPrice");

  const parts = getParts();
  const filamentGrams = parts.reduce((sum, part) => sum + part.grams, 0);
  const totalMinutes = parts.reduce((sum, part) => sum + part.totalMinutes, 0);
  const totalHours = totalMinutes / 60;

  const maintenancePerHour = maskedValueOf("maintenancePerHour");
  const depreciationPerHour = maskedValueOf("depreciationPerHour");
  const energyPerKwh = maskedValueOf("energyPerKwh");

  const packaging = maskedValueOf("packaging");
  const shipping = maskedValueOf("shipping");
  const unexpectedCost = maskedValueOf("unexpectedCost");
  const profitPercent = maskedValueOf("profitPercent");
  const salesFeePercent = maskedValueOf("salesFeePercent");
  const taxPercent = maskedValueOf("taxPercent");

  const totalDeductionsPercent = salesFeePercent + taxPercent;

  if (filamentKgPrice < 0 || filamentGrams < 0 || totalHours < 0) {
    showError("Preencha os campos com valores válidos.");
    return;
  }

  if (totalMinutes <= 0) {
    showError("Informe um tempo de impressão maior que zero em pelo menos uma parte.");
    return;
  }

  if (filamentGrams <= 0) {
    showError("Informe a quantidade de filamento usada em pelo menos uma parte.");
    return;
  }

  if (totalDeductionsPercent >= 100) {
    showError("A soma das taxas de venda e impostos precisa ser menor que 100%.");
    return;
  }

  const filamentCost = (filamentKgPrice / 1000) * filamentGrams;
  const maintenanceCost = maintenancePerHour * totalHours;
  const depreciationCost = depreciationPerHour * totalHours;

  const energyKwh = (PRINTER_WATTS / 1000) * totalHours;
  const energyCost = energyKwh * energyPerKwh;

  const totalCost =
    filamentCost +
    maintenanceCost +
    depreciationCost +
    energyCost +
    packaging +
    shipping +
    unexpectedCost;

  const desiredProfit = totalCost * (profitPercent / 100);
  const desiredNetRevenue = totalCost + desiredProfit;

  const deductionsRate = totalDeductionsPercent / 100;
  const suggestedPrice = desiredNetRevenue / (1 - deductionsRate);

  const feesValue = suggestedPrice * (salesFeePercent / 100);
  const taxesValue = suggestedPrice * (taxPercent / 100);
  const netRevenue = suggestedPrice - feesValue - taxesValue;
  const netProfit = netRevenue - totalCost;

  const machineHourCost =
    maintenancePerHour +
    depreciationPerHour +
    ((PRINTER_WATTS / 1000) * energyPerKwh);

  renderPartsSummary(parts, totalMinutes);

  setText("rFilament", money(filamentCost));
  setText("rMaintenance", money(maintenanceCost));
  setText("rDepreciation", money(depreciationCost));
  setText("rEnergy", money(energyCost));
  setText("rPackaging", money(packaging));
  setText("rShipping", money(shipping));
  setText("rUnexpected", money(unexpectedCost));
  setText("rTotalCost", money(totalCost));

  setText("rProfit", `${money(desiredProfit)} (${profitPercent.toLocaleString("pt-BR")}% do custo)`);
  setText("rFees", `${money(feesValue)} (${salesFeePercent.toLocaleString("pt-BR")}%)`);
  setText("rTaxes", `${money(taxesValue)} (${taxPercent.toLocaleString("pt-BR")}%)`);
  setText("rNet", money(netRevenue));
  setText("rNetProfit", money(netProfit));

  setText("suggestedPrice", money(suggestedPrice));
  setText("rTime", formatDuration(totalMinutes, true));
  setText("rGrams", `${filamentGrams.toLocaleString("pt-BR")} g`);
  setText("rKwh", `${numberBR.format(energyKwh)} kWh`);
  setText("rMachineHour", money(machineHourCost));

  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    resetParts();
    result.hidden = true;
    formError.hidden = true;
  }, 0);
});

bindInputMasks();
resetParts();
