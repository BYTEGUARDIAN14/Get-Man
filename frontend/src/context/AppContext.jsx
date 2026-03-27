import React, { createContext, useReducer, useEffect, useRef, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'apiplayground_state';

const initialState = {
  collections: [
    {
      id: '1', name: 'JSONPlaceholder', color: '#3D6B4F',
      requests: [
        { id: 'r1', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts', name: 'Get Posts' },
        { id: 'r2', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users', name: 'Get Users' },
        { id: 'r3', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', name: 'Create Post' },
      ],
    },
    {
      id: '2', name: 'httpbin', color: '#3D5470',
      requests: [
        { id: 'r4', method: 'GET', url: 'https://httpbin.org/get', name: 'GET Test' },
        { id: 'r5', method: 'POST', url: 'https://httpbin.org/post', name: 'POST Test' },
      ],
    },
  ],
  history: [],
  environments: [
    { id: 'e1', name: 'Development', variables: [{ key: 'BASE_URL', value: 'https://jsonplaceholder.typicode.com' }, { key: 'API_KEY', value: 'dev-key-123' }] },
    { id: 'e2', name: 'Production', variables: [{ key: 'BASE_URL', value: 'https://api.example.com' }, { key: 'API_KEY', value: 'prod-key-456' }] },
  ],
  activeEnvId: 'e1',
  settings: {
    accentColor: '#5A7A5C',
    timeout: 30,
    sslVerification: true,
    followRedirects: true,
    aiEnabled: true,
    aiModel: 'gemini-pro',
    aiLanguage: 'English',
  },
  currentResponse: null,
  currentRequest: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'ADD_TO_HISTORY':
      return { ...state, history: [action.payload, ...state.history].slice(0, 100) };
    case 'DELETE_HISTORY_ITEM':
      return { ...state, history: state.history.filter(h => h.id !== action.payload) };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] };
    case 'DELETE_COLLECTION':
      return { ...state, collections: state.collections.filter(c => c.id !== action.payload) };
    case 'ADD_REQUEST_TO_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === action.payload.collectionId
            ? { ...c, requests: [...c.requests, action.payload.request] }
            : c
        ),
      };
    case 'REMOVE_REQUEST_FROM_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === action.payload.collectionId
            ? { ...c, requests: c.requests.filter(r => r.id !== action.payload.requestId) }
            : c
        ),
      };
    case 'SET_ACTIVE_ENV':
      return { ...state, activeEnvId: action.payload };
    case 'ADD_ENVIRONMENT':
      return { ...state, environments: [...state.environments, action.payload] };
    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        environments: state.environments.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'DELETE_ENVIRONMENT':
      return { ...state, environments: state.environments.filter(e => e.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_CURRENT_RESPONSE':
      return { ...state, currentResponse: action.payload };
    case 'SET_CURRENT_REQUEST':
      return { ...state, currentRequest: action.payload };
    default:
      return state;
  }
}

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        }
      } catch (e) {
        console.error('Failed to load state:', e);
      }
      isLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded.current) return;
    const toSave = { ...state };
    delete toSave.currentResponse;
    delete toSave.currentRequest;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(e =>
      console.error('Failed to save state:', e)
    );
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useTheme() {
  const { state } = useContext(AppContext);
  return { accent: state.settings?.accentColor || '#5A7A5C' };
}
