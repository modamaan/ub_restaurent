// Menu type definitions – all data is managed via the Admin panel

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;   // public path e.g. "/cheese_loaded_fries.webp"
    available: boolean;
    isVeg: boolean;
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}
