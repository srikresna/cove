import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
} from "../domain/property/Property";

export interface IPropertyService {
  listDefinitions(): Promise<PropertyDefinition[]>;

  createDefinition(name: string, type: PropertyType): Promise<PropertyDefinition>;
  deleteDefinition(id: string): Promise<void>;

  addOption(definitionId: string, name: string): Promise<PropertyOption>;
  valuesForNote(noteId: string): Promise<Map<string, PropertyValue>>;
  setValue(noteId: string, propertyId: string, value: PropertyValue): Promise<void>;
  removeValue(noteId: string, propertyId: string): Promise<void>;
}
