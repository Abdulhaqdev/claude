"use client";

import { motion } from "framer-motion";
import { Package, Barcode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  color: string;
  size: string;
  wholesalePrice: number;
  sellPrice: number;
  status: "ACTIVE" | "DISCONTINUED" | "DRAFT";
  category: string;
  stock: number;
}

interface ProductsGridProps {
  products: Product[];
  renderActions?: (product: Product) => React.ReactNode;
}

export function ProductsGrid({ products, renderActions }: ProductsGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
              <Badge
                variant={product.status === "ACTIVE" ? "success" : "secondary"}
                className="absolute top-3 right-3"
              >
                {product.status === "ACTIVE" ? "Active" : "Discontinued"}
              </Badge>
              {product.stock <= 10 && product.stock > 0 && (
                <Badge variant="warning" className="absolute top-3 left-3">
                  Low Stock
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="absolute top-3 left-3">
                  Out of Stock
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <h3 className="font-medium text-sm leading-tight truncate">{product.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{product.color}</span>
                <span>·</span>
                <span>Size {product.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{formatCurrency(product.wholesalePrice)}</p>
                  <p className="text-[10px] text-muted-foreground">wholesale</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.stock}</p>
                  <p className="text-[10px] text-muted-foreground">in stock</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <Barcode className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-mono text-muted-foreground">{product.sku}</span>
              </div>
            </div>
            {renderActions?.(product)}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
