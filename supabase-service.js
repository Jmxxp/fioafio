(function () {
  "use strict";

  var LIBRARY_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  var config = window.FIOAFIO_SUPABASE_CONFIG || {};
  var client = null;
  var libraryPromise = null;
  var editorEnabled = false;

  function configured() {
    if (
      typeof config.url !== "string" ||
      typeof config.publishableKey !== "string" ||
      config.publishableKey.trim().length <= 20
    ) {
      return false;
    }
    try {
      return new URL(config.url.trim()).protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  function loadLibrary() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve();
    }
    if (libraryPromise) {
      return libraryPromise;
    }
    libraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = LIBRARY_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = function () {
        if (window.supabase && typeof window.supabase.createClient === "function") {
          resolve();
        } else {
          reject(new Error("A biblioteca do Supabase não foi carregada."));
        }
      };
      script.onerror = function () {
        reject(new Error("Não foi possível carregar a conexão com o Supabase."));
      };
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  function publicImageUrl(path, fallbackUrl) {
    if (!path || !client) {
      return fallbackUrl || "";
    }
    return client.storage.from(config.bucket || "catalog-images").getPublicUrl(path).data.publicUrl;
  }

  function toCategory(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description || "",
      image: publicImageUrl(row.image_path, row.image_url),
      imageId: "",
      imagePath: row.image_path || "",
      imageAlt: row.image_alt || row.name,
      sortOrder: Number(row.sort_order) || 0
    };
  }

  function toProduct(row) {
    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description || "",
      unit: row.unit || "metro",
      minQuantity: Number(row.min_quantity) || 0.5,
      quantityStep: Number(row.quantity_step) || 0.5,
      image: publicImageUrl(row.image_path, row.image_url),
      imageId: "",
      imagePath: row.image_path || "",
      imageAlt: row.image_alt || row.name,
      sortOrder: Number(row.sort_order) || 0,
      variants: [{
        id: "var_" + row.id.replace(/[^A-Za-z0-9_-]/g, ""),
        name: "Padrão",
        hex: "#777777",
        available: row.active !== false,
        image: "",
        imageId: "",
        imageAlt: row.name
      }]
    };
  }

  function categoryRow(category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description || "",
      image_path: category.imagePath || null,
      image_url: category.imagePath ? null : category.image || null,
      image_alt: category.imageAlt || category.name,
      sort_order: Number(category.sortOrder) || 0,
      active: true
    };
  }

  function productRow(product) {
    return {
      id: product.id,
      category_id: product.categoryId,
      name: product.name,
      description: product.description || "",
      unit: product.unit || "metro",
      min_quantity: Number(product.minQuantity) || 0.5,
      quantity_step: Number(product.quantityStep) || 0.5,
      image_path: product.imagePath || null,
      image_url: product.imagePath ? null : product.image || null,
      image_alt: product.imageAlt || product.name,
      sort_order: Number(product.sortOrder) || 0,
      active: true
    };
  }

  async function init() {
    if (!configured()) {
      return { configured: false, editor: false };
    }
    await loadLibrary();
    client = window.supabase.createClient(config.url.trim(), config.publishableKey.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    return { configured: true, editor: editorEnabled };
  }

  function setEditorEnabled(enabled) {
    editorEnabled = Boolean(enabled);
  }

  async function loadCatalog() {
    if (!client) {
      return null;
    }
    var results = await Promise.all([
      client.from("categories").select("*").order("sort_order", { ascending: true }),
      client.from("products").select("*").order("sort_order", { ascending: true })
    ]);
    if (results[0].error) {
      throw results[0].error;
    }
    if (results[1].error) {
      throw results[1].error;
    }
    if (!results[0].data.length) {
      return null;
    }
    return {
      schemaVersion: 2,
      revision: Date.now(),
      imageSeedVersion: 0,
      updatedAt: new Date().toISOString(),
      categories: results[0].data.map(toCategory),
      products: results[1].data.map(toProduct)
    };
  }

  function requireEditor() {
    if (!client || !editorEnabled) {
      throw new Error("Ative o modo editor para alterar o catálogo.");
    }
  }

  async function saveCategory(category) {
    requireEditor();
    var result = await client.from("categories").upsert(categoryRow(category), { onConflict: "id" });
    if (result.error) {
      throw result.error;
    }
  }

  async function saveProduct(product) {
    requireEditor();
    var result = await client.from("products").upsert(productRow(product), { onConflict: "id" });
    if (result.error) {
      throw result.error;
    }
  }

  async function deleteCategory(id) {
    requireEditor();
    var result = await client.from("categories").delete().eq("id", id);
    if (result.error) {
      throw result.error;
    }
  }

  async function deleteProduct(id) {
    requireEditor();
    var result = await client.from("products").delete().eq("id", id);
    if (result.error) {
      throw result.error;
    }
  }

  async function uploadImage(kind, entityId, processed) {
    requireEditor();
    var extension = processed.mime === "image/jpeg" ? "jpg" : "webp";
    var path = kind + "/" + entityId + "-" + Date.now() + "." + extension;
    var result = await client.storage
      .from(config.bucket || "catalog-images")
      .upload(path, processed.blob, {
        cacheControl: "31536000",
        contentType: processed.mime,
        upsert: false
      });
    if (result.error) {
      throw result.error;
    }
    return {
      path: result.data.path,
      publicUrl: publicImageUrl(result.data.path, "")
    };
  }

  async function deleteImage(path) {
    requireEditor();
    if (!path) {
      return;
    }
    var result = await client.storage.from(config.bucket || "catalog-images").remove([path]);
    if (result.error) {
      throw result.error;
    }
  }

  async function syncCatalog(catalog) {
    requireEditor();
    if (!catalog.categories.length) {
      return;
    }
    var categoryResult = await client
      .from("categories")
      .upsert(catalog.categories.map(categoryRow), { onConflict: "id" });
    if (categoryResult.error) {
      throw categoryResult.error;
    }
    if (catalog.products.length) {
      var productResult = await client
        .from("products")
        .upsert(catalog.products.map(productRow), { onConflict: "id" });
      if (productResult.error) {
        throw productResult.error;
      }
    }
  }

  window.FioAFioBackend = {
    init: init,
    isConfigured: configured,
    isEditorEnabled: function () { return editorEnabled; },
    setEditorEnabled: setEditorEnabled,
    loadCatalog: loadCatalog,
    saveCategory: saveCategory,
    saveProduct: saveProduct,
    deleteCategory: deleteCategory,
    deleteProduct: deleteProduct,
    uploadImage: uploadImage,
    deleteImage: deleteImage,
    syncCatalog: syncCatalog
  };
})();
