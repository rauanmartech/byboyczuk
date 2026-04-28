import art1 from "@/assets/art-1.jpg";
import art2 from "@/assets/art-2.jpg";
import art3 from "@/assets/art-3.jpg";
import art4 from "@/assets/art-4.jpg";
import art5 from "@/assets/art-5.jpg";
import art6 from "@/assets/art-6.jpg";

export interface Artwork {
  id: string;
  title: string;
  description: string;
  image: string;
  image_url_1?: string;
  image_url_2?: string;
  image_url_3?: string;
  price: number | null;
  dimensions: string;
  technique: string;
  available: boolean;
  status: string;
  quantity: number;
  year: number;
  category: "original" | "print";
}

export const artworks: Artwork[] = [
  {
    id: "1",
    title: "Entrega Silenciosa",
    description: "Uma meditação sobre a vulnerabilidade de fechar os olhos e confiar no que não se vê.",
    image: art1,
    price: 2800,
    dimensions: "60 × 80 cm",
    technique: "Óleo e aquarela sobre tela",
    available: true,
    year: 2024,
    category: "original",
  },
  {
    id: "2",
    title: "Jardim Interior",
    description: "As flores que cultivamos dentro de nós, mesmo quando ninguém está olhando.",
    image: art2,
    price: 2200,
    dimensions: "50 × 70 cm",
    technique: "Aquarela sobre papel algodão",
    available: true,
    year: 2024,
    category: "original",
  },
  {
    id: "3",
    title: "Mapa de Sentir",
    description: "Uma cartografia emocional — onde o rosa encontra o verde, há um lugar seguro.",
    image: art3,
    price: 1800,
    dimensions: "70 × 50 cm",
    technique: "Técnica mista sobre tela",
    available: true,
    year: 2023,
    category: "original",
  },
  {
    id: "4",
    title: "Asas de Papel",
    description: "Sobre a delicadeza do que sustenta nossos voos mais corajosos.",
    image: art4,
    price: null,
    dimensions: "40 × 50 cm",
    technique: "Ilustração botânica, nanquim e aquarela",
    available: false,
    year: 2023,
    category: "original",
  },
  {
    id: "5",
    title: "Ruínas que Florescem",
    description: "O que parece abandonado ainda pode ser o lugar mais bonito.",
    image: art5,
    price: 150,
    dimensions: "30 × 40 cm",
    technique: "Print fine art em papel Hahnemühle",
    available: true,
    year: 2024,
    category: "print",
  },
  {
    id: "6",
    title: "Retorno",
    description: "Um olhar que carrega tudo o que foi vivido e tudo o que ainda será.",
    image: art6,
    price: 3500,
    dimensions: "50 × 70 cm",
    technique: "Óleo sobre tela",
    available: true,
    year: 2024,
    category: "original",
  },
];
