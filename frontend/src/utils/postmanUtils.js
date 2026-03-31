import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Converts internal collection format to Postman Collection v2.1.0
 */
export const convertToPostmanCollection = (collection) => {
  const postmanCollection = {
    info: {
      _postman_id: collection.id || Math.random().toString(36).substr(2, 9),
      name: collection.name,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: (collection.requests || []).map(req => {
      // Basic URL decomposition for Postman compatibility
      let urlObj = { raw: req.url };
      try {
        const url = new URL(req.url);
        urlObj = {
          raw: req.url,
          protocol: url.protocol.replace(':', ''),
          host: url.hostname.split('.'),
          path: url.pathname.split('/').filter(p => p),
          port: url.port || undefined,
          query: Array.from(url.searchParams.entries()).map(([key, value]) => ({ key, value }))
        };
      } catch (e) {
        // Fallback for invalid URLs
      }

      return {
        name: req.name || req.url,
        request: {
          method: req.method,
          header: (req.headers || []).filter(h => h.key && h.enabled !== false).map(h => ({
            key: h.key,
            value: h.value,
            type: "text"
          })),
          body: req.body ? {
            mode: "raw",
            raw: typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2),
            options: {
              raw: {
                language: "json"
              }
            }
          } : undefined,
          url: urlObj
        },
        response: []
      };
    })
  };

  return postmanCollection;
};

/**
 * Generates and opens the share dialog for a Postman collection JSON
 */
export const shareCollection = async (collection) => {
  try {
    const postmanJson = convertToPostmanCollection(collection);
    const fileName = `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.postman_collection.json`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(postmanJson, null, 2));
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: `Export ${collection.name}`,
        UTI: 'public.json'
      });
    } else {
      console.error("Sharing is not available on this platform");
      // Fallback or alert could be added here if needed for web
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
};
