export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'skincare' | 'treatment';
  image: string;
  description: string;
  benefits: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'paid' | 'completed';
}

export interface Consultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  procedure: string;
  specialistId: string;
  date: string;
  time: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  rating: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  before: string;
  after: string;
  category: string;
  objectFit?: 'cover' | 'contain';
}

export interface Testimonial {
  id: string;
  title: string;
  quote: string;
  rating: number;
  author: string;
  source: string;
}
