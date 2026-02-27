export interface UserT {
  name: string;
  avatar?: string;
  username: string;
  bio?: string;
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  website?: string;
}

export interface RequestT {
  id: string;
  sender: UserT;
  receiver: UserT;
  createdAt: string;
  updatedAt: string;
}
