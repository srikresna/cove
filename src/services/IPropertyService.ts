import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
  PropertyVisibility,
} from "../domain/property/Property";

export interface IPropertyService {
  listDefinitions(): Promise<PropertyDefinition[]>;

  createDefinition(name: string, type: PropertyType): Promise<PropertyDefinition>;
  renameDefinition(id: string, name: string): Promise<void>;
  setDefinitionIcon(id: string, icon: string | null): Promise<void>;
  setDefinitionVisibility(id: string, show: PropertyVisibility): Promise<void>;
  reorderDefinition(id: string, targetId: string, position: "before" | "after"): Promise<void>;
  deleteDefinition(id: string): Promise<void>;

  addOption(definitionId: string, name: string, color?: string): Promise<PropertyOption>;
  renameOption(definitionId: string, optionId: string, name: string): Promise<void>;
  setOptionColor(definitionId: string, optionId: string, color: string): Promise<void>;
  deleteOption(definitionId: string, optionId: string): Promise<void>;
  valuesForNote(noteId: string): Promise<Map<string, PropertyValue>>;
  valuesForDefinitionAllNotes(propertyId: string): Promise<Map<string, PropertyValue>>;
  setValue(noteId: string, propertyId: string, value: PropertyValue): Promise<void>;
  removeValue(noteId: string, propertyId: string): Promise<void>;
}
