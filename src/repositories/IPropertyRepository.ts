import type { PropertyDefinition } from "../domain/property/Property";

export interface NotePropertyRecord {
  noteId: string;
  propertyId: string;
  valueJson: string;
}

export interface IPropertyRepository {
  listDefinitions(): Promise<PropertyDefinition[]>;
  createDefinition(def: PropertyDefinition): Promise<void>;
  updateOptions(id: string, optionsJson: string): Promise<void>;
  appendOption(id: string, optionJson: string): Promise<void>;
  deleteDefinition(id: string): Promise<void>;
  valuesForNote(noteId: string): Promise<NotePropertyRecord[]>;
  setValue(noteId: string, propertyId: string, valueJson: string): Promise<void>;
  removeValue(noteId: string, propertyId: string): Promise<void>;
}
