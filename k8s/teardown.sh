#!/bin/bash
set -e

echo "🧹 Tearing down GlowCart from Kubernetes..."

kubectl delete namespace glowcart --ignore-not-found

echo "✅ GlowCart removed successfully!"