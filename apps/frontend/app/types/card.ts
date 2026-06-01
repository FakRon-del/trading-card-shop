export type Listing = {
  id: string
  condition: string
  price: string
  stock: number
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
  imageUrl: string | null
  listings: Listing[]
}