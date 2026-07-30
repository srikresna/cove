export interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly color: string;
  readonly description?: string;
  readonly createdAt: number;
}
