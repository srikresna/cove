import type { PropertyDefinition, PropertyVisibility } from "../domain/property/Property";

export interface NotePropertyRecord {
  noteId: string;
  propertyId: string;
  valueJson: string;
}

export interface PropertyDefinitionPatch {
  name?: string;
  show?: PropertyVisibility;
  orderIndex?: string;
  icon?: string | null;
}

export interface IPropertyRepository {
  listDefinitions(): Promise<PropertyDefinition[]>;
  createDefinition(def: PropertyDefinition): Promise<void>;
  updateDefinition(id: string, patch: PropertyDefinitionPatch): Promise<void>;
  updateOptions(id: string, optionsJson: string): Promise<void>;
  appendOption(id: string, optionJson: string): Promise<void>;
  deleteDefinition(id: string): Promise<void>;
  valuesForNote(noteId: string): Promise<NotePropertyRecord[]>;
  valuesForPropertyAll(propertyId: string): Promise<NotePropertyRecord[]>;
  setValue(noteId: string, propertyId: string, valueJson: string): Promise<void>;
  removeValue(noteId: string, propertyId: string): Promise<void>;
}
