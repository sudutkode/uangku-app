export interface User {
  id: string;
  identifierHash: string;
  username: string;
  avatar?: string;
  createdAt: Date;
}
