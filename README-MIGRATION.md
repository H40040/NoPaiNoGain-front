# Migração e Consolidação do Banco de Dados

Este documento descreve as alterações realizadas para consolidar as coleções de usuários no banco de dados e melhorar a experiência de autenticação no aplicativo NoPainNoGain.

## Alterações Realizadas

### 1. Implementação da SplashScreen
- Criado arquivo `app/_layout.js` para gerenciar a visibilidade da SplashScreen
- Implementada lógica para manter a SplashScreen visível durante o carregamento inicial
- Adicionado tempo mínimo de exibição para melhorar a experiência do usuário

### 2. Melhoria na Navegação após Login
- Simplificada a lógica de navegação no arquivo `app/(tabs)/LoginScreen.js`
- Implementado mecanismo de fallback para navegação (router.push como alternativa ao router.replace)
- Reduzido o tempo de timeout para o redirecionamento (de 500ms para 300ms)
- Adicionada limpeza de erros anteriores ao montar o componente

### 3. Consolidação das Coleções do Banco de Dados
- Criado modelo unificado de usuário (`backend/models/userModel.js`)
- Atualizado middleware de autenticação para trabalhar com o novo modelo
- Expandidas as rotas de autenticação para incluir mais funcionalidades
- Criado script de migração para mover dados da coleção `users` para `clients` e renomear para `users`
- Criado script para atualizar referências no frontend

## Como Executar a Migração

### Passo 1: Backup do Banco de Dados
Antes de iniciar a migração, faça um backup do banco de dados:

```bash
mongodump --db nopainnogain --out ./backup
```

### Passo 2: Executar o Script de Migração
Execute o script de migração para consolidar as coleções:

```bash
cd backend
node scripts/migrateUsers.js
```

### Passo 3: Atualizar Referências no Frontend
Execute o script para atualizar as referências no frontend:

```bash
node scripts/update-auth-references.js
```

### Passo 4: Verificar a Migração
Verifique se a migração foi bem-sucedida:

1. Inicie o servidor backend
2. Tente fazer login com um usuário existente
3. Verifique se o perfil do usuário está sendo exibido corretamente

## Estrutura do Novo Modelo de Usuário

O novo modelo de usuário consolidado inclui os seguintes campos:

- `name`: Nome completo do usuário
- `email`: Email do usuário (único, usado para login)
- `password`: Senha do usuário (armazenada com hash)
- `profileImage`: URL da imagem de perfil
- `birthDate`: Data de nascimento
- `gender`: Gênero
- `isActive`: Status da conta (ativo/inativo)
- `lastLogin`: Data do último login
- `role`: Função do usuário (user, trainer, admin)
- `createdAt`: Data de criação da conta
- `updatedAt`: Data da última atualização
- `phone`: Número de telefone
- `address`: Endereço completo (objeto com street, city, state, zipCode, country)
- `preferences`: Preferências do usuário (objeto com language, notifications, theme)
- `lastActivity`: Data da última atividade

## Novas Funcionalidades de Autenticação

As seguintes funcionalidades foram adicionadas ou melhoradas:

1. **Registro de Usuários**: Endpoint `/auth/register` para criar novas contas
2. **Perfil de Usuário**: Endpoint `/auth/profile` para obter e atualizar informações do perfil
3. **Renovação de Token**: Endpoint `/auth/refresh-token` para renovar tokens JWT
4. **Controle de Acesso por Função**: Middleware `authorizeRoles` para restringir acesso baseado em funções
5. **Tratamento de Erros Melhorado**: Respostas de erro mais detalhadas e códigos de erro específicos
6. **Monitoramento de Atividade**: Rastreamento da última atividade do usuário

## Próximos Passos

1. Atualizar a documentação da API
2. Implementar testes automatizados para as novas funcionalidades
3. Adicionar funcionalidade de recuperação de senha
4. Implementar autenticação de dois fatores (2FA)
