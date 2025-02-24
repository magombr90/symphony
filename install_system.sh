
#!/bin/bash

#========================================
# CONFIGURAÇÕES DO SISTEMA
#========================================

# Configurações do Banco de Dados PostgreSQL
DB_NAME="ticketsystem"
DB_USER="ticketadmin"
DB_PASSWORD="sua_senha_segura"
DB_HOST="localhost"
DB_PORT="5432"
DB_SSL="false"

# Configurações do Domínio
DOMAIN="seu_dominio.com"

# Configurações do Projeto
PROJECT_PATH="/var/www/ticketsystem"
REPO_URL="seu_repositorio_git"

# Configurações do Usuário
UBUNTU_USER=$USER

#========================================
# NÃO MODIFIQUE ABAIXO DESTA LINHA
#========================================

# ... keep existing code (até a parte do PostgreSQL)

# Configuração específica do PostgreSQL para o projeto
log "Configurando banco de dados do projeto..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
\i $PROJECT_PATH/db/init.sql
\q
EOF
check_error "Falha na configuração do banco de dados do projeto"

# Criar arquivo .env com configurações do banco
cat > $PROJECT_PATH/.env << EOF
VITE_DB_USER=$DB_USER
VITE_DB_HOST=$DB_HOST
VITE_DB_NAME=$DB_NAME
VITE_DB_PASSWORD=$DB_PASSWORD
VITE_DB_PORT=$DB_PORT
VITE_DB_SSL=$DB_SSL
EOF

# ... keep existing code (resto do script)
