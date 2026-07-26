import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
} from "../domain/property/Property";

export interface IPropertyService {
  listDefinitions(): Promise<PropertyDefinition[]>;
  /** Creates a definition; status types start with the default option set. */
  createDefinition(name: string, type: PropertyType): Promise<PropertyDefinition>;
  deleteDefinition(id: string): Promise<void>;
  /** Find-or-create an option on a select-like definition (palette-rotated color). */
  addOption(definitionId: string, name: string): Promise<PropertyOption>;
  valuesForNote(noteId: string): Promise<Map<string, PropertyValue>>;
  setValue(noteId: string, propertyId: string, value: PropertyValue): Promise<void>;
  removeValue(noteId: string, propertyId: string): Promise<void>;
}
