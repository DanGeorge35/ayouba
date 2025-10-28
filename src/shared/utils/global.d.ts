type BaseDataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | GenericObjectType
  | DataValueArray
  | BaseDataValue
  | (() => unknown);

export type GenericObjectType = {
  [key: string]: BaseDataValue;
};

export type HmacHeaders = HMAC_HEADER;
