import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem('@GoMarket:products');
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      const productIndex = products.findIndex(p => p.id === product.id);

      if (productIndex >= 0) {
        const qtdSum = 1 + products[productIndex].quantity;

        const newProducts = [...products];
        newProducts.splice(productIndex, 1);

        setProducts([...newProducts, { ...product, quantity: qtdSum }]);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex >= 0) {
        const product = {
          ...products[productIndex],
          quantity: products[productIndex].quantity + 1,
        };

        const newProducts = [...products];
        newProducts.splice(productIndex, 1);

        setProducts([...newProducts, product]);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex >= 0) {
        const product = products[productIndex];
        const qtdResult = products[productIndex].quantity - 1;

        const newProducts = [...products];

        if (qtdResult === 0) {
          newProducts.splice(productIndex, 1);

          setProducts(newProducts);

          return;
        }

        newProducts.splice(productIndex, 1);

        setProducts([...newProducts, { ...product, quantity: qtdResult }]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
