document.addEventListener("DOMContentLoaded", function () {
  let page = 2;
  let isLoading = false;
  let allProductsLoaded = false;
  let lastScrollTop = 0;

  const loader = document.getElementById("loader");
  const mainBody = document.getElementById("home_page_product");

  async function loadMoreProducts() {
    if (isLoading || allProductsLoaded) return;

    isLoading = true;
    loader.style.display = "block";

    try {
      const response = await fetch(
        `${MAIN_URL}mango.php?action=product&page=${page}`,
        {
          method: "GET",
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }
      );

      if (!response.ok) throw new Error("Network error");

      const html = await response.text();

      if (html.trim() !== "") {
        const temp = document.createElement("tbody");
        temp.innerHTML = html.trim();

        const newCells = temp.querySelectorAll("td.products");

        for (let i = 0; i < newCells.length; i += 2) {
          const tr = document.createElement("tr");
          tr.appendChild(newCells[i]);
          if (newCells[i + 1]) tr.appendChild(newCells[i + 1]);
          mainBody.appendChild(tr);
        }

        page++;
      } else {
        allProductsLoaded = true;
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      loader.style.display = "none";
      isLoading = false;
    }
  }

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollPosition = window.innerHeight + scrollTop;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollTop > lastScrollTop && scrollPosition >= pageHeight - 120) {
      loadMoreProducts();
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
});

var start = 10;
var seconds = 59;

setInterval(function () {
  seconds--;
  if (seconds == 0) {
    start--;
    seconds = 59;
  }
  if (start == 0) {
    start = 10;
    seconds = 59;
  }
  $("#timer").text(
    start.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0")
  );
}, 1000);

const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

let timeInSeconds = 15 * 60;

function updateTimer() {
  const hours = Math.floor(timeInSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeInSeconds % 60).toString().padStart(2, "0");

  if (hoursElement) hoursElement.textContent = hours;
  if (minutesElement) minutesElement.textContent = minutes;
  if (secondsElement) secondsElement.textContent = seconds;

  if (timeInSeconds <= 0) {
    clearInterval(timerInterval);
    return;
  }

  timeInSeconds--;
}

const timerInterval = setInterval(updateTimer, 1000);
updateTimer();
