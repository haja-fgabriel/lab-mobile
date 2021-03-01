
export type IDType = string;

export interface LocationProps {
  latitude?: number;
  longitude?: number;
}

export interface ItemProps {
  _id?: IDType;
  name: string;
  provenienceCountry: string;
  amount: number;
  pricePerKg: number;
  version: number;
  offline?: boolean;
  location?: LocationProps;
  photo?: string;
  conflict?: boolean;
  conflictedItem?: ItemProps;
}

export const compareItems: (i1: ItemProps, i2: ItemProps) => boolean = (i1, i2) => {
  return (        // JavaScript/TypeScript is so smart, that it's putting the semicolons for me
    i1._id === i2._id
    && i1.name === i2.name
    && i1.provenienceCountry === i2.provenienceCountry
    && i1.amount === i2.amount
    && i1.pricePerKg === i2.pricePerKg
    && i1.location === i1.location
    && i1.photo === i2.photo
  );
}