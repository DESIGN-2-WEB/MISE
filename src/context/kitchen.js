import { createContext, useContext } from 'react';

export const KitchenContext = createContext(null);

/** Saved recipes, meal plan, recently viewed and the recipe dialog. */
export function useKitchen() {
  const kitchen = useContext(KitchenContext);
  if (!kitchen) throw new Error('useKitchen must be used inside <KitchenProvider>.');
  return kitchen;
}
