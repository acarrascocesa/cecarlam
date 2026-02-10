#!/bin/bash

# Script rápido de despliegue para el frontend de CECARLAM
# Reconstruye y reinicia el contenedor sin detener primero

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/var/www/clientes/cecarlam"
SERVICE_NAME="crm-frontend"

echo -e "${BLUE}🚀 Despliegue rápido del frontend...${NC}"
echo ""

cd "$PROJECT_DIR"

# Verificar que PostgreSQL esté corriendo
echo -e "${BLUE}🔍 Verificando PostgreSQL...${NC}"
if ! docker ps --format '{{.Names}}' | grep -q "cecarlam_postgres"; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo. Iniciando...${NC}"
    docker-compose up -d postgres
    echo -e "${BLUE}⏳ Esperando a que PostgreSQL esté listo...${NC}"
    sleep 5
fi

# Verificar que el backend esté corriendo
if ! docker ps --format '{{.Names}}' | grep -q "cecarlam_crm_backend"; then
    echo -e "${YELLOW}⚠️  Backend no está corriendo. Iniciando...${NC}"
    docker-compose up -d crm-backend
    sleep 3
fi

# Eliminar contenedor antiguo si existe (evita errores de ContainerConfig)
echo -e "${BLUE}🗑️  Eliminando contenedor antiguo si existe...${NC}"
docker rm -f cecarlam_crm_frontend 2>/dev/null || true

# Reconstruir y reiniciar SOLO el frontend
echo -e "${BLUE}🔨 Reconstruyendo y reiniciando frontend...${NC}"
docker-compose up -d --build --no-deps "$SERVICE_NAME"

echo ""
echo -e "${GREEN}✅ Frontend desplegado!${NC}"
echo ""
echo -e "Ver logs: ${BLUE}docker-compose logs -f ${SERVICE_NAME}${NC}"

