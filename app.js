(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5519997625253";
  var STORAGE_KEYS = {
    catalog: "fioafio.catalog.v1",
    catalogBackup: "fioafio.catalog.backup.v1",
    cart: "fioafio.cart.v1",
    editor: "fioafio.editor"
  };

  var MEDIA_DB = {
    name: "fioafio-media",
    version: 1,
    store: "images"
  };
  var MAX_IMAGE_BYTES = 12 * 1024 * 1024;
  var MAX_IMAGE_EDGE = 1600;
  var mediaDbPromise = null;
  var mediaUrlCache = new Map();
  var mediaChannel = null;

  var DEFAULT_CATALOG = {
    schemaVersion: 2,
    revision: 1,
    imageSeedVersion: 1,
    updatedAt: "2026-07-14T12:00:00.000Z",
    categories: [
      {
        id: "cat-tricolines",
        name: "Tricolines",
        description: "Leves, versáteis e perfeitas para criações cheias de personalidade.",
        image: "assets/catalog/tricoline-cotton.jpg",
        imageAlt: "Tecido de algodão em detalhe",
        sortOrder: 10
      },
      {
        id: "cat-linhos",
        name: "Linhos",
        description: "Textura natural e elegância serena para moda e decoração.",
        image: "assets/catalog/linen-natural.jpg",
        imageAlt: "Textura de linho natural",
        sortOrder: 20
      },
      {
        id: "cat-festa",
        name: "Festa & Noivas",
        description: "Brilho, fluidez e presença para ocasiões que ficam na memória.",
        image: "assets/catalog/fabric-folds.jpg",
        imageAlt: "Tecido fluido em dobras",
        sortOrder: 30
      },
      {
        id: "cat-malhas",
        name: "Malhas",
        description: "Conforto, movimento e caimento para acompanhar todos os dias.",
        image: "assets/catalog/knit-texture.jpg",
        imageAlt: "Textura de malha",
        sortOrder: 40
      },
      {
        id: "cat-rendas",
        name: "Rendas & Tules",
        description: "Delicadeza em camadas para acabamentos e peças especiais.",
        image: "assets/catalog/lace-light.jpg",
        imageAlt: "Renda clara em detalhe",
        sortOrder: 50
      },
      {
        id: "cat-decoracao",
        name: "Decoração",
        description: "Texturas marcantes que transformam cada detalhe da casa.",
        image: "assets/catalog/upholstery.jpg",
        imageAlt: "Textura para estofado",
        sortOrder: 60
      }
    ],
    products: [
      {
        id: "prd-tricoline-algodao",
        categoryId: "cat-tricolines",
        name: "Tricoline 100% Algodão",
        description: "Toque macio, trama firme e excelente versatilidade para camisas, vestidos, artesanato e peças infantis.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/tricoline-cotton.jpg",
        sortOrder: 10,
        variants: [
          { id: "var-tri-branco", name: "Branco", hex: "#F2F0E9", available: true },
          { id: "var-tri-preto", name: "Preto", hex: "#171717", available: true },
          { id: "var-tri-areia", name: "Areia", hex: "#C9B99F", available: true },
          { id: "var-tri-marinho", name: "Azul-marinho", hex: "#17243E", available: true }
        ]
      },
      {
        id: "prd-tricoline-digital",
        categoryId: "cat-tricolines",
        name: "Tricoline Digital",
        description: "Estampas nítidas e cores vivas em uma base de algodão agradável, ideal para projetos autorais e criativos.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/tricoline-pattern.jpg",
        sortOrder: 20,
        variants: [
          { id: "var-dig-floral", name: "Floral rosé", hex: "#B86F78", available: true },
          { id: "var-dig-botanico", name: "Botânico verde", hex: "#496653", available: true },
          { id: "var-dig-porcelana", name: "Azul porcelana", hex: "#6C88A4", available: true }
        ]
      },
      {
        id: "prd-linho-natural",
        categoryId: "cat-linhos",
        name: "Linho Natural",
        description: "Visual orgânico, toque fresco e uma textura elegante que valoriza alfaiataria leve, vestidos e decoração.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/linen-natural.jpg",
        sortOrder: 30,
        variants: [
          { id: "var-lin-cru", name: "Cru", hex: "#D8CBB3", available: true },
          { id: "var-lin-aveia", name: "Aveia", hex: "#B7A68C", available: true },
          { id: "var-lin-telha", name: "Telha", hex: "#A65B43", available: true },
          { id: "var-lin-oliva", name: "Verde oliva", hex: "#657052", available: true }
        ]
      },
      {
        id: "prd-linho-alfaiataria",
        categoryId: "cat-linhos",
        name: "Linho Alfaiataria",
        description: "Estrutura refinada e caimento alinhado para coletes, calças, blazers e conjuntos contemporâneos.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/fabric-folds.jpg",
        sortOrder: 40,
        variants: [
          { id: "var-lina-off", name: "Off-white", hex: "#E9E4D9", available: true },
          { id: "var-lina-preto", name: "Preto", hex: "#151515", available: true },
          { id: "var-lina-fendi", name: "Fendi", hex: "#9A8C7A", available: true }
        ]
      },
      {
        id: "prd-cetim-charmousse",
        categoryId: "cat-festa",
        name: "Cetim Charmousse",
        description: "Superfície acetinada, brilho elegante e caimento fluido para vestidos, saias, blusas e detalhes sofisticados.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/fabric-folds.jpg",
        sortOrder: 50,
        variants: [
          { id: "var-cet-champagne", name: "Champagne", hex: "#D8BE91", available: true },
          { id: "var-cet-marsala", name: "Marsala", hex: "#6B2635", available: true },
          { id: "var-cet-preto", name: "Preto", hex: "#111111", available: true },
          { id: "var-cet-noite", name: "Azul noite", hex: "#151D34", available: true }
        ]
      },
      {
        id: "prd-crepe-amanda",
        categoryId: "cat-festa",
        name: "Crepe Amanda",
        description: "Caimento encorpado com movimento suave, acabamento fosco e excelente presença em peças de festa.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/linen-natural.jpg",
        sortOrder: 60,
        variants: [
          { id: "var-cre-rose", name: "Rosa seco", hex: "#B77C83", available: true },
          { id: "var-cre-lavanda", name: "Lavanda", hex: "#9383A9", available: true },
          { id: "var-cre-esmeralda", name: "Esmeralda", hex: "#1D604F", available: true },
          { id: "var-cre-vermelho", name: "Vermelho", hex: "#A2222E", available: true }
        ]
      },
      {
        id: "prd-viscolycra",
        categoryId: "cat-malhas",
        name: "Viscolycra Premium",
        description: "Malha macia, respirável e com elasticidade confortável para peças práticas com ótimo caimento.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/knit-texture.jpg",
        sortOrder: 70,
        variants: [
          { id: "var-vis-preto", name: "Preto", hex: "#161616", available: true },
          { id: "var-vis-mescla", name: "Mescla", hex: "#898989", available: true },
          { id: "var-vis-marinho", name: "Marinho", hex: "#1F2B42", available: true },
          { id: "var-vis-caramelo", name: "Caramelo", hex: "#A56E42", available: true }
        ]
      },
      {
        id: "prd-malha-canelada",
        categoryId: "cat-malhas",
        name: "Malha Canelada",
        description: "Textura vertical, elasticidade e conforto para blusas, vestidos e conjuntos com visual atual.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/knit-texture.jpg",
        sortOrder: 80,
        variants: [
          { id: "var-can-off", name: "Off-white", hex: "#E9E4D8", available: true },
          { id: "var-can-choco", name: "Chocolate", hex: "#4F3025", available: true },
          { id: "var-can-militar", name: "Verde militar", hex: "#525D45", available: true },
          { id: "var-can-vinho", name: "Vinho", hex: "#5D2531", available: true }
        ]
      },
      {
        id: "prd-renda-chantilly",
        categoryId: "cat-rendas",
        name: "Renda Chantilly",
        description: "Desenho delicado e transparência sutil para sobreposições, mangas, acabamentos e peças de noiva.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/lace-light.jpg",
        sortOrder: 90,
        variants: [
          { id: "var-ren-off", name: "Off-white", hex: "#E9E2D5", available: true },
          { id: "var-ren-branco", name: "Branco", hex: "#F4F3EE", available: true },
          { id: "var-ren-rose", name: "Rosé", hex: "#C99A9C", available: true },
          { id: "var-ren-preto", name: "Preto", hex: "#181616", available: true }
        ]
      },
      {
        id: "prd-tule-ilusion",
        categoryId: "cat-rendas",
        name: "Tule Ilusion",
        description: "Base fina e leve para volumes delicados, transparências, véus e acabamentos praticamente invisíveis.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/lace-dark.jpg",
        sortOrder: 100,
        variants: [
          { id: "var-tul-branco", name: "Branco", hex: "#F1F1ED", available: true },
          { id: "var-tul-nude", name: "Nude", hex: "#CDA99A", available: true },
          { id: "var-tul-preto", name: "Preto", hex: "#171717", available: true },
          { id: "var-tul-bebe", name: "Azul bebê", hex: "#B7CAD8", available: true }
        ]
      },
      {
        id: "prd-suede",
        categoryId: "cat-decoracao",
        name: "Suede Decor",
        description: "Toque aveludado e resistência para estofados, almofadas, cabeceiras e detalhes acolhedores.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/upholstery.jpg",
        sortOrder: 110,
        variants: [
          { id: "var-sue-areia", name: "Areia", hex: "#B8A58C", available: true },
          { id: "var-sue-cinza", name: "Cinza", hex: "#797A78", available: true },
          { id: "var-sue-caramelo", name: "Caramelo", hex: "#9F663E", available: true },
          { id: "var-sue-musgo", name: "Verde musgo", hex: "#4A5542", available: true }
        ]
      },
      {
        id: "prd-jacquard",
        categoryId: "cat-decoracao",
        name: "Jacquard Essenza",
        description: "Trama elaborada e aspecto nobre para cortinas, almofadas e composições decorativas de destaque.",
        unit: "metro",
        minQuantity: 0.5,
        quantityStep: 0.5,
        image: "assets/catalog/tricoline-pattern.jpg",
        sortOrder: 120,
        variants: [
          { id: "var-jac-dourado", name: "Dourado", hex: "#B99552", available: true },
          { id: "var-jac-marfim", name: "Marfim", hex: "#D8CEB8", available: true },
          { id: "var-jac-grafite", name: "Grafite", hex: "#4A4A49", available: true }
        ]
      }
    ]
  };

  var state = {
    catalog: null,
    cart: { schemaVersion: 1, items: [] },
    activeCategory: "all",
    search: "",
    currentProductId: null,
    selectedVariantId: null,
    editorMode: false,
    editorCategoryId: null,
    categoryPhotoDraft: { mode: "keep", existingId: "", existingLegacy: "", previewUrl: "", processed: null },
    productPhotoDraft: { mode: "keep", existingId: "", existingLegacy: "", previewUrl: "", processed: null },
    variantPhotoDrafts: new Map(),
    pendingConfirm: null,
    lastScrollY: 0,
    scrollTicking: false
  };

  var dom = {};
  var animationObserver = null;
  var sectionObserver = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function bySelector(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function allBySelector(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function makeElement(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  }

  function makeIcon(classNames) {
    var icon = document.createElement("i");
    icon.className = classNames;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function isValidId(value) {
    return typeof value === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(value);
  }

  function isValidHex(value) {
    return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
  }

  function cleanText(value, maxLength) {
    if (typeof value !== "string") {
      return "";
    }
    return value.normalize("NFKC").trim().slice(0, maxLength);
  }

  function isSafeImageUrl(value) {
    if (!value) {
      return true;
    }
    if (typeof value !== "string" || value.length > 1200) {
      return false;
    }
    var trimmed = value.trim();
    if (/^(assets\/|\.\/assets\/)/i.test(trimmed)) {
      return true;
    }
    try {
      var url = new URL(trimmed, window.location.href);
      return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "file:";
    } catch (error) {
      return false;
    }
  }

  function normalizeCatalog(input) {
    if (!input || typeof input !== "object" || [1, 2].indexOf(input.schemaVersion) < 0) {
      throw new Error("Versão do catálogo não reconhecida.");
    }
    if (!Array.isArray(input.categories) || input.categories.length < 1 || input.categories.length > 100) {
      throw new Error("O catálogo precisa ter entre 1 e 100 categorias.");
    }
    if (!Array.isArray(input.products) || input.products.length > 1000) {
      throw new Error("A lista de tecidos é inválida.");
    }

    var categoryIds = new Set();
    var categories = input.categories.map(function (category, index) {
      if (!category || !isValidId(category.id) || categoryIds.has(category.id)) {
        throw new Error("Há uma categoria com identificador inválido ou repetido.");
      }
      categoryIds.add(category.id);
      var name = cleanText(category.name, 60);
      if (!name) {
        throw new Error("Toda categoria precisa de um nome.");
      }
      var image = typeof category.image === "string" ? category.image.trim() : "";
      if (!isSafeImageUrl(image)) {
        throw new Error("Há uma URL de imagem não permitida.");
      }
      return {
        id: category.id,
        name: name,
        description: cleanText(category.description || "", 180),
        image: image,
        imageId: isValidId(category.imageId) ? category.imageId : "",
        imageAlt: cleanText(category.imageAlt || name, 120),
        sortOrder: Number.isFinite(Number(category.sortOrder)) ? Number(category.sortOrder) : (index + 1) * 10
      };
    });

    var productIds = new Set();
    var variantIds = new Set();
    var products = input.products.map(function (product, index) {
      if (!product || !isValidId(product.id) || productIds.has(product.id)) {
        throw new Error("Há um tecido com identificador inválido ou repetido.");
      }
      if (!categoryIds.has(product.categoryId)) {
        throw new Error("Um tecido aponta para uma categoria inexistente.");
      }
      productIds.add(product.id);
      var name = cleanText(product.name, 80);
      if (!name) {
        throw new Error("Todo tecido precisa de um nome.");
      }
      if (!Array.isArray(product.variants) || product.variants.length < 1 || product.variants.length > 100) {
        throw new Error("Cada tecido precisa de pelo menos uma cor.");
      }
      var variants = product.variants.map(function (variant) {
        if (!variant || !isValidId(variant.id) || variantIds.has(variant.id)) {
          throw new Error("Há uma cor com identificador inválido ou repetido.");
        }
        variantIds.add(variant.id);
        var variantName = cleanText(variant.name, 60);
        if (!variantName || !isValidHex(variant.hex)) {
          throw new Error("Há uma cor sem nome ou com valor hexadecimal inválido.");
        }
        var variantImage = typeof variant.image === "string" ? variant.image.trim() : "";
        if (!isSafeImageUrl(variantImage)) {
          throw new Error("Há uma URL de foto de cor não permitida.");
        }
        return {
          id: variant.id,
          name: variantName,
          hex: variant.hex.toUpperCase(),
          available: variant.available !== false,
          image: variantImage,
          imageId: isValidId(variant.imageId) ? variant.imageId : "",
          imageAlt: cleanText(variant.imageAlt || variantName, 120)
        };
      });
      var image = typeof product.image === "string" ? product.image.trim() : "";
      if (!isSafeImageUrl(image)) {
        throw new Error("Há uma URL de imagem não permitida.");
      }
      return {
        id: product.id,
        categoryId: product.categoryId,
        name: name,
        description: cleanText(product.description || "", 300),
        unit: ["metro", "unidade", "rolo"].indexOf(product.unit) >= 0 ? product.unit : "metro",
        minQuantity: validQuantity(product.minQuantity) ? Number(product.minQuantity) : 0.5,
        quantityStep: validQuantity(product.quantityStep) ? Number(product.quantityStep) : 0.5,
        image: image,
        imageId: isValidId(product.imageId) ? product.imageId : "",
        imageAlt: cleanText(product.imageAlt || name, 120),
        sortOrder: Number.isFinite(Number(product.sortOrder)) ? Number(product.sortOrder) : (index + 1) * 10,
        variants: variants
      };
    });

    return {
      schemaVersion: 2,
      revision: Number.isFinite(Number(input.revision)) ? Number(input.revision) : 1,
      imageSeedVersion: Number.isFinite(Number(input.imageSeedVersion)) ? Number(input.imageSeedVersion) : 0,
      updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
      categories: categories,
      products: products
    };
  }

  function validQuantity(value) {
    var number = Number(value);
    return Number.isFinite(number) && number > 0 && number <= 9999;
  }

  function loadCatalog() {
    try {
      var stored = localStorage.getItem(STORAGE_KEYS.catalog);
      if (stored) {
        return hydrateDefaultImages(normalizeCatalog(JSON.parse(stored)));
      }
    } catch (error) {
      console.warn("Não foi possível carregar o catálogo salvo.", error);
    }
    return normalizeCatalog(clone(DEFAULT_CATALOG));
  }

  function hydrateDefaultImages(catalog) {
    if (catalog.imageSeedVersion >= DEFAULT_CATALOG.imageSeedVersion) {
      return catalog;
    }
    var defaults = normalizeCatalog(clone(DEFAULT_CATALOG));
    var defaultCategories = new Map(defaults.categories.map(function (category) { return [category.id, category]; }));
    var defaultProducts = new Map(defaults.products.map(function (product) { return [product.id, product]; }));

    catalog.categories.forEach(function (category) {
      var fallback = defaultCategories.get(category.id);
      if (fallback && !category.imageId && !category.image) {
        category.image = fallback.image;
        category.imageAlt = fallback.imageAlt;
      }
    });

    catalog.products.forEach(function (product) {
      var fallback = defaultProducts.get(product.id);
      if (fallback && !product.imageId && !product.image) {
        product.image = fallback.image;
        product.imageAlt = fallback.imageAlt;
      }
    });

    catalog.imageSeedVersion = DEFAULT_CATALOG.imageSeedVersion;
    return catalog;
  }

  function normalizeCart(input) {
    if (!input || input.schemaVersion !== 1 || !Array.isArray(input.items)) {
      return { schemaVersion: 1, items: [] };
    }
    var items = input.items
      .filter(function (item) {
        return item && isValidId(item.id) && isValidId(item.productId) && isValidId(item.variantId) && validQuantity(item.quantity);
      })
      .slice(0, 300)
      .map(function (item) {
        var snapshot = item.snapshot && typeof item.snapshot === "object" ? item.snapshot : {};
        return {
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: Number(item.quantity),
          addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
          snapshot: {
            productName: cleanText(snapshot.productName || "Tecido", 80),
            categoryName: cleanText(snapshot.categoryName || "Categoria", 60),
            colorName: cleanText(snapshot.colorName || "Cor", 60),
            colorHex: isValidHex(snapshot.colorHex) ? snapshot.colorHex : "#777777",
            unit: ["metro", "unidade", "rolo"].indexOf(snapshot.unit) >= 0 ? snapshot.unit : "metro",
            image: isSafeImageUrl(snapshot.image || "") ? snapshot.image || "" : "",
            imageId: isValidId(snapshot.imageId) ? snapshot.imageId : ""
          }
        };
      });
    return { schemaVersion: 1, items: items };
  }

  function loadCart() {
    try {
      var stored = localStorage.getItem(STORAGE_KEYS.cart);
      if (stored) {
        return normalizeCart(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Não foi possível carregar o pedido salvo.", error);
    }
    return { schemaVersion: 1, items: [] };
  }

  function saveCatalog(options) {
    options = options || {};
    try {
      var current = localStorage.getItem(STORAGE_KEYS.catalog);
      if (current && !options.skipBackup) {
        localStorage.setItem(STORAGE_KEYS.catalogBackup, current);
      }
      state.catalog.revision += 1;
      state.catalog.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(state.catalog));
      return true;
    } catch (error) {
      showToast("Não foi possível salvar", "O armazenamento deste navegador pode estar indisponível.", "error");
      return false;
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
      return true;
    } catch (error) {
      showToast("Pedido não salvo", "O armazenamento deste navegador pode estar indisponível.", "error");
      return false;
    }
  }

  function commitState(previousCatalog, previousCart) {
    var catalogSaved = saveCatalog();
    var cartSaved = true;
    if (catalogSaved && previousCart) {
      cartSaved = saveCart();
    }
    if (catalogSaved && cartSaved) {
      return true;
    }

    state.catalog = previousCatalog;
    if (previousCart) {
      state.cart = previousCart;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(previousCatalog));
      if (previousCart) {
        localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(previousCart));
      }
    } catch (error) {
      // The original save error already explains that persistence is unavailable.
    }
    return false;
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      try {
        return prefix + "_" + window.crypto.randomUUID().replace(/-/g, "");
      } catch (error) {
        // Falls through for file contexts where randomUUID is unavailable.
      }
    }
    var randomPart = "";
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      var values = new Uint32Array(2);
      window.crypto.getRandomValues(values);
      randomPart = values[0].toString(36) + values[1].toString(36);
    } else {
      randomPart = Math.random().toString(36).slice(2);
    }
    return prefix + "_" + Date.now().toString(36) + randomPart;
  }

  function openMediaDb() {
    if (!("indexedDB" in window)) {
      return Promise.reject(new Error("Este navegador não oferece armazenamento de imagens."));
    }
    if (mediaDbPromise) {
      return mediaDbPromise;
    }
    mediaDbPromise = new Promise(function (resolve, reject) {
      var request = window.indexedDB.open(MEDIA_DB.name, MEDIA_DB.version);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(MEDIA_DB.store)) {
          db.createObjectStore(MEDIA_DB.store, { keyPath: "id" });
        }
      };
      request.onsuccess = function () {
        request.result.onversionchange = function () {
          request.result.close();
          mediaDbPromise = null;
        };
        resolve(request.result);
      };
      request.onerror = function () {
        mediaDbPromise = null;
        reject(request.error || new Error("Falha ao abrir o banco de imagens."));
      };
      request.onblocked = function () {
        reject(new Error("Feche outras abas da vitrine para atualizar o banco de imagens."));
      };
    });
    return mediaDbPromise;
  }

  function mediaRequest(mode, handler) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var transaction = db.transaction(MEDIA_DB.store, mode);
        var store = transaction.objectStore(MEDIA_DB.store);
        var request;
        var requestResult;
        try {
          request = handler(store);
        } catch (error) {
          reject(error);
          return;
        }
        request.onsuccess = function () {
          requestResult = request.result;
          if (mode === "readonly") {
            resolve(requestResult);
          }
        };
        request.onerror = function () { reject(request.error || new Error("Falha no armazenamento de imagens.")); };
        transaction.oncomplete = function () {
          if (mode !== "readonly") {
            resolve(requestResult);
          }
        };
        transaction.onabort = function () { reject(transaction.error || new Error("A operação com a imagem foi cancelada.")); };
      });
    });
  }

  function mediaGet(id) {
    if (!isValidId(id)) {
      return Promise.resolve(null);
    }
    return mediaRequest("readonly", function (store) { return store.get(id); });
  }

  function mediaGetAll() {
    return mediaRequest("readonly", function (store) { return store.getAll(); });
  }

  function mediaPut(record) {
    return mediaRequest("readwrite", function (store) { return store.put(record); }).then(function (result) {
      revokeMediaUrl(record.id);
      if (mediaChannel) {
        mediaChannel.postMessage({ type: "changed", id: record.id });
      }
      return result;
    });
  }

  function mediaDelete(id) {
    if (!isValidId(id)) {
      return Promise.resolve();
    }
    return mediaRequest("readwrite", function (store) { return store.delete(id); }).then(function () {
      revokeMediaUrl(id);
      if (mediaChannel) {
        mediaChannel.postMessage({ type: "deleted", id: id });
      }
    }).catch(function (error) {
      console.warn("Não foi possível remover uma foto sem uso.", error);
    });
  }

  function revokeMediaUrl(id) {
    var url = mediaUrlCache.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      mediaUrlCache.delete(id);
    }
  }

  function revokeAllMediaUrls() {
    mediaUrlCache.forEach(function (url) { URL.revokeObjectURL(url); });
    mediaUrlCache.clear();
  }

  function getMediaObjectUrl(id) {
    if (mediaUrlCache.has(id)) {
      return Promise.resolve(mediaUrlCache.get(id));
    }
    return mediaGet(id).then(function (record) {
      if (!record || !(record.blob instanceof Blob)) {
        return "";
      }
      var url = URL.createObjectURL(record.blob);
      mediaUrlCache.set(id, url);
      return url;
    });
  }

  function decodeImage(file) {
    if (typeof window.createImageBitmap === "function") {
      return window.createImageBitmap(file).then(function (bitmap) {
        return {
          width: bitmap.width,
          height: bitmap.height,
          draw: function (context, width, height) {
            context.drawImage(bitmap, 0, 0, width, height);
            bitmap.close();
          }
        };
      });
    }
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var image = new Image();
      image.onload = function () {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
          draw: function (context, width, height) {
            context.drawImage(image, 0, 0, width, height);
            URL.revokeObjectURL(url);
          }
        });
      };
      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Não foi possível abrir esta imagem."));
      };
      image.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Não foi possível otimizar esta imagem."));
        }
      }, type, quality);
    });
  }

  function processImageFile(file) {
    var allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!(file instanceof Blob) || allowedTypes.indexOf(file.type) < 0) {
      return Promise.reject(new Error("Escolha uma foto JPG, PNG ou WebP."));
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return Promise.reject(new Error("A foto deve ter no máximo 12 MB."));
    }
    return decodeImage(file).then(function (decoded) {
      if (!decoded.width || !decoded.height || decoded.width > 16384 || decoded.height > 16384 || decoded.width * decoded.height > 40000000) {
        throw new Error("A resolução desta foto é muito alta. Escolha uma imagem menor.");
      }
      var ratio = Math.min(1, MAX_IMAGE_EDGE / Math.max(decoded.width, decoded.height));
      var width = Math.max(1, Math.round(decoded.width * ratio));
      var height = Math.max(1, Math.round(decoded.height * ratio));
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext("2d", { alpha: true });
      if (!context) {
        throw new Error("O navegador não conseguiu preparar a foto.");
      }
      decoded.draw(context, width, height);
      return canvasToBlob(canvas, "image/webp", 0.84).catch(function () {
        return canvasToBlob(canvas, "image/jpeg", 0.88);
      }).then(function (blob) {
        return {
          blob: blob,
          width: width,
          height: height,
          mime: blob.type || "image/webp",
          originalName: cleanText(file.name || "foto", 160)
        };
      });
    });
  }

  function storeProcessedMedia(processed) {
    var id = makeId("img");
    return mediaPut({
      id: id,
      blob: processed.blob,
      width: processed.width,
      height: processed.height,
      mime: processed.mime,
      originalName: processed.originalName,
      createdAt: new Date().toISOString()
    }).then(function () { return id; });
  }

  function makeMediaPlaceholder(label) {
    var placeholder = makeElement("span", "media-placeholder");
    placeholder.append(makeIcon("fa-regular fa-image"), makeElement("span", "", label || "Foto não cadastrada"));
    return placeholder;
  }

  function renderStoredPhoto(container, imageId, legacyUrl, alt, emptyLabel) {
    if (!container) {
      return;
    }
    var token = makeId("render");
    container.dataset.mediaToken = token;
    container.replaceChildren(makeMediaPlaceholder(emptyLabel));

    function applyUrl(url) {
      if (!url || container.dataset.mediaToken !== token) {
        return;
      }
      var image = document.createElement("img");
      image.className = "product-photo";
      image.alt = alt || "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", function () {
        if (container.dataset.mediaToken === token) {
          container.replaceChildren(makeMediaPlaceholder(emptyLabel));
        }
      }, { once: true });
      image.src = url;
      container.replaceChildren(image);
    }

    if (isValidId(imageId)) {
      getMediaObjectUrl(imageId).then(function (url) {
        if (url) {
          applyUrl(url);
        } else if (legacyUrl && (isSafeImageUrl(legacyUrl) || /^blob:/i.test(legacyUrl))) {
          applyUrl(legacyUrl);
        }
      }).catch(function () {
        if (legacyUrl && (isSafeImageUrl(legacyUrl) || /^blob:/i.test(legacyUrl))) {
          applyUrl(legacyUrl);
        }
      });
    } else if (legacyUrl && (isSafeImageUrl(legacyUrl) || /^blob:/i.test(legacyUrl))) {
      applyUrl(legacyUrl);
    }
  }

  function createPhotoVisual(entity, className, emptyLabel) {
    var wrapper = makeElement("div", className || "");
    var mediaLayer = makeElement("div", "media-layer");
    wrapper.appendChild(mediaLayer);
    renderStoredPhoto(mediaLayer, entity.imageId, entity.image || "", "", emptyLabel || "Foto não cadastrada");
    return wrapper;
  }

  function getVariantImageEntity(product, variant) {
    return {
      image: (variant && variant.image) || product.image || "",
      imageId: (variant && variant.imageId) || product.imageId || "",
      imageAlt: (variant && variant.imageAlt) || product.imageAlt || product.name
    };
  }

  function isMediaReferenced(id) {
    if (!id) {
      return false;
    }
    return state.catalog.categories.some(function (category) { return category.imageId === id; }) ||
      state.catalog.products.some(function (product) {
        return product.imageId === id || product.variants.some(function (variant) { return variant.imageId === id; });
      });
  }

  function deleteMediaIfUnused(id) {
    if (id && !isMediaReferenced(id)) {
      return mediaDelete(id);
    }
    return Promise.resolve();
  }

  function clearPhotoDraft(draftName) {
    var draft = state[draftName];
    if (draft && draft.previewUrl) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    state[draftName] = { mode: "keep", existingId: "", existingLegacy: "", previewUrl: "", processed: null, requestId: makeId("photo") };
  }

  function setPhotoDraftFromFile(draftName, file, preview, removeButton) {
    var previous = state[draftName];
    var requestId = makeId("photo");
    state[draftName] = Object.assign({}, previous, { requestId: requestId });
    preview.dataset.photoRequest = requestId;
    preview.classList.add("is-processing");
    return processImageFile(file).then(function (processed) {
      if (!state[draftName] || state[draftName].requestId !== requestId) {
        return;
      }
      if (previous && previous.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      var previewUrl = URL.createObjectURL(processed.blob);
      state[draftName] = {
        mode: "replace",
        existingId: previous ? previous.existingId : "",
        existingLegacy: previous ? previous.existingLegacy || "" : "",
        previewUrl: previewUrl,
        processed: processed,
        requestId: requestId
      };
      renderStoredPhoto(preview, "", previewUrl, "Prévia da foto", "Nenhuma foto selecionada");
      removeButton.hidden = false;
    }).catch(function (error) {
      if (!state[draftName] || state[draftName].requestId !== requestId) {
        return;
      }
      state[draftName] = previous || { mode: "keep", existingId: "", previewUrl: "", processed: null };
      showToast("Foto não adicionada", error.message || "Escolha outra imagem.", "error");
      throw error;
    }).finally(function () {
      if (preview.dataset.photoRequest === requestId) {
        preview.classList.remove("is-processing");
        delete preview.dataset.photoRequest;
      }
    });
  }

  function setSubmitBusy(form, busy) {
    var button = bySelector("button[type='submit']", form);
    if (!button) {
      return;
    }
    button.disabled = busy;
    button.setAttribute("aria-busy", String(busy));
  }

  function markPhotoForRemoval(draftName, input, preview, removeButton, label) {
    var draft = state[draftName] || {};
    var remove = function () {
      if (draft.previewUrl) {
        URL.revokeObjectURL(draft.previewUrl);
      }
      state[draftName] = {
        mode: "remove",
        existingId: draft.existingId || "",
        existingLegacy: draft.existingLegacy || "",
        previewUrl: "",
        processed: null,
        requestId: makeId("photo")
      };
      input.value = "";
      renderStoredPhoto(preview, "", "", "", "Nenhuma foto selecionada");
      removeButton.hidden = true;
    };
    if (draft.existingId || draft.existingLegacy) {
      askConfirm("Remover esta foto?", "A foto será excluída quando você salvar " + label + ".", remove);
    } else {
      remove();
    }
  }

  function cacheDom() {
    dom.categoryGrid = bySelector("[data-category-grid]");
    dom.categoryChips = bySelector("[data-category-chips]");
    dom.productGrid = bySelector("[data-product-grid]");
    dom.emptyState = bySelector("[data-empty-state]");
    dom.search = bySelector("[data-search]");
    dom.catalogLabel = bySelector("[data-catalog-label]");
    dom.resultCount = bySelector("[data-result-count]");
    dom.filterClear = bySelector(".filter-clear");
    dom.productDialog = bySelector("[data-product-dialog]");
    dom.productDialogVisual = bySelector("[data-product-dialog-visual]");
    dom.productDialogCategory = bySelector("[data-product-dialog-category]");
    dom.productDialogName = bySelector("[data-product-dialog-name]");
    dom.productDialogDescription = bySelector("[data-product-dialog-description]");
    dom.selectedColor = bySelector("[data-selected-color]");
    dom.colorOptions = bySelector("[data-color-options]");
    dom.productQuantity = bySelector("[data-product-quantity]");
    dom.unitLabel = bySelector("[data-unit-label]");
    dom.addCartButton = bySelector("[data-action='add-to-cart']");
    dom.cartDialog = bySelector("[data-cart-dialog]");
    dom.cartItems = bySelector("[data-cart-items]");
    dom.cartEmpty = bySelector("[data-cart-empty]");
    dom.cartFooter = bySelector("[data-cart-footer]");
    dom.cartLinesLabel = bySelector("[data-cart-lines-label]");
    dom.cartLineCount = bySelector("[data-cart-line-count]");
    dom.cartTotalQuantity = bySelector("[data-cart-total-quantity]");
    dom.editorDialog = bySelector("[data-editor-dialog]");
    dom.editorBar = bySelector("[data-editor-bar]");
    dom.editorCategoriesPanel = bySelector("[data-editor-panel='categories']");
    dom.editorProductsPanel = bySelector("[data-editor-panel='products']");
    dom.editorCategoryList = bySelector("[data-editor-category-list]");
    dom.editorProductList = bySelector("[data-editor-product-list]");
    dom.categoryForm = bySelector("[data-category-form]");
    dom.productForm = bySelector("[data-product-form]");
    dom.categoryPhotoInput = bySelector("[data-category-photo-input]");
    dom.categoryPhotoPreview = bySelector("[data-category-photo-preview]");
    dom.categoryPhotoRemove = bySelector("[data-action='remove-category-photo']");
    dom.productPhotoInput = bySelector("[data-product-photo-input]");
    dom.productPhotoPreview = bySelector("[data-product-photo-preview]");
    dom.productPhotoRemove = bySelector("[data-action='remove-product-photo']");
    dom.editorCategorySummaryPhoto = bySelector("[data-editor-category-summary-photo]");
    dom.editorProductPanelTitle = bySelector("[data-editor-product-panel-title]");
    dom.editorProductPanelDescription = bySelector("[data-editor-product-panel-description]");
    dom.categorySelect = bySelector("[data-category-select]");
    dom.colorRows = bySelector("[data-color-rows]");
    dom.confirmDialog = bySelector("[data-confirm-dialog]");
    dom.confirmTitle = bySelector("[data-confirm-title]");
    dom.confirmMessage = bySelector("[data-confirm-message]");
    dom.toastRegion = bySelector("[data-toast-region]");
    dom.liveRegion = bySelector("[data-live-region]");
    dom.mobileMenu = bySelector("#mobile-menu");
    dom.menuToggle = bySelector("[data-action='toggle-menu']");
    dom.siteHeader = bySelector(".site-header");
    dom.progress = bySelector(".scroll-progress span");
    dom.heroImage = bySelector(".hero-media img");
    dom.floatingCart = bySelector(".floating-cart");
    dom.cartTrigger = bySelector(".cart-trigger");
  }

  function sortedCategories() {
    return state.catalog.categories.slice().sort(function (a, b) {
      return a.sortOrder - b.sortOrder;
    });
  }

  function sortedProducts() {
    return state.catalog.products.slice().sort(function (a, b) {
      return a.sortOrder - b.sortOrder;
    });
  }

  function findCategory(id) {
    return state.catalog.categories.find(function (category) {
      return category.id === id;
    });
  }

  function findProduct(id) {
    return state.catalog.products.find(function (product) {
      return product.id === id;
    });
  }

  function findVariant(product, id) {
    if (!product) {
      return null;
    }
    return product.variants.find(function (variant) {
      return variant.id === id;
    });
  }

  function normalizeSearch(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function observeAnimated(node, delay) {
    if (!node) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !animationObserver) {
      node.classList.add("is-visible");
      return;
    }
    if (delay) {
      node.style.transitionDelay = delay + "ms";
    }
    animationObserver.observe(node);
  }

  function renderCategories() {
    dom.categoryGrid.replaceChildren();
    sortedCategories().forEach(function (category, index) {
      var productCount = state.catalog.products.filter(function (product) {
        return product.categoryId === category.id;
      }).length;
      var card = makeElement("article", "category-card");

      var mainButton = makeElement("button", "category-card-button");
      mainButton.type = "button";
      mainButton.dataset.action = "select-category";
      mainButton.dataset.categoryId = category.id;
      mainButton.setAttribute("aria-label", "Ver categoria " + category.name);

      var visual = createPhotoVisual(category, "category-visual", "Foto da categoria não cadastrada");

      var indexLabel = makeElement("span", "category-index", String(index + 1).padStart(2, "0"));
      var content = makeElement("div", "category-content");
      var textWrap = makeElement("div");
      var count = makeElement("small", "", productCount + (productCount === 1 ? " opção" : " opções"));
      var title = makeElement("h3", "", category.name);
      var description = makeElement("p", "", category.description);
      textWrap.append(count, title, description);
      var arrow = makeElement("span", "category-arrow");
      arrow.append(
        makeElement("span", "category-action-label", "Ver produtos"),
        makeIcon("fa-solid fa-arrow-up-right-from-square")
      );
      content.append(textWrap, arrow);
      card.append(visual, indexLabel, content, mainButton);

      var edit = makeElement("button", "editor-card-action", "Editar");
      edit.type = "button";
      edit.dataset.action = "edit-category";
      edit.dataset.categoryId = category.id;
      edit.appendChild(makeIcon("fa-solid fa-pen-to-square"));
      card.appendChild(edit);

      dom.categoryGrid.appendChild(card);
      observeAnimated(card, Math.min(index * 70, 350));
    });
  }

  function renderCategoryChips() {
    dom.categoryChips.replaceChildren();
    var allChip = makeElement("button", "category-chip", "Todos");
    allChip.type = "button";
    allChip.dataset.action = "filter-category";
    allChip.dataset.categoryId = "all";
    allChip.classList.toggle("is-active", state.activeCategory === "all");
    allChip.setAttribute("aria-pressed", String(state.activeCategory === "all"));
    dom.categoryChips.appendChild(allChip);

    sortedCategories().forEach(function (category) {
      var chip = makeElement("button", "category-chip", category.name);
      chip.type = "button";
      chip.dataset.action = "filter-category";
      chip.dataset.categoryId = category.id;
      chip.classList.toggle("is-active", state.activeCategory === category.id);
      chip.setAttribute("aria-pressed", String(state.activeCategory === category.id));
      dom.categoryChips.appendChild(chip);
    });
  }

  function filteredProducts() {
    var query = normalizeSearch(state.search);
    return sortedProducts().filter(function (product) {
      if (state.activeCategory !== "all" && product.categoryId !== state.activeCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      var category = findCategory(product.categoryId);
      var searchable = [
        product.name,
        product.description,
        category ? category.name : "",
        product.variants.map(function (variant) { return variant.name; }).join(" ")
      ].join(" ");
      return normalizeSearch(searchable).indexOf(query) >= 0;
    });
  }

  function renderProducts() {
    var products = filteredProducts();
    dom.productGrid.replaceChildren();
    products.forEach(function (product, index) {
      var category = findCategory(product.categoryId);
      var card = makeElement("article", "product-card");
      var button = makeElement("button", "product-card-button");
      button.type = "button";
      button.dataset.action = "open-product";
      button.dataset.productId = product.id;
      button.setAttribute("aria-label", "Ver cores de " + product.name);

      var visual = createPhotoVisual(product, "product-visual", "Foto do produto não cadastrada");
      var overlay = makeElement("div", "product-visual-overlay");
      var tag = makeElement("span", "product-tag", category ? category.name : "Tecido");
      var view = makeElement("span", "product-view");
      view.append(
        makeElement("span", "product-action-label", "Selecionar opções"),
        makeIcon("fa-solid fa-arrow-right")
      );
      visual.append(overlay, tag, view);

      var info = makeElement("div", "product-info");
      var infoText = makeElement("div");
      var unit = makeElement("small", "", "Venda por " + product.unit);
      var title = makeElement("h3", "", product.name);
      var colorCount = product.variants.filter(function (variant) {
        return variant.available;
      }).length;
      var colorsText = makeElement("p", "", colorCount + (colorCount === 1 ? " cor disponível" : " cores disponíveis"));
      infoText.append(unit, title, colorsText);

      var swatches = makeElement("div", "product-swatches");
      product.variants.slice(0, 4).forEach(function (variant) {
        var swatch = makeElement("i", "mini-swatch");
        swatch.style.setProperty("--swatch", variant.hex);
        swatch.title = variant.name;
        swatches.appendChild(swatch);
      });
      if (product.variants.length > 4) {
        swatches.appendChild(makeElement("span", "more-colors", "+" + (product.variants.length - 4)));
      }
      info.append(infoText, swatches);
      card.append(visual, info, button);

      var edit = makeElement("button", "editor-card-action", "Editar");
      edit.type = "button";
      edit.dataset.action = "edit-product";
      edit.dataset.productId = product.id;
      edit.appendChild(makeIcon("fa-solid fa-pen-to-square"));
      card.appendChild(edit);

      dom.productGrid.appendChild(card);
      observeAnimated(card, Math.min((index % 4) * 65, 195));
    });

    var category = state.activeCategory === "all" ? null : findCategory(state.activeCategory);
    dom.catalogLabel.textContent = category ? category.name : state.search ? "Resultado da busca" : "Todos os tecidos";
    dom.resultCount.textContent = products.length + (products.length === 1 ? " tecido" : " tecidos");
    dom.emptyState.hidden = products.length !== 0;
    dom.productGrid.hidden = products.length === 0;
    dom.filterClear.hidden = state.activeCategory === "all" && !state.search;
  }

  function renderCatalog() {
    renderCategoryChips();
    renderProducts();
  }

  function getContrastColor(hex) {
    var value = hex.replace("#", "");
    var red = parseInt(value.slice(0, 2), 16);
    var green = parseInt(value.slice(2, 4), 16);
    var blue = parseInt(value.slice(4, 6), 16);
    var luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    return luminance > 0.63 ? "#191919" : "#FFFFFF";
  }

  function renderProductDialog(product) {
    var category = findCategory(product.categoryId);
    dom.productDialogCategory.textContent = category ? category.name : "Tecido";
    dom.productDialogName.textContent = product.name;
    dom.productDialogDescription.textContent = product.description;
    dom.unitLabel.textContent = product.unit === "metro" ? "Em metros" : "Em " + pluralUnit(product.unit, 2);
    dom.productQuantity.min = String(product.minQuantity);
    dom.productQuantity.step = String(product.quantityStep);
    dom.productQuantity.value = formatInputNumber(product.minQuantity);
    dom.selectedColor.textContent = "Selecione uma opção";
    dom.addCartButton.disabled = true;
    dom.addCartButton.querySelector("span").textContent = "Adicionar ao pedido";
    renderProductDialogVisual(product);

    dom.colorOptions.replaceChildren();
    product.variants.forEach(function (variant) {
      var option = makeElement("button", "color-option");
      option.type = "button";
      option.dataset.action = "select-color";
      option.dataset.variantId = variant.id;
      option.setAttribute("aria-pressed", "false");
      option.disabled = !variant.available;
      var swatch = makeElement("i");
      swatch.style.setProperty("--swatch", variant.hex);
      swatch.style.setProperty("--swatch-contrast", getContrastColor(variant.hex));
      option.append(swatch, document.createTextNode(variant.name));
      dom.colorOptions.appendChild(option);
    });
  }

  function renderProductDialogVisual(product, variant) {
    dom.productDialogVisual.replaceChildren();
    var imageEntity = getVariantImageEntity(product, variant);
    dom.productDialogVisual.appendChild(createPhotoVisual(imageEntity, "product-dialog-photo", "Foto do produto não cadastrada"));
  }

  function openProduct(productId) {
    var product = findProduct(productId);
    if (!product) {
      showToast("Tecido indisponível", "Este item não está mais no catálogo.", "error");
      return;
    }
    state.currentProductId = product.id;
    state.selectedVariantId = null;
    renderProductDialog(product);
    openDialog(dom.productDialog);
  }

  function selectColor(variantId) {
    var product = findProduct(state.currentProductId);
    var variant = findVariant(product, variantId);
    if (!product || !variant || !variant.available) {
      return;
    }
    state.selectedVariantId = variant.id;
    allBySelector(".color-option", dom.colorOptions).forEach(function (button) {
      var selected = button.dataset.variantId === variant.id;
      button.setAttribute("aria-pressed", String(selected));
    });
    dom.selectedColor.textContent = variant.name;
    dom.addCartButton.disabled = false;
    renderProductDialogVisual(product, variant);
  }

  function formatInputNumber(value) {
    return String(Number(Number(value).toFixed(2)));
  }

  function clampProductQuantity(product, value) {
    var number = Number(String(value).replace(",", "."));
    if (!Number.isFinite(number)) {
      return product.minQuantity;
    }
    number = Math.max(product.minQuantity, Math.min(999, number));
    var steps = Math.round((number - product.minQuantity) / product.quantityStep);
    return Number((product.minQuantity + steps * product.quantityStep).toFixed(2));
  }

  function changeProductQuantity(direction) {
    var product = findProduct(state.currentProductId);
    if (!product) {
      return;
    }
    var current = clampProductQuantity(product, dom.productQuantity.value);
    var next = clampProductQuantity(product, current + direction * product.quantityStep);
    dom.productQuantity.value = formatInputNumber(next);
  }

  function addCurrentProductToCart() {
    var product = findProduct(state.currentProductId);
    var variant = findVariant(product, state.selectedVariantId);
    if (!product || !variant || !variant.available) {
      showToast("Escolha uma cor", "Selecione uma opção disponível antes de adicionar.", "error");
      return;
    }
    var category = findCategory(product.categoryId);
    var quantity = clampProductQuantity(product, dom.productQuantity.value);
    var existing = state.cart.items.find(function (item) {
      return item.productId === product.id && item.variantId === variant.id;
    });
    var reachedLimit = false;

    if (existing) {
      var combined = Number((existing.quantity + quantity).toFixed(2));
      existing.quantity = clampProductQuantity(product, combined);
      reachedLimit = combined > 999;
    } else {
      if (state.cart.items.length >= 60) {
        showToast("Pedido muito extenso", "Finalize esta seleção antes de adicionar novas opções.", "error");
        return;
      }
      state.cart.items.push({
        id: makeId("line"),
        productId: product.id,
        variantId: variant.id,
        quantity: quantity,
        addedAt: new Date().toISOString(),
        snapshot: {
          productName: product.name,
          categoryName: category ? category.name : "Tecido",
          colorName: variant.name,
          colorHex: variant.hex,
          unit: product.unit,
          image: getVariantImageEntity(product, variant).image,
          imageId: getVariantImageEntity(product, variant).imageId
        }
      });
    }
    saveCart();
    renderCart();
    bumpCartCount();
    announce(product.name + ", cor " + variant.name + ", adicionado ao pedido.");
    showToast(
      reachedLimit ? "Quantidade ajustada ao limite" : "Adicionado ao pedido",
      product.name + " • " + variant.name,
      "success"
    );
    closeDialog(dom.productDialog);
  }

  function resolveCartItem(item) {
    var product = findProduct(item.productId);
    var variant = findVariant(product, item.variantId);
    var category = product ? findCategory(product.categoryId) : null;
    return {
      product: product,
      variant: variant,
      name: product ? product.name : item.snapshot.productName,
      categoryName: category ? category.name : item.snapshot.categoryName,
      colorName: variant ? variant.name : item.snapshot.colorName,
      colorHex: variant ? variant.hex : item.snapshot.colorHex,
      unit: product ? product.unit : item.snapshot.unit,
      image: product && variant ? getVariantImageEntity(product, variant).image : item.snapshot.image,
      imageId: product && variant ? getVariantImageEntity(product, variant).imageId : item.snapshot.imageId,
      valid: Boolean(product && variant && variant.available)
    };
  }

  function createSnapshotProduct(resolved) {
    return {
      image: resolved.image || "",
      imageId: resolved.imageId || ""
    };
  }

  function renderCart() {
    dom.cartItems.replaceChildren();
    state.cart.items.forEach(function (item) {
      var resolved = resolveCartItem(item);
      var row = makeElement("article", "cart-item");
      var visual = createPhotoVisual(createSnapshotProduct(resolved), "cart-item-visual", "Sem foto");

      var info = makeElement("div", "cart-item-info");
      var category = makeElement("small", "", resolved.categoryName);
      var title = makeElement("h3", "", resolved.name);
      var color = makeElement("p", "cart-item-color");
      var colorDot = makeElement("i");
      colorDot.style.setProperty("--swatch", resolved.colorHex);
      color.append(colorDot, document.createTextNode(resolved.colorName));

      var bottom = makeElement("div", "cart-item-bottom");
      var control = makeElement("div", "quantity-control");
      var decrease = makeElement("button", "", "−");
      decrease.type = "button";
      decrease.dataset.action = "decrease-cart-qty";
      decrease.dataset.lineId = item.id;
      decrease.setAttribute("aria-label", "Diminuir " + resolved.name);
      var input = document.createElement("input");
      input.type = "number";
      input.value = formatInputNumber(item.quantity);
      input.min = resolved.product ? String(resolved.product.minQuantity) : "0.5";
      input.max = "999";
      input.step = resolved.product ? String(resolved.product.quantityStep) : "0.5";
      input.dataset.action = "cart-qty-input";
      input.dataset.lineId = item.id;
      input.setAttribute("aria-label", "Quantidade de " + resolved.name);
      var increase = makeElement("button", "", "+");
      increase.type = "button";
      increase.dataset.action = "increase-cart-qty";
      increase.dataset.lineId = item.id;
      increase.setAttribute("aria-label", "Aumentar " + resolved.name);
      control.append(decrease, input, increase);
      bottom.append(control, makeElement("span", "", shortUnit(resolved.unit, item.quantity)));
      info.append(category, title, color, bottom);

      var remove = makeElement("button", "remove-cart-item");
      remove.type = "button";
      remove.dataset.action = "remove-cart-item";
      remove.dataset.lineId = item.id;
      remove.setAttribute("aria-label", "Remover " + resolved.name);
      remove.appendChild(makeIcon("fa-solid fa-trash-can"));
      row.append(visual, info, remove);
      if (!resolved.valid) {
        row.classList.add("is-unavailable");
        row.title = "Esta opção não está mais disponível no catálogo.";
      }
      dom.cartItems.appendChild(row);
    });

    var lineCount = state.cart.items.length;
    var empty = lineCount === 0;
    dom.cartEmpty.hidden = !empty;
    dom.cartItems.hidden = empty;
    dom.cartFooter.hidden = empty;
    dom.cartLinesLabel.textContent = lineCount ? "(" + lineCount + ")" : "";
    dom.cartLineCount.textContent = String(lineCount);
    dom.cartTotalQuantity.textContent = formatCartQuantitySummary();
    allBySelector("[data-cart-count]").forEach(function (counter) {
      counter.textContent = String(lineCount);
      counter.setAttribute("aria-label", lineCount + (lineCount === 1 ? " opção no pedido" : " opções no pedido"));
    });
    if (dom.cartTrigger) {
      dom.cartTrigger.setAttribute(
        "aria-label",
        "Abrir pedido, " + lineCount + (lineCount === 1 ? " opção" : " opções")
      );
      dom.cartTrigger.classList.toggle("has-items", lineCount > 0);
    }
    dom.floatingCart.classList.toggle("has-items", lineCount > 0);
    updateFloatingCart();
  }

  function formatCartQuantitySummary() {
    if (!state.cart.items.length) {
      return "0";
    }
    var totals = {};
    state.cart.items.forEach(function (item) {
      var unit = resolveCartItem(item).unit;
      totals[unit] = Number(((totals[unit] || 0) + item.quantity).toFixed(2));
    });
    return Object.keys(totals).map(function (unit) {
      return formatNumber(totals[unit]) + " " + shortUnit(unit, totals[unit]);
    }).join(" • ");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  function pluralUnit(unit, quantity) {
    if (unit === "metro") {
      return Number(quantity) === 1 ? "metro" : "metros";
    }
    if (unit === "unidade") {
      return Number(quantity) === 1 ? "unidade" : "unidades";
    }
    return Number(quantity) === 1 ? "rolo" : "rolos";
  }

  function shortUnit(unit, quantity) {
    if (unit === "metro") {
      return "m";
    }
    if (unit === "unidade") {
      return Number(quantity) === 1 ? "un." : "un.";
    }
    return Number(quantity) === 1 ? "rolo" : "rolos";
  }

  function changeCartQuantity(lineId, direction) {
    var item = state.cart.items.find(function (line) {
      return line.id === lineId;
    });
    if (!item) {
      return;
    }
    var resolved = resolveCartItem(item);
    var step = resolved.product ? resolved.product.quantityStep : 0.5;
    var minimum = resolved.product ? resolved.product.minQuantity : 0.5;
    var next = Number((item.quantity + direction * step).toFixed(2));
    if (next < minimum) {
      removeCartItem(lineId);
      return;
    }
    item.quantity = Math.min(999, next);
    saveCart();
    renderCart();
  }

  function setCartQuantity(lineId, value) {
    var item = state.cart.items.find(function (line) {
      return line.id === lineId;
    });
    if (!item) {
      return;
    }
    var resolved = resolveCartItem(item);
    var product = resolved.product || { minQuantity: 0.5, quantityStep: 0.5 };
    item.quantity = clampProductQuantity(product, value);
    saveCart();
    renderCart();
  }

  function removeCartItem(lineId) {
    var index = state.cart.items.findIndex(function (item) {
      return item.id === lineId;
    });
    if (index < 0) {
      return;
    }
    var resolved = resolveCartItem(state.cart.items[index]);
    state.cart.items.splice(index, 1);
    saveCart();
    renderCart();
    announce(resolved.name + " removido do pedido.");
    showToast("Item removido", resolved.name + " saiu do seu pedido.", "success");
  }

  function bumpCartCount() {
    allBySelector("[data-cart-count]").forEach(function (counter) {
      counter.classList.remove("bump");
      void counter.offsetWidth;
      counter.classList.add("bump");
    });
  }

  function buildWhatsAppMessage() {
    var lines = [
      "Olá, Fio a Fio! 👋",
      "Montei uma seleção pela vitrine do site e gostaria de solicitar um orçamento.",
      "",
      "*MEU PEDIDO*"
    ];
    state.cart.items.forEach(function (item, index) {
      var resolved = resolveCartItem(item);
      lines.push("");
      lines.push((index + 1) + ". *" + resolved.name + "*");
      lines.push("Categoria: " + resolved.categoryName);
      lines.push("Cor: " + resolved.colorName);
      lines.push("Quantidade: " + formatNumber(item.quantity) + " " + pluralUnit(resolved.unit, item.quantity));
    });
    lines.push("");
    lines.push("*Resumo:* " + state.cart.items.length + (state.cart.items.length === 1 ? " opção" : " opções") + " • " + formatCartQuantitySummary());
    lines.push("");
    lines.push("Poderiam confirmar a disponibilidade, os valores e as opções de envio?");
    lines.push("Nome:");
    lines.push("Cidade/UF:");
    return lines.join("\n");
  }

  function checkout() {
    if (!state.cart.items.length) {
      showToast("Pedido vazio", "Escolha ao menos um tecido antes de finalizar.", "error");
      return;
    }
    var unavailable = state.cart.items.some(function (item) {
      return !resolveCartItem(item).valid;
    });
    if (unavailable) {
      showToast("Revise o pedido", "Remova as opções que não estão mais disponíveis.", "error");
      return;
    }
    var message = buildWhatsAppMessage();
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    if (url.length > 7500) {
      showToast("Pedido muito extenso", "Divida a seleção em dois pedidos para enviar pelo WhatsApp.", "error");
      return;
    }
    window.location.assign(url);
  }

  function setActiveCategory(categoryId, scrollToCatalog) {
    if (categoryId !== "all" && !findCategory(categoryId)) {
      categoryId = "all";
    }
    state.activeCategory = categoryId;
    renderCatalog();
    if (scrollToCatalog) {
      bySelector("#tecidos").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clearFilters() {
    state.activeCategory = "all";
    state.search = "";
    dom.search.value = "";
    renderCatalog();
  }

  function setEditorMode(enabled, openManager) {
    state.editorMode = Boolean(enabled);
    try {
      sessionStorage.setItem(STORAGE_KEYS.editor, state.editorMode ? "1" : "0");
    } catch (error) {
      // Editor mode still works during this session.
    }
    document.body.classList.toggle("editor-mode", state.editorMode);
    dom.editorBar.hidden = !state.editorMode;
    allBySelector(".editor-trigger").forEach(function (button) {
      button.setAttribute("aria-pressed", String(state.editorMode));
    });
    if (!state.editorMode && dom.editorDialog.open) {
      closeDialog(dom.editorDialog);
    }
    if (state.editorMode && openManager) {
      renderEditor();
      switchEditorTab("categories");
      openDialog(dom.editorDialog);
    }
  }

  function toggleEditor() {
    setEditorMode(!state.editorMode, !state.editorMode);
  }

  function openEditor() {
    if (!state.editorMode) {
      setEditorMode(true, false);
    }
    renderEditor();
    switchEditorTab("categories");
    openDialog(dom.editorDialog);
  }

  function renderEditor() {
    if (state.editorCategoryId && !findCategory(state.editorCategoryId)) {
      state.editorCategoryId = null;
    }
    renderEditorCategoryList();
    renderEditorProductList();
    renderEditorCategorySummary();
    renderEditorCategorySelect();
    renderEditorStats();
  }

  function renderEditorCategoryList() {
    dom.editorCategoryList.replaceChildren();
    sortedCategories().forEach(function (category) {
      var productCount = state.catalog.products.filter(function (product) {
        return product.categoryId === category.id;
      }).length;
      var row = makeElement("article", "editor-list-item");
      var open = makeElement("button", "editor-item-main");
      open.type = "button";
      open.dataset.action = "open-editor-category";
      open.dataset.categoryId = category.id;
      open.setAttribute("aria-label", "Abrir produtos de " + category.name);
      var preview = makeElement("span", "editor-item-preview");
      renderStoredPhoto(preview, category.imageId, category.image || "", "", "Sem foto");
      var info = makeElement("div", "editor-item-info");
      info.append(
        makeElement("strong", "", category.name),
        makeElement("small", "", productCount + (productCount === 1 ? " tecido" : " tecidos"))
      );
      open.append(preview, info, makeIcon("fa-solid fa-chevron-right"));
      var actions = makeElement("div", "editor-item-actions");
      var edit = makeElement("button");
      edit.type = "button";
      edit.dataset.action = "edit-category";
      edit.dataset.categoryId = category.id;
      edit.setAttribute("aria-label", "Editar " + category.name);
      edit.appendChild(makeIcon("fa-solid fa-pen-to-square"));
      var remove = makeElement("button");
      remove.type = "button";
      remove.dataset.action = "delete-category";
      remove.dataset.categoryId = category.id;
      remove.setAttribute("aria-label", "Excluir " + category.name);
      remove.appendChild(makeIcon("fa-solid fa-trash-can"));
      actions.append(edit, remove);
      row.append(open, actions);
      dom.editorCategoryList.appendChild(row);
    });
  }

  function renderEditorProductList() {
    dom.editorProductList.replaceChildren();
    var category = findCategory(state.editorCategoryId);
    if (!category) {
      dom.editorProductList.appendChild(makeElement("p", "editor-list-empty", "Escolha uma categoria para ver seus produtos."));
      return;
    }
    var products = sortedProducts().filter(function (product) {
      return product.categoryId === category.id;
    });
    if (!products.length) {
      dom.editorProductList.appendChild(makeElement("p", "editor-list-empty", "Esta categoria ainda não tem produtos."));
    }
    products.forEach(function (product) {
      var category = findCategory(product.categoryId);
      var row = makeElement("article", "editor-list-item");
      var preview = makeElement("span", "editor-item-preview");
      renderStoredPhoto(preview, product.imageId, product.image, "", "Sem foto");
      var info = makeElement("div", "editor-item-info");
      info.append(
        makeElement("strong", "", product.name),
        makeElement("small", "", (category ? category.name + " • " : "") + product.variants.length + (product.variants.length === 1 ? " cor" : " cores"))
      );
      var actions = makeElement("div", "editor-item-actions");
      var edit = makeElement("button");
      edit.type = "button";
      edit.dataset.action = "edit-product";
      edit.dataset.productId = product.id;
      edit.setAttribute("aria-label", "Editar " + product.name);
      edit.appendChild(makeIcon("fa-solid fa-pen-to-square"));
      var remove = makeElement("button");
      remove.type = "button";
      remove.dataset.action = "delete-product";
      remove.dataset.productId = product.id;
      remove.setAttribute("aria-label", "Excluir " + product.name);
      remove.appendChild(makeIcon("fa-solid fa-trash-can"));
      actions.append(edit, remove);
      row.append(preview, info, actions);
      dom.editorProductList.appendChild(row);
    });
  }

  function renderEditorCategorySummary() {
    var category = findCategory(state.editorCategoryId);
    if (!category) {
      dom.editorProductPanelTitle.textContent = "Produtos";
      dom.editorProductPanelDescription.textContent = "";
      renderStoredPhoto(dom.editorCategorySummaryPhoto, "", "", "", "Sem foto");
      return;
    }
    dom.editorProductPanelTitle.textContent = category.name;
    dom.editorProductPanelDescription.textContent = category.description || "Sem descrição cadastrada.";
    renderStoredPhoto(dom.editorCategorySummaryPhoto, category.imageId, category.image || "", "", "Sem foto");
  }

  function openEditorCategory(categoryId) {
    var category = findCategory(categoryId);
    if (!category) {
      showToast("Categoria indisponível", "Esta categoria não está mais no catálogo.", "error");
      return;
    }
    state.editorCategoryId = category.id;
    hideCategoryForm();
    hideProductForm();
    renderEditorProductList();
    renderEditorCategorySummary();
    switchEditorTab("products");
  }

  function renderEditorCategorySelect() {
    var current = dom.categorySelect.value;
    dom.categorySelect.replaceChildren();
    sortedCategories().forEach(function (category) {
      var option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      dom.categorySelect.appendChild(option);
    });
    if (current && findCategory(current)) {
      dom.categorySelect.value = current;
    }
  }

  function renderEditorStats() {
    var colorCount = state.catalog.products.reduce(function (total, product) {
      return total + product.variants.length;
    }, 0);
    allBySelector("[data-editor-category-count]").forEach(function (node) {
      node.textContent = String(state.catalog.categories.length);
    });
    allBySelector("[data-editor-product-count]").forEach(function (node) {
      node.textContent = String(state.catalog.products.length);
    });
    bySelector("[data-stat-categories]").textContent = String(state.catalog.categories.length);
    bySelector("[data-stat-products]").textContent = String(state.catalog.products.length);
    bySelector("[data-stat-colors]").textContent = String(colorCount);
  }

  function switchEditorTab(tabName) {
    if (["categories", "products", "data"].indexOf(tabName) < 0) {
      tabName = "categories";
    }
    var selectedTab = tabName === "products" ? "categories" : tabName;
    allBySelector("[data-editor-tab]").forEach(function (button) {
      var active = button.dataset.editorTab === selectedTab;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (button.dataset.editorTab === "categories") {
        button.setAttribute("aria-controls", tabName === "products" ? "editor-panel-products" : "editor-panel-categories");
      }
    });
    allBySelector("[data-editor-panel]").forEach(function (panel) {
      var active = panel.dataset.editorPanel === tabName;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    if (tabName === "categories") {
      state.editorCategoryId = null;
      hideProductForm();
    }
  }

  function resetCategoryForm() {
    dom.categoryForm.reset();
    dom.categoryForm.elements.id.value = "";
    clearPhotoDraft("categoryPhotoDraft");
    renderStoredPhoto(dom.categoryPhotoPreview, "", "", "", "Nenhuma foto selecionada");
    dom.categoryPhotoRemove.hidden = true;
    bySelector("[data-category-form-title]").textContent = "Nova categoria";
    bySelector("[data-error-for='category-name']").textContent = "";
    dom.categoryForm.elements.name.removeAttribute("aria-invalid");
  }

  function showCategoryForm(categoryId) {
    switchEditorTab("categories");
    resetCategoryForm();
    var category = categoryId ? findCategory(categoryId) : null;
    if (category) {
      dom.categoryForm.elements.id.value = category.id;
      dom.categoryForm.elements.name.value = category.name;
      dom.categoryForm.elements.description.value = category.description;
      state.categoryPhotoDraft.existingId = category.imageId || "";
      renderStoredPhoto(dom.categoryPhotoPreview, category.imageId, category.image || "", "Prévia de " + category.name, "Nenhuma foto cadastrada");
      dom.categoryPhotoRemove.hidden = !category.imageId && !category.image;
      bySelector("[data-category-form-title]").textContent = "Editar categoria";
    }
    dom.categoryForm.hidden = false;
    dom.categoryForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(function () {
      dom.categoryForm.elements.name.focus();
    }, 100);
  }

  function hideCategoryForm() {
    dom.categoryForm.hidden = true;
    resetCategoryForm();
  }

  async function submitCategoryForm(event) {
    event.preventDefault();
    if (dom.categoryPhotoPreview.classList.contains("is-processing")) {
      showToast("Aguarde a foto", "A imagem ainda está sendo preparada.", "error");
      return;
    }
    var name = cleanText(dom.categoryForm.elements.name.value, 60);
    var error = bySelector("[data-error-for='category-name']");
    if (!name) {
      error.textContent = "Informe o nome da categoria.";
      dom.categoryForm.elements.name.setAttribute("aria-invalid", "true");
      dom.categoryForm.elements.name.focus();
      return;
    }
    error.textContent = "";
    dom.categoryForm.elements.name.removeAttribute("aria-invalid");
    var previousCatalog = clone(state.catalog);
    var id = dom.categoryForm.elements.id.value;
    var existing = id ? findCategory(id) : null;
    var category = existing || {
      id: makeId("cat"),
      sortOrder: (state.catalog.categories.length + 1) * 10,
      imageId: ""
    };
    var oldImageId = existing ? existing.imageId || "" : "";
    var newImageId = oldImageId;
    var storedImageId = "";
    setSubmitBusy(dom.categoryForm, true);
    try {
      if (state.categoryPhotoDraft.mode === "replace" && state.categoryPhotoDraft.processed) {
        storedImageId = await storeProcessedMedia(state.categoryPhotoDraft.processed);
        newImageId = storedImageId;
      } else if (state.categoryPhotoDraft.mode === "remove") {
        newImageId = "";
      }
      category.name = name;
      category.description = cleanText(dom.categoryForm.elements.description.value, 180);
      category.imageId = newImageId;
      if (state.categoryPhotoDraft.mode === "replace" || state.categoryPhotoDraft.mode === "remove") {
        category.image = "";
      }
      category.imageAlt = name;
      if (!existing) {
        state.catalog.categories.push(category);
      }
      if (commitState(previousCatalog, null)) {
        hideCategoryForm();
        renderAll();
        renderEditor();
        await deleteMediaIfUnused(oldImageId);
        showToast(existing ? "Categoria atualizada" : "Categoria criada", category.name + " já aparece na vitrine.", "success");
      } else {
        if (storedImageId) {
          await mediaDelete(storedImageId);
        }
        renderAll();
        renderEditor();
      }
    } catch (saveError) {
      state.catalog = previousCatalog;
      if (storedImageId) {
        await mediaDelete(storedImageId);
      }
      showToast("Não foi possível salvar", saveError.message || "Tente outra foto.", "error");
      renderAll();
      renderEditor();
    } finally {
      setSubmitBusy(dom.categoryForm, false);
    }
  }

  function deleteCategory(categoryId) {
    var category = findCategory(categoryId);
    if (!category) {
      return;
    }
    if (state.catalog.categories.length === 1) {
      showToast("Ação não permitida", "O catálogo precisa ter ao menos uma categoria.", "error");
      return;
    }
    var products = state.catalog.products.filter(function (product) {
      return product.categoryId === category.id;
    });
    var message = products.length
      ? "A categoria “" + category.name + "” e seus " + products.length + (products.length === 1 ? " tecido serão excluídos. " : " tecidos serão excluídos. ") + "Itens relacionados também sairão do pedido."
      : "A categoria “" + category.name + "” será removida da vitrine.";
    askConfirm("Excluir categoria?", message, async function () {
      var previousCatalog = clone(state.catalog);
      var previousCart = clone(state.cart);
      var previousActiveCategory = state.activeCategory;
      var mediaIds = [category.imageId].concat(products.reduce(function (ids, product) {
        return ids.concat(product.imageId || "", product.variants.map(function (variant) { return variant.imageId || ""; }));
      }, [])).filter(Boolean);
      var productIds = new Set(products.map(function (product) { return product.id; }));
      state.catalog.categories = state.catalog.categories.filter(function (item) {
        return item.id !== category.id;
      });
      state.catalog.products = state.catalog.products.filter(function (product) {
        return product.categoryId !== category.id;
      });
      state.cart.items = state.cart.items.filter(function (item) {
        return !productIds.has(item.productId);
      });
      if (state.activeCategory === category.id) {
        state.activeCategory = "all";
      }
      if (state.editorCategoryId === category.id) {
        state.editorCategoryId = null;
      }
      var saved = commitState(previousCatalog, previousCart);
      if (!saved) {
        state.activeCategory = previousActiveCategory;
      }
      renderAll();
      renderEditor();
      if (saved) {
        switchEditorTab("categories");
        await Promise.all(mediaIds.map(deleteMediaIfUnused));
        showToast("Categoria excluída", category.name + " foi removida da vitrine.", "success");
      }
    });
  }

  function clearVariantPhotoDrafts() {
    state.variantPhotoDrafts.forEach(function (draft) {
      if (draft.previewUrl) {
        URL.revokeObjectURL(draft.previewUrl);
      }
    });
    state.variantPhotoDrafts.clear();
  }

  function renderVariantPhotoDraft(row, draft, label) {
    var preview = bySelector("[data-variant-photo-preview]", row);
    var remove = bySelector("[data-action='remove-variant-photo']", row);
    if (!preview || !draft) {
      return;
    }
    if (draft.mode === "replace") {
      renderStoredPhoto(preview, "", draft.previewUrl, "Prévia da foto de " + (label || "cor"), "Sem foto desta cor");
    } else if (draft.mode === "remove") {
      renderStoredPhoto(preview, "", "", "", "Sem foto desta cor");
    } else {
      renderStoredPhoto(preview, draft.existingId, draft.existingLegacy, "Foto de " + (label || "cor"), "Sem foto desta cor");
    }
    remove.hidden = draft.mode === "keep" && !draft.existingId && !draft.existingLegacy;
  }

  function setVariantPhotoDraftFromFile(row, file) {
    var draftKey = row.dataset.variantDraftKey;
    var previous = state.variantPhotoDrafts.get(draftKey);
    var preview = bySelector("[data-variant-photo-preview]", row);
    var requestId = makeId("photo");
    if (!previous || !preview) {
      return Promise.resolve();
    }
    previous.requestId = requestId;
    preview.dataset.photoRequest = requestId;
    preview.classList.add("is-processing");
    return processImageFile(file).then(function (processed) {
      var current = state.variantPhotoDrafts.get(draftKey);
      if (!current || current.requestId !== requestId) {
        return;
      }
      if (current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      current.mode = "replace";
      current.previewUrl = URL.createObjectURL(processed.blob);
      current.processed = processed;
      renderVariantPhotoDraft(row, current, bySelector("[data-variant-name]", row).value);
    }).catch(function (error) {
      showToast("Foto não adicionada", error.message || "Escolha outra imagem.", "error");
      throw error;
    }).finally(function () {
      if (preview.dataset.photoRequest === requestId) {
        preview.classList.remove("is-processing");
        delete preview.dataset.photoRequest;
      }
    });
  }

  function removeVariantPhotoDraft(row) {
    var draft = state.variantPhotoDrafts.get(row.dataset.variantDraftKey);
    if (!draft) {
      return;
    }
    if (draft.previewUrl) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    draft.mode = "remove";
    draft.previewUrl = "";
    draft.processed = null;
    renderVariantPhotoDraft(row, draft, bySelector("[data-variant-name]", row).value);
  }

  function discardVariantPhotoDraft(row) {
    var draft = state.variantPhotoDrafts.get(row.dataset.variantDraftKey);
    if (draft && draft.previewUrl) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    state.variantPhotoDrafts.delete(row.dataset.variantDraftKey);
  }

  function addColorRow(variant) {
    variant = variant || { id: "", name: "", hex: "#D6B563", image: "", imageId: "" };
    var row = makeElement("div", "color-editor-row");
    row.dataset.variantId = variant.id || "";
    row.dataset.variantDraftKey = makeId("variant-photo");
    state.variantPhotoDrafts.set(row.dataset.variantDraftKey, {
      mode: "keep",
      existingId: variant.imageId || "",
      existingLegacy: variant.image || "",
      previewUrl: "",
      processed: null,
      requestId: makeId("photo")
    });

    var fields = makeElement("div", "color-editor-fields");
    var color = document.createElement("input");
    color.type = "color";
    color.value = isValidHex(variant.hex) ? variant.hex : "#D6B563";
    color.dataset.variantHex = "";
    color.setAttribute("aria-label", "Paleta da cor");
    var name = document.createElement("input");
    name.type = "text";
    name.maxLength = 60;
    name.placeholder = "Nome da cor";
    name.value = variant.name || "";
    name.dataset.variantName = "";
    name.setAttribute("aria-label", "Nome da cor");
    fields.append(color, name);

    var photo = makeElement("div", "variant-photo-control");
    var preview = makeElement("div", "variant-photo-preview");
    preview.dataset.variantPhotoPreview = "";
    var upload = makeElement("label", "variant-photo-upload");
    upload.append(makeIcon("fa-solid fa-camera"), document.createTextNode("Foto da cor"));
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.dataset.variantPhotoInput = "";
    upload.appendChild(input);
    var removePhoto = makeElement("button", "variant-photo-remove");
    removePhoto.type = "button";
    removePhoto.dataset.action = "remove-variant-photo";
    removePhoto.setAttribute("aria-label", "Remover foto desta cor");
    removePhoto.appendChild(makeIcon("fa-solid fa-trash-can"));
    photo.append(preview, upload, removePhoto);

    var remove = makeElement("button", "color-row-remove");
    remove.type = "button";
    remove.dataset.action = "remove-color-row";
    remove.setAttribute("aria-label", "Remover cor");
    remove.appendChild(makeIcon("fa-solid fa-xmark"));
    row.append(fields, photo, remove);
    dom.colorRows.appendChild(row);
    renderVariantPhotoDraft(row, state.variantPhotoDrafts.get(row.dataset.variantDraftKey), variant.name);
  }

  function resetProductForm() {
    dom.productForm.reset();
    dom.productForm.elements.id.value = "";
    clearPhotoDraft("productPhotoDraft");
    clearVariantPhotoDrafts();
    renderStoredPhoto(dom.productPhotoPreview, "", "", "", "Nenhuma foto selecionada");
    dom.productPhotoRemove.hidden = true;
    dom.colorRows.replaceChildren();
    addColorRow();
    bySelector("[data-product-form-title]").textContent = "Novo tecido";
    bySelector("[data-error-for='product-name']").textContent = "";
    bySelector("[data-error-for='product-colors']").textContent = "";
    dom.productForm.elements.name.removeAttribute("aria-invalid");
    bySelector(".variant-editor", dom.productForm).removeAttribute("aria-invalid");
    renderEditorCategorySelect();
  }

  function showProductForm(productId, preferredCategoryId) {
    var product = productId ? findProduct(productId) : null;
    var targetCategoryId = product ? product.categoryId : preferredCategoryId || state.editorCategoryId;
    if (!findCategory(targetCategoryId)) {
      targetCategoryId = sortedCategories()[0].id;
    }
    state.editorCategoryId = targetCategoryId;
    switchEditorTab("products");
    resetProductForm();
    renderEditorProductList();
    renderEditorCategorySummary();
    dom.productForm.elements.categoryId.value = targetCategoryId;
    if (product) {
      dom.productForm.elements.id.value = product.id;
      dom.productForm.elements.name.value = product.name;
      dom.productForm.elements.categoryId.value = product.categoryId;
      dom.productForm.elements.description.value = product.description;
      dom.productForm.elements.unit.value = product.unit;
      state.productPhotoDraft.existingId = product.imageId || "";
      state.productPhotoDraft.existingLegacy = product.image || "";
      renderStoredPhoto(dom.productPhotoPreview, product.imageId, product.image, "Prévia de " + product.name, "Nenhuma foto cadastrada");
      dom.productPhotoRemove.hidden = !(product.imageId || product.image);
      dom.colorRows.replaceChildren();
      product.variants.forEach(function (variant) {
        addColorRow(variant);
      });
      bySelector("[data-product-form-title]").textContent = "Editar tecido";
    }
    dom.productForm.hidden = false;
    dom.productForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(function () {
      dom.productForm.elements.name.focus();
    }, 100);
  }

  function hideProductForm() {
    dom.productForm.hidden = true;
    resetProductForm();
  }

  function collectProductColors() {
    var colors = [];
    var names = new Set();
    allBySelector(".color-editor-row", dom.colorRows).forEach(function (row) {
      var hex = bySelector("[data-variant-hex]", row).value.toUpperCase();
      var name = cleanText(bySelector("[data-variant-name]", row).value, 60);
      if (!name || !isValidHex(hex)) {
        return;
      }
      var normalized = normalizeSearch(name);
      if (names.has(normalized)) {
        return;
      }
      names.add(normalized);
      var draft = state.variantPhotoDrafts.get(row.dataset.variantDraftKey) || {};
      colors.push({
        id: isValidId(row.dataset.variantId) ? row.dataset.variantId : makeId("var"),
        name: name,
        hex: hex,
        available: true,
        image: draft.existingLegacy || "",
        imageId: draft.existingId || "",
        imageAlt: name,
        draftKey: row.dataset.variantDraftKey
      });
    });
    return colors;
  }

  async function submitProductForm(event) {
    event.preventDefault();
    if (dom.productPhotoPreview.classList.contains("is-processing") || bySelector(".variant-photo-preview.is-processing", dom.productForm)) {
      showToast("Aguarde a foto", "A imagem ainda está sendo preparada.", "error");
      return;
    }
    var name = cleanText(dom.productForm.elements.name.value, 80);
    var nameError = bySelector("[data-error-for='product-name']");
    var colorsError = bySelector("[data-error-for='product-colors']");
    if (!name) {
      nameError.textContent = "Informe o nome do tecido.";
      dom.productForm.elements.name.setAttribute("aria-invalid", "true");
      dom.productForm.elements.name.focus();
      return;
    }
    nameError.textContent = "";
    dom.productForm.elements.name.removeAttribute("aria-invalid");
    var colors = collectProductColors();
    if (!colors.length) {
      colorsError.textContent = "Adicione ao menos uma cor com nome.";
      bySelector(".variant-editor", dom.productForm).setAttribute("aria-invalid", "true");
      var firstColorName = bySelector(".color-editor-row input[type='text']", dom.colorRows);
      if (firstColorName) {
        firstColorName.focus();
      }
      return;
    }
    colorsError.textContent = "";
    bySelector(".variant-editor", dom.productForm).removeAttribute("aria-invalid");
    var categoryId = dom.productForm.elements.categoryId.value;
    var category = findCategory(categoryId);
    if (!category) {
      showToast("Categoria inválida", "Escolha uma categoria existente.", "error");
      return;
    }
    var id = dom.productForm.elements.id.value;
    var existing = id ? findProduct(id) : null;
    var previousCatalog = clone(state.catalog);
    var previousCart = clone(state.cart);
    var product = existing || {
      id: makeId("prd"),
      minQuantity: 0.5,
      quantityStep: 0.5,
      sortOrder: (state.catalog.products.length + 1) * 10,
      image: "",
      imageId: ""
    };
    var oldImageId = existing ? existing.imageId || "" : "";
    var oldVariantImageIds = existing ? existing.variants.map(function (variant) { return variant.imageId || ""; }).filter(Boolean) : [];
    var newImageId = oldImageId;
    var storedImageId = "";
    var storedVariantImageIds = [];
    setSubmitBusy(dom.productForm, true);
    try {
      if (state.productPhotoDraft.mode === "replace" && state.productPhotoDraft.processed) {
        storedImageId = await storeProcessedMedia(state.productPhotoDraft.processed);
        newImageId = storedImageId;
      } else if (state.productPhotoDraft.mode === "remove") {
        newImageId = "";
      }
      product.name = name;
      product.categoryId = category.id;
      product.description = cleanText(dom.productForm.elements.description.value, 300);
      product.unit = dom.productForm.elements.unit.value;
      product.minQuantity = product.unit === "metro" ? 0.5 : 1;
      product.quantityStep = product.unit === "metro" ? 0.5 : 1;
      product.imageId = newImageId;
      product.imageAlt = name;
      if (state.productPhotoDraft.mode === "replace" || state.productPhotoDraft.mode === "remove") {
        product.image = "";
      }
      for (var colorIndex = 0; colorIndex < colors.length; colorIndex += 1) {
        var color = colors[colorIndex];
        var draft = state.variantPhotoDrafts.get(color.draftKey);
        if (draft && draft.mode === "replace" && draft.processed) {
          color.imageId = await storeProcessedMedia(draft.processed);
          color.image = "";
          storedVariantImageIds.push(color.imageId);
        } else if (draft && draft.mode === "remove") {
          color.imageId = "";
          color.image = "";
        }
        delete color.draftKey;
      }
      product.variants = colors;
      if (!existing) {
        state.catalog.products.push(product);
      }
      var colorIds = new Set(colors.map(function (variant) { return variant.id; }));
      state.cart.items = state.cart.items.filter(function (item) {
        return item.productId !== product.id || colorIds.has(item.variantId);
      });
      state.cart.items.forEach(function (item) {
        if (item.productId === product.id) {
          var liveVariant = findVariant(product, item.variantId);
          item.quantity = clampProductQuantity(product, item.quantity);
          item.snapshot.productName = product.name;
          item.snapshot.categoryName = category.name;
          item.snapshot.colorName = liveVariant ? liveVariant.name : item.snapshot.colorName;
          item.snapshot.colorHex = liveVariant ? liveVariant.hex : item.snapshot.colorHex;
          item.snapshot.unit = product.unit;
          var cartImage = liveVariant ? getVariantImageEntity(product, liveVariant) : product;
          item.snapshot.image = cartImage.image || "";
          item.snapshot.imageId = cartImage.imageId || "";
        }
      });
      state.editorCategoryId = category.id;
      if (commitState(previousCatalog, previousCart)) {
        hideProductForm();
        renderAll();
        renderEditor();
        switchEditorTab("products");
        await Promise.all([oldImageId].concat(oldVariantImageIds).map(deleteMediaIfUnused));
        showToast(existing ? "Tecido atualizado" : "Tecido adicionado", product.name + " já aparece na vitrine.", "success");
      } else {
        if (storedImageId) {
          await mediaDelete(storedImageId);
        }
        await Promise.all(storedVariantImageIds.map(mediaDelete));
        renderAll();
        renderEditor();
      }
    } catch (saveError) {
      state.catalog = previousCatalog;
      state.cart = previousCart;
      if (storedImageId) {
        await mediaDelete(storedImageId);
      }
      await Promise.all(storedVariantImageIds.map(mediaDelete));
      showToast("Não foi possível salvar", saveError.message || "Tente outra foto.", "error");
      renderAll();
      renderEditor();
    } finally {
      setSubmitBusy(dom.productForm, false);
    }
  }

  function deleteProduct(productId) {
    var product = findProduct(productId);
    if (!product) {
      return;
    }
    askConfirm(
      "Excluir tecido?",
      "“" + product.name + "” e suas cores serão removidos. Se estiver no pedido, também será retirado.",
      async function () {
        var previousCatalog = clone(state.catalog);
        var previousCart = clone(state.cart);
        state.catalog.products = state.catalog.products.filter(function (item) {
          return item.id !== product.id;
        });
        state.cart.items = state.cart.items.filter(function (item) {
          return item.productId !== product.id;
        });
        var saved = commitState(previousCatalog, previousCart);
        renderAll();
        renderEditor();
        if (saved) {
          await Promise.all([product.imageId].concat(product.variants.map(function (variant) { return variant.imageId || ""; })).filter(Boolean).map(deleteMediaIfUnused));
          showToast("Tecido excluído", product.name + " foi removido da vitrine.", "success");
        }
      }
    );
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(reader.error || new Error("Falha ao preparar uma foto para o backup.")); };
      reader.readAsDataURL(blob);
    });
  }

  function dataUrlToBlob(dataUrl) {
    var match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl || "");
    if (!match) {
      throw new Error("O backup contém uma foto inválida.");
    }
    var binary = window.atob(match[2].replace(/\s/g, ""));
    if (binary.length > MAX_IMAGE_BYTES) {
      throw new Error("Uma foto do backup ultrapassa 12 MB.");
    }
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: match[1].toLowerCase() });
  }

  function referencedMediaIds(catalog) {
    var ids = new Set();
    catalog.categories.forEach(function (category) {
      if (category.imageId) { ids.add(category.imageId); }
    });
    catalog.products.forEach(function (product) {
      if (product.imageId) { ids.add(product.imageId); }
    });
    return ids;
  }

  async function exportCatalog() {
    try {
      var ids = referencedMediaIds(state.catalog);
      var records = ids.size ? await mediaGetAll() : [];
      var validRecords = records.filter(function (record) {
        return ids.has(record.id) && record.blob instanceof Blob;
      });
      var foundIds = new Set(validRecords.map(function (record) { return record.id; }));
      var missingIds = Array.from(ids).filter(function (id) { return !foundIds.has(id); });
      if (missingIds.length) {
        throw new Error("Há fotos cadastradas que não puderam ser lidas. Reabra a página e tente novamente.");
      }
      var media = await Promise.all(validRecords.map(async function (record) {
        return {
          id: record.id,
          dataUrl: await blobToDataUrl(record.blob),
          width: Number(record.width) || 0,
          height: Number(record.height) || 0,
          mime: record.blob.type || record.mime || "image/webp",
          originalName: cleanText(record.originalName || "foto", 160),
          createdAt: record.createdAt || new Date().toISOString()
        };
      }));
      var backup = {
        backupVersion: 2,
        exportedAt: new Date().toISOString(),
        catalog: state.catalog,
        media: media
      };
      var json = JSON.stringify(backup, null, 2);
      var blob = new Blob([json], { type: "application/json;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      var date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = "fio-a-fio-backup-" + date + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      showToast("Backup exportado", media.length ? "Catálogo e fotos foram incluídos no arquivo." : "O catálogo foi incluído no arquivo.", "success");
    } catch (error) {
      showToast("Falha ao exportar", error.message || "Não foi possível preparar o backup.", "error");
    }
  }

  function importCatalog(file) {
    if (!file) {
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showToast("Arquivo muito grande", "O backup JSON deve ter no máximo 100 MB.", "error");
      return;
    }
    file.text().then(function (content) {
      var imported;
      var mediaRecords = [];
      try {
        var parsed = JSON.parse(content);
        imported = normalizeCatalog(parsed && parsed.catalog ? parsed.catalog : parsed);
        if (parsed && parsed.catalog && parsed.media !== undefined) {
          if (!Array.isArray(parsed.media) || parsed.media.length > 1100) {
            throw new Error("A lista de fotos do backup é inválida.");
          }
          var seenMedia = new Set();
          mediaRecords = parsed.media.map(function (record) {
            if (!record || !isValidId(record.id) || seenMedia.has(record.id) || typeof record.dataUrl !== "string" || record.dataUrl.length > 18 * 1024 * 1024) {
              throw new Error("O backup contém uma foto inválida ou repetida.");
            }
            seenMedia.add(record.id);
            return record;
          });
        }
      } catch (error) {
        showToast("JSON inválido", error.message || "Não foi possível ler este catálogo.", "error");
        return;
      }
      askConfirm(
        "Importar este catálogo?",
        "A vitrine atual será substituída por " + imported.categories.length + " categorias, " + imported.products.length + " tecidos e " + mediaRecords.length + (mediaRecords.length === 1 ? " foto." : " fotos."),
        async function () {
          var previousCatalog = clone(state.catalog);
          var previousCart = clone(state.cart);
          var previousActiveCategory = state.activeCategory;
          var restoredMedia = new Map();
          var writtenIds = [];
          try {
            for (var index = 0; index < mediaRecords.length; index += 1) {
              var record = mediaRecords[index];
              restoredMedia.set(record.id, await mediaGet(record.id));
              var imageBlob = dataUrlToBlob(record.dataUrl);
              await mediaPut({
                id: record.id,
                blob: imageBlob,
                width: Number(record.width) || 0,
                height: Number(record.height) || 0,
                mime: imageBlob.type,
                originalName: cleanText(record.originalName || "foto", 160),
                createdAt: typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString()
              });
              writtenIds.push(record.id);
            }
            state.catalog = imported;
            state.activeCategory = "all";
            state.editorCategoryId = null;
            reconcileCart();
            if (!commitState(previousCatalog, previousCart)) {
              throw new Error("O catálogo não pôde ser salvo neste navegador.");
            }
            var usedIds = referencedMediaIds(state.catalog);
            var allMedia = await mediaGetAll().catch(function () { return []; });
            await Promise.all(allMedia.filter(function (record) { return !usedIds.has(record.id); }).map(function (record) {
              return mediaDelete(record.id);
            }));
            renderAll();
            renderEditor();
            switchEditorTab("categories");
            showToast("Catálogo importado", "A vitrine e as fotos foram atualizadas com sucesso.", "success");
          } catch (importError) {
            state.catalog = previousCatalog;
            state.cart = previousCart;
            state.activeCategory = previousActiveCategory;
            for (var rollbackIndex = 0; rollbackIndex < writtenIds.length; rollbackIndex += 1) {
              var writtenId = writtenIds[rollbackIndex];
              var oldRecord = restoredMedia.get(writtenId);
              if (oldRecord) {
                await mediaPut(oldRecord);
              } else {
                await mediaDelete(writtenId);
              }
            }
            renderAll();
            renderEditor();
            showToast("Falha ao importar", importError.message || "O backup não pôde ser aplicado.", "error");
          }
        }
      );
    }).catch(function () {
      showToast("Falha na leitura", "Não foi possível abrir este arquivo.", "error");
    }).finally(function () {
      bySelector("[data-import-input]").value = "";
    });
  }

  function resetCatalog() {
    askConfirm(
      "Restaurar catálogo original?",
      "Todas as categorias, tecidos e cores adicionados neste navegador serão substituídos pela demonstração inicial.",
      async function () {
        var previousCatalog = clone(state.catalog);
        var previousCart = clone(state.cart);
        var previousActiveCategory = state.activeCategory;
        state.catalog = normalizeCatalog(clone(DEFAULT_CATALOG));
        state.activeCategory = "all";
        state.editorCategoryId = null;
        reconcileCart();
        var saved = commitState(previousCatalog, previousCart);
        if (!saved) {
          state.activeCategory = previousActiveCategory;
        }
        renderAll();
        renderEditor();
        if (saved) {
          var allMedia = await mediaGetAll().catch(function () { return []; });
          await Promise.all(allMedia.map(function (record) { return mediaDelete(record.id); }));
          switchEditorTab("categories");
          showToast("Catálogo restaurado", "A demonstração inicial está ativa novamente.", "success");
        }
      }
    );
  }

  function reconcileCart() {
    state.cart.items = state.cart.items.filter(function (item) {
      var product = findProduct(item.productId);
      return Boolean(product && findVariant(product, item.variantId));
    });
  }

  function askConfirm(title, message, onAccept) {
    state.pendingConfirm = onAccept;
    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    openDialog(dom.confirmDialog);
  }

  function acceptConfirm() {
    var action = state.pendingConfirm;
    state.pendingConfirm = null;
    closeDialog(dom.confirmDialog);
    if (typeof action === "function") {
      action();
    }
  }

  function cancelConfirm() {
    state.pendingConfirm = null;
    closeDialog(dom.confirmDialog);
  }

  function renderAll() {
    renderCategories();
    renderCatalog();
    renderCart();
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) {
      return;
    }
    dialog.showModal();
    syncDialogBody();
  }

  function closeDialog(dialog) {
    if (!dialog || !dialog.open) {
      return;
    }
    dialog.close();
    window.setTimeout(syncDialogBody, 0);
  }

  function syncDialogBody() {
    document.body.classList.toggle("dialog-open", Boolean(bySelector("dialog[open]")));
  }

  function announce(message) {
    dom.liveRegion.textContent = "";
    window.setTimeout(function () {
      dom.liveRegion.textContent = message;
    }, 30);
  }

  function showToast(title, message, type) {
    if (!dom.toastRegion) {
      return;
    }
    var toast = makeElement("div", "toast");
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    var icon = makeElement("span", "toast-icon");
    if (type === "error") {
      icon.appendChild(makeIcon("fa-solid fa-circle-exclamation"));
    } else {
      icon.appendChild(makeIcon("fa-solid fa-check"));
    }
    var copy = makeElement("div");
    copy.append(makeElement("strong", "", title), makeElement("p", "", message));
    toast.append(icon, copy);
    dom.toastRegion.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add("is-leaving");
      window.setTimeout(function () {
        toast.remove();
      }, 320);
    }, 3900);
  }

  function toggleMenu(force) {
    var shouldOpen = typeof force === "boolean" ? force : !dom.mobileMenu.classList.contains("is-open");
    dom.mobileMenu.classList.toggle("is-open", shouldOpen);
    dom.mobileMenu.inert = !shouldOpen;
    dom.mobileMenu.setAttribute("aria-hidden", String(!shouldOpen));
    dom.menuToggle.setAttribute("aria-expanded", String(shouldOpen));
    dom.menuToggle.setAttribute("aria-label", shouldOpen ? "Fechar menu" : "Abrir menu");
    var icon = bySelector("i", dom.menuToggle);
    if (icon) {
      icon.classList.toggle("fa-bars", !shouldOpen);
      icon.classList.toggle("fa-xmark", shouldOpen);
    }
  }

  function updateFloatingCart() {
    var visible = window.scrollY > 540 || state.cart.items.length > 0;
    dom.floatingCart.classList.toggle("is-visible", visible);
    dom.floatingCart.tabIndex = visible ? 0 : -1;
    dom.floatingCart.setAttribute("aria-hidden", String(!visible));
  }

  function handleScroll() {
    var scrollY = window.scrollY;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    dom.progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, progress)) + ")";
    dom.siteHeader.classList.toggle("is-scrolled", scrollY > 24);

    var menuOpen = dom.mobileMenu.classList.contains("is-open");
    var scrollingDown = scrollY > state.lastScrollY;
    dom.siteHeader.classList.toggle("is-hidden", scrollingDown && scrollY > 260 && !menuOpen);
    state.lastScrollY = Math.max(0, scrollY);

    updateFloatingCart();
    state.scrollTicking = false;
  }

  function onScroll() {
    if (!state.scrollTicking) {
      state.scrollTicking = true;
      window.requestAnimationFrame(handleScroll);
    }
  }

  function setupObservers() {
    allBySelector(".hero .reveal").forEach(function (node) {
      node.classList.add("is-visible");
    });

    if ("IntersectionObserver" in window) {
      animationObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.style.transitionDelay = "";
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

      allBySelector(".reveal").forEach(function (node) {
        if (!node.closest(".hero")) {
          animationObserver.observe(node);
        }
      });

      sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          var activeSectionId = entry.target.id === "categorias" ? "tecidos" : entry.target.id;
          allBySelector(".nav-link").forEach(function (link) {
            var isActive = link.getAttribute("href") === "#" + activeSectionId;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      }, { threshold: 0.18, rootMargin: "-18% 0px -60% 0px" });

      ["inicio", "categorias", "tecidos", "como-pedir", "sobre", "contato"].forEach(function (id) {
        var section = document.getElementById(id);
        if (section) {
          sectionObserver.observe(section);
        }
      });
    } else {
      allBySelector(".reveal").forEach(function (node) {
        node.classList.add("is-visible");
      });
    }
  }

  function handleAction(button, event) {
    var action = button.dataset.action;
    switch (action) {
      case "focus-search":
        bySelector("#tecidos").scrollIntoView({ behavior: "smooth" });
        window.setTimeout(function () { dom.search.focus(); }, 500);
        break;
      case "toggle-editor":
        toggleEditor();
        toggleMenu(false);
        break;
      case "open-editor":
        openEditor();
        break;
      case "close-editor":
        closeDialog(dom.editorDialog);
        break;
      case "toggle-menu":
        toggleMenu();
        break;
      case "open-cart":
        renderCart();
        openDialog(dom.cartDialog);
        break;
      case "close-cart":
        closeDialog(dom.cartDialog);
        break;
      case "continue-shopping":
        closeDialog(dom.cartDialog);
        bySelector("#tecidos").scrollIntoView({ behavior: "smooth" });
        break;
      case "select-category":
      case "filter-category":
        setActiveCategory(button.dataset.categoryId, action === "select-category");
        break;
      case "clear-filters":
        clearFilters();
        break;
      case "open-product":
        openProduct(button.dataset.productId);
        break;
      case "close-product":
        closeDialog(dom.productDialog);
        break;
      case "select-color":
        selectColor(button.dataset.variantId);
        break;
      case "decrease-product-qty":
        changeProductQuantity(-1);
        break;
      case "increase-product-qty":
        changeProductQuantity(1);
        break;
      case "add-to-cart":
        addCurrentProductToCart();
        break;
      case "decrease-cart-qty":
        changeCartQuantity(button.dataset.lineId, -1);
        break;
      case "increase-cart-qty":
        changeCartQuantity(button.dataset.lineId, 1);
        break;
      case "remove-cart-item":
        removeCartItem(button.dataset.lineId);
        break;
      case "checkout":
        checkout();
        break;
      case "new-category":
        showCategoryForm();
        break;
      case "edit-category":
        if (!state.editorMode) {
          setEditorMode(true, false);
        }
        if (!dom.editorDialog.open) {
          renderEditor();
          openDialog(dom.editorDialog);
        }
        showCategoryForm(button.dataset.categoryId);
        break;
      case "cancel-category-form":
        hideCategoryForm();
        break;
      case "delete-category":
        deleteCategory(button.dataset.categoryId);
        break;
      case "open-editor-category":
        openEditorCategory(button.dataset.categoryId);
        break;
      case "back-editor-categories":
        switchEditorTab("categories");
        break;
      case "edit-current-category":
        if (state.editorCategoryId) {
          showCategoryForm(state.editorCategoryId);
        }
        break;
      case "new-product-in-category":
        showProductForm(null, state.editorCategoryId);
        break;
      case "edit-product":
        if (!state.editorMode) {
          setEditorMode(true, false);
        }
        if (!dom.editorDialog.open) {
          renderEditor();
          openDialog(dom.editorDialog);
        }
        showProductForm(button.dataset.productId);
        break;
      case "cancel-product-form":
        hideProductForm();
        break;
      case "delete-product":
        deleteProduct(button.dataset.productId);
        break;
      case "add-color-row":
        addColorRow();
        break;
      case "remove-color-row":
        if (dom.colorRows.children.length === 1) {
          showToast("Mantenha uma cor", "Cada tecido precisa de ao menos uma opção.", "error");
        } else if (isValidId(button.closest(".color-editor-row").dataset.variantId)) {
          askConfirm("Remover esta cor?", "A cor será excluída quando você salvar o produto.", function () {
            var row = button.closest(".color-editor-row");
            discardVariantPhotoDraft(row);
            row.remove();
          });
        } else {
          var newRow = button.closest(".color-editor-row");
          discardVariantPhotoDraft(newRow);
          newRow.remove();
        }
        break;
      case "remove-variant-photo":
        removeVariantPhotoDraft(button.closest(".color-editor-row"));
        break;
      case "remove-category-photo":
        markPhotoForRemoval("categoryPhotoDraft", dom.categoryPhotoInput, dom.categoryPhotoPreview, dom.categoryPhotoRemove, "a categoria");
        break;
      case "remove-product-photo":
        markPhotoForRemoval("productPhotoDraft", dom.productPhotoInput, dom.productPhotoPreview, dom.productPhotoRemove, "o produto");
        break;
      case "export-catalog":
        exportCatalog();
        break;
      case "reset-catalog":
        resetCatalog();
        break;
      case "cancel-confirm":
        cancelConfirm();
        break;
      case "accept-confirm":
        acceptConfirm();
        break;
      default:
        break;
    }
  }

  function setupEvents() {
    document.addEventListener("click", function (event) {
      var actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        handleAction(actionButton, event);
      }
      var navLink = event.target.closest(".mobile-menu a");
      if (navLink) {
        toggleMenu(false);
      }
    });

    dom.search.addEventListener("input", function () {
      state.search = dom.search.value;
      renderProducts();
    });

    dom.productQuantity.addEventListener("change", function () {
      var product = findProduct(state.currentProductId);
      if (product) {
        dom.productQuantity.value = formatInputNumber(clampProductQuantity(product, dom.productQuantity.value));
      }
    });

    document.addEventListener("change", function (event) {
      if (event.target.matches("[data-action='cart-qty-input']")) {
        setCartQuantity(event.target.dataset.lineId, event.target.value);
      }
      if (event.target.matches("[data-import-input]")) {
        importCatalog(event.target.files && event.target.files[0]);
      }
      if (event.target.matches("[data-category-photo-input]")) {
        var categoryFile = event.target.files && event.target.files[0];
        if (categoryFile) {
          event.target.disabled = true;
          setSubmitBusy(dom.categoryForm, true);
          setPhotoDraftFromFile("categoryPhotoDraft", categoryFile, dom.categoryPhotoPreview, dom.categoryPhotoRemove).catch(function () {
            dom.categoryPhotoInput.value = "";
          }).finally(function () {
            dom.categoryPhotoInput.disabled = false;
            setSubmitBusy(dom.categoryForm, false);
          });
        }
      }
      if (event.target.matches("[data-product-photo-input]")) {
        var productFile = event.target.files && event.target.files[0];
        if (productFile) {
          event.target.disabled = true;
          setSubmitBusy(dom.productForm, true);
          setPhotoDraftFromFile("productPhotoDraft", productFile, dom.productPhotoPreview, dom.productPhotoRemove).catch(function () {
            dom.productPhotoInput.value = "";
          }).finally(function () {
            dom.productPhotoInput.disabled = false;
            setSubmitBusy(dom.productForm, false);
          });
        }
      }
      if (event.target.matches("[data-variant-photo-input]")) {
        var variantFile = event.target.files && event.target.files[0];
        var variantRow = event.target.closest(".color-editor-row");
        if (variantFile && variantRow) {
          event.target.disabled = true;
          setSubmitBusy(dom.productForm, true);
          setVariantPhotoDraftFromFile(variantRow, variantFile).catch(function () {
            event.target.value = "";
          }).finally(function () {
            event.target.disabled = false;
            setSubmitBusy(dom.productForm, false);
          });
        }
      }
    });

    allBySelector("[data-editor-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        switchEditorTab(button.dataset.editorTab);
      });
    });

    bySelector(".editor-tabs").addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      var tabs = allBySelector("[data-editor-tab]");
      var current = tabs.findIndex(function (tab) {
        return tab.getAttribute("aria-selected") === "true";
      });
      var direction = event.key === "ArrowRight" ? 1 : -1;
      var next = (current + direction + tabs.length) % tabs.length;
      switchEditorTab(tabs[next].dataset.editorTab);
      tabs[next].focus();
    });

    dom.categoryForm.addEventListener("submit", submitCategoryForm);
    dom.productForm.addEventListener("submit", submitProductForm);

    [dom.productDialog, dom.cartDialog, dom.editorDialog, dom.confirmDialog].forEach(function (dialog) {
      dialog.addEventListener("close", syncDialogBody);
      dialog.addEventListener("cancel", function (event) {
        if (dialog === dom.confirmDialog) {
          state.pendingConfirm = null;
        }
        window.setTimeout(syncDialogBody, 0);
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          if (dialog === dom.confirmDialog) {
            cancelConfirm();
          } else {
            closeDialog(dialog);
          }
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        closeDialog(dom.cartDialog);
        bySelector("#tecidos").scrollIntoView({ behavior: "smooth" });
        window.setTimeout(function () {
          dom.search.focus();
        }, 450);
      }
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateFloatingCart, { passive: true });
    window.addEventListener("beforeunload", function () {
      revokeAllMediaUrls();
      if (mediaChannel) {
        mediaChannel.close();
      }
    });
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEYS.catalog && event.newValue) {
        try {
          state.catalog = normalizeCatalog(JSON.parse(event.newValue));
          if (state.activeCategory !== "all" && !findCategory(state.activeCategory)) {
            state.activeCategory = "all";
          }
          renderAll();
          if (dom.editorDialog.open) {
            renderEditor();
          }
          showToast("Vitrine sincronizada", "Uma alteração feita em outra aba foi carregada.", "success");
        } catch (error) {
          // Ignore invalid cross-tab data.
        }
      }
      if (event.key === STORAGE_KEYS.cart && event.newValue) {
        try {
          state.cart = normalizeCart(JSON.parse(event.newValue));
          renderCart();
        } catch (error) {
          // Ignore invalid cross-tab data.
        }
      }
    });
  }

  function setupMediaSync() {
    if (!("BroadcastChannel" in window)) {
      return;
    }
    mediaChannel = new BroadcastChannel("fioafio-media-sync");
    mediaChannel.addEventListener("message", function (event) {
      var id = event.data && event.data.id;
      if (isValidId(id)) {
        revokeMediaUrl(id);
      }
      renderAll();
      if (dom.editorDialog.open) {
        renderEditor();
      }
    });
  }

  function initStaticContent() {
    var currentYear = new Date().getFullYear();
    allBySelector("[data-current-year]").forEach(function (node) {
      node.textContent = String(currentYear);
    });
    var years = Math.max(1, currentYear - 2013);
    allBySelector("[data-years]").forEach(function (node) {
      node.textContent = String(years);
    });
  }

  function init() {
    cacheDom();
    state.catalog = loadCatalog();
    state.cart = loadCart();
    try {
      state.editorMode = sessionStorage.getItem(STORAGE_KEYS.editor) === "1";
    } catch (error) {
      state.editorMode = false;
    }
    setupObservers();
    setupMediaSync();
    renderAll();
    renderEditor();
    setEditorMode(state.editorMode, false);
    initStaticContent();
    setupEvents();
    handleScroll();
  }

  init();
})();
