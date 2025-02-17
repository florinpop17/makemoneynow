// Configuration
const CONFIG = {
    startDate: new Date("2025-02-17T11:23:00.000+00:00"),
    daysToSell: 100,
    priceDecreasePerSecond: 0.01,
};

// Derived constants
const SECONDS_TO_SELL = CONFIG.daysToSell * 24 * 60 * 60;
const END_DATE = new Date(CONFIG.startDate.getTime() + SECONDS_TO_SELL * 1000);
const START_PRICE = SECONDS_TO_SELL / 100;

// Price display state
let lastDisplayedPrice = "";

// Formatting functions
const formatters = {
    price: new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }),

    startingPrice: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }),

    timeLeft: (timeDiff) => {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    },
};

// UI Components
const digitClasses = {
    normal: {
        container:
            "w-[40px] md:w-[80px] h-20 md:h-36 bg-black/50 border border-white/10 rounded-lg flex items-center justify-center",
        content: "text-white text-4xl md:text-7xl font-bold",
    },
    cents: {
        container:
            "w-[28px] md:w-[50px] h-16 md:h-28 bg-black/50 border border-white/10 rounded-lg flex items-center justify-center",
        content: "text-white text-2xl md:text-5xl font-bold",
    },
    symbol: {
        container: "w-6 md:w-12 h-20 md:h-36 flex items-center justify-center",
        content: "text-white text-4xl md:text-7xl",
    },
    separator: {
        container: "w-3 md:w-6 h-20 md:h-36 flex items-center justify-center",
        content: "text-white text-4xl md:text-7xl",
    },
};

function createDigit(digit, type = "normal") {
    const div = document.createElement("div");
    const content = document.createElement("div");

    div.className = digitClasses[type].container;
    content.className = digitClasses[type].content;
    content.textContent = digit;

    div.appendChild(content);
    return div;
}

function updateEmailLink(price) {
    const emailLink = document.querySelector('a[href^="mailto"]');
    if (emailLink) {
        const subject = encodeURIComponent(`Lock MakeMoney.now at ${price}`);
        const body = encodeURIComponent(
            `Hi Florin,\n\nI'd like to lock in MakeMoney.now at the current price of $${price}.\n\nLooking forward to hearing from you!`
        );
        emailLink.href = `mailto:florin@florin-pop.com?subject=${subject}&body=${body}`;
    }
}

function updatePriceDisplay(price) {
    if (price === lastDisplayedPrice) return;

    const display = document.getElementById("priceDisplay");
    display.innerHTML = "";

    const [dollars, cents] = price.split(".");
    const digits = [
        { value: "$", type: "symbol" },
        ...dollars.split("").map((d) => ({
            value: d,
            type: d === "," ? "separator" : "normal",
        })),
        { value: ".", type: "separator" },
        ...cents.split("").map((d) => ({ value: d, type: "cents" })),
    ];

    digits.forEach(({ value, type }) => {
        display.appendChild(createDigit(value, type));
    });

    updateEmailLink(price);
    lastDisplayedPrice = price;
}

function updateTimer() {
    const now = new Date();
    const timeDiff = END_DATE - now;

    if (timeDiff <= 0) {
        document.getElementById("timeLeft").textContent = "Auction ended";
        document.getElementById("timeLeftPrice").textContent = "Auction ended";
        return;
    }

    // Calculate elapsed time in seconds (rounded to 1 decimal place)
    const secondsElapsed = Math.floor((now - CONFIG.startDate) / 100) / 10;

    // Calculate remaining time based on the same elapsed seconds
    const remainingSeconds = SECONDS_TO_SELL - secondsElapsed;
    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    const timeLeftFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Update both time displays
    document.getElementById("timeLeft").textContent = timeLeftFormatted;
    document.getElementById("timeLeftPrice").textContent = timeLeftFormatted;

    // Calculate price using the same elapsed seconds
    const currentPrice = Math.max(
        0,
        START_PRICE - secondsElapsed * CONFIG.priceDecreasePerSecond
    );
    updatePriceDisplay(formatters.price.format(currentPrice));
}

// Initialization
function init() {
    // Set up single timer using requestAnimationFrame
    function animate() {
        updateTimer();
        requestAnimationFrame(animate);
    }

    // Initial update
    updateTimer();

    // Start animation loop
    requestAnimationFrame(animate);

    // Set start date display
    document.getElementById("startDate").textContent =
        CONFIG.startDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }) + " (UTC+0)";

    // Set starting price elements
    document.querySelectorAll("[data-starting-price]").forEach((element) => {
        element.textContent = formatters.startingPrice.format(START_PRICE);
    });
}

// Start the app
document.addEventListener("DOMContentLoaded", init);
