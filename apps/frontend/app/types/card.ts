export type CardSku = {
  id: string
  condition: string
  price: string
  stock: number
}

export type Card = {
  id: string
  name: string
  set: string
  number: string
  rarity: string
  imageUrl: string | null
  skus: CardSku[]
}