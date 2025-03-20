/**
 * Script para atualizar referências de autenticação no frontend
 * Este script atualiza as importações e referências a "Client" para "User"
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);

// Diretórios a serem verificados
const directories = [
  path.join(__dirname, '..', 'services'),
  path.join(__dirname, '..', 'store'),
  path.join(__dirname, '..', 'utils'),
  path.join(__dirname, '..', 'app'),
  path.join(__dirname, '..', 'components')
];

// Extensões de arquivos a serem verificados
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Padrões a serem substituídos
const replacements = [
  { from: /client\./gi, to: 'user.' },
  { from: /Client\./g, to: 'User.' },
  { from: /\.client/gi, to: '.user' },
  { from: /\.Client/g, to: '.User' },
  { from: /role: 'client'/g, to: "role: 'user'" },
  { from: /role === 'client'/g, to: "role === 'user'" },
  { from: /role !== 'client'/g, to: "role !== 'user'" },
  { from: /role: "client"/g, to: 'role: "user"' },
  { from: /role === "client"/g, to: 'role === "user"' },
  { from: /role !== "client"/g, to: 'role !== "user"' },
  { from: /clientModel/g, to: 'userModel' },
  { from: /ClientModel/g, to: 'UserModel' },
  { from: /client_model/g, to: 'user_model' },
  { from: /Client model/g, to: 'User model' },
  { from: /client model/g, to: 'user model' },
  { from: /require\(['"]\.\.\/models\/clientModel['"]\)/g, to: "require('../models/userModel')" },
  { from: /import.*from ['"]\.\.\/models\/clientModel['"]/g, to: "import User from '../models/userModel'" },
  { from: /const Client = require\(['"]\.\.\/models\/clientModel['"]\)/g, to: "const User = require('../models/userModel')" }
];

// Função para verificar se um arquivo deve ser processado
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return fileExtensions.includes(ext);
}

// Função para processar um arquivo
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let changed = false;

    // Aplicar substituições
    for (const replacement of replacements) {
      const originalContent = newContent;
      newContent = newContent.replace(replacement.from, replacement.to);
      if (originalContent !== newContent) {
        changed = true;
      }
    }

    // Se houve alterações, escrever o novo conteúdo
    if (changed) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Atualizado: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`Erro ao processar arquivo ${filePath}:`, error);
    return 0;
  }
}

// Função para processar um diretório recursivamente
async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    let count = 0;

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Ignorar node_modules e .git
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          count += await processDirectory(fullPath);
        }
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        count += await processFile(fullPath);
      }
    }

    return count;
  } catch (error) {
    console.error(`Erro ao processar diretório ${dirPath}:`, error);
    return 0;
  }
}

// Função principal
async function main() {
  console.log('Iniciando atualização de referências de autenticação...');
  let totalUpdated = 0;

  for (const directory of directories) {
    try {
      const dirStat = await stat(directory);
      if (dirStat.isDirectory()) {
        console.log(`Processando diretório: ${directory}`);
        const updated = await processDirectory(directory);
        totalUpdated += updated;
        console.log(`${updated} arquivos atualizados em ${directory}`);
      }
    } catch (error) {
      console.error(`Erro ao verificar diretório ${directory}:`, error);
    }
  }

  console.log(`\nAtualização concluída! ${totalUpdated} arquivos foram atualizados.`);
}

// Executar a função principal
main().catch(error => {
  console.error('Erro ao executar o script:', error);
  process.exit(1);
});
