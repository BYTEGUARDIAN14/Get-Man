import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

export function useRequest() {
  const [loading, setLoading] = useState(false);
  const { dispatch, state } = useContext(AppContext);

  const sendRequest = useCallback(async ({ method, url, headers = {}, params = {}, body, authType, authValues, timeout }) => {
    setLoading(true);
    const startTime = Date.now();
    const effectiveTimeout = (timeout || state.settings.timeout) * 1000;
    try {
      const finalHeaders = { ...headers };
      if (authType === 'bearer' && authValues?.token) {
        finalHeaders['Authorization'] = 'Bearer ' + authValues.token;
      } else if (authType === 'basic' && authValues?.username) {
        const encoded = btoa(authValues.username + ':' + (authValues.password || ''));
        finalHeaders['Authorization'] = 'Basic ' + encoded;
      } else if (authType === 'apikey' && authValues?.key) {
        if (authValues.location === 'Header') {
          finalHeaders[authValues.keyName || 'X-API-Key'] = authValues.key;
        }
      }

      const config = {
        method: method.toLowerCase(),
        url,
        headers: finalHeaders,
        params,
        timeout: effectiveTimeout,
        validateStatus: () => true,
      };

      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body) {
        if (typeof body === 'string') {
          try { config.data = JSON.parse(body); } catch { config.data = body; }
        } else {
          config.data = body;
        }
      }

      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      const responseSize = JSON.stringify(response.data).length;

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.data,
        time: responseTime,
        size: responseSize,
      };

      const historyItem = {
        id: Date.now().toString(),
        method, url,
        status: response.status,
        time: responseTime,
        size: responseSize,
        timestamp: new Date().toISOString(),
        responseData: result,
        requestData: { method, url, headers: finalHeaders, params, body },
      };
      dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem });
      return { response: result, error: null };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorResult = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || error.message,
        headers: error.response?.headers || {},
        body: error.response?.data || { error: error.message },
        time: responseTime,
        size: 0,
      };
      const historyItem = {
        id: Date.now().toString(),
        method, url,
        status: errorResult.status,
        time: responseTime,
        size: 0,
        timestamp: new Date().toISOString(),
        responseData: errorResult,
        requestData: { method, url, headers, params, body },
      };
      dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem });
      return { response: errorResult, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [dispatch, state.settings.timeout]);

  return { sendRequest, loading };
}
