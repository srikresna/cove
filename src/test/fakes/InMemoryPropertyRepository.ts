import type { PropertyDefinition } from "../../domain/property/Property";
import type {
  IPropertyRepository,
  NotePropertyRecord,
} from "../../repositories/IPropertyRepository";

export class InMemoryPropertyRepository implements IPropertyRepository {
  public definitions: PropertyDefinition[] = [];
  public values: NotePropertyRecord[] = [];

  async listDefinitions(): Promise<PropertyDefinition[]> {
    return this.definitions.map((d) => ({ ...d, options: [...d.options] }));
  }

  async createDefinition(def: PropertyDefinition): Promise<void> {
    this.definitions.push({ ...def, options: [...def.options] });
  }

  async updateOptions(id: string, optionsJson: string): Promise<void> {
    const def = this.definitions.find((d) => d.id === id);
    if (def) def.options = JSON.parse(optionsJson);
  }

  async deleteDefinition(id: string): Promise<void> {
    this.definitions = this.definitions.filter((d) => d.id !== id);
    this.values = this.values.filter((v) => v.propertyId !== id);
  }

  async valuesForNote(noteId: string): Promise<NotePropertyRecord[]> {
    return this.values.filter((v) => v.noteId === noteId).map((v) => ({ ...v }));
  }

  async setValue(noteId: string, propertyId: string, valueJson: string): Promise<void> {
    const existing = this.values.find((v) => v.noteId === noteId && v.propertyId === propertyId);
    if (existing) {
      existing.valueJson = valueJson;
    } else {
      this.values.push({ noteId, propertyId, valueJson });
    }
  }

  async removeValue(noteId: string, propertyId: string): Promise<void> {
    this.values = this.values.filter((v) => !(v.noteId === noteId && v.propertyId === propertyId));
  }
}
