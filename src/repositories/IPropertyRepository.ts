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

/** One note-value write in an option-deletion sweep; null valueJson = remove. */
export interface OptionDeletionWrite {
  noteId: string;
  valueJson: string | null;
}

export interface IPropertyRepository {
  listDefinitions(): Promise<PropertyDefinition[]>;
  createDefinition(def: PropertyDefinition): Promise<void>;
  updateDefinition(id: string, patch: PropertyDefinitionPatch): Promise<void>;
  updateOptions(id: string, optionsJson: string): Promise<void>;
  appendOption(id: string, optionJson: string): Promise<void>;
  deleteDefinition(id: string): Promise<void>;
  /**
   * Atomically removes one option: replaces optionsJson (skipped when null)
   * and applies the value sweep in the same transaction.
   */
  applyOptionDeletion(
    definitionId: string,
    optionsJson: string | null,
    writes: OptionDeletionWrite[],
  ): Promise<void>;
  valuesForNote(noteId: string): Promise<NotePropertyRecord[]>;
  valuesForPropertyAll(propertyId: string): Promise<NotePropertyRecord[]>;
  setValue(noteId: string, propertyId: string, valueJson: string): Promise<void>;
  removeValue(noteId: string, propertyId: string): Promise<void>;
}
