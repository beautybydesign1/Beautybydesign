export interface Service {
  id: string;
  title: string;
  description: string;
  durationMins: number;
  price: number;
  imageUrl: string;
}

export const services: Service[] = [
  {
    id: "makeup-service-1hr",
    title: "1 Hour Makeup Service",
    description:
      "Personalized beauty solutions to enhance your natural features.",
    durationMins: 60,
    price: 60,
    imageUrl:
      "https://bucket.setmore.com/files/img/fgXRSwhcENFb/566add08-a096-4f1f-bf74-ed8b69a7bb92.jpeg?crop=800;800;0;496",
  },
  {
    id: "makeup-instruction-1hr",
    title: "1 Hour Makeup Instruction",
    description:
      "Personalized beauty instructions and demonstrations to enhance your natural features.",
    durationMins: 60,
    price: 80,
    imageUrl:
      "https://bucket.setmore.com/files/img/fYfK2pVUzOyk/3ac0b040-8891-4d60-a6d4-ac27557baaab.jpeg?crop=800;800;10;501",
  },
  {
    id: "glamor-makeup-2hr",
    title: "2 Hour Glamor Makeup Service",
    description:
      "Glamor makeup with special highlights to elevate your look for any occasion.",
    durationMins: 120,
    price: 120,
    imageUrl:
      "https://bucket.setmore.com/files/img/f6IyJCHOijpY/517ec137-2fa6-4963-b000-b1a5a510fbca.jpeg?crop=810;810;0;497",
  },
];

export const BEAUTICIAN = {
  name: "Peggy Ngotoro",
  businessName: "Beauty by Design",
  phone: "+13026605338",
  email: "ngotorop@gmail.com",
  baseLocation: {
    lat: 39.449556,
    lng: -75.7163207,
    address: "Middletown, Delaware 19709",
  },
  travelFeePerMile: 2,
  depositPercentage: 50,
  cancellationPolicy:
    "Deposit nonrefundable. More than 24 hrs notice: No cancellation fee, deposit transferable to future appointment within 6 months. Less than 24 hrs notice/no-show/late arrival over 15 mins: Cancellation fee is amount of deposit.",
};
