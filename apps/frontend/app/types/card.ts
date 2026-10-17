export type Listing = {
  id: string
  condition: string
  availability: string
  price: string
  stock: number
  description?: string
  seller?: {
    shopName: string
  }
}

export type Card = {
  id: string
  name: string
  set: string
  number: string
  rarity: string
  category: string
  imageUrl: string | null
  listings: Listing[]
}