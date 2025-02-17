// Configuration
const CONFIG = {
    startDate: new Date("2025-02-18T00:00:00.000+00:00"),
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
const createDigit = (digit, type = "normal") => {
    const div = document.createElement("div");

    // Base classes for different types
    const classes = {
        normal: {
            container:
                "w-[50px] md:w-[80px] h-24 md:h-36 bg-black/50 border border-white/10 rounded-lg flex items-center justify-center",
            content: "text-white text-5xl md:text-7xl font-bold",
        },
        cents: {
            container:
                "w-[35px] md:w-[50px] h-20 md:h-28 bg-black/50 border border-white/10 rounded-lg flex items-center justify-center",
            content: "text-white text-3xl md:text-5xl font-bold",
        },
        symbol: {
            container:
                "w-8 md:w-12 h-24 md:h-36 flex items-center justify-center",
            content: "text-white text-5xl md:text-7xl",
        },
        separator: {
            container:
                "w-4 md:w-6 h-24 md:h-36 flex items-center justify-center",
            content: "text-white text-5xl md:text-7xl",
        },
    };

    div.className = classes[type].container;

    const content = document.createElement("div");
    content.className = classes[type].content;
    content.textContent = digit;

    div.appendChild(content);
    return div;
};

// Update functions
function updatePriceDisplay(price) {
    if (price === lastDisplayedPrice) return;

    const display = document.getElementById("priceDisplay");
    display.innerHTML = "";

    // Add dollar symbol
    display.appendChild(createDigit("$", "symbol"));

    // Split price into dollars and cents
    const [dollars, cents] = price.split(".");

    // Add dollar digits with commas
    dollars.split("").forEach((digit) => {
        if (digit === ",") {
            display.appendChild(createDigit(",", "separator"));
        } else {
            display.appendChild(createDigit(digit, "normal"));
        }
    });

    // Add cents
    display.appendChild(createDigit(".", "separator"));
    cents.split("").forEach((digit) => {
        display.appendChild(createDigit(digit, "cents"));
    });

    // Update email link with current price
    const emailLink = document.querySelector('a[href^="mailto"]');
    if (emailLink) {
        const subject = encodeURIComponent(`Lock MakeMoney.now at ${price}`);
        const body = encodeURIComponent(
            `Hi Florin,\n\nI'd like to lock in MakeMoney.now at the current price of $${price}.\n\nLooking forward to hearing from you!`
        );
        emailLink.href = `mailto:florin@florin-pop.com?subject=${subject}&body=${body}`;
    }

    lastDisplayedPrice = price;
}

function updateTimer() {
    const now = new Date();
    const timeDiff = END_DATE - now;

    if (timeDiff <= 0) {
        document.getElementById("timeLeft").textContent = "Auction ended";
        return;
    }

    // Update time remaining
    document.getElementById("timeLeft").textContent =
        formatters.timeLeft(timeDiff);

    // Update price
    const secondsElapsed = (now - CONFIG.startDate) / 1000;
    const currentPrice = Math.max(
        0,
        START_PRICE - secondsElapsed * CONFIG.priceDecreasePerSecond
    );
    updatePriceDisplay(formatters.price.format(currentPrice));
}

// Initialization
function init() {
    // Set up timer
    setInterval(updateTimer, 100);
    updateTimer();

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
