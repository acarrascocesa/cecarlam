#!/bin/bash

# Script de despliegue para el frontend de CECARLAM
# Este script reconstruye y reinicia el contenedor del frontend

set -e  # Salir si hay algún error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="/var/www/clientes/cecarlam"
SERVICE_NAME="crm-frontend"
CONTAINER_NAME="cecarlam_crm_frontend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Despliegue Frontend CECARLAM${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto o cambiarlo
if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: No se encontró docker-compose.yml en $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"
echo -e "${GREEN}✓ Directorio: $PROJECT_DIR${NC}"
echo ""

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    exit 1
fi

# Verificar que el contenedor existe
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⚠️  El contenedor ${CONTAINER_NAME} no existe. Creándolo...${NC}"
    docker-compose up -d "$SERVICE_NAME"
    echo -e "${GREEN}✓ Contenedor creado${NC}"
    echo ""
fi

# Eliminar todos los contenedores relacionados (evita errores de ContainerConfig)
echo -e "${YELLOW}🗑️  Eliminando contenedores antiguos relacionados...${NC}"
# Buscar y eliminar contenedores que coincidan con el patrón
docker ps -a --format "{{.ID}} {{.Names}}" | grep -E "cecarlam.*frontend|frontend.*cecarlam" | awk '{print $1}' | xargs -r docker rm -f > /dev/null 2>&1 || true
# También eliminar por nombre exacto
docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Contenedores antiguos eliminados${NC}"
echo ""

# Reconstruir la imagen sin caché para asegurar cambios
echo -e "${BLUE}🔨 Reconstruyendo imagen del frontend (sin caché)...${NC}"
docker-compose build --no-cache "$SERVICE_NAME"
echo -e "${GREEN}✓ Imagen reconstruida${NC}"
echo ""

# Iniciar el contenedor (usar --force-recreate y --no-deps para evitar errores)
echo -e "${BLUE}🚀 Iniciando contenedor...${NC}"
docker-compose up -d --force-recreate --no-deps "$SERVICE_NAME"
echo -e "${GREEN}✓ Contenedor iniciado${NC}"
echo ""

# Esperar un momento para que el contenedor inicie
echo -e "${YELLOW}⏳ Esperando a que el contenedor esté listo...${NC}"
sleep 5

# Verificar el estado del contenedor
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}✓ Contenedor está corriendo${NC}"
else
    echo -e "${RED}❌ Error: El contenedor no está corriendo${NC}"
    echo -e "${YELLOW}Mostrando logs del contenedor:${NC}"
    docker-compose logs --tail=50 "$SERVICE_NAME"
    exit 1
fi

# Verificar healthcheck
echo ""
echo -e "${BLUE}🏥 Verificando healthcheck...${NC}"
for i in {1..10}; do
    if docker exec "$CONTAINER_NAME" pgrep -f "next-server" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthcheck OK - Next.js está corriendo${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}⚠️  Healthcheck no responde aún, pero el contenedor está corriendo${NC}"
    else
        echo -e "${YELLOW}  Intento $i/10...${NC}"
        sleep 2
    fi
done

# Mostrar información del contenedor
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Información del Contenedor${NC}"
echo -e "${BLUE}========================================${NC}"
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Mostrar últimas líneas de logs
echo -e "${BLUE}📋 Últimas líneas de logs:${NC}"
docker-compose logs --tail=20 "$SERVICE_NAME"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Despliegue completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Para ver los logs en tiempo real, ejecuta:"
echo -e "  ${BLUE}docker-compose logs -f ${SERVICE_NAME}${NC}"
echo ""
echo -e "Para verificar el estado:"
echo -e "  ${BLUE}docker ps | grep ${CONTAINER_NAME}${NC}"
echo ""

