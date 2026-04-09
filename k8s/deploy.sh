#!/bin/bash
set -e

echo "🚀 Deploying GlowCart to Kubernetes..."

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Create config and secrets
echo "🔧 Applying configuration..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy PostgreSQL
echo "🗄️  Deploying PostgreSQL..."
kubectl apply -f k8s/postgres/pvc.yaml
kubectl apply -f k8s/postgres/statefulset.yaml
kubectl apply -f k8s/postgres/service.yaml

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --namespace glowcart \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=postgres \
  --timeout=120s

# Deploy Backend
echo "🖥️  Deploying Backend..."
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
kubectl apply -f k8s/backend/hpa.yaml

# Deploy Frontend
echo "🌐 Deploying Frontend..."
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# Deploy Ingress
echo "🔀 Deploying Ingress..."
kubectl apply -f k8s/ingress.yaml

echo ""
echo "✅ GlowCart deployed successfully!"
echo ""
echo "📊 Checking pod status..."
kubectl get pods -n glowcart
echo ""
echo "🌐 Services:"
kubectl get svc -n glowcart
echo ""
echo "🔀 Ingress:"
kubectl get ingress -n glowcart