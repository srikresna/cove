export interface CustomIcon {
  id: string;
  name: string;
  dataUrl: string;
}

export interface ICustomIconService {
  list(): Promise<CustomIcon[]>;
  add(name: string, dataUrl: string): Promise<CustomIcon>;
  remove(id: string): Promise<void>;
}
