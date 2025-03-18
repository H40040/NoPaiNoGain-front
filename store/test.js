// Arquivo de teste para verificar a configuração do Redux
import { store } from './index';

console.log('Store configurado:', store);
console.log('Reducers registrados:', Object.keys(store.getState()));

// Exportar para poder importar em outros arquivos
export const testStore = () => {
  console.log('Teste do store executado');
  return store;
};
