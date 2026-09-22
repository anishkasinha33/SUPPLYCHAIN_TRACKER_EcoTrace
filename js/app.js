// Builds a 20-item true/false checklist array - the first trueCount items are ticked
function makeChecklist(trueCount) {
    const arr = [];
    for (let i = 0; i < 20; i++) {
        arr.push(i < trueCount);
    }
    return arr;
}

const DEFAULT_SUPPLIERS = [
    {
        id: "SUP-1",
        name: "GreenTex Mills",
        country: "Tamil Nadu, India",
        material: "Organic Cotton & Recycled Yarn",
        score: 90,
        checklist: makeChecklist(18),
        audit: "Fair Trade Certified",
        contact: "Aarav Sharma",
        email: "aarav@greentexmills.in",
        certId: "FT-IND-8840",
        energy: "85% Solar Powered",
        specialty: "Certified organic cotton spinning & recycled yarn"
    },
    {
        id: "SUP-2",
        name: "Apex Assembly Hub",
        country: "Maharashtra, India",
        material: "Metal Hardware & Fittings",
        score: 90,
        checklist: makeChecklist(18),
        audit: "ISO 14001 Audited",
        contact: "Rohan Deshmukh",
        email: "rohan.d@apexassembly.in",
        certId: "ISO-14001-IN912",
        energy: "100% Renewable Hydroelectric",
        specialty: "Low-impact automated sewing & CNC assembly"
    },
    {
        id: "SUP-3",
        name: "SafeWorks India Audit",
        country: "Karnataka, India",
        material: "Audit & Safety Compliance Services",
        score: 95,
        checklist: makeChecklist(19),
        audit: "Fair Trade Certified",
        contact: "Ananya Iyer",
        email: "ananya@safeworksindia.in",
        certId: "SA8000-IN-4401",
        energy: "100% Wind Power",
        specialty: "UN SDG 8 fair labor auditing & material safety testing"
    },
    {
        id: "SUP-4",
        name: "BioPack Boxes",
        country: "Gujarat, India",
        material: "Recycled Cardboard Packaging",
        score: 85,
        checklist: makeChecklist(17),
        audit: "Fair Trade Certified",
        contact: "Vikram Mehta",
        email: "vikram.m@biopack-packaging.in",
        certId: "FSC-IN-2099",
        energy: "70% Biomass & Solar",
        specialty: "FSC-certified 100% post-consumer corrugated cardboard"
    },
    {
        id: "SUP-5",
        name: "Bamboo Craft Collective",
        country: "Assam, India",
        material: "Raw Bamboo Cane",
        score: 90,
        checklist: makeChecklist(18),
        audit: "Fair Trade Certified",
        contact: "Priyanka Baruah",
        email: "priyanka.baruah@bamboocraft.in",
        certId: "FT-IN-1192",
        energy: "Manual & Solar Thermal",
        specialty: "Regenerative bamboo harvesting & natural beeswax seal"
    }
];

// Sustainability scoring checklist - each ticked item is worth 5 points (max 100)
const SCORE_CHECKLIST = [
    {
        section: "Section 1: Fair Work & Factory Safety (SDG 8)",
        items: [
            "Pays workers a fair living wage, not just the legal minimum.",
            "Strictly bans all child labor and forced labor.",
            "Does not force workers to do unpaid overtime.",
            "Gives workers paid sick leave and health support.",
            "Allows workers to speak up or form groups to protect their rights.",
            "Passes annual safety checks (has clear fire exits and safe machines).",
            "Provides clean drinking water and safe restrooms for all staff.",
            "Gives safety gear (like gloves or goggles) for free."
        ]
    },
    {
        section: "Section 2: Clean Production & Materials (SDG 12)",
        items: [
            "Makes products using at least 50% recycled materials.",
            "Cleans all dirty factory water before letting it into rivers.",
            "Runs the factory using solar panels or wind energy.",
            "Refuses to use toxic chemicals or poisonous dyes.",
            "Reuses factory scraps so nothing goes to the garbage dump (Zero Waste).",
            "Uses packaging made only from paper or mushrooms, not plastic."
        ]
    },
    {
        section: "Section 3: Green Transport & Logistics (SDG 12)",
        items: [
            "Delivers boxes using electric vans (EVs) instead of diesel trucks.",
            "Buys ingredients locally (under 100 miles) to save fuel.",
            "Ships items using trains or boats instead of highly polluting airplanes.",
            "Packs trucks completely full so no one drives a half-empty truck.",
            "Uses heavy-duty reusable plastic crates for shipping instead of throwing away cardboard every time.",
            "Measures and reports exactly how much pollution their delivery trucks make."
        ]
    }
];

const SEED_PRODUCTS = [
    {
        id: "PROD-101",
        name: "Organic Canvas Backpack",
        batch: "BATCH-4021",
        currentStageIndex: 1, // 0 to 3
        stages: [
            {
                name: "1. Raw Materials Sourcing",
                desc: "Harvesting certified organic cotton and recycled zippers",
                supplierId: "SUP-1",
                completedDate: "Sep 12, 2026",
                notes: "Zero pesticide organic cotton verified by third party.",
                transitToNext: { mode: "Electric Cargo Train", carrier: "RailGreen India", emissions: "Low" }
            },
            {
                name: "2. Assembly & Stitching",
                desc: "Precision sewing in a 100% solar-powered workshop",
                supplierId: "SUP-2",
                completedDate: null,
                notes: "Target living wages distributed to all line workers.",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CityZero Dispatch", emissions: "Zero" }
            },
            {
                name: "3. Quality & Ethical Inspection",
                desc: "Verifying fair living wages, seam strength, and safety checks",
                supplierId: "SUP-3",
                completedDate: null,
                notes: "Annual safety audit conducted under SDG 8.8 standards.",
                transitToNext: { mode: "Bio-Fuel Maritime Ship", carrier: "EcoLine Sea", emissions: "Moderate" }
            },
            {
                name: "4. Packaging & Delivered",
                desc: "100% compostable cardboard packaging delivered to customer",
                supplierId: "SUP-4",
                completedDate: null,
                notes: "Shipped with zero single-use plastic wrap.",
                transitToNext: null
            }
        ]
    },
    {
        id: "PROD-102",
        name: "Bamboo Desk Organizer",
        batch: "BATCH-8090",
        currentStageIndex: 2,
        stages: [
            {
                name: "1. Raw Materials Sourcing",
                desc: "Harvesting sustainable regrowth bamboo canes",
                supplierId: "SUP-5",
                completedDate: "Sep 08, 2026",
                notes: "Certified non-deforestation farm harvest.",
                transitToNext: { mode: "Electric Cargo Train", carrier: "Konkan Rail Express", emissions: "Low" }
            },
            {
                name: "2. Assembly & Carving",
                desc: "CNC precision carving with non-toxic natural oil finish",
                supplierId: "SUP-2",
                completedDate: "Sep 15, 2026",
                notes: "Zero VOC emissions in finish application.",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CleanHaul Logistics", emissions: "Zero" }
            },
            {
                name: "3. Quality & Ethical Inspection",
                desc: "Audit for Target 8.8 safety checks and packaging prep",
                supplierId: "SUP-3",
                completedDate: null,
                notes: "Structural rigidity passed international standards.",
                transitToNext: { mode: "Electric Delivery Van", carrier: "Local Clean Fleet", emissions: "Zero" }
            },
            {
                name: "4. Packaging & Delivered",
                desc: "Arrived at eco-friendly retail distribution center",
                supplierId: "SUP-4",
                completedDate: null,
                notes: "Ready for direct eco-commerce dispatch.",
                transitToNext: null
            }
        ]
    },
    {
        id: "PROD-103",
        name: "Recycled Denim Tote Bag",
        batch: "BATCH-3157",
        currentStageIndex: 0,
        stages: [
            {
                name: "1. Raw Materials Sourcing",
                desc: "Collecting post-consumer denim scraps for shredding and re-spinning",
                supplierId: "SUP-1",
                completedDate: null,
                notes: "Awaiting first batch of reclaimed denim.",
                transitToNext: { mode: "Electric Cargo Train", carrier: "RailGreen India", emissions: "Low" }
            },
            {
                name: "2. Assembly & Stitching",
                desc: "Reinforced stitching using solar-powered machines",
                supplierId: "SUP-2",
                completedDate: null,
                notes: "",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CityZero Dispatch", emissions: "Zero" }
            },
            {
                name: "3. Quality & Ethical Inspection",
                desc: "Durability testing and fair labor audit",
                supplierId: "SUP-3",
                completedDate: null,
                notes: "",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CityZero Dispatch", emissions: "Zero" }
            },
            {
                name: "4. Packaging & Delivered",
                desc: "Compostable wrap, ready for dispatch",
                supplierId: "SUP-4",
                completedDate: null,
                notes: "",
                transitToNext: null
            }
        ]
    },
    {
        id: "PROD-104",
        name: "Steel Water Bottle",
        batch: "BATCH-6622",
        currentStageIndex: 3,
        stages: [
            {
                name: "1. Raw Materials Sourcing",
                desc: "Sourcing food-grade recycled stainless steel sheets",
                supplierId: "SUP-2",
                completedDate: "Sep 01, 2026",
                notes: "100% recycled steel stock confirmed.",
                transitToNext: { mode: "Electric Cargo Train", carrier: "RailGreen India", emissions: "Low" }
            },
            {
                name: "2. Precision Manufacturing",
                desc: "CNC forming, welding and polishing",
                supplierId: "SUP-2",
                completedDate: "Sep 05, 2026",
                notes: "Zero-leak seam welding verified.",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CityZero Dispatch", emissions: "Zero" }
            },
            {
                name: "3. Quality & Ethical Inspection",
                desc: "Leak testing and factory safety audit",
                supplierId: "SUP-3",
                completedDate: "Sep 09, 2026",
                notes: "Passed SDG 8.8 safety and hygiene checks.",
                transitToNext: { mode: "Electric Delivery Van", carrier: "Local Clean Fleet", emissions: "Zero" }
            },
            {
                name: "4. Packaging & Delivered",
                desc: "Recycled cardboard sleeve packaging shipped to customer",
                supplierId: "SUP-4",
                completedDate: "Sep 12, 2026",
                notes: "Delivered with zero single-use plastic wrap.",
                transitToNext: null
            }
        ]
    },
    {
        id: "PROD-105",
        name: "Bamboo Cutlery Set",
        batch: "BATCH-9043",
        currentStageIndex: 1,
        stages: [
            {
                name: "1. Raw Materials Sourcing",
                desc: "Harvesting mature bamboo culms from Assam plantations",
                supplierId: "SUP-5",
                completedDate: "Sep 10, 2026",
                notes: "Certified non-deforestation farm harvest.",
                transitToNext: { mode: "Electric Cargo Train", carrier: "Konkan Rail Express", emissions: "Low" }
            },
            {
                name: "2. Cutting & Shaping",
                desc: "CNC shaping into fork, spoon and knife sets",
                supplierId: "SUP-2",
                completedDate: null,
                notes: "",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CleanHaul Logistics", emissions: "Zero" }
            },
            {
                name: "3. Natural Finishing",
                desc: "Beeswax sealing for water resistance",
                supplierId: "SUP-5",
                completedDate: null,
                notes: "",
                transitToNext: { mode: "Electric Delivery Van", carrier: "Local Clean Fleet", emissions: "Zero" }
            },
            {
                name: "4. Quality & Ethical Inspection",
                desc: "Splinter-safety and hygiene audit",
                supplierId: "SUP-3",
                completedDate: null,
                notes: "",
                transitToNext: { mode: "Bio-Fuel Maritime Ship", carrier: "EcoLine Sea", emissions: "Moderate" }
            },
            {
                name: "5. Packaging & Delivered",
                desc: "Plastic-free pouch packaging shipped to retailers",
                supplierId: "SUP-4",
                completedDate: null,
                notes: "",
                transitToNext: null
            }
        ]
    },
    {
        id: "PROD-106",
        name: "Organic Cotton T-Shirt",
        batch: "BATCH-2285",
        currentStageIndex: 2,
        stages: [
            {
                name: "1. Raw Materials Sourcing",
                desc: "GOTS-certified organic cotton procurement",
                supplierId: "SUP-1",
                completedDate: "Sep 05, 2026",
                notes: "Zero pesticide organic cotton verified by third party.",
                transitToNext: { mode: "Electric Cargo Train", carrier: "RailGreen India", emissions: "Low" }
            },
            {
                name: "2. Assembly & Stitching",
                desc: "Low-impact dyeing and stitching",
                supplierId: "SUP-2",
                completedDate: "Sep 11, 2026",
                notes: "Azo-free dyes used throughout.",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CityZero Dispatch", emissions: "Zero" }
            },
            {
                name: "3. Quality & Ethical Inspection",
                desc: "Fabric strength and living wage audit",
                supplierId: "SUP-3",
                completedDate: null,
                notes: "",
                transitToNext: { mode: "Electric Delivery Van", carrier: "CityZero Dispatch", emissions: "Zero" }
            },
            {
                name: "4. Packaging & Delivered",
                desc: "Recycled paper packaging dispatched to warehouse",
                supplierId: "SUP-4",
                completedDate: null,
                notes: "",
                transitToNext: null
            }
        ]
    }
];

let appState = {
    suppliers: [],
    products: [],
    selectedProductId: null,
    activePage: "home"
};

let modalAssignSupplier = null;
let modalCreateSupplier = null;
let modalChangeTransit = null;
let modalCreateProduct = null;
let modalSupplierProfile = null;
let modalUpdateStageStatus = null;
let activeTargetStageIndex = null;
let currentProfileSupplierId = null;
let pendingEditRedirect = false;
let newProductStages = [];

function loadAppData() {
    const saved = localStorage.getItem("ecoTrackPortalData_v2");
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch(e) {
            appState = { suppliers: DEFAULT_SUPPLIERS, products: SEED_PRODUCTS, selectedProductId: SEED_PRODUCTS[0].id, activePage: "home" };
        }
    } else {
        appState = { suppliers: DEFAULT_SUPPLIERS, products: SEED_PRODUCTS, selectedProductId: SEED_PRODUCTS[0].id, activePage: "home" };
        saveAppData();
    }

    if (!appState.selectedProductId && appState.products.length > 0) {
        appState.selectedProductId = appState.products[0].id;
    }

    navigateToPage(appState.activePage || "home");
}

function saveAppData() {
    localStorage.setItem("ecoTrackPortalData_v2", JSON.stringify(appState));
}

function navigateToPage(pageName) {
    appState.activePage = pageName;
    saveAppData();

    // Hide all pages
    document.getElementById("pageHome").classList.add("d-none");
    document.getElementById("pageProducts").classList.add("d-none");
    document.getElementById("pageSuppliers").classList.add("d-none");
    document.getElementById("pageSdg").classList.add("d-none");

    // Update navbar buttons
    document.getElementById("tabBtnHome").classList.remove("active");
    document.getElementById("tabBtnProducts").classList.remove("active");
    document.getElementById("tabBtnSuppliers").classList.remove("active");
    document.getElementById("tabBtnSdg").classList.remove("active");

    if (pageName === "home") {
        document.getElementById("pageHome").classList.remove("d-none");
        document.getElementById("tabBtnHome").classList.add("active");
        renderHomePage();
    } else if (pageName === "products") {
        document.getElementById("pageProducts").classList.remove("d-none");
        document.getElementById("tabBtnProducts").classList.add("active");
        renderProductsPage();
    } else if (pageName === "suppliers") {
        document.getElementById("pageSuppliers").classList.remove("d-none");
        document.getElementById("tabBtnSuppliers").classList.add("active");
        renderSuppliersPage();
    } else if (pageName === "sdg") {
        document.getElementById("pageSdg").classList.remove("d-none");
        document.getElementById("tabBtnSdg").classList.add("active");
        renderSdgPage();
    }
}

// Lists every checklist item on the About & SDG Scoring page, grouped by section
function renderSdgPage() {
    const container = document.getElementById("sdgScoringChecklistView");
    let html = "";

    for (let s = 0; s < SCORE_CHECKLIST.length; s++) {
        const section = SCORE_CHECKLIST[s];
        html += `<h6 class="small fw-bold text-muted mt-3 mb-2">${section.section}</h6>`;
        html += `<ul class="small mb-0 ps-3">`;
        for (let i = 0; i < section.items.length; i++) {
            html += `<li>${section.items[i]} <span class="text-success fw-bold">(5 pts)</span></li>`;
        }
        html += `</ul>`;
    }

    container.innerHTML = html;
}

function renderHomePage() {
    document.getElementById("homeKpiProducts").textContent = appState.products.length;
    document.getElementById("homeKpiSuppliers").textContent = appState.suppliers.length;

    let totalScores = 0;
    let totalStages = 0;
    let deliveredCount = 0;

    appState.products.forEach(p => {
        if (p.currentStageIndex >= p.stages.length - 1) deliveredCount++;
        p.stages.forEach(stg => {
            const sup = appState.suppliers.find(s => s.id === stg.supplierId);
            totalScores += sup ? sup.score : 75;
            totalStages++;
        });
    });

    const avgScore = totalStages > 0 ? Math.round(totalScores / totalStages) : 85;
    document.getElementById("homeKpiScore").textContent = `${avgScore}/100`;
    document.getElementById("homeKpiDelivered").textContent = deliveredCount;

    const tbody = document.getElementById("homeProductsTableBody");
    tbody.innerHTML = "";

    appState.products.forEach(p => {
        const isDelivered = p.currentStageIndex >= p.stages.length - 1;
        const currentStageName = p.stages[p.currentStageIndex]?.name || "Completed";

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${p.name}</td>
                <td><code>${p.batch}</code></td>
                <td>${currentStageName}</td>
                <td><span class="badge ${isDelivered ? 'bg-success' : 'bg-primary'}">${isDelivered ? 'Delivered' : 'In Progress'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-dark py-0" onclick="viewProductLifecycle('${p.id}')">View Journey</button>
                </td>
            </tr>
        `;
    });
}

function renderProductsPage() {
    // Check if we are viewing detail or list
    const listView = document.getElementById("productsListView");
    const detailView = document.getElementById("productDetailView");

    if (appState.selectedProductId && detailView.dataset.open === "true") {
        listView.classList.add("d-none");
        detailView.classList.remove("d-none");
        renderDetailedLifecycle();
    } else {
        listView.classList.remove("d-none");
        detailView.classList.add("d-none");
        renderProductsGrid();
    }
}

function renderProductsGrid() {
    const grid = document.getElementById("productsCardsGrid");
    grid.innerHTML = "";

    appState.products.forEach(p => {
        const isDelivered = p.currentStageIndex >= p.stages.length - 1;
        const currentStage = p.stages[p.currentStageIndex]?.name || "Delivered";

        let totalScore = 0;
        p.stages.forEach(stg => {
            const sup = appState.suppliers.find(s => s.id === stg.supplierId);
            totalScore += sup ? sup.score : 70;
        });
        const avgScore = Math.round(totalScore / p.stages.length);

        const cardCol = document.createElement("div");
        cardCol.className = "col-md-6 col-lg-4";
        cardCol.innerHTML = `
            <div class="product-card-item portal-card p-3 h-100 d-flex flex-column justify-content-between" onclick="viewProductLifecycle('${p.id}')">
                <div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">${p.batch}</span>
                        <span class="badge ${isDelivered ? 'bg-success' : 'bg-primary'}">${isDelivered ? 'Delivered' : 'Stage ' + (p.currentStageIndex + 1) + '/' + p.stages.length}</span>
                    </div>
                    <h5 class="fw-bold mb-1">${p.name}</h5>
                    <p class="text-muted small mb-2">Current: <strong>${currentStage}</strong></p>
                </div>
                <div class="pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="small text-muted">Eco Rating: <strong class="text-success">${avgScore}/100</strong></span>
                    <button class="btn btn-sm btn-dark py-1 px-3">Inspect Lifecycle &rarr;</button>
                </div>
            </div>
        `;
        grid.appendChild(cardCol);
    });
}

function viewProductLifecycle(productId) {
    appState.selectedProductId = productId;
    const detailView = document.getElementById("productDetailView");
    detailView.dataset.open = "true";
    navigateToPage("products");
}

function returnToProductsList() {
    const detailView = document.getElementById("productDetailView");
    detailView.dataset.open = "false";
    renderProductsPage();
}

function renderDetailedLifecycle() {
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod) return;

    document.getElementById("detailProdName").textContent = prod.name;
    document.getElementById("detailProdBatch").textContent = prod.batch;

    let totalScore = 0;
    prod.stages.forEach(stg => {
        const sup = appState.suppliers.find(s => s.id === stg.supplierId);
        totalScore += sup ? sup.score : 70;
    });
    const avgScore = Math.round(totalScore / prod.stages.length);
    document.getElementById("detailProdEcoScore").textContent = `Eco Score: ${avgScore}/100`;

    const isCompleted = prod.currentStageIndex >= prod.stages.length - 1;
    const btnAdvance = document.getElementById("btnAdvanceMilestone");
    btnAdvance.disabled = isCompleted;
    btnAdvance.textContent = isCompleted ? "Lifecycle Fully Delivered ✓" : "Advance Next Milestone →";

    const container = document.getElementById("detailMilestonesContainer");
    container.innerHTML = "";

    prod.stages.forEach((stage, idx) => {
        const isDone = idx < prod.currentStageIndex;
        const isCurrent = idx === prod.currentStageIndex;
        const isPending = idx > prod.currentStageIndex;
        const supplier = appState.suppliers.find(s => s.id === stage.supplierId);

        // Build Status Bar Near Milestone
        let statusBarHTML = "";
        if (isDone) {
            const dateText = stage.completedDate ? ` on ${stage.completedDate}` : "";
            statusBarHTML = `<span class="milestone-status-bar status-done">✓ Completed${dateText}</span>`;
        } else if (isCurrent) {
            statusBarHTML = `<span class="milestone-status-bar status-current">● Active In-Progress (Current)</span>`;
        } else {
            statusBarHTML = `<span class="milestone-status-bar status-pending">○ Pending Milestone</span>`;
        }

        // Stage Container Box with View Supplier & Update Status Actions
        const boxDiv = document.createElement("div");
        boxDiv.className = `milestone-box ${isDone ? 'done' : (isCurrent ? 'current' : 'pending')}`;
        boxDiv.innerHTML = `
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="fw-bold mb-0">${stage.name}</h5>
                    ${statusBarHTML}
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="openUpdateStageStatusModal(${idx})">
                        ✎ Update Status
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="openAssignSupplierModal(${idx})">
                        ${supplier ? 'Change Supplier' : '+ Assign Supplier'}
                    </button>
                </div>
            </div>

            <p class="text-muted mb-3">${stage.desc}</p>

            <!-- Supplier Details Card inside Stage with Well-Defined View Supplier Profile Button -->
            <div class="p-3 rounded border bg-light d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div class="d-flex flex-column">
                    <span class="text-muted small d-block">Stage Supplier:</span>
                    <span class="fs-6"><strong>${supplier ? supplier.name : 'None Assigned'}</strong> <span class="text-muted small">(${supplier ? supplier.country : '--'})</span></span>
                    ${stage.notes ? `<small class="text-secondary mt-1"><i class="text-muted">Note:</i> ${stage.notes}</small>` : ''}
                </div>
                <div>
                    <span class="text-muted small d-block">SDG 8 Labor Audit:</span>
                    <span class="badge ${supplier && supplier.audit.includes('Certified') ? 'bg-success' : 'bg-warning text-dark'}">
                        ${supplier ? supplier.audit : 'Unverified'}
                    </span>
                </div>
                <div>
                    <span class="text-muted small d-block">Sustainability Score:</span>
                    <span class="fw-bold ${supplier && supplier.score >= 85 ? 'text-success' : 'text-danger'}">
                        ${supplier ? supplier.score : 0} / 100
                    </span>
                </div>
                <div>
                    ${supplier ? `
                        <button class="btn btn-sm btn-dark px-3 shadow-sm" onclick="viewSupplierProfile('${supplier.id}', false)">
                            View Supplier Profile &rarr;
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-outline-secondary" onclick="openAssignSupplierModal(${idx})">
                            + Assign Supplier
                        </button>
                    `}
                </div>
            </div>
        `;
        container.appendChild(boxDiv);

        // Directional Arrow and Transportation between stages
        if (stage.transitToNext) {
            const transit = stage.transitToNext;
            const arrowDiv = document.createElement("div");
            arrowDiv.className = "stage-arrow-divider";
            arrowDiv.innerHTML = `
                <div class="arrow-line"></div>
                <div class="arrow-icon-badge" onclick="openChangeTransitModal(${idx})" title="Click to change transport provider">
                    <span>🚛 <strong>${transit.mode}</strong> &bull; Carrier: ${transit.carrier}</span>
                    <span class="badge ${transit.emissions === 'Zero' || transit.emissions === 'Low' ? 'bg-success' : 'bg-secondary'}">${transit.emissions} CO2</span>
                    <span class="text-primary small text-decoration-underline ms-1">Edit Transit</span>
                </div>
                <div class="arrow-line"></div>
                <div class="arrow-head"></div>
            `;
            container.appendChild(arrowDiv);
        }
    });
}

function viewSupplierProfile(supplierId, editable = true) {
    const sup = appState.suppliers.find(s => s.id === supplierId);
    if (!sup) {
        showToast("Supplier details could not be found.", "warning");
        return;
    }

    currentProfileSupplierId = supplierId;

    document.getElementById("profSupName").textContent = sup.name;
    document.getElementById("profSupId").textContent = sup.id;
    document.getElementById("profSupScore").textContent = sup.score;
    document.getElementById("profSupCountry").textContent = sup.country || "Global";
    document.getElementById("profSupMaterial").textContent = sup.material || "Not Specified";
    document.getElementById("profSupContact").textContent = sup.contact || "Compliance Director";
    document.getElementById("profSupEmail").textContent = sup.email || `contact@${sup.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    document.getElementById("profSupEnergy").textContent = sup.energy || "80% Renewable Clean Power";
    document.getElementById("profSupCertId").textContent = sup.certId ? `Cert #${sup.certId}` : "Cert #SDG-8801";
    document.getElementById("profSupAuditBadge").textContent = sup.audit || "Unverified";
    document.getElementById("profSupAuditBadge").className = `badge ${sup.audit && sup.audit.includes('Certified') ? 'bg-success' : 'bg-warning text-dark'}`;

    // Find which products and stages this supplier participates in
    const stagesSupplied = [];
    appState.products.forEach(p => {
        p.stages.forEach(stg => {
            if (stg.supplierId === sup.id) {
                stagesSupplied.push(`<li><strong>${p.name}</strong> (<code>${p.batch}</code>) &mdash; ${stg.name}</li>`);
            }
        });
    });

    document.getElementById("profSupSuppliedStages").innerHTML = stagesSupplied.length > 0
        ? `<ul class="mb-0 ps-3">${stagesSupplied.join("")}</ul>`
        : "<em>Currently not attached to any active product pipeline milestones.</em>";

    // Load this supplier's saved checklist ticks into the editable score section
    setChecklistArray("prof", sup.checklist || []);
    calculateChecklistScore("prof");

    // Supplier details can only be edited from the Suppliers tab, not Products
    const scoreEditSection = document.getElementById("profScoreEditSection");
    const saveScoreBtn = document.getElementById("profSaveScoreBtn");
    const cancelBtn = document.getElementById("profCancelBtn");
    const editRedirectBtn = document.getElementById("profEditRedirectBtn");

    if (editable) {
        scoreEditSection.classList.remove("d-none");
        saveScoreBtn.classList.remove("d-none");
        cancelBtn.classList.remove("d-none");
        editRedirectBtn.classList.add("d-none");
    } else {
        scoreEditSection.classList.add("d-none");
        saveScoreBtn.classList.add("d-none");
        cancelBtn.classList.add("d-none");
        editRedirectBtn.classList.remove("d-none");
    }

    modalSupplierProfile.show();
}

// Closes the read-only profile and reopens it in edit mode on the Suppliers tab
function editSupplierFromProductsTab() {
    pendingEditRedirect = true;
    modalSupplierProfile.hide();
}

function saveSupplierProfileScore() {
    const supplierId = document.getElementById("profSupId").textContent;
    const sup = appState.suppliers.find(s => s.id === supplierId);
    if (!sup) return;

    const checklist = getChecklistArray("prof");
    sup.checklist = checklist;
    sup.score = getScoreFromChecklist(checklist);

    document.getElementById("profSupScore").textContent = sup.score;

    saveAppData();
    renderSuppliersPage();
    if (appState.activePage === "products") renderProductsPage();
    if (appState.activePage === "home") renderHomePage();
    showToast(`Sustainability score updated for <strong>${sup.name}</strong>.`, "success");
}

function openUpdateStageStatusModal(stageIdx) {
    activeTargetStageIndex = stageIdx;
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod) return;

    const stage = prod.stages[stageIdx];
    document.getElementById("editStageIdx").value = stageIdx;
    document.getElementById("editStageName").value = stage.name;

    let currentState = "pending";
    if (stageIdx < prod.currentStageIndex) currentState = "done";
    else if (stageIdx === prod.currentStageIndex) currentState = "current";
    document.getElementById("editStageState").value = currentState;

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    document.getElementById("editStageDate").value = stage.completedDate || today;
    document.getElementById("editStageNotes").value = stage.notes || "";

    modalUpdateStageStatus.show();
}

function confirmStageStatusUpdate() {
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod || activeTargetStageIndex === null) return;

    const stateVal = document.getElementById("editStageState").value;
    const dateVal = document.getElementById("editStageDate").value.trim();
    const notesVal = document.getElementById("editStageNotes").value.trim();
    const stage = prod.stages[activeTargetStageIndex];

    stage.notes = notesVal;

    if (stateVal === "done") {
        stage.completedDate = dateVal || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        // If this is set to done, ensure currentStageIndex is at least next
        if (prod.currentStageIndex <= activeTargetStageIndex) {
            prod.currentStageIndex = Math.min(prod.stages.length - 1, activeTargetStageIndex + 1);
        }
    } else if (stateVal === "current") {
        prod.currentStageIndex = activeTargetStageIndex;
        stage.completedDate = null;
    } else if (stateVal === "pending") {
        if (prod.currentStageIndex >= activeTargetStageIndex) {
            prod.currentStageIndex = Math.max(0, activeTargetStageIndex - 1);
        }
        stage.completedDate = null;
    }

    saveAppData();
    modalUpdateStageStatus.hide();
    renderDetailedLifecycle();
    showToast(`Status updated for <strong>${stage.name}</strong>.`, "success");
}

function advanceActiveMilestone() {
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod || prod.currentStageIndex >= prod.stages.length - 1) return;

    const currentStage = prod.stages[prod.currentStageIndex];
    const supplier = appState.suppliers.find(s => s.id === currentStage.supplierId);

    // Gatekeeper check: Supplier audit
    if (supplier && supplier.audit === "Unverified / High Risk") {
        showToast(`Cannot advance: Supplier <strong>${supplier.name}</strong> failed ethical labor audit (SDG 8)! Please re-assign supplier.`, "danger");
        return;
    }

    // Stamp completion date on the stage just finished
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    currentStage.completedDate = dateStr;

    prod.currentStageIndex++;
    saveAppData();
    renderDetailedLifecycle();
    showToast(`Milestone <strong>${prod.stages[prod.currentStageIndex].name}</strong> is now Active!`, "success");
}

function renderSuppliersPage() {
    const container = document.getElementById("suppliersByProductContainer");
    container.innerHTML = "";

    appState.products.forEach(prod => {
        const section = document.createElement("div");
        section.className = "portal-card p-4";

        // Collect unique suppliers for this product
        const stageSuppliersList = [];
        prod.stages.forEach((stg, sIdx) => {
            const sup = appState.suppliers.find(s => s.id === stg.supplierId);
            stageSuppliersList.push({
                stageIndex: sIdx + 1,
                stageName: stg.name,
                supplier: sup
            });
        });

        let tableRows = stageSuppliersList.map(item => {
            const sup = item.supplier;
            if (!sup) {
                return `
                    <tr>
                        <td><span class="badge bg-light text-dark border">Stage ${item.stageIndex}</span></td>
                        <td class="fw-semibold">${item.stageName}</td>
                        <td colspan="6" class="text-muted">No supplier assigned</td>
                    </tr>
                `;
            }
            const badgeClass = sup.audit.includes("Certified") ? "bg-success" : (sup.audit.includes("Audited") ? "bg-info text-dark" : "bg-danger");
            return `
                <tr>
                    <td><span class="badge bg-light text-dark border">Stage ${item.stageIndex}</span></td>
                    <td class="fw-semibold">${item.stageName}</td>
                    <td class="fw-bold">${sup.name}</td>
                    <td>${sup.material || "--"}</td>
                    <td>${sup.country}</td>
                    <td><span class="badge ${badgeClass}">${sup.audit}</span></td>
                    <td><strong>${sup.score}</strong> / 100</td>
                    <td>
                        <button class="btn btn-sm btn-outline-dark py-0 px-2" onclick="viewSupplierProfile('${sup.id}')">
                            Profile &rarr;
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        section.innerHTML = `
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                    <h5 class="fw-bold mb-0 text-dark">${prod.name}</h5>
                    <span class="text-muted small">Batch: <code>${prod.batch}</code> &bull; Lifecycle Stages: ${prod.stages.length}</span>
                </div>
                <button class="btn btn-sm btn-outline-dark" onclick="viewProductLifecycle('${prod.id}')">View Full Lifecycle &rarr;</button>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Lifecycle Node</th>
                            <th>Stage Name</th>
                            <th>Assigned Supplier</th>
                            <th>Material Supplied</th>
                            <th>Country</th>
                            <th>SDG 8 Labor Audit</th>
                            <th>Eco Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
        container.appendChild(section);
    });
}

function openAssignSupplierModal(stageIndex) {
    activeTargetStageIndex = stageIndex;
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod) return;

    document.getElementById("assignStageName").textContent = prod.stages[stageIndex].name;
    const dropdown = document.getElementById("dropdownExistingSuppliers");
    dropdown.innerHTML = `<option value="">-- Select Existing Supplier --</option>`;

    appState.suppliers.forEach(s => {
        dropdown.innerHTML += `<option value="${s.id}">${s.name} (${s.country}) - Score: ${s.score}/100 [${s.audit}]</option>`;
    });

    dropdown.value = prod.stages[stageIndex].supplierId || "";
    document.getElementById("newSupName").value = "";
    document.getElementById("newSupCountry").value = "";
    document.getElementById("newSupMaterial").value = "";
    resetScoreChecklist("assign");

    modalAssignSupplier.show();
}

function confirmSupplierAssignment() {
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod || activeTargetStageIndex === null) return;

    const existingSupId = document.getElementById("dropdownExistingSuppliers").value;
    const newName = document.getElementById("newSupName").value.trim();

    if (newName) {
        const newId = `SUP-${Date.now().toString().slice(-4)}`;
        const newCountry = document.getElementById("newSupCountry").value.trim() || "International";
        const newMaterial = document.getElementById("newSupMaterial").value.trim() || "Not Specified";
        const newChecklist = getChecklistArray("assign");
        const newScore = getScoreFromChecklist(newChecklist);
        const newAudit = document.getElementById("newSupAudit").value;

        const newSup = { id: newId, name: newName, country: newCountry, material: newMaterial, score: newScore, checklist: newChecklist, audit: newAudit };
        appState.suppliers.push(newSup);
        prod.stages[activeTargetStageIndex].supplierId = newId;
    } else if (existingSupId) {
        prod.stages[activeTargetStageIndex].supplierId = existingSupId;
    }

    saveAppData();
    modalAssignSupplier.hide();
    renderDetailedLifecycle();
    showToast("Supplier assignment updated for this stage.", "success");
}

function openCreateSupplierModal() {
    document.getElementById("globalSupName").value = "";
    document.getElementById("globalSupCountry").value = "";
    document.getElementById("globalSupMaterial").value = "";
    resetScoreChecklist("global");
    modalCreateSupplier.show();
}

function saveGlobalSupplier() {
    const name = document.getElementById("globalSupName").value.trim();
    const country = document.getElementById("globalSupCountry").value.trim() || "Global";
    const material = document.getElementById("globalSupMaterial").value.trim() || "Not Specified";
    const checklist = getChecklistArray("global");
    const score = getScoreFromChecklist(checklist);
    const audit = document.getElementById("globalSupAudit").value;

    if (!name) {
        showToast("Please enter a supplier name.", "warning");
        return;
    }

    const newId = `SUP-${Date.now().toString().slice(-4)}`;
    appState.suppliers.push({ id: newId, name, country, material, score, checklist, audit });
    saveAppData();
    modalCreateSupplier.hide();
    renderSuppliersPage();
    showToast(`Supplier <strong>${name}</strong> added to global registry.`, "success");
}

// Builds the tickbox sustainability scoring list inside a modal
function renderScoreChecklist(containerId, prefix) {
    const container = document.getElementById(containerId);
    let html = "";
    let itemNumber = 1;

    for (let s = 0; s < SCORE_CHECKLIST.length; s++) {
        const section = SCORE_CHECKLIST[s];
        html += `<h6 class="small fw-bold text-muted mt-3 mb-2">${section.section}</h6>`;

        for (let i = 0; i < section.items.length; i++) {
            const boxId = prefix + "_chk_" + itemNumber;
            html += `
                <div class="form-check mb-1">
                    <input class="form-check-input score-checkbox" type="checkbox" id="${boxId}" data-prefix="${prefix}" onchange="calculateChecklistScore('${prefix}')">
                    <label class="form-check-label small" for="${boxId}">[5 Points] ${section.items[i]}</label>
                </div>
            `;
            itemNumber++;
        }
    }

    container.innerHTML = html;
}

// Adds up 5 points for every ticked checkbox and updates the score display
function calculateChecklistScore(prefix) {
    const checklist = getChecklistArray(prefix);
    const total = getScoreFromChecklist(checklist);
    document.getElementById(prefix + "ScoreDisplay").textContent = total;
    return total;
}

// Reads the current true/false state of every checkbox for a given modal
function getChecklistArray(prefix) {
    const boxes = document.querySelectorAll('.score-checkbox[data-prefix="' + prefix + '"]');
    const result = [];
    boxes.forEach(box => {
        result.push(box.checked);
    });
    return result;
}

// Ticks/unticks the checkboxes for a given modal to match a saved checklist array
function setChecklistArray(prefix, checklistArray) {
    const boxes = document.querySelectorAll('.score-checkbox[data-prefix="' + prefix + '"]');
    boxes.forEach((box, i) => {
        box.checked = checklistArray[i] === true;
    });
}

// Counts how many items in a checklist array are true and multiplies by 5 points
function getScoreFromChecklist(checklistArray) {
    let total = 0;
    for (let i = 0; i < checklistArray.length; i++) {
        if (checklistArray[i]) {
            total += 5;
        }
    }
    return total;
}

// Unticks every checkbox for the given modal and resets score back to 0
function resetScoreChecklist(prefix) {
    const boxes = document.querySelectorAll('.score-checkbox[data-prefix="' + prefix + '"]');
    boxes.forEach(box => { box.checked = false; });
    document.getElementById(prefix + "ScoreDisplay").textContent = "0";
}

function openChangeTransitModal(stageIndex) {
    activeTargetStageIndex = stageIndex;
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod || !prod.stages[stageIndex].transitToNext) return;

    const transit = prod.stages[stageIndex].transitToNext;
    document.getElementById("transitModeSelect").value = transit.mode;
    document.getElementById("transitCarrierName").value = transit.carrier;

    modalChangeTransit.show();
}

// Works out an emissions rating from a transport mode's name
function getEmissionsForMode(mode) {
    let emissions = "Moderate";
    if (mode.includes("Train") || mode.includes("Van")) emissions = "Low";
    if (mode.includes("Zero") || mode.includes("Electric Delivery")) emissions = "Zero";
    if (mode.includes("Diesel")) emissions = "High";
    return emissions;
}

function saveTransitChange() {
    const prod = appState.products.find(p => p.id === appState.selectedProductId);
    if (!prod || activeTargetStageIndex === null) return;

    const mode = document.getElementById("transitModeSelect").value;
    const carrier = document.getElementById("transitCarrierName").value.trim() || "Green Logistics Lines";
    const emissions = getEmissionsForMode(mode);

    prod.stages[activeTargetStageIndex].transitToNext = { mode, carrier, emissions };
    saveAppData();
    modalChangeTransit.hide();
    renderDetailedLifecycle();
    showToast("Logistics provider updated.", "info");
}

function openNewProductModal() {
    document.getElementById("createProdName").value = "";
    document.getElementById("createProdBatch").value = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Start with two blank stages so there's already a stage to fill in and a place to attach transit
    newProductStages = [
        { name: "", desc: "", supplierId: "", transitMode: "Electric Cargo Train", transitCarrier: "" },
        { name: "", desc: "", supplierId: "", transitMode: "Electric Cargo Train", transitCarrier: "" }
    ];
    renderNewProductStageBuilder();

    modalCreateProduct.show();
}

// Draws every stage row in the Add Product modal from the newProductStages array
function renderNewProductStageBuilder() {
    const container = document.getElementById("createProdStagesContainer");
    let html = "";

    newProductStages.forEach((stage, idx) => {
        const isLastStage = idx === newProductStages.length - 1;
        let supplierOptions = `<option value="">-- No Supplier Yet --</option>`;
        appState.suppliers.forEach(s => {
            const selected = s.id === stage.supplierId ? "selected" : "";
            supplierOptions += `<option value="${s.id}" ${selected}>${s.name} (${s.country})</option>`;
        });

        html += `
            <div class="border rounded p-3 mb-3 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="small text-uppercase text-muted">Stage ${idx + 1}</strong>
                    ${newProductStages.length > 1 ? `<button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeNewProductStage(${idx})">Remove</button>` : ""}
                </div>
                <div class="mb-2">
                    <input type="text" class="form-control form-control-sm" id="npsName_${idx}" placeholder="Stage Name (e.g., Raw Material Sourcing)" value="${stage.name}">
                </div>
                <div class="mb-2">
                    <input type="text" class="form-control form-control-sm" id="npsDesc_${idx}" placeholder="Short description (optional)" value="${stage.desc}">
                </div>
                <div class="mb-2">
                    <select class="form-select form-select-sm" id="npsSupplier_${idx}">${supplierOptions}</select>
                </div>
                ${isLastStage ? `
                    <span class="small text-muted">Final stage &mdash; no transport needed after this one.</span>
                ` : `
                    <label class="small text-muted d-block mb-1">Transport to next stage:</label>
                    <div class="row g-2">
                        <div class="col-7">
                            <select class="form-select form-select-sm" id="npsMode_${idx}">
                                <option value="Electric Cargo Train" ${stage.transitMode === "Electric Cargo Train" ? "selected" : ""}>Electric Cargo Train</option>
                                <option value="Electric Delivery Van" ${stage.transitMode === "Electric Delivery Van" ? "selected" : ""}>Electric Delivery Van</option>
                                <option value="Bio-Fuel Maritime Ship" ${stage.transitMode === "Bio-Fuel Maritime Ship" ? "selected" : ""}>Bio-Fuel Maritime Ship</option>
                                <option value="Diesel Heavy Truck" ${stage.transitMode === "Diesel Heavy Truck" ? "selected" : ""}>Diesel Heavy Truck</option>
                            </select>
                        </div>
                        <div class="col-5">
                            <input type="text" class="form-control form-control-sm" id="npsCarrier_${idx}" placeholder="Carrier Name" value="${stage.transitCarrier}">
                        </div>
                    </div>
                `}
            </div>
        `;
    });

    container.innerHTML = html;
}

// Reads whatever is currently typed/selected in the stage builder back into newProductStages
function syncNewProductStagesFromDOM() {
    newProductStages.forEach((stage, idx) => {
        const nameInput = document.getElementById(`npsName_${idx}`);
        if (!nameInput) return;

        stage.name = nameInput.value.trim();
        stage.desc = document.getElementById(`npsDesc_${idx}`).value.trim();
        stage.supplierId = document.getElementById(`npsSupplier_${idx}`).value;

        const modeSelect = document.getElementById(`npsMode_${idx}`);
        const carrierInput = document.getElementById(`npsCarrier_${idx}`);
        if (modeSelect) stage.transitMode = modeSelect.value;
        if (carrierInput) stage.transitCarrier = carrierInput.value.trim();
    });
}

function addNewProductStage() {
    syncNewProductStagesFromDOM();
    newProductStages.push({ name: "", desc: "", supplierId: "", transitMode: "Electric Cargo Train", transitCarrier: "" });
    renderNewProductStageBuilder();
}

function removeNewProductStage(index) {
    syncNewProductStagesFromDOM();
    if (newProductStages.length <= 1) {
        showToast("A product needs at least one stage.", "warning");
        return;
    }
    newProductStages.splice(index, 1);
    renderNewProductStageBuilder();
}

function saveNewProduct() {
    const name = document.getElementById("createProdName").value.trim();
    const batch = document.getElementById("createProdBatch").value.trim();
    if (!name) {
        showToast("Please enter a product name.", "warning");
        return;
    }

    syncNewProductStagesFromDOM();

    for (let i = 0; i < newProductStages.length; i++) {
        if (!newProductStages[i].name) {
            showToast(`Please name Stage ${i + 1} before saving.`, "warning");
            return;
        }
    }

    const stages = newProductStages.map((stage, idx) => {
        const isLastStage = idx === newProductStages.length - 1;
        let transitToNext = null;
        if (!isLastStage && stage.transitCarrier) {
            transitToNext = {
                mode: stage.transitMode,
                carrier: stage.transitCarrier,
                emissions: getEmissionsForMode(stage.transitMode)
            };
        }

        return {
            name: stage.name,
            desc: stage.desc || "Stage details to be added.",
            supplierId: stage.supplierId || null,
            completedDate: null,
            notes: "",
            transitToNext: transitToNext
        };
    });

    const newProduct = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        name: name,
        batch: batch,
        currentStageIndex: 0,
        stages: stages
    };

    appState.products.push(newProduct);
    appState.selectedProductId = newProduct.id;
    saveAppData();
    modalCreateProduct.hide();
    viewProductLifecycle(newProduct.id);
    showToast(`Product <strong>${name}</strong> added with ${stages.length} stage(s)!`, "success");
}

function showToast(msg, type = "success") {
    const div = document.getElementById("statusNotification");
    div.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show py-2 small mb-3 shadow-sm" role="alert">
            ${msg}
            <button type="button" class="btn-close py-2" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => { div.innerHTML = ""; }, 4000);
}

window.addEventListener("DOMContentLoaded", () => {
    modalAssignSupplier = new bootstrap.Modal(document.getElementById("modalAssignSupplier"));
    modalCreateSupplier = new bootstrap.Modal(document.getElementById("modalCreateSupplier"));
    modalChangeTransit = new bootstrap.Modal(document.getElementById("modalChangeTransit"));
    modalCreateProduct = new bootstrap.Modal(document.getElementById("modalCreateProduct"));
    modalSupplierProfile = new bootstrap.Modal(document.getElementById("modalSupplierProfile"));
    modalUpdateStageStatus = new bootstrap.Modal(document.getElementById("modalUpdateStageStatus"));

    renderScoreChecklist("globalScoreChecklist", "global");
    renderScoreChecklist("assignScoreChecklist", "assign");
    renderScoreChecklist("profScoreChecklist", "prof");

    // Once the profile modal finishes closing, reopen it in edit mode on the Suppliers tab
    document.getElementById("modalSupplierProfile").addEventListener("hidden.bs.modal", () => {
        if (pendingEditRedirect) {
            pendingEditRedirect = false;
            navigateToPage("suppliers");
            viewSupplierProfile(currentProfileSupplierId, true);
        }
    });

    loadAppData();
});
